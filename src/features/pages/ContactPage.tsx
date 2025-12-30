"use client";
import React, { useState, useEffect } from "react";
import DefaultLayouts from "../layouts/DefaultLayouts";
import BackgroundSlider from "../components/BackgroundSlider";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  User,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

interface SiteSettings {
  email: string;
  phone: string;
  address: string;
}

const ContactPage = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const backgroundImages = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80",
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&q=80",
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1920&q=80",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
          });
        }, 3000);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <DefaultLayouts>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <BackgroundSlider
          images={backgroundImages}
          duration={6000}
          effect="ken-burns"
          overlayOpacity="bg-emerald-950/90"
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-white">
              Get In <span className="text-emerald-400">Touch</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Have questions or want to get involved? {"We'd"} love to hear from
              you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-linear-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-8 shadow-2xl animate-pulse"
                >
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-6" />
                  <div className="h-6 bg-slate-200 rounded mb-3 w-24" />
                  <div className="h-4 bg-slate-200 rounded mb-2 w-32" />
                  <div className="h-4 bg-slate-200 rounded w-36" />
                </div>
              ))}
            </div>
          ) : settings ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 group border border-emerald-100">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3">
                  Call Us
                </h3>
                <p className="text-slate-600 mb-2">Mon-Sat: 9AM - 6PM</p>
                <a
                  href={`tel:${settings.phone}`}
                  className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                >
                  {settings.phone}
                </a>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 group border border-emerald-100">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3">
                  Email Us
                </h3>
                <p className="text-slate-600 mb-2">We reply within 24 hours</p>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors break-all"
                >
                  {settings.email}
                </a>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 group border border-emerald-100">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-3">
                  Visit Us
                </h3>
                <p className="text-slate-600 mb-2">Our main office</p>
                <address className="text-emerald-600 font-bold not-italic">
                  {settings.address}
                </address>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-emerald-100">
              <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
                  Send Us a <span className="text-emerald-600">Message</span>
                </h2>
                <p className="text-slate-600 text-lg">
                  Fill out the form below and {"we'll"} get back to you soon
                </p>
              </div>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-3">
                    Thank You!
                  </h3>
                  <p className="text-slate-600 text-lg">
                    Your message has been sent successfully.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-slate-800 font-bold mb-2"
                        htmlFor="name"
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-slate-800 font-bold mb-2"
                        htmlFor="email"
                      >
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address*
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        className="block text-slate-800 font-bold mb-2"
                        htmlFor="phone"
                      >
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white text-slate-800 placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-slate-800 font-bold mb-2"
                        htmlFor="subject"
                      >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Subject*
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-white text-slate-800"
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="volunteering">Volunteering</option>
                        <option value="donation">Donation</option>
                        <option value="partnership">Partnership</option>
                        <option value="general">General Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-slate-800 font-bold mb-2"
                      htmlFor="message"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Your Message*
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all duration-300 resize-none bg-white text-slate-800 placeholder:text-slate-400"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </DefaultLayouts>
  );
};

export default ContactPage;
