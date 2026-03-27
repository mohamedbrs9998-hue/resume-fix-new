import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="container nav">
      <Link href="/" className="logo">Resume<span>Fix</span> AI</Link>
      <div className="nav-links">
        <Link href="/pricing">Pricing</Link>
        <Link href="/upload">Upload</Link>
        <Link href="/legal">Legal</Link>
        <Link href="/admin">Admin</Link>
      </div>
    </div>
  );
}
