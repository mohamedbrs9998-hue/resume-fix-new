import Link from 'next/link';
import { getAdminSession } from '@/lib/admin';
import { redirect } from 'next/navigation';

export default async function AdminLoginPage({ searchParams }) {
  const session = await getAdminSession();
  if (session) {
    redirect('/admin');
  }

  const params = await searchParams;
  const error = params?.error || '';
  const nextUrl = params?.next || '/admin';

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div className="badge">ADMIN ACCESS</div>
        <h1 style={{ marginTop: 18 }}>Sign in to the control panel</h1>
        <p className="muted">Use your owner account to review orders, queue jobs, and platform errors.</p>
        <form action="/api/admin/login" method="POST" className="form" style={{ marginTop: 18 }}>
          <input type="hidden" name="next" value={nextUrl} />
          <label>
            Email
            <input name="email" type="email" placeholder="owner@example.com" required />
          </label>
          <label>
            Password
            <input name="password" type="password" placeholder="••••••••" required />
          </label>
          {error ? <div className="small" style={{ color: '#ffd0d0' }}>{decodeURIComponent(error)}</div> : null}
          <button className="btn btn-primary btn-full" type="submit">Sign in</button>
        </form>
        <p className="small" style={{ marginTop: 18 }}>
          First setup: create one admin user in Supabase using the SQL in <code>supabase/schema.sql</code>.
        </p>
        <Link href="/" className="small" style={{ display: 'inline-block', marginTop: 12 }}>Back to website</Link>
      </div>
    </main>
  );
}
