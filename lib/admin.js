import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';

const SESSION_COOKIE = 'rf_admin_session';

function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

function unb64url(input) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_SECRET_TOKEN;
  if (!secret) {
    throw new Error('Missing AUTH_SECRET');
  }
  return secret;
}

export async function createPasswordHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
  return `scrypt$16384$${salt}$${Buffer.from(derivedKey).toString('hex')}`;
}

export async function verifyPassword(password, encodedHash) {
  if (!password || !encodedHash) return false;
  const [algorithm, cost, salt, hash] = encodedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;

  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, Buffer.from(hash, 'hex').length, { N: Number(cost) || 16384, r: 8, p: 1 }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derivedKey));
}

function signSessionPayload(payload) {
  const secret = getAuthSecret();
  const encoded = b64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function readAdminSessionToken(token) {
  if (!token || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', getAuthSecret()).update(encoded).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const payload = JSON.parse(unb64url(encoded));
  if (!payload?.exp || Date.now() > payload.exp) return null;
  return payload;
}

export async function createAdminSession(user) {
  const expiresInDays = Number(process.env.ADMIN_SESSION_DAYS || 14);
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const token = signSessionPayload({
    sub: user.id,
    email: user.email,
    role: user.role || 'owner',
    exp: expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  });

  return token;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return readAdminSessionToken(token);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }
  return session;
}

export async function getAdminUserByEmail(email) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', String(email || '').trim().toLowerCase())
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function authenticateAdmin(email, password) {
  const user = await getAdminUserByEmail(email);
  if (!user) return null;
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
  };
}

export async function isAdminAuthorized(request) {
  const authHeader = request.headers.get('authorization');
  const legacyToken = process.env.ADMIN_SECRET_TOKEN;
  if (legacyToken && authHeader === `Bearer ${legacyToken}`) return true;
  const session = await getAdminSession();
  return Boolean(session);
}
