"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

interface Content {
  _id: string;
  key: string;
  title: string;
  content: string;
  images: string[];
}

const AboutUs = () => {
  const [aboutContent, setAboutContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await fetch("/api/content?key=about");
        const data = await res.json();
        const about = data.content.find((c: Content) => c.key === "about");
        setAboutContent(about || null);
      } catch (error) {
        console.error("Failed to fetch about content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const defaultTitle = "Feeding the Hungry. Saving Lives.";
  const defaultContent =
    "We provide essential food, emergency medical aid, and blood donation support to underprivileged communities across Odisha.";
  const defaultImage =
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000";

  return (
    <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-40 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-xs font-black uppercase mb-6">
            🌱 Grassroots NGO since 2022
          </span>
          {loading ? (
            <>
              <div className="h-20 bg-slate-200 rounded-2xl mb-8 animate-pulse" />
              <div className="h-24 bg-slate-200 rounded-2xl mb-10 animate-pulse" />
            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8">
                {aboutContent?.title || defaultTitle}
              </h1>
              <p className="text-lg text-slate-600 max-w-lg mb-10 leading-relaxed whitespace-pre-line">
                {aboutContent?.content || defaultContent}
              </p>
            </>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="rounded-[3rem] overflow-hidden shadow-2xl border-10 border-white">
            {loading ? (
              <div className="w-full h-125 bg-slate-200 animate-pulse" />
            ) : (
              <Image
                src={aboutContent?.images[0] || defaultImage}
                className="w-full h-125 object-cover"
                alt="About Us"
                width={1000}
                height={500}
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;
