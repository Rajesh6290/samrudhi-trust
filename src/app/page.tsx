"use client";
import DefaultLayouts from "@/features/layouts/DefaultLayouts";
import PageLoader from "@/features/components/PageLoader";
import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";

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

const VideoSection = dynamic(
  () => import("@/features/components/VideoSection"),
  {
    loading: () => <div className="h-96 bg-white animate-pulse" />,
  }
);

const CTASection = dynamic(() => import("@/features/components/CTASection"), {
  loading: () => <div className="h-96 bg-emerald-900 animate-pulse" />,
});
const Certifications = dynamic(
  () => import("@/features/components/Certifications"),
  {
    loading: () => <div className="h-96 bg-emerald-900 animate-pulse" />,
  }
);

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loader for minimum 1.5 seconds for smooth experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

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
        <VideoSection />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <Certifications />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-slate-900 animate-pulse" />}>
        <CTASection />
      </Suspense>
    </DefaultLayouts>
  );
}
