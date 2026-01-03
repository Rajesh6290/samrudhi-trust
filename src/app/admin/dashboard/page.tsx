import DashboardPage from "@/features/pages/admin/DashboardPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Dashboard | Admin Portal | Samriddhi Seva Trust - Serving Humanity, One Meal at a Time",
};

const page = () => {
  return <DashboardPage />;
};

export default page;
