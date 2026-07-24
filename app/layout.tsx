import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Webmers — Buy. Edit. Own.',
    template: '%s · Webmers',
  },
  description: 'The premium marketplace for fully-built websites. Buy a site, edit it visually, own the code.',
  openGraph: {
    title: 'Webmers',
    description: 'Buy. Edit. Own. The premium marketplace for fully-built websites.',
    siteName: 'Webmers',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#07130e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#07130e] text-[#f7f5ea] antialiased">
        <Providers>
          <div className="grain-overlay" aria-hidden="true" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
