"use client";
import { motion } from "framer-motion";
import { Droplet, HeartHandshake, Recycle, Utensils } from "lucide-react";
import React from "react";
import BackgroundSlider from "./BackgroundSlider";

const HeroSection: React.FC = () => {
  const heroImages = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1652858672796-960164bd632b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1613399421095-41f5c68e9f8c?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1623122617524-18ca7a791c37?auto=format&fit=crop&w=1920&q=80",
  ];

  return (
    <>
      <section
        id="home"
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <BackgroundSlider
          images={heroImages}
          duration={6000}
          effect="ken-burns"
          overlayOpacity="bg-gradient-to-r from-emerald-950/95 via-emerald-900/50 to-slate-900/85"
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-block bg-orange-500/20 text-orange-400 border border-orange-500/30 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-sm"
            >
              Transforming Lives Daily
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-3xl md:text-8xl font-black text-white md:leading-[0.9] md:tracking-tighter tracking-wider  mb-8"
            >
              Serving Humanity, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-200">
                One Meal
              </span>{" "}
              at a Time.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-emerald-50/90  md:text-2xl max-w-2xl mb-12 font-medium leading-relaxed"
            >
              Join samriddhi Seva Trust in our mission to rescue surplus food,
              provide life-saving blood, and nurture children in need. Together,
              we can make a difference.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap gap-6"
            >
              <button className="bg-orange-500 cursor-pointer hover:bg-orange-600 text-white sm:px-8 sm:py-1 px-4 py-1.5 rounded-full sm:font-black font-medium text-sm uppercase tracking-widest transition-all hover:scale-105 shadow-lg active:scale-95">
                Donate Now
              </button>
              <button className="group bg-white/10 cursor-pointer hover:bg-white/20 backdrop-blur-md text-white border border-white/20 sm:px-10 sm:py-3 px-6 py-1.5  rounded-full font-medium sm:font-black sm:text-lg transition-all hover:-translate-y-1 flex items-center gap-3">
                Our Impact{" "}
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-3"
          >
            <motion.div className="w-1 h-2 bg-white rounded-full" />
          </motion.div>
        </motion.div>
      </section>
      <div className="relative z-20 -mt-16 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 bg-white rounded-4xl shadow-2xl overflow-hidden border border-slate-100">
          {[
            {
              icon: <Utensils className="text-orange-500" />,
              title: "Free Food",
              sub: "Hospital Distribution",
            },
            {
              icon: <HeartHandshake className="text-emerald-600" />,
              title: "Orphan Care",
              sub: "Education & Health",
            },
            {
              icon: <Droplet className="text-red-500" />,
              title: "Emergency Blood",
              sub: "24/7 Donor Network",
            },
            {
              icon: <Recycle className="text-emerald-500" />,
              title: "Zero Waste",
              sub: "Event Food Rescue",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 flex items-center gap-6 border-r last:border-0 border-slate-50 hover:bg-emerald-50 transition-colors"
            >
              <div className="bg-slate-50 p-4 rounded-2xl">{item.icon}</div>
              <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 font-bold">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HeroSection;
