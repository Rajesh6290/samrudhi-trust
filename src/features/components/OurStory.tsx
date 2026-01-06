"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Heart,
  Users,
  Target,
  Award,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import useSwr from "../hooks/useSwr";

interface Content {
  _id: string;
  key: string;
  title: string;
  content: string;
  images: string[];
  metadata?: {
    milestones?: string[];
  };
}

const OurStory = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: contentData, isLoading: loading } = useSwr("content?key=story");
  const storyContent: Content | null =
    contentData?.content?.find((c: Content) => c.key === "story") || null;

  // Auto-swap images every 4 seconds
  useEffect(() => {
    if (!storyContent?.images || storyContent.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % storyContent.images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [storyContent]);

  const images = storyContent?.images || [];
  const milestones = storyContent?.metadata?.milestones || [];

  // Get preview text (first 2 paragraphs or 300 characters)
  const getPreviewText = (text: string) => {
    const paragraphs = text.split("\n\n");
    if (paragraphs.length > 2) {
      return paragraphs.slice(0, 2).join("\n\n");
    }
    if (text.length > 300) {
      return text.substring(0, 300) + "...";
    }
    return text;
  };

  const contentText = storyContent?.content || "";
  const previewText = getPreviewText(contentText);
  const hasMoreContent = contentText.length > previewText.length;

  const FADE_UP = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  };

  const SCALE_IN = {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <section
      id="about"
      className="py-10 container mx-auto px-6 overflow-hidden"
    >
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* Image Section with Carousel */}
        <motion.div {...FADE_UP} className="relative">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl rotate-2 transform transition-transform hover:rotate-0 duration-500">
            {loading ? (
              <div className="w-full h-[600px] bg-slate-200 animate-pulse" />
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.7 }}
                    className="relative w-full h-[600px]"
                  >
                    <Image
                      src={images[currentImageIndex]}
                      alt={`Our Story ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Image Navigation Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? "bg-white w-8"
                            : "bg-white/50 w-2 hover:bg-white/75"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </>
            )}
          </div>

          {/* Floating Stats Card */}
          <motion.div
            {...SCALE_IN}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-10 sm:-right-10 right-0 bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-3xl shadow-2xl text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8" />
              <span className="text-5xl font-black">10+</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest opacity-90">
              Years of Trust
            </span>
          </motion.div>

          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute -top-6 -left-6 w-24 h-24 bg-orange-500 rounded-full blur-3xl opacity-20"
          />
        </motion.div>

        {/* Content Section */}
        <motion.div {...FADE_UP} transition={{ delay: 0.2 }}>
          <span className="inline-flex items-center gap-2 text-orange-500 font-black uppercase tracking-[0.2em] text-sm mb-6">
            <Heart className="w-4 h-4 animate-pulse" />
            Our Story
          </span>

          {loading ? (
            <>
              <div className="h-16 bg-slate-200 rounded-2xl mb-8 animate-pulse" />
              <div className="h-24 bg-slate-200 rounded-2xl mb-8 animate-pulse" />
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
                <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter">
                {storyContent?.title || "Our Journey"}
              </h2>

              <div className="relative">
                <motion.p
                  className="text-slate-600 text-lg leading-relaxed mb-6 whitespace-pre-line"
                  initial={false}
                  animate={{ height: isExpanded ? "auto" : "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  {isExpanded ? contentText : previewText}
                </motion.p>

                {hasMoreContent && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center gap-2 mb-8 group transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Read Less
                        <motion.span
                          animate={{ rotate: 180 }}
                          className="group-hover:-translate-y-1 transition-transform"
                        >
                          ▼
                        </motion.span>
                      </>
                    ) : (
                      <>
                        Read More
                        <motion.span
                          animate={{ rotate: 0 }}
                          className="group-hover:translate-y-1 transition-transform"
                        >
                          ▼
                        </motion.span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-6 mb-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-lg transition-all duration-300 border border-emerald-100"
                >
                  <CheckCircle className="text-emerald-500 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-slate-900 font-bold uppercase text-sm mb-2">
                    Transparency
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Every donation is tracked and reported monthly.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-lg transition-all duration-300 border border-orange-100"
                >
                  <ShieldCheck className="text-orange-500 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-slate-900 font-bold uppercase text-sm mb-2">
                    Dedication
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Our volunteers work 24/7 for blood emergencies.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all duration-300 border border-blue-100"
                >
                  <Users className="text-blue-500 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-slate-900 font-bold uppercase text-sm mb-2">
                    Community
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Building stronger communities through service.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all duration-300 border border-purple-100"
                >
                  <Target className="text-purple-500 w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-slate-900 font-bold uppercase text-sm mb-2">
                    Impact
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Measurable results that transform lives daily.
                  </p>
                </motion.div>
              </div>

              {/* Milestones */}
              {milestones.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200"
                >
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-500" />
                    Our Milestones
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {milestones.map((milestone, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-slate-700 shadow-sm border border-slate-200"
                      >
                        {milestone}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 }}
                whileHover={{ x: 5 }}
                className="group flex items-center gap-3 font-black text-emerald-700 hover:text-emerald-800 uppercase tracking-widest text-sm transition-colors"
              >
                Read More About Us
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default OurStory;
