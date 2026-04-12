import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyAd from '@/components/StickyAd';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PDFGEN.online - Free PDF Tools',
  description: 'The best collection of free online PDF tools. Merge, split, compress, and convert PDF files easily.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <Header />
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
          <Footer />
          <StickyAd />
        </ThemeProvider>
      </body>
    </html>
  );
}
