"use client";
import { motion } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import useSwr from "../hooks/useSwr";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  image?: string;
  rating: number;
  order: number;
}

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const { data: testimonialsData, isLoading: loading } = useSwr(
    "testimonials?active=true"
  );
  const testimonials: Testimonial[] = (
    testimonialsData?.testimonials || []
  ).sort((a: Testimonial, b: Testimonial) => a.order - b.order);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1280) {
        setCardsPerView(3); // XL screens
      } else if (window.innerWidth >= 1024) {
        setCardsPerView(2); // LG screens
      } else {
        setCardsPerView(1); // Mobile
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - cardsPerView);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + cardsPerView
  );

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-3xl shadow-xl p-8 animate-pulse">
      <div className="w-12 h-12 bg-slate-200 rounded-full mb-6" />
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 bg-slate-200 rounded" />
        ))}
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="h-4 bg-slate-200 rounded w-4/6" />
      </div>
      <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
        <div className="w-14 h-14 bg-slate-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-32 bg-linear-to-b from-slate-50 to-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-orange-500 font-black uppercase tracking-[0.2em] text-sm mb-4 block">
            Voices of Change
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
            Stories from Our Community
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Hear from volunteers, donors, and community members whose lives have
            been touched by our mission.
          </p>
        </motion.div>

        <div className="relative max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {[...Array(cardsPerView)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* No Testimonials */}
          {!loading && testimonials.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Quote className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                No Testimonials Yet
              </h3>
              <p className="text-slate-600 font-medium">
                Check back soon for community stories
              </p>
            </div>
          )}

          {/* Testimonials Carousel */}
          {!loading && testimonials.length > 0 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                {visibleTestimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial._id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all hover:-translate-y-2"
                  >
                    {/* Quote Icon */}
                    <div className="mb-6">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                        <Quote
                          className="text-orange-500"
                          size={24}
                          fill="currentColor"
                        />
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className="text-orange-500 fill-orange-500"
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-slate-700 text-base leading-relaxed mb-6 italic">
                      {` "${testimonial.content}"`}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                      {/* Avatar with fallback to User icon */}
                      <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-orange-500/20 bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                        {testimonial.image ? (
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-7 h-7 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-orange-500 font-semibold text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="sm:flex hidden justify-center gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full transition-all hover:scale-110 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Indicators */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`transition-all ${
                        index === currentIndex
                          ? "w-8 bg-orange-500"
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                      } h-2 rounded-full`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex}
                  className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full transition-all hover:scale-110 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Next testimonials"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
