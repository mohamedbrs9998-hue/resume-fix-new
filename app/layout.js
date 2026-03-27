import './globals.css';

export const metadata = {
  title: 'ResumeFix AI',
  description: 'Upload your CV, pay online, and instantly receive an improved ATS-ready resume package.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
