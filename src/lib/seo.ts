import { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

export function generateSEO(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    image = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=630",
    url = "https://samriddhisevatrust.org",
  } = config;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      siteName: "Samriddhi Seva Trust",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
