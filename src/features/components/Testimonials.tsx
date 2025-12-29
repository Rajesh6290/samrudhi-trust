"use client";
import { motion } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Volunteer Coordinator",
    content:
      "Working with samriddhi Seva Trust has been the most fulfilling experience of my life. Seeing the smiles on children's faces when we distribute food makes every effort worthwhile.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    rating: 5,
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Corporate Donor",
    content:
      "As a business owner, I wanted to give back to society. samriddhi Seva Trust's transparent operations and genuine impact made it an easy choice. They're doing incredible work.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rating: 5,
  },
  {
    id: 3,
    name: "Anita Deshmukh",
    role: "Community Member",
    content:
      "The blood donation drives organized by samriddhi have saved countless lives, including my own father's. Their dedication to serving humanity goes beyond words.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    rating: 5,
  },
  {
    id: 4,
    name: "Vikram Patel",
    role: "Regular Donor",
    content:
      "Every rupee donated reaches those who need it most. The trust's commitment to zero waste and maximum impact is commendable. I've been supporting them for 3 years.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    rating: 5,
  },
  {
    id: 5,
    name: "Meera Nair",
    role: "Teacher",
    content:
      "The educational support program has transformed the lives of my students. samriddhi's dedication to child welfare is truly inspiring and making a real difference.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
    rating: 5,
  },
  {
    id: 6,
    name: "Amit Singh",
    role: "Event Organizer",
    content:
      "Collaborating with samriddhi Seva Trust for community events has been seamless. Their professionalism and genuine care for people is evident in everything they do.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);

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
          {/* Testimonials Carousel - 1 on mobile, 2 on LG, 3 on XL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
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
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-orange-500/20">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
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
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
