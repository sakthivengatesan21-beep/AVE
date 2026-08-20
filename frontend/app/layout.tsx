import './globals.css';
import { Sidebar, Header } from '@/components/Navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-zinc-950 text-zinc-100">
      <body className="flex h-screen overflow-hidden antialiased font-sans bg-zinc-950 text-zinc-100">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
