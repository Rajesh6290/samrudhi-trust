import { Metadata } from "next";
import dynamic from "next/dynamic";
const ContactPage = dynamic(() => import("../../features/pages/ContactPage"));
export const metadata: Metadata = {
  title: "Contact Us - Samriddhi Seva Trust",
  description:
    "Get in touch with Samriddhi Seva Trust. We're here to answer your questions and provide more information about our mission to serve humanity.",
  keywords: [
    "Contact Samriddhi Seva Trust",
    "Get in touch NGO",
    "Samriddhi Seva Trust support",
    "Volunteer inquiries",
    "Donation information",
    "Community service contact",
    "Food donation help",
    "Blood donation queries",
    "Child welfare support",
    "Non-profit organization contact",
  ],
};
const page = () => {
  return <ContactPage />;
};

export default page;
