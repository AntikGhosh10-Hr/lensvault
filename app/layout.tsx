import type { Metadata } from "next";

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
    <html lang="en" className="dark bg-[#080706] text-[#ede8e1]">
      <head>
        {/* Instant Fail-Proof Tailwind Engine */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      vault: {
                        950: "#080706",
                        900: "#100f0d",
                        850: "#171512",
                        800: "#1f1c18",
                        700: "#2d2924",
                        600: "#443f38",
                        400: "#8a8175",
                        200: "#d6d0c7",
                        100: "#ede8e1",
                        50: "#faf8f5",
                        accent: "#c5a059",
                        accentHover: "#d9b36a",
                      }
                    },
                    fontFamily: {
                      serif: ['Georgia', 'serif'],
                      sans: ['system-ui', '-apple-system', 'sans-serif'],
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-vault-950 text-vault-100 antialiased selection:bg-vault-accent selection:text-vault-950">
        {children}
      </body>
    </html>
  );
}