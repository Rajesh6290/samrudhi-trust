"use client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Phone, X, Upload } from "lucide-react";
import React, { useState } from "react";
import BackgroundSlider from "./BackgroundSlider";

const CTASection: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const bgImages = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920",
    "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920",
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1920",
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      <BackgroundSlider
        images={bgImages}
        duration={7000}
        effect="fade-zoom"
        overlayOpacity="bg-slate-900/85"
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Make a Difference
              <br />
              <span className="text-orange-500">Today</span>
            </h2>
            <p className="text-white/80 text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Your support helps us feed thousands, save lives through blood
              donation, and nurture children in need.
            </p>
          </motion.div>
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <button
              onClick={() => setShowFeedback(true)}
              className="group bg-orange-500 hover:bg-orange-400 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-3"
            >
              <MessageSquare className="group-hover:scale-110 transition-transform" />
              Give Feedback
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="group bg-white text-slate-900 hover:bg-slate-100 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-3"
            >
              <Phone className="group-hover:scale-110 transition-transform" />
              Contact Now
            </button>
          </motion.div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFeedback(false)}
            className="fixed inset-0 bg-black/80 z-100 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black text-slate-900">
                  Share Your Feedback
                </h3>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Profile Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-colors flex items-center gap-2"
                    >
                      <Upload size={20} />
                      Upload Image
                    </button>
                    <span className="text-sm text-slate-500">
                      Max size: 2MB
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Category *
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors">
                    <option>Select category</option>
                    <option>Food Distribution</option>
                    <option>Blood Donation</option>
                    <option>Child Welfare</option>
                    <option>Volunteer Experience</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Brief title for your feedback"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Your Feedback *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Share your experience with us..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-xl font-black text-lg transition-all hover:-translate-y-1 shadow-xl"
                >
                  Submit Feedback
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Dialog */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowContact(false)}
            className="fixed inset-0 bg-black/80 z-200 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black text-slate-900">
                  Get in Touch
                </h3>
                <button
                  onClick={() => setShowContact(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Purpose *
                  </label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors">
                    <option>Select purpose</option>
                    <option>Volunteer Registration</option>
                    <option>Corporate Partnership</option>
                    <option>Donation Inquiry</option>
                    <option>Event Collaboration</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-xl font-black text-lg transition-all hover:-translate-y-1 shadow-xl"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CTASection;
