export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "samriddhi Seva Trust",
    alternateName: "samriddhi Trust",
    url: "https://samriddhisevatrust.org",
    logo: "https://samriddhisevatrust.org/logo.png",
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
      telephone: "+91 9776391244",
      contactType: "Customer Service",
      email: "samriddhisevatrust2022@gmail.com",
      availableLanguage: ["English", "Hindi"],
    },
  },

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  event: (event: {
    name: string;
    description: string;
    startDate: string;
    location: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    location: {
      "@type": "Place",
      name: event.location,
    },
    organizer: {
      "@type": "Organization",
      name: "samriddhi Seva Trust",
      url: "https://samriddhisevatrust.org",
    },
  }),
};
