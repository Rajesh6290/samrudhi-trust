import { Metadata } from "next";
import dynamic from "next/dynamic";

const FAQPage = dynamic(() => import("../../features/pages/FAQPage"));

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Samriddhi Seva Trust",
  description:
    "Find answers to common questions about Samriddhi Seva Trust, our programs, volunteering opportunities, donations, and how you can make a difference.",
  keywords: [
    "FAQ Samriddhi Seva Trust",
    "NGO questions",
    "Volunteering FAQ",
    "Donation information",
    "How to volunteer",
    "Trust programs",
    "Non-profit questions",
    "Community service FAQ",
    "Blood donation queries",
    "Tax deduction donations",
  ],
};

const Page = () => {
  return <FAQPage />;
};

export default Page;
