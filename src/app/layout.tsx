import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from '@/contexts/language-context'
import { Toaster } from "@/components/ui/sonner"
import { CookieConsentBanner } from "@/components/ui/cookie-consent"
import Script from 'next/script'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stackbill.dev'),
  title: "StackBill - Professional Subscription Tracker for SaaS Founders",
  description: "Track your SaaS subscriptions and recurring expenses. Simple, powerful tool built by developers for developers and entrepreneurs.",
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stackbill.dev',
    title: 'StackBill - Professional Subscription Tracker for SaaS Founders',
    description: 'Simple, powerful subscription tracker built by developers for developers and entrepreneurs.',
    siteName: 'StackBill',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StackBill - Subscription Tracker Dashboard'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StackBill - Professional Subscription Tracker',
    description: 'Simple, powerful subscription tracker built by developers for developers and entrepreneurs.',
    images: ['/og-image.png'],
    creator: '@stackbill_dev'
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
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {measurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
              strategy="beforeInteractive"
            />
            <Script id="google-analytics" strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                // Check if user has previously declined analytics
                var savedConsent = null;
                try {
                  savedConsent = localStorage.getItem('stackbill-cookie-consent');
                } catch(e) {}

                var analyticsConsent = 'granted'; // Default to granted
                if (savedConsent) {
                  try {
                    var consentData = JSON.parse(savedConsent);
                    analyticsConsent = consentData.analytics ? 'granted' : 'denied';
                  } catch(e) {}
                }

                // Set consent mode based on user's previous choice or default
                gtag('consent', 'default', {
                  analytics_storage: analyticsConsent,
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  functionality_storage: 'granted',
                  security_storage: 'granted'
                });

                gtag('config', '${measurementId}', {
                  anonymize_ip: true,
                  allow_google_signals: false,
                  allow_ad_personalization_signals: false,
                });
              `}
            </Script>
          </>
        )}
      </head>
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
              <CookieConsentBanner />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
