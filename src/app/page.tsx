"use client";
import DefaultLayouts from "@/features/layouts/DefaultLayouts";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import components for code splitting and optimization
const HeroSection = dynamic(() => import("@/features/components/HeroSection"), {
  ssr: true,
});
const AboutUs = dynamic(() => import("@/features/components/AboutUs"), {
  ssr: true,
});
const WhatWeDo = dynamic(() => import("@/features/components/WhatWeDo"), {
  loading: () => <div className="h-96 bg-slate-50 animate-pulse" />,
});

const OurStory = dynamic(() => import("@/features/components/OurStory"), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const RealTimeImpact = dynamic(
  () => import("@/features/components/RealTimeImpact"),
  {
    loading: () => <div className="h-96 bg-slate-50 animate-pulse" />,
  }
);

const Testimonials = dynamic(
  () => import("@/features/components/Testimonials"),
  {
    loading: () => <div className="h-96 bg-white animate-pulse" />,
  }
);

const Gallery = dynamic(() => import("@/features/components/Gallery"), {
  loading: () => <div className="h-96 bg-slate-50 animate-pulse" />,
});

const CTASection = dynamic(() => import("@/features/components/CTASection"), {
  loading: () => <div className="h-96 bg-emerald-900 animate-pulse" />,
});
const Certifications = dynamic(
  () => import("@/features/components/Certifications"),
  {
    loading: () => <div className="h-96 bg-emerald-900 animate-pulse" />,
  }
);

const VolunteerSection = dynamic(
  () => import("@/features/components/VolunteerSection"),
  {
    loading: () => <div className="h-96 bg-emerald-900 animate-pulse" />,
  }
);

export default function HomePage() {
  return (
    <DefaultLayouts>
      <Suspense
        fallback={<div className="h-screen bg-emerald-900 animate-pulse" />}
      >
        <HeroSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-slate-50 animate-pulse" />}>
        <WhatWeDo />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <OurStory />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <AboutUs />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-slate-50 animate-pulse" />}>
        <RealTimeImpact />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <Testimonials />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-slate-50 animate-pulse" />}>
        <Gallery />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <Certifications />
      </Suspense>

      <Suspense
        fallback={<div className="h-96 bg-emerald-900 animate-pulse" />}
      >
        <VolunteerSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-slate-900 animate-pulse" />}>
        <CTASection />
      </Suspense>
    </DefaultLayouts>
  );
}
