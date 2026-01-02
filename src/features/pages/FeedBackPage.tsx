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
  Phone,
  MapPin,
  Heart,
  ThumbsUp,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

const FeedBackPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    rating: 0,
    category: "",
    feedback: "",
    improvements: "",
    wouldRecommend: "",
    anonymous: false,
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const backgroundImages = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80",
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&q=80",
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920&q=80",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const feedbackDetails = `
Category: ${formData.category}
Rating: ${formData.rating}/5 stars
Would Recommend: ${formData.wouldRecommend}
${formData.phone ? `Phone: ${formData.phone}` : ""}
${formData.location ? `Location: ${formData.location}` : ""}

Feedback:
${formData.feedback}

${formData.improvements ? `Suggested Improvements:\n${formData.improvements}` : ""}
      `.trim();

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.anonymous ? "Anonymous" : formData.name,
          email: formData.email,
          message: feedbackDetails,
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
            phone: "",
            location: "",
            rating: 0,
            category: "",
            feedback: "",
            improvements: "",
            wouldRecommend: "",
            anonymous: false,
          });
          setCurrentStep(1);
        }, 5000);
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

  const feedbackCategories = [
    {
      value: "service",
      label: "Service Quality",
      icon: ThumbsUp,
      color: "emerald",
    },
    {
      value: "program",
      label: "Program Experience",
      icon: Heart,
      color: "rose",
    },
    {
      value: "volunteer",
      label: "Volunteer Experience",
      icon: Sparkles,
      color: "purple",
    },
    {
      value: "website",
      label: "Website & Communication",
      icon: MessageSquare,
      color: "blue",
    },
    {
      value: "suggestion",
      label: "Suggestion",
      icon: Lightbulb,
      color: "amber",
    },
    {
      value: "complaint",
      label: "Issue/Complaint",
      icon: AlertCircle,
      color: "red",
    },
    { value: "other", label: "Other", icon: HelpCircle, color: "slate" },
  ];

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
            <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Help us serve better! Your honest feedback helps us improve our
              services, create greater impact, and serve the community more
              effectively.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-sm text-white font-semibold">
                  Easy & Quick
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Heart className="w-4 h-4 text-red-300" />
                <span className="text-sm text-white font-semibold">
                  Anonymous Option
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-sm text-white font-semibold">
                  Make a Difference
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section className="py-20 bg-linear-to-br from-emerald-50 via-white to-teal-50 relative">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Info Cards */}
          <div className="max-w-6xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Why Your Feedback Matters
                  </h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Every piece of feedback helps us understand your needs better
                  and improve our programs to serve the community more
                  effectively.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-teal-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-teal-100 rounded-xl">
                    <Heart className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    We Value Privacy
                  </h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Your information is secure with us. You can also submit
                  feedback anonymously if you prefer to keep your identity
                  private.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Quick & Easy
                  </h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Our simplified form takes just 2-3 minutes to complete. Share
                  as much or as little as {"you'd"} like.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-100">
              {isSubmitted ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 mb-6 animate-bounce">
                    <CheckCircle className="w-14 h-14 text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-slate-800 mb-4">
                    Thank You! 🎉
                  </h3>
                  <p className="text-slate-600 text-lg mb-6 max-w-md mx-auto">
                    Your valuable feedback has been received successfully. We
                    truly appreciate you taking the time to help us improve!
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <div className="px-4 py-2 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-emerald-700 font-semibold">
                        ✓ Feedback Recorded
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-teal-50 rounded-lg">
                      <p className="text-sm text-teal-700 font-semibold">
                        ✓ Team Notified
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Progress Indicator */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between max-w-md mx-auto">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"}`}
                        >
                          1
                        </div>
                        <span className="text-xs mt-2 font-semibold text-slate-600">
                          Rate
                        </span>
                      </div>
                      <div
                        className={`h-1 flex-1 ${currentStep >= 2 ? "bg-emerald-600" : "bg-slate-200"}`}
                      ></div>
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"}`}
                        >
                          2
                        </div>
                        <span className="text-xs mt-2 font-semibold text-slate-600">
                          Details
                        </span>
                      </div>
                      <div
                        className={`h-1 flex-1 ${currentStep >= 3 ? "bg-emerald-600" : "bg-slate-200"}`}
                      ></div>
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"}`}
                        >
                          3
                        </div>
                        <span className="text-xs mt-2 font-semibold text-slate-600">
                          Submit
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Rating & Category */}
                  {currentStep === 1 && (
                    <div className="space-y-8 animate-fadeIn">
                      {/* Rating Section */}
                      <div className="text-center">
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

                      {/* Category Selection */}
                      <div>
                        <label className="block text-slate-800 font-bold mb-4 text-center text-xl">
                          What would you like to share feedback about?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {feedbackCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    category: cat.value,
                                  })
                                }
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                  formData.category === cat.value
                                    ? `border-${cat.color}-500 bg-${cat.color}-50 shadow-md`
                                    : "border-slate-200 hover:border-slate-300 bg-white"
                                }`}
                              >
                                <Icon
                                  className={`w-6 h-6 ${formData.category === cat.value ? `text-${cat.color}-600` : "text-slate-400"}`}
                                />
                                <span
                                  className={`font-semibold ${formData.category === cat.value ? `text-${cat.color}-700` : "text-slate-600"}`}
                                >
                                  {cat.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        disabled={formData.rating === 0 || !formData.category}
                        className="w-full bg-linear-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg"
                      >
                        Continue to Details
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Contact Information */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                      <h2 className="text-3xl font-black text-slate-800 mb-6 text-center">
                        Tell us about yourself
                      </h2>

                      <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
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
                          🕶️ Submit feedback anonymously (Skip contact details)
                        </label>
                      </div>

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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-slate-800 font-bold mb-2">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Phone Number (Optional)
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={formData.anonymous}
                            className="w-full px-4 py-3.5 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-slate-100 disabled:text-slate-400 bg-white text-slate-800 placeholder:text-slate-400"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-800 font-bold mb-2">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Location (Optional)
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            disabled={formData.anonymous}
                            className="w-full px-4 py-3.5 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-slate-100 disabled:text-slate-400 bg-white text-slate-800 placeholder:text-slate-400"
                            placeholder="City, State"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1 bg-slate-200 text-slate-700 py-4 px-8 rounded-xl font-bold text-lg hover:bg-slate-300 transition-all duration-300"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3 shadow-lg"
                        >
                          Continue
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Detailed Feedback */}
                  {currentStep === 3 && (
                    <form
                      onSubmit={handleSubmit}
                      className="space-y-6 animate-fadeIn"
                    >
                      <h2 className="text-3xl font-black text-slate-800 mb-6 text-center">
                        Share your thoughts
                      </h2>

                      <div>
                        <label className="block text-slate-800 font-bold mb-2">
                          <MessageSquare className="w-4 h-4 inline mr-2" />
                          Your Feedback *
                        </label>
                        <textarea
                          name="feedback"
                          value={formData.feedback}
                          onChange={handleChange}
                          rows={6}
                          required
                          placeholder="Tell us about your experience, what you liked, or what could be improved..."
                          className="w-full px-4 py-3.5 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 resize-none bg-white text-slate-800 placeholder:text-slate-400"
                        ></textarea>
                        <p className="text-xs text-slate-500 mt-1">
                          Minimum 10 characters
                        </p>
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-2">
                          <Lightbulb className="w-4 h-4 inline mr-2" />
                          Suggestions for Improvement (Optional)
                        </label>
                        <textarea
                          name="improvements"
                          value={formData.improvements}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Any specific suggestions or ideas to help us serve better?"
                          className="w-full px-4 py-3.5 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 resize-none bg-white text-slate-800 placeholder:text-slate-400"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-slate-800 font-bold mb-3">
                          <ThumbsUp className="w-4 h-4 inline mr-2" />
                          Would you recommend us to others? *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            {
                              value: "yes",
                              label: "Yes, Definitely! 👍",
                              color: "emerald",
                            },
                            {
                              value: "maybe",
                              label: "Maybe 🤔",
                              color: "amber",
                            },
                            { value: "no", label: "Not Yet 👎", color: "red" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  wouldRecommend: option.value,
                                })
                              }
                              className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                                formData.wouldRecommend === option.value
                                  ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="flex-1 bg-slate-200 text-slate-700 py-4 px-8 rounded-xl font-bold text-lg hover:bg-slate-300 transition-all duration-300"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            !formData.feedback ||
                            !formData.wouldRecommend
                          }
                          className="flex-1 bg-linear-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg"
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
                      </div>
                    </form>
                  )}
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
