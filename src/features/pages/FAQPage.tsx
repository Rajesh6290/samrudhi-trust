"use client";
import React, { useState, useEffect } from "react";
import DefaultLayouts from "../layouts/DefaultLayouts";
import BackgroundSlider from "../components/BackgroundSlider";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Book,
  Users,
} from "lucide-react";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const FAQPage = () => {
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch("/api/faqs");
      if (response.ok) {
        const data = await response.json();
        setFaqData(data.faqs);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(faqData.map((faq) => faq.category))),
  ];

  const categoryIcons: { [key: string]: React.ReactNode } = {
    General: <HelpCircle className="w-5 h-5" />,
    Donations: <MessageCircle className="w-5 h-5" />,
    Programs: <Book className="w-5 h-5" />,
    Volunteering: <Users className="w-5 h-5" />,
    Transparency: <MessageCircle className="w-5 h-5" />,
    Partnership: <Users className="w-5 h-5" />,
  };

  const backgroundImages = [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1920&q=80",
  ];

  const filteredFAQs =
    activeCategory === "All"
      ? faqData
      : faqData.filter((faq) => faq.category === activeCategory);

  return (
    <DefaultLayouts>
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
        <BackgroundSlider
          images={backgroundImages}
          duration={6000}
          effect="fade-zoom"
          overlayOpacity="bg-emerald-950/90"
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-6 animate-fade-in">
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase">
                Frequently Asked Questions
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 animate-slide-up tracking-tight">
              How Can We <span className="text-orange-400">Help You?</span>
            </h1>

            <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-8 animate-slide-up animation-delay-200">
              Find answers to common questions about Samriddhi Seva Trust, our
              programs, volunteering, donations, and more.
            </p>

            <div className="relative max-w-2xl mx-auto animate-slide-up animation-delay-300">
              <input
                type="text"
                placeholder="Search for answers..."
                className="w-full px-6 py-4 pl-12 rounded-full bg-white text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-4 focus:ring-orange-400 shadow-2xl transition-all"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  if (searchTerm) {
                    const matchedIndex = faqData.findIndex(
                      (faq) =>
                        faq.question.toLowerCase().includes(searchTerm) ||
                        faq.answer.toLowerCase().includes(searchTerm)
                    );
                    if (matchedIndex !== -1) setOpenIndex(matchedIndex);
                  }
                }}
              />
              <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-xl shadow-md py-6 border-b border-emerald-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                    transition-all duration-300 hover:scale-105 active:scale-95 shadow-md
                    ${
                      activeCategory === category
                        ? "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-500/50"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }
                  `}
              >
                {category !== "All" && categoryIcons[category]}
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <section className="py-16 bg-linear-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {loading && (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 shadow-sm animate-pulse"
                  >
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                  No FAQs Found
                </h3>
                <p className="text-slate-600 font-medium">
                  {activeCategory === "All"
                    ? "No FAQs available"
                    : `No FAQs in ${activeCategory} category`}
                </p>
              </div>
            )}

            {!loading && filteredFAQs.length > 0 && (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => {
                  const isOpen = openIndex === index;

                  return (
                    <div
                      key={index}
                      className={`
                      bg-white rounded-2xl shadow-lg overflow-hidden
                      transition-all duration-300 hover:shadow-xl
                      ${isOpen ? "ring-4 ring-emerald-500/20" : ""}
                    `}
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full px-8 py-6 flex items-start justify-between gap-4 text-left hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                              {faq.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                            {faq.question}
                          </h3>
                        </div>

                        <ChevronDown
                          className={`
                          w-6 h-6 text-emerald-600 shrink-0 transition-transform duration-300
                          ${isOpen ? "rotate-180" : ""}
                        `}
                        />
                      </button>

                      <div
                        className={`
                        overflow-hidden transition-all duration-500 ease-in-out
                        ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                      `}
                      >
                        <div className="px-8 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Our team is here to help! Reach out to us and{" we'll"} get back to
            you as soon as possible.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 shadow-2xl active:scale-95"
            >
              Contact Us
            </a>
            <a
              href="/feedback"
              className="inline-block bg-white hover:bg-slate-50 text-emerald-700 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 shadow-2xl active:scale-95"
            >
              Send Feedback
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </DefaultLayouts>
  );
};

export default FAQPage;
