import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/hooks/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastContainer } from "react-toastify";
import "dotenv/config";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Samriddhi Seva Trust - Serving Humanity, One Meal at a Time",
  description:
    "Join Samriddhi Seva Trust in our mission to rescue surplus food, provide life-saving blood, and nurture children in need. Together, we transform lives across communities.",
  keywords: [
    "NGO",
    "charity",
    "food donation",
    "blood donation",
    "child welfare",
    "social service",
    "volunteer",
    "non-profit",
    "community service",
    "humanitarian aid",
  ],
  authors: [{ name: "Samriddhi Seva Trust" }],
  creator: "Samriddhi Seva Trust",
  publisher: "Samriddhi Seva Trust",
  openGraph: {
    title: "Samriddhi Seva Trust - Serving Humanity, One Meal at a Time",
    description:
      "Join us in making a difference through food rescue, blood donation drives, and child welfare programs.",
    url: "https://samriddhisevatrust.org",
    siteName: "Samriddhi Seva Trust",
    images: [
      {
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=630",
        width: 1200,
        height: 630,
        alt: "samriddhi Seva Trust - Community Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samriddhi Seva Trust - Serving Humanity",
    description:
      "Join us in making a difference through food rescue, blood donation, and child welfare.",
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=630",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://samriddhisevatrust.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NGO",
              name: "Samriddhi Seva Trust",
              alternateName: "Samriddhi Trust",
              url: "https://samriddhisevatrust.org",
              logo: "https://samriddhisevatrust.org/logo.svg",
              description:
                "A non-profit organization dedicated to food rescue, blood donation drives, and child welfare programs.",
              foundingDate: "2020",
              areaServed: {
                "@type": "Country",
                name: "India",
              },
              sameAs: [
                "https://facebook.com/samrudhisevatrust",
                "https://twitter.com/samrudhitrust",
                "https://instagram.com/samrudhisevatrust",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-9776391244",
                contactType: "Customer Service",
                email: "samriddhisevatrust2022@gmail.com",
                availableLanguage: ["English", "Hindi"],
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased text-gray-900`}>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <SpeedInsights />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
