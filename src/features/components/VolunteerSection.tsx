"use client";
import { motion } from "framer-motion";
import { Heart, Users, Clock, CheckCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const VolunteerSection = () => {
  const [submitted, setSubmitted] = useState(false);

  const interestOptions = [
    "Food Distribution",
    "Blood Donation",
    "Child Welfare",
    "Education",
    "Healthcare",
    "Event Management",
    "Social Media",
    "Fundraising",
  ];

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone is required"),
    city: Yup.string()
      .min(2, "City must be at least 2 characters")
      .required("City is required"),
    interest: Yup.string().required("Please select an area of interest"),
    availability: Yup.string().required("Availability is required"),
    whyVolunteer: Yup.string(),
  });

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    city: "",
    interest: "",
    availability: "flexible",
    whyVolunteer: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, resetForm }: any
  ) => {
    try {
      const response = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setSubmitted(true);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to submit volunteer application:", error);
      alert("Failed to submit application. Please try again.");
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
    <section
      id="volunteer"
      className="py-32 bg-linear-to-br from-emerald-900 via-emerald-800 to-slate-900 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Info */}
          <motion.div {...FADE_UP}>
            <span className="inline-flex items-center gap-2 text-emerald-300 font-black uppercase tracking-[0.2em] text-sm mb-6">
              <Sparkles size={16} />
              Join Our Mission
            </span>
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">
              Become a{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-300 to-orange-400">
                Volunteer
              </span>
            </h2>
            <p className="text-emerald-100 text-lg mb-10 leading-relaxed">
              Your time and skills can create meaningful change. Join our
              community of passionate volunteers making a real difference in
              people&apos;s lives.
            </p>

            {/* Benefits */}
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Heart className="text-emerald-300" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">
                    Make Real Impact
                  </h3>
                  <p className="text-emerald-200 text-sm">
                    Directly contribute to feeding families, saving lives, and
                    supporting children in need.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Users className="text-orange-300" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">
                    Join Community
                  </h3>
                  <p className="text-emerald-200 text-sm">
                    Connect with like-minded individuals who share your passion
                    for social service.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock className="text-purple-300" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2">
                    Flexible Schedule
                  </h3>
                  <p className="text-emerald-200 text-sm">
                    Choose opportunities that fit your schedule - weekdays,
                    weekends, or both.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            {...FADE_UP}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] p-10 shadow-2xl"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-emerald-600" size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">
                  Application Submitted!
                </h3>
                <p className="text-slate-600 mb-8">
                  Thank you for your interest in volunteering with us.
                  We&apos;ll review your application and get back to you soon.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold transition-colors"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-3">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-2">
                        Apply Now
                      </h3>
                      <p className="text-slate-600 text-sm">
                        Fill out the form below to join our volunteer team
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <Field
                        type="text"
                        name="name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
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
                          Phone *
                        </label>
                        <Field
                          type="tel"
                          name="phone"
                          className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
                          placeholder="+91 XXXXX XXXXX"
                        />
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          City *
                        </label>
                        <Field
                          type="text"
                          name="city"
                          className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
                          placeholder="Your city"
                        />
                        <ErrorMessage
                          name="city"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Availability *
                        </label>
                        <Field
                          as="select"
                          name="availability"
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-400 text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
                        >
                          <option value="flexible">Flexible</option>
                          <option value="weekdays">Weekdays Only</option>
                          <option value="weekends">Weekends Only</option>
                          <option value="both">Both Weekdays & Weekends</option>
                        </Field>
                        <ErrorMessage
                          name="availability"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Area of Interest *
                      </label>
                      <Field
                        as="select"
                        name="interest"
                        className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select an area of interest</option>
                        {interestOptions.map((interest) => (
                          <option key={interest} value={interest}>
                            {interest}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="interest"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Why do you want to volunteer?
                      </label>
                      <Field
                        as="textarea"
                        name="whyVolunteer"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-400 text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                        placeholder="Tell us about your motivation..."
                      />
                      <ErrorMessage
                        name="whyVolunteer"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 rounded-full font-black text-lg uppercase tracking-wider transition-all hover:-translate-y-1 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </Form>
                )}
              </Formik>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerSection;
