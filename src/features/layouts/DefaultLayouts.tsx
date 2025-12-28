import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import ScrollProgress from "../components/ScrollProgress";

const Navbar = dynamic(() => import("@/features/components/Navbar"), {
  loading: () => <div className="h-20 bg-white" />,
});

const Footer = dynamic(() => import("@/features/components/Footer"), {
  loading: () => <div className="h-64 bg-slate-900" />,
});
const PaymentInfo = dynamic(() => import("@/features/components/PaymentInfo"), {
  loading: () => <div className="h-64 bg-slate-900" />,
});

const DefaultLayouts = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full min-h-dvh bg-white flex relative flex-col gap-5 ">
      <ScrollProgress />
      <Suspense fallback={<div className="h-20 bg-white" />}>
        <Navbar />
        {children}
        <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
          <PaymentInfo />
        </Suspense>
        <Suspense fallback={<div className="h-64 bg-slate-900" />}>
          <Footer />
        </Suspense>
      </Suspense>
    </div>
  );
};

export default DefaultLayouts;
