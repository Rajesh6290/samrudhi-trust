"use client";
import { motion } from "framer-motion";
import {
  Droplet,
  Gift,
  Globe,
  GraduationCap,
  Heart,
  Home,
  Shield,
  Utensils,
  Users,
  Zap,
} from "lucide-react";
import React from "react";
import useSwr from "../hooks/useSwr";

interface Service {
  _id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={32} />,
  Gift: <Gift size={32} />,
  Zap: <Zap size={32} />,
  Droplet: <Droplet size={32} />,
  GraduationCap: <GraduationCap size={32} />,
  Globe: <Globe size={32} />,
  Heart: <Heart size={32} />,
  Users: <Users size={32} />,
  Home: <Home size={32} />,
  Shield: <Shield size={32} />,
};

const WhatWeDo = () => {
  const { data: servicesData, isLoading: loading } = useSwr(
    "services?active=true"
  );
  const services: Service[] = servicesData?.services || [];

  const FADE_UP = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <section id="work" className="py-32 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-orange-500 font-black uppercase tracking-[0.2em] text-sm mb-4 block">
            What We Do
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
            Small acts, big impact.
          </h2>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-12 rounded-[2.5rem] shadow-xl h-72 animate-pulse"
              />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            <p className="text-xl">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {services.map((service) => (
              <motion.div
                key={service._id}
                {...FADE_UP}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 group"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                  {iconMap[service.icon] || <Utensils size={32} />}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-4">
                  {service.title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WhatWeDo;
