import type { Metadata } from "next";
import "./globals.css";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

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
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
