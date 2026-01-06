"use client";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import { CheckCircle, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import useMutation from "../hooks/useMutation";
import useSwr from "../hooks/useSwr";
import DefaultLayouts from "../layouts/DefaultLayouts";

interface SiteSettings {
  email: string;
  phone: string;
  address: string;
}

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const { mutation, isLoading } = useMutation();
  const { data: settingsData, isLoading: loading } = useSwr("settings");
  const settings: SiteSettings | null = settingsData?.settings || null;

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .optional(),
    subject: Yup.string().required("Please select a subject"),
    message: Yup.string()
      .min(10, "Message must be at least 10 characters")
      .required("Message is required"),
  });

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    try {
      const response = await mutation("contact", {
        method: "POST",
        body: values,
        isAlert: true,
      });

      if (response?.results?.success) {
        setSubmitted(true);
        resetForm();
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error("Failed to submit contact form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const FADE_UP = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <DefaultLayouts>
      {/* Main Contact Section with Two-Column Layout */}
      <section
        id="contact"
        className="py-32 bg-linear-to-br from-blue-900 via-cyan-800 to-teal-900 relative overflow-hidden"
      >
        {/* Background Pattern - Textured Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.25) 0%, transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              `,
              backgroundBlendMode: "overlay",
            }}
          />
        </div>

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Contact Info */}
            <motion.div {...FADE_UP}>
              <span className="inline-flex items-center gap-2 text-cyan-300 font-black uppercase tracking-[0.2em] text-sm mb-6">
                Get In Touch
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">
                We&apos;d Love to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-teal-300 to-blue-300">
                  Hear From You
                </span>
              </h2>
              <p className="text-cyan-100 text-lg mb-10 leading-relaxed">
                Have questions or want to get involved? Reach out to us through
                any of these channels, and we&apos;ll get back to you as soon as
                possible.
              </p>

              {/* Contact Info Benefits */}
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 animate-pulse"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl" />
                        <div className="flex-1">
                          <div className="h-5 bg-white/20 rounded mb-2 w-24" />
                          <div className="h-4 bg-white/20 rounded w-40" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : settings ? (
                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center shrink-0">
                      <Phone className="text-cyan-300" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">
                        Call Us
                      </h3>
                      <p className="text-cyan-200 text-sm mb-1">
                        Mon-Sat: 9AM - 6PM
                      </p>
                      <a
                        href={`tel:${settings.phone}`}
                        className="text-cyan-300 font-bold hover:text-cyan-200 transition-colors"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center shrink-0">
                      <Mail className="text-teal-300" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">
                        Email Us
                      </h3>
                      <p className="text-cyan-200 text-sm mb-1">
                        We reply within 24 hours
                      </p>
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-teal-300 font-bold hover:text-teal-200 transition-colors break-all"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin className="text-blue-300" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">
                        Visit Us
                      </h3>
                      <p className="text-cyan-200 text-sm mb-1">
                        Our main office
                      </p>
                      <address className="text-blue-300 font-bold not-italic">
                        {settings.address}
                      </address>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* WhatsApp Button */}
              <button
                onClick={() => {
                  const whatsappNumber = "919876543210";
                  const message =
                    "Hello, I want to know more about Samrudhi Trust";
                  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
                  window.open(url, "_blank");
                }}
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
              >
                <svg
                  className="w-6 h-6 group-hover:rotate-12 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>Chat on WhatsApp</span>
              </button>
            </motion.div>

            {/* Right Side - Contact Form */}
            <motion.div
              {...FADE_UP}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] p-10 shadow-2xl"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-cyan-600" size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">
                    Message Sent!
                  </h3>
                  <p className="text-slate-600 mb-8">
                    Thank you for reaching out to us. We&apos;ll get back to you
                    within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-full font-bold transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-6">
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">
                          Send a Message
                        </h3>
                        <p className="text-slate-600 text-sm">
                          Fill out the form below and we&apos;ll respond shortly
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Full Name *
                        </label>
                        <Field
                          type="text"
                          name="name"
                          className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-cyan-500 focus:outline-none transition-colors"
                          placeholder="Enter your full name"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Email *
                          </label>
                          <Field
                            type="email"
                            name="email"
                            className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-cyan-500 focus:outline-none transition-colors"
                            placeholder="your@email.com"
                          />
                          <ErrorMessage
                            name="email"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Phone
                          </label>
                          <Field
                            type="tel"
                            name="phone"
                            className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-cyan-500 focus:outline-none transition-colors"
                            placeholder="+91 XXXXX XXXXX"
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Subject *
                        </label>
                        <Field
                          as="select"
                          name="subject"
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-400 text-gray-900 focus:border-cyan-500 focus:outline-none transition-colors"
                        >
                          <option value="">Select a subject</option>
                          <option value="volunteering">Volunteering</option>
                          <option value="donation">Donation</option>
                          <option value="partnership">Partnership</option>
                          <option value="general">General Inquiry</option>
                          <option value="other">Other</option>
                        </Field>
                        <ErrorMessage
                          name="subject"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Your Message *
                        </label>
                        <Field
                          as="textarea"
                          name="message"
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                          placeholder="Tell us how we can help..."
                        />
                        <ErrorMessage
                          name="message"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-black text-lg uppercase tracking-wider transition-all hover:-translate-y-1 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isSubmitting || isLoading ? (
                          <>
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={20} />
                            Send Message
                          </>
                        )}
                      </button>
                    </Form>
                  )}
                </Formik>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </DefaultLayouts>
  );
};

export default ContactPage;
