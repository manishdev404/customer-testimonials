import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { PRODUCT_NAME, PRODUCT_TAGLINE } from '@/constants';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
    template: `%s · ${PRODUCT_NAME}`,
  },
  description:
    'Collect, moderate and publish customer testimonials. Approved social proof, ready for your site.',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {/* First tab stop on every page — lets keyboard users skip the chrome. */}
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-80"
        >
          Skip to content
        </a>

        {children}
        <Toaster />
      </body>
    </html>
  );
}
