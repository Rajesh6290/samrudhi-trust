"use client";

import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  CreditCard,
  IndianRupee,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import DefaultLayouts from "@/features/layouts/DefaultLayouts";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

const MemberPaymentPage = () => {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [paymentMonth, setPaymentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [show80GInfo, setShow80GInfo] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { mutation } = useMutation();
  const { data: membersData, isLoading: membersLoading } = useSwr("members");

  const members = useMemo(
    () => (membersData?.members || []) as Member[],
    [membersData]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formikRef = useRef<any>(null);

  useEffect(() => {
    if (selectedMemberId && members.length > 0 && formikRef.current) {
      const member = members.find((m) => m._id === selectedMemberId);
      if (member) {
        formikRef.current.setFieldValue("name", member.name);
        formikRef.current.setFieldValue("email", member.email);
        formikRef.current.setFieldValue("phone", member.phone || "");
      }
    }
  }, [selectedMemberId, members]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
    address: Yup.string()
      .min(10, "Address must be at least 10 characters")
      .required("Address is required"),
    amount: Yup.number()
      .min(200, "Minimum amount is ₹200")
      .required("Amount is required"),
    needs80G: Yup.boolean(),
    panCard: Yup.string()
      .transform((value) => value?.toUpperCase())
      .when("needs80G", {
        is: true,
        then: (schema) =>
          schema
            .matches(
              /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
              "Invalid PAN card format (e.g., ABCDE1234F)"
            )
            .required("PAN card is required for 80G certificate"),
      }),
  });

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    address: "",
    amount: "200",
    needs80G: false,
    panCard: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is loading, please wait...");
      setSubmitting(false);
      return;
    }

    if (!selectedMemberId) {
      toast.error("Please select a member");
      setSubmitting(false);
      return;
    }

    try {
      const orderResponse = await mutation("payments/create-order", {
        method: "POST",
        body: {
          paymentType: "member",
          memberId: selectedMemberId,
          month: paymentMonth,
          donorName: values.name,
          donorEmail: values.email,
          donorPhone: values.phone,
          donorAddress: values.address,
          amount: parseFloat(values.amount),
          needs80G: values.needs80G,
          panCard: values.needs80G ? values.panCard.toUpperCase() : undefined,
        },
      });

      if (!orderResponse?.results?.success) {
        toast.error(
          orderResponse?.results?.error ||
            "Failed to create order. Please try again."
        );
        setSubmitting(false);
        return;
      }

      const { orderId, amount, keyId, paymentId } = orderResponse.results;

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "Samrudhi Trust",
        description: `Membership Payment - ${paymentMonth}`,
        order_id: orderId,
        prefill: {
          name: values.name,
          email: values.email,
          contact: values.phone,
        },
        theme: {
          color: "#3b82f6",
        },
        handler: async (response: RazorpayResponse) => {
          const verifyResponse = await mutation("payments/verify", {
            method: "POST",
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            },
          });

          if (verifyResponse?.results?.success) {
            const payment = verifyResponse.results.payment;
            setSubmitted(true);
            toast.success(
              "Membership payment successful! Thank you for your support!"
            );

            // Automatically download/open invoice
            try {
              const invoiceResponse = await fetch(
                `/api/payments/invoice/${payment._id}`
              );
              const invoiceData = await invoiceResponse.json();

              if (invoiceData.success) {
                const invoiceWindow = window.open("", "_blank");
                if (invoiceWindow) {
                  invoiceWindow.document.write(invoiceData.invoiceHTML);
                  invoiceWindow.document.close();
                }
              }
            } catch {
              toast.info("Invoice will be sent via email");
            }

            resetForm();
            setSelectedMemberId("");
            setTimeout(() => {
              setSubmitted(false);
              window.location.href = "/";
            }, 3000);
          } else {
            throw new Error("Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setSubmitting(false);
          },
        },
      });

      razorpay.open();
    } catch (error) {
      toast.error((error as Error).message || "Payment failed");
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
    <DefaultLayouts showPaymentInfo={false}>
      <section
        id="member-payment"
        className="py-32 bg-linear-to-br from-blue-900 via-cyan-800 to-teal-900 relative overflow-hidden"
      >
        {/* Background Pattern */}
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
            {/* Left Side - Member Payment Info */}
            <motion.div {...FADE_UP}>
              <span className="inline-flex items-center gap-2 text-cyan-300 font-black uppercase tracking-[0.2em] text-sm mb-6">
                <Users className="w-4 h-4" />
                Member Payment
              </span>
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">
                Membership{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-teal-300 to-blue-300">
                  Payment Portal
                </span>
              </h2>
              <p className="text-cyan-100 text-lg mb-10 leading-relaxed">
                Make your monthly membership payment securely. Select your
                member profile and complete the payment for the selected month.
              </p>

              {/* Payment Benefits */}
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Shield className="text-cyan-300" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2">
                      Secure Transactions
                    </h3>
                    <p className="text-cyan-200 text-sm">
                      All payments are processed securely through Razorpay
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <CreditCard className="text-teal-300" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2">
                      Instant Receipt
                    </h3>
                    <p className="text-cyan-200 text-sm">
                      Get your payment receipt and invoice immediately
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center shrink-0">
                    <Calendar className="text-blue-300" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-2">
                      Monthly Tracking
                    </h3>
                    <p className="text-cyan-200 text-sm">
                      Keep track of your membership payments by month
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Payment Form */}
            <motion.div
              {...FADE_UP}
              transition={{ ...FADE_UP.transition, delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                {submitted ? (
                  <div className="text-center py-16">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <CheckCircle
                        className="mx-auto text-green-400 mb-6"
                        size={80}
                      />
                    </motion.div>
                    <h3 className="text-3xl font-black text-white mb-4">
                      Payment Successful!
                    </h3>
                    <p className="text-cyan-200 text-lg">
                      Your membership payment has been processed.
                      <br />
                      Redirecting to home page...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        Make Payment
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Complete your membership payment
                      </p>
                    </div>

                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                      innerRef={formikRef}
                    >
                      {({ isSubmitting, values }) => (
                        <Form className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Member Selection */}
                            <div className="md:col-span-2">
                              <label className="text-gray-700 font-semibold text-sm mb-1 flex items-center gap-2">
                                <Users size={16} />
                                Select Member *
                              </label>
                              {membersLoading ? (
                                <div className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-600 flex items-center gap-2">
                                  <Loader2 className="animate-spin" size={16} />
                                  Loading members...
                                </div>
                              ) : (
                                <select
                                  value={selectedMemberId}
                                  onChange={(e) =>
                                    setSelectedMemberId(e.target.value)
                                  }
                                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                                >
                                  <option value="">Select a member</option>
                                  {members.map((member) => (
                                    <option
                                      key={member._id}
                                      value={member._id}
                                      className="bg-slate-800"
                                    >
                                      {member.name} - {member.email}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {!selectedMemberId && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Please select a member to auto-fill details
                                </p>
                              )}
                            </div>

                            {/* Payment Month */}
                            <div className="md:col-span-2">
                              <label className="text-gray-700 font-semibold text-sm mb-1 flex items-center gap-2">
                                <Calendar size={16} />
                                Payment Month *
                              </label>
                              <input
                                type="month"
                                value={paymentMonth}
                                onChange={(e) =>
                                  setPaymentMonth(e.target.value)
                                }
                                max={new Date().toISOString().slice(0, 7)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Name Field */}
                            <div>
                              <label className="text-gray-700 font-semibold text-sm mb-1 flex items-center gap-2">
                                <User size={16} />
                                Full Name *
                              </label>
                              <Field
                                name="name"
                                type="text"
                                placeholder="Enter full name"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                              />
                              <ErrorMessage
                                name="name"
                                component="div"
                                className="text-red-300 text-sm mt-2 ml-1"
                              />
                            </div>

                            {/* Email Field */}
                            <div>
                              <label className="text-gray-700 font-semibold text-sm mb-1 flex items-center gap-2">
                                <Mail size={16} />
                                Email Address *
                              </label>
                              <Field
                                name="email"
                                type="email"
                                placeholder="your@email.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                              />
                              <ErrorMessage
                                name="email"
                                component="div"
                                className="text-red-300 text-sm mt-2 ml-1"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Phone Field */}
                            <div>
                              <label className="text-gray-700 font-semibold text-sm mb-1 flex items-center gap-2">
                                <Phone size={16} />
                                Phone Number
                              </label>
                              <Field
                                name="phone"
                                type="tel"
                                placeholder="10-digit mobile number (optional)"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                              />
                              <ErrorMessage
                                name="phone"
                                component="div"
                                className="text-red-300 text-sm mt-2 ml-1"
                              />
                            </div>

                            {/* Amount Field */}
                            <div>
                              <label className="text-gray-700 font-semibold text-sm mb-1 flex items-center gap-2">
                                <IndianRupee size={16} />
                                Payment Amount *
                              </label>
                              <Field
                                name="amount"
                                type="number"
                                min="200"
                                placeholder="Minimum ₹200"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                              />
                              <ErrorMessage
                                name="amount"
                                component="div"
                                className="text-red-300 text-sm mt-2 ml-1"
                              />
                            </div>
                          </div>

                          {/* Address Field */}
                          <div>
                            <label className="text-gray-700 font-semibold text-sm mb-1 flex items-center gap-2">
                              <MapPin size={16} />
                              Address *
                            </label>
                            <Field
                              name="address"
                              type="text"
                              placeholder="Enter complete address"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                            />
                            <ErrorMessage
                              name="address"
                              component="div"
                              className="text-red-300 text-sm mt-2 ml-1"
                            />
                          </div>

                          {/* 80G Certificate Option */}
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-start gap-3">
                              <Field
                                name="needs80G"
                                type="checkbox"
                                className="mt-1 w-4 h-4 rounded accent-blue-500"
                              />
                              <div className="flex-1">
                                <label className="text-gray-800 font-semibold block cursor-pointer text-sm">
                                  I need 80G Tax Exemption Certificate
                                </label>
                                <p className="text-gray-600 text-xs mt-1">
                                  Get tax benefits under section 80G
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShow80GInfo(!show80GInfo)}
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                <Info size={18} />
                              </button>
                            </div>

                            {show80GInfo && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-300"
                              >
                                <p className="text-gray-700 text-xs">
                                  <strong>About 80G Certificate:</strong> Claim
                                  tax deduction on your payment. PAN card
                                  required.
                                </p>
                              </motion.div>
                            )}

                            {values.needs80G && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3"
                              >
                                <label className="block text-gray-700 font-semibold text-sm mb-1">
                                  PAN Card Number *
                                </label>
                                <Field
                                  name="panCard"
                                  type="text"
                                  placeholder="ABCDE1234F"
                                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all uppercase"
                                />
                                <ErrorMessage
                                  name="panCard"
                                  component="div"
                                  className="text-red-300 text-sm mt-2 ml-1"
                                />
                              </motion.div>
                            )}
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={isSubmitting || !razorpayLoaded}
                            className="w-full bg-linear-to-r from-cyan-600 to-teal-600 text-white py-3 rounded-xl font-semibold text-base hover:shadow-lg hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="animate-spin" size={20} />
                                Processing...
                              </>
                            ) : !razorpayLoaded ? (
                              <>
                                <Loader2 className="animate-spin" size={20} />
                                Loading Payment Gateway...
                              </>
                            ) : (
                              <>
                                <Lock size={20} />
                                Proceed to Secure Payment
                              </>
                            )}
                          </button>

                          <p className="text-gray-500 text-xs text-center">
                            Secure payment processing via Razorpay. Your payment
                            details are protected.
                          </p>
                        </Form>
                      )}
                    </Formik>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </DefaultLayouts>
  );
};

export default MemberPaymentPage;
