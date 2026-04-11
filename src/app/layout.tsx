import type { Metadata } from 'next';
import { Providers } from '@/components/providers/Providers';
import { PageTitleProvider } from '@/components/layout/PageTitleContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'LogFit - Workout Logging Platform',
  description: 'Track your workouts, routines, and progress over time',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang='en'>
      <body className='antialiased'>
        <Providers>
          <PageTitleProvider>{children}</PageTitleProvider>
        </Providers>
      </body>
    </html>
  );
}
