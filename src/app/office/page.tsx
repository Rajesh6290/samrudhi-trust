import { Metadata } from "next";
import dynamic from "next/dynamic";

const OfficePage = dynamic(() => import("../../features/pages/OfficePage"));

export const metadata: Metadata = {
  title: "Our Team & Offices - Samriddhi Seva Trust",
  description:
    "Meet our dedicated team members and visit our offices across India. Learn about the people behind Samriddhi Seva Trust's mission to serve humanity.",
  keywords: [
    "Samriddhi Seva Trust team",
    "NGO leadership",
    "Office locations",
    "Team members",
    "Trust offices India",
    "Community leaders",
    "Non-profit team",
    "Social workers",
    "Volunteer coordinators",
    "Meet the team",
  ],
};

const Page = () => {
  return <OfficePage />;
};

export default Page;
