import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LensVault | Private Editorial Photography Galleries",
  description: "Bespoke, private, AI-curated portrait galleries for distinguished clientele.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-vault-950 text-vault-100 antialiased selection:bg-vault-accent selection:text-vault-950">
      <body className="min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
