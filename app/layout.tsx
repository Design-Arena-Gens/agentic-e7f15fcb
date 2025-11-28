export const metadata = {
  title: 'ChatPT Atlas',
  description: 'Explore the world with a chat-driven atlas',
};

import './globals.css';
import Providers from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
