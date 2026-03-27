import crypto from 'crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-admin-password.mjs "YourStrongPassword"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) => {
  if (error) throw error;
  console.log(`scrypt$16384$${salt}$${Buffer.from(key).toString('hex')}`);
});
