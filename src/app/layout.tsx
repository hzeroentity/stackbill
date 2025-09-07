import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from '@/contexts/language-context'
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StackBill - Professional Subscription Tracker for SaaS Founders",
  description: "Legitimate business tool for tracking SaaS subscriptions and recurring expenses. Trusted by developers and entrepreneurs worldwide.",
  keywords: "subscription tracker, SaaS management, recurring expenses, business tools, subscription analytics",
  authors: [{ name: "StackBill Team" }],
  creator: "StackBill",
  publisher: "StackBill",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "google-site-verification-code-here", // You'll need to add your actual verification code
  },
  other: {
    "business-type": "legitimate-saas-application",
    "content-category": "business-productivity-tool"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
