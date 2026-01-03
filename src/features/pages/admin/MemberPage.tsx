"use client";
import dynamic from "next/dynamic";
const Members = dynamic(
  () => import("@/features/components/admin/members/Members"),
  { ssr: false }
);
const MemberPage = () => {
  return <Members />;
};

export default MemberPage;
