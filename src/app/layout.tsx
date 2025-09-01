import type { Metadata } from "next";
import "./globals.css";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "DotFlow E-commerce",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Loja online integrada ao DotFlow",
  keywords: ["e-commerce", "loja online", "produtos", "DotFlow"],
  authors: [{ name: "DotFlow Team" }],
  openGraph: {
    title: process.env.NEXT_PUBLIC_APP_NAME || "DotFlow E-commerce",
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Loja online integrada ao DotFlow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_APP_NAME || "DotFlow E-commerce",
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Loja online integrada ao DotFlow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
