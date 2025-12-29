import { Metadata } from "next";
import dynamic from "next/dynamic";

const GallaryPage = dynamic(() => import("../../features/pages/GallaryPage"));

export const metadata: Metadata = {
  title: "Gallery - Samriddhi Seva Trust",
  description:
    "Explore our gallery of impactful moments. View photos and videos from our food distribution drives, blood donation camps, child welfare programs, and community events.",
  keywords: [
    "Samriddhi Seva Trust gallery",
    "NGO photos",
    "Community service images",
    "Food distribution pictures",
    "Blood donation camp photos",
    "Child welfare videos",
    "Volunteer events gallery",
    "Social impact images",
    "Charity work photos",
    "Non-profit gallery",
  ],
};

const Page = () => {
  return <GallaryPage />;
};

export default Page;
