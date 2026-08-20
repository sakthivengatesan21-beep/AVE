import './globals.css';

export const metadata = {
  title: 'ProofStay — Evidence-Based Rental Damage Attribution System',
  description: 'Document rental property condition, connect maintenance history, and generate evidence-based damage analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-zinc-950 text-zinc-100">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
