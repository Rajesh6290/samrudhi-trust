"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import useSwr from "../hooks/useSwr";

interface Content {
  _id: string;
  key: string;
  title: string;
  content: string;
  images: string[];
  metadata?: {
    registrationNumber?: string;
    founded?: string;
    location?: string;
  };
}

const AboutUs = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isValidating: loading } = useSwr("content?key=about");
  const aboutContent: Content | null = data ? data?.content?.[0] : null;
  // Auto-swap images every 5 seconds
  useEffect(() => {
    if (!aboutContent?.images || aboutContent.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % aboutContent.images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [aboutContent]);

  const images = aboutContent?.images || [];
  console.log(aboutContent?.title);
  // Get preview text (first paragraph or 250 characters)
  const getPreviewText = (text: string) => {
    const paragraphs = text.split("\n\n");
    if (paragraphs.length > 1) {
      return paragraphs[0];
    }
    if (text.length > 250) {
      return text.substring(0, 250) + "...";
    }
    return text;
  };

  const contentText = aboutContent?.content || "";
  const previewText = getPreviewText(contentText);
  const hasMoreContent = contentText.length > previewText.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-40 bg-gradient-to-br from-slate-50 via-orange-50/30 to-emerald-50/40 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-300 to-emerald-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-300 to-blue-300 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 px-5 py-2.5 rounded-full text-xs font-black uppercase shadow-sm border border-orange-200">
                <Sparkles className="w-4 h-4" />
                Grassroots NGO since 2022
              </span>
            </motion.div>

            {loading ? (
              <>
                <div className="h-24 bg-slate-200/50 rounded-3xl animate-pulse" />
                <div className="h-32 bg-slate-200/50 rounded-3xl animate-pulse" />
                <div className="h-20 bg-slate-200/50 rounded-3xl animate-pulse" />
              </>
            ) : (
              <>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
                  {aboutContent?.title || "About Samriddhi Seva Trust"}
                </h1>

                <motion.div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={isExpanded ? "full" : "preview"}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-lg text-slate-600 leading-relaxed whitespace-pre-line"
                    >
                      {isExpanded ? contentText : previewText}
                    </motion.p>
                  </AnimatePresence>

                  {hasMoreContent && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors group"
                    >
                      {isExpanded ? (
                        <>
                          Show Less
                          <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                        </>
                      ) : (
                        <>
                          Read Full Story
                          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  )}
                </motion.div>

                {/* Metadata Cards */}
                {aboutContent?.metadata && (
                  <motion.div className="grid grid-cols-3 gap-4 pt-6">
                    {aboutContent.metadata.founded && (
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <Calendar className="w-5 h-5 text-emerald-600 mb-2" />
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                          Founded
                        </p>
                        <p className="text-lg font-black text-slate-900">
                          {aboutContent.metadata.founded}
                        </p>
                      </div>
                    )}

                    {aboutContent.metadata.location && (
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <MapPin className="w-5 h-5 text-orange-600 mb-2" />
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                          Location
                        </p>
                        <p className="text-sm font-black text-slate-900 leading-tight">
                          {aboutContent.metadata.location}
                        </p>
                      </div>
                    )}

                    {aboutContent.metadata.registrationNumber && (
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow col-span-3 sm:col-span-1">
                        <FileCheck className="w-5 h-5 text-blue-600 mb-2" />
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                          Reg. No.
                        </p>
                        <p className="text-xs font-bold text-slate-900 break-all">
                          {aboutContent.metadata.registrationNumber}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </motion.div>

          {/* Right Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotate: 3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative group">
              {/* Main Image Container */}
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white transform transition-transform duration-500 group-hover:scale-[1.02]">
                {loading ? (
                  <div className="w-full h-[500px] bg-slate-200 animate-pulse" />
                ) : (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.7 }}
                        className="relative w-full h-[500px]"
                      >
                        <Image
                          src={images[currentImageIndex]}
                          alt={`About Us ${currentImageIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Image Navigation Indicators */}
                    {images.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === currentImageIndex
                                ? "bg-white w-10 shadow-lg"
                                : "bg-white/60 w-2 hover:bg-white/80"
                            }`}
                            aria-label={`View image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  </>
                )}
              </div>

              {/* Decorative Elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl blur-2xl opacity-30"
              />
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-3xl blur-2xl opacity-30"
              />
            </div>

            {/* Floating Stats Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 -left-8 bg-gradient-to-br from-white to-slate-50 p-6 rounded-3xl shadow-2xl border border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">50K+</p>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Lives Touched
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
