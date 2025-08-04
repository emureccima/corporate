import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppContent } from "@/components/layout/AppContent";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Emure Chambers of Commerce, Mines, Industries and Agriculture (EMURECCIMA)",
  description: "Building a stronger community through Chamber values and mutual support. Manage memberships, savings, loans, and community events.",
  keywords: "Chamber, society, membership, savings, loans, community, events",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <AuthProvider>
          <AppContent>
            {children}
          </AppContent>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
