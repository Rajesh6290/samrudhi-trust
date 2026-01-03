"use client";
import dynamic from "next/dynamic";
const DashboardOverview = dynamic(
  () => import("@/features/components/admin/dashboard/DashboardOverview"),
  { ssr: false }
);
const DashboardPage = () => {
  return <DashboardOverview />;
};

export default DashboardPage;
