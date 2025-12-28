"use client";
import { motion } from "framer-motion";
import {
  Droplet,
  Gift,
  Globe,
  GraduationCap,
  Utensils,
  Zap,
} from "lucide-react";
import React from "react";

const WhatWeDo = () => {
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

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Utensils size={32} />,
              title: "Daily Hospital Feeding",
              desc: "Providing breakfast and lunch to patient attendees at government hospitals who often go hungry to save money for treatment.",
            },
            {
              icon: <Gift size={32} />,
              title: "Orphan Support",
              desc: "Sponsoring uniforms, books, and medical camps for 12+ partner children's homes in urban and rural clusters.",
            },
            {
              icon: <Zap size={32} />,
              title: "Event Food Rescue",
              desc: "Collaborating with wedding halls and caterers to collect untouched surplus food and distribute it to street dwellers within 2 hours.",
            },
            {
              icon: <Droplet size={32} />,
              title: "Blood Helpline",
              desc: "An automated and manual coordination network that connects blood donors with families in medical distress.",
            },
            {
              icon: <GraduationCap size={32} />,
              title: "Skill Centers",
              desc: "Training young adults from low-income families in basic computer literacy and vocational skills.",
            },
            {
              icon: <Globe size={32} />,
              title: "Emergency Relief",
              desc: "Immediate response team for food, water, and clothing distribution during natural calamities and floods.",
            },
          ].map((service, idx) => (
            <motion.div
              key={idx}
              {...FADE_UP}
              whileHover={{ y: -10 }}
              className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 group"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                {service.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4">
                {service.title}
              </h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
