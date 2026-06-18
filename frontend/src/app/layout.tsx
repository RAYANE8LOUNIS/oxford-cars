import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Oxford Cars — Drive Distinction',
    template: '%s | Oxford Cars',
  },
  description: 'Premium luxury car rental in Algeria. British Heritage. Timeless Prestige. Experience the finest vehicles with Oxford Cars.',
  keywords: ['luxury car rental', 'Algeria', 'premium vehicles', 'Oxford Cars', 'voiture de location', 'Algérie'],
  openGraph: {
    type: 'website',
    locale: 'fr_DZ',
    siteName: 'Oxford Cars',
    title: 'Oxford Cars — Drive Distinction',
    description: 'Premium luxury car rental in Algeria. British Heritage. Timeless Prestige.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
      <body className="bg-oxford-black text-ivory antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1C1C1C',
              color: '#F5F0E8',
              border: '1px solid rgba(201, 169, 110, 0.3)',
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#C9A96E', secondary: '#0A0A0A' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#F5F0E8' },
            },
          }}
        />
      </body>
    </html>
  );
}
