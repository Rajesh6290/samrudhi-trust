import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Samrudhi Seva Trust - Serving Humanity, One Meal at a Time",
  description:
    "Join Samrudhi Seva Trust in our mission to rescue surplus food, provide life-saving blood, and nurture children in need. Together, we transform lives across communities.",
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
  authors: [{ name: "Samrudhi Seva Trust" }],
  creator: "Samrudhi Seva Trust",
  publisher: "Samrudhi Seva Trust",
  openGraph: {
    title: "Samrudhi Seva Trust - Serving Humanity, One Meal at a Time",
    description:
      "Join us in making a difference through food rescue, blood donation drives, and child welfare programs.",
    url: "https://samrudhisevatrust.org",
    siteName: "Samrudhi Seva Trust",
    images: [
      {
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=630",
        width: 1200,
        height: 630,
        alt: "Samrudhi Seva Trust - Community Service",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samrudhi Seva Trust - Serving Humanity",
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
        <link rel="canonical" href="https://samrudhisevatrust.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NGO",
              name: "Samrudhi Seva Trust",
              alternateName: "Samrudhi Trust",
              url: "https://samrudhisevatrust.org",
              logo: "https://samrudhisevatrust.org/logo.png",
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
                telephone: "+91-1234567890",
                contactType: "Customer Service",
                email: "info@samrudhisevatrust.org",
                availableLanguage: ["English", "Hindi"],
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
