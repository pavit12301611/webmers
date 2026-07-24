import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Webmers — Buy. Edit. Own.',
  description: 'The premium marketplace for fully-built websites.',
  openGraph: {
    title: 'Webmers',
    description: 'Buy. Edit. Own.',
    siteName: 'Webmers',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-webmers-black text-webmers-white min-h-[300vh] relative">
        <div className="grain-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
