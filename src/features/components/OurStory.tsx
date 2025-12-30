"use client";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface Content {
  _id: string;
  key: string;
  title: string;
  content: string;
  images: string[];
}

const OurStory = () => {
  const [storyContent, setStoryContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await fetch("/api/content?key=story");
        const data = await res.json();
        const story = data.content.find((c: Content) => c.key === "story");
        setStoryContent(story || null);
      } catch (error) {
        console.error("Failed to fetch story content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, []);

  const defaultImage =
    "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80";
  const defaultContent =
    "samriddhi Seva Trust was founded on a simple realization: that abundance exists, but it doesn't always reach those in need. We act as the bridge between surplus and scarcity.";

  const FADE_UP = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <section id="about" className="py-32 container mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <motion.div {...FADE_UP} className="relative">
          <div className="rounded-[3rem] overflow-hidden shadow-2xl rotate-2">
            {loading ? (
              <div className="w-full h-[600px] bg-slate-200 animate-pulse" />
            ) : (
              <Image
                src={storyContent?.images[0] || defaultImage}
                alt="Our Story"
                width={800}
                height={600}
                className="scale-105"
              />
            )}
          </div>
          <div className="absolute -bottom-10 sm:-right-10 right-0 bg-emerald-600 p-10 rounded-4xl shadow-2xl text-white">
            <span className="text-5xl font-black block">10+</span>
            <span className="text-xs font-bold uppercase tracking-widest">
              Years of Trust
            </span>
          </div>
        </motion.div>
        <motion.div {...FADE_UP} transition={{ delay: 0.2 }}>
          <span className="text-orange-500 font-black uppercase tracking-[0.2em] text-sm mb-6 block">
            Our Story
          </span>
          {loading ? (
            <>
              <div className="h-16 bg-slate-200 rounded-2xl mb-8 animate-pulse" />
              <div className="h-24 bg-slate-200 rounded-2xl mb-8 animate-pulse" />
            </>
          ) : (
            <>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter">
                {storyContent?.title || "Compassion in every action."}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8 whitespace-pre-line">
                {storyContent?.content || defaultContent}
              </p>
            </>
          )}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <CheckCircle className="text-emerald-500" />
              <h4 className=" text-black font-semibold uppercase text-sm">
                Transparency
              </h4>
              <p className="text-slate-500 text-sm">
                Every donation is tracked and reported monthly.
              </p>
            </div>
            <div className="space-y-3">
              <ShieldCheck className="text-emerald-500" />
              <h4 className=" text-black font-semibold uppercase text-sm">
                Dedication
              </h4>
              <p className="text-slate-500 text-sm">
                Our volunteers work 24/7 for blood emergencies.
              </p>
            </div>
          </div>
          <button className="group flex items-center gap-3 font-black text-emerald-700 uppercase tracking-widest text-sm">
            Read More About Us{" "}
            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default OurStory;
