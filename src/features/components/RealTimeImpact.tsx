"use client";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const ImpactCounter = ({
  value,
  title,
  suffix = "",
}: {
  value: number;
  title: string;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds for smooth animation
      const steps = 60; // 60 steps for smoother updates
      const stepDuration = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        // Easing function for smooth deceleration (ease-out)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const newCount = Math.floor(easeOutQuart * value);

        setCount(newCount);

        if (currentStep >= steps) {
          setCount(value);
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div
      ref={ref}
      className="text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-3xl md:text-4xl font-black text-orange-600 mb-1">
        {count.toLocaleString()}
        {suffix}
      </h3>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        {title}
      </p>
    </div>
  );
};

const RealTimeImpact = () => {
  return (
    <section id="impact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 text-slate-900">
            Our Real-Time Impact
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Serving continuously since 2022
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactCounter value={12500} title="Meals Served" suffix="+" />
          <ImpactCounter value={720} title="Families Helped" suffix="+" />
          <ImpactCounter value={280} title="Blood Requests" suffix="+" />
          <ImpactCounter value={135} title="Active Volunteers" />
        </div>
      </div>
    </section>
  );
};

export default RealTimeImpact;
