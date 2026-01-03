import MemberPage from "@/features/pages/admin/MemberPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Members | Admin Portal |Samriddhi Seva Trust - Serving Humanity, One Meal at a Time",
};

const page = () => {
  return <MemberPage />;
};

export default page;
