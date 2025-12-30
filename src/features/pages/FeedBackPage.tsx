"use client";
import React, { useState } from "react";
import DefaultLayouts from "../layouts/DefaultLayouts";
import BackgroundSlider from "../components/BackgroundSlider";
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle,
  User,
  Mail,
  Smile,
  Meh,
  Frown,
} from "lucide-react";

const FeedBackPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    category: "",
    feedback: "",
    anonymous: false,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const backgroundImages = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80",
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&q=80",
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920&q=80",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.anonymous ? "Anonymous" : formData.name,
          email: formData.email,
          message: formData.feedback,
          rating: formData.rating,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: "",
            email: "",
            rating: 0,
            category: "",
            feedback: "",
            anonymous: false,
          });
        }, 3000);
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const renderSentimentIcon = () => {
    const rating = hoveredRating || formData.rating;
    if (rating >= 4) return <Smile className="w-16 h-16 text-emerald-500" />;
    if (rating >= 2) return <Meh className="w-16 h-16 text-yellow-500" />;
    if (rating >= 1) return <Frown className="w-16 h-16 text-red-500" />;
    return <MessageSquare className="w-16 h-16 text-slate-300" />;
  };

  return (
    <DefaultLayouts>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <BackgroundSlider
          images={backgroundImages}
          duration={6000}
          effect="ken-burns"
          overlayOpacity="bg-emerald-950/85"
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase text-white">
                Your Voice Matters
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-white">
              Share Your <span className="text-emerald-400">Feedback</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Help us serve better! Your feedback helps us improve our services
              and create a greater impact.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section className="py-20 bg-linear-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-100">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-3">
                    Thank You!
                  </h3>
                  <p className="text-slate-600 text-lg">
                    Your feedback has been received successfully.
                  </p>
                </div>
              ) : (
                <>
                  {/* Rating Section */}
                  <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                      {renderSentimentIcon()}
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-6">
                      How was your experience?
                    </h2>
                    <div className="flex justify-center gap-3 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() =>
                            setFormData({ ...formData, rating: star })
                          }
                          className="transition-transform hover:scale-125 active:scale-110"
                        >
                          <Star
                            className={`w-12 h-12 transition-colors ${
                              star <= (hoveredRating || formData.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {formData.rating > 0 && (
                      <p className="text-slate-600 font-medium animate-fadeIn">
                        {formData.rating === 5 &&
                          "Excellent! We're thrilled to hear that! 🎉"}
                        {formData.rating === 4 &&
                          "Great! Thank you for your positive feedback! 😊"}
                        {formData.rating === 3 &&
                          "Good! We appreciate your feedback."}
                        {formData.rating === 2 &&
                          "We're sorry to hear that. Please tell us more."}
                        {formData.rating === 1 &&
                          "We apologize. Your feedback is valuable."}
                      </p>
                    )}
                  </div>

                  {/* Feedback Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-slate-800 font-bold mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Your Name {!formData.anonymous && "*"}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required={!formData.anonymous}
                          disabled={formData.anonymous}
                          className="w-full px-4 py-3.5 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-slate-100 disabled:text-slate-400 bg-white text-slate-800 placeholder:text-slate-400"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-800 font-bold mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email Address {!formData.anonymous && "*"}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required={!formData.anonymous}
                          disabled={formData.anonymous}
                          className="w-full px-4 py-3.5 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-slate-100 disabled:text-slate-400 bg-white text-slate-800 placeholder:text-slate-400"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <input
                        type="checkbox"
                        name="anonymous"
                        id="anonymous"
                        checked={formData.anonymous}
                        onChange={handleChange}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                      <label
                        htmlFor="anonymous"
                        className="text-sm font-medium text-slate-700 cursor-pointer"
                      >
                        Submit feedback anonymously
                      </label>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-2">
                        Feedback Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white text-slate-800"
                      >
                        <option value="">Select a category</option>
                        <option value="service">Service Quality</option>
                        <option value="program">Program Experience</option>
                        <option value="volunteer">Volunteer Experience</option>
                        <option value="website">Website & Communication</option>
                        <option value="suggestion">Suggestion</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-bold mb-2">
                        Your Feedback *
                      </label>
                      <textarea
                        name="feedback"
                        value={formData.feedback}
                        onChange={handleChange}
                        rows={6}
                        required
                        placeholder="Share your thoughts with us..."
                        className="w-full px-4 py-3.5 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 resize-none bg-white text-slate-800 placeholder:text-slate-400"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || formData.rating === 0}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </DefaultLayouts>
  );
};

export default FeedBackPage;
