import { Metadata } from "next";
import dynamic from "next/dynamic";

const FeedBackPage = dynamic(() => import("../../features/pages/FeedBackPage"));

export const metadata: Metadata = {
  title: "Share Your Feedback - Samriddhi Seva Trust",
  description:
    "Your feedback matters! Share your experience, suggestions, and thoughts about Samriddhi Seva Trust. Help us improve and serve the community better.",
  keywords: [
    "Feedback Samriddhi Seva Trust",
    "NGO feedback",
    "Share experience",
    "Customer satisfaction",
    "Community feedback",
    "Volunteer feedback",
    "Service improvement",
    "Non-profit feedback form",
    "Suggestions",
    "User experience",
  ],
};

const Page = () => {
  return <FeedBackPage />;
};

export default Page;
