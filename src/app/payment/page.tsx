"use client";

import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Gift,
  Heart,
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
import Swal from "sweetalert2";
import * as Yup from "yup";

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

export default function PaymentPage() {
  const [step, setStep] = useState<
    "member-check" | "details" | "processing" | "success"
  >("member-check");
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [paymentMonth, setPaymentMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [show80GInfo, setShow80GInfo] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<{
    _id: string;
    invoiceNumber: string;
    amount: number;
    needs80G: boolean;
    certificateNumber80G?: string;
    razorpayPaymentId: string;
  } | null>(null);

  const { mutation, isLoading } = useMutation();
  const { data: membersData, isLoading: membersLoading } = useSwr(
    isMember === true ? "members" : null
  );

  const members = useMemo(
    () => (membersData?.members || []) as Member[],
    [membersData]
  );

  // Use ref instead of state to avoid infinite loops
  const formikRef = useRef<{
    setFieldValue: (field: string, value: string) => void;
    resetForm: () => void;
  } | null>(null);

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

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name: Yup.string()
          .min(3, "Name must be at least 3 characters")
          .required("Full name is required"),
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
        phone: Yup.string()
          .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
          .when("$isMember", {
            is: false,
            then: (schema) => schema.required("Phone number is required"),
          }),
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
      }),
    []
  );

  const initialValues = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      address: "",
      amount: "200",
      needs80G: false,
      panCard: "",
    }),
    []
  );

  const formikContext = useMemo(() => ({ isMember }), [isMember]);

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

  const handlePayment = async (values: typeof initialValues) => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway is loading, please wait...");
      return;
    }

    if (isMember && !selectedMemberId) {
      toast.error("Please select a member");
      return;
    }

    setStep("processing");

    try {
      const orderResponse = await mutation("payments/create-order", {
        method: "POST",
        body: {
          paymentType: isMember ? "member" : "donation",
          memberId: isMember ? selectedMemberId : undefined,
          month: isMember ? paymentMonth : undefined,
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
        setStep("details"); // Reset to details step
        // Reset form
        if (formikRef.current) {
          formikRef.current.resetForm();
        }
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text:
            orderResponse?.results?.error ||
            "Failed to create order. Please try again.",
        });
        return; // Exit early
      } else if (
        orderResponse?.status === 201 ||
        orderResponse?.status === 200
      ) {
        const { orderId, amount, keyId, paymentId } = orderResponse.results;

        const razorpay = new window.Razorpay({
          key: keyId,
          amount,
          currency: "INR",
          name: "Samrudhi Trust",
          description: isMember
            ? `Membership Payment - ${paymentMonth}`
            : "Donation",
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
              setCompletedPayment(payment);
              toast.success("Payment successful! Opening invoice...");

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
                    // Redirect to home after a short delay
                    setTimeout(() => {
                      window.location.href = "/";
                    }, 1000);
                  } else {
                    toast.error("Please allow pop-ups to view invoice");
                    setStep("success");
                  }
                } else {
                  toast.warning("Invoice will be sent via email");
                  formikRef.current?.resetForm();
                  setStep("details");
                }
              } catch {
                toast.warning(
                  "Payment successful! Invoice will be sent via email"
                );
                formikRef.current?.resetForm();
                setStep("details");
              }
            } else {
              throw new Error("Payment verification failed");
            }
          },
          modal: {
            ondismiss: () => {
              setStep("details");
              toast.info("Payment cancelled");
            },
          },
        });

        razorpay.open();
      }
    } catch (error) {
      toast.error((error as Error).message || "Payment failed");
      setStep("details");
    }
  };

  const downloadInvoice = async () => {
    if (!completedPayment?._id) return;

    try {
      const response = await fetch(
        `/api/payments/invoice/${completedPayment._id}`
      );
      const data = await response.json();

      if (data.success) {
        const invoiceWindow = window.open("", "_blank");
        if (invoiceWindow) {
          invoiceWindow.document.write(data.invoiceHTML);
          invoiceWindow.document.close();
        } else {
          toast.error("Please allow pop-ups to view invoice");
        }
      }
    } catch {
      toast.error("Failed to download invoice");
    }
  };

  // Step 1: Member Check
  if (step === "member-check") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="w-full mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
                <Heart className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-5xl font-bold text-gray-800 mb-4">
                Make a Difference Today
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose how {"you'd"} like to contribute to our mission of
                creating positive change in communities
              </p>
            </motion.div>

            {/* Payment Options */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Member Payment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  setIsMember(true);
                  setStep("details");
                }}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
                      <Users className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Member Payment
                    </h3>
                    <p className="text-gray-600 mb-6 grow">
                      Make your monthly membership contribution and continue
                      supporting our community initiatives
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Fast auto-fill for registered members</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Automatic membership renewal</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Member benefits and recognition</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-semibold text-blue-600">
                        For Existing Members
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Donation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => {
                  setIsMember(false);
                  setStep("details");
                }}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
                      <Gift className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Make a Donation
                    </h3>
                    <p className="text-gray-600 mb-6 grow">
                      Support our cause with a generous contribution and help us
                      create lasting impact
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>80G tax exemption certificate</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>50% tax deduction benefit</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Instant payment receipt</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-semibold text-purple-600">
                        Open to Everyone
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Security Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-md border border-gray-100">
                <Lock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Secure Payment • SSL Encrypted • Powered by Razorpay
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Details Form
  if (step === "details") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="w-full mx-auto">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                setStep("member-check");
                setIsMember(null);
                setSelectedMemberId("");
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to selection</span>
            </motion.button>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left Sidebar - Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <div className="sticky top-8">
                  <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                      {isMember ? (
                        <Users className="w-7 h-7 text-white" />
                      ) : (
                        <Gift className="w-7 h-7 text-white" />
                      )}
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                      {isMember ? "Member Payment" : "Make a Donation"}
                    </h2>
                    <p className="text-gray-600 mb-8">
                      {isMember
                        ? "Complete your membership payment securely"
                        : "Your contribution makes a real difference"}
                    </p>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            Secure & Safe
                          </h4>
                          <p className="text-sm text-gray-600">
                            256-bit SSL encryption ensures your data is
                            protected
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            Instant Receipt
                          </h4>
                          <p className="text-sm text-gray-600">
                            Get immediate confirmation and receipt via email
                          </p>
                        </div>
                      </div>

                      {!isMember && (
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                              Tax Benefits
                            </h4>
                            <p className="text-sm text-gray-600">
                              Claim 50% tax deduction with 80G certificate
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Lock className="w-4 h-4" />
                        <span>Your information is encrypted and secure</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Payment Details
                  </h3>

                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    context={formikContext}
                    onSubmit={handlePayment}
                    innerRef={(ref) => {
                      formikRef.current = ref;
                    }}
                  >
                    {({ values }) => (
                      <Form className="space-y-6">
                        {/* Member Selection */}
                        {isMember && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Select Member
                            </label>
                            {membersLoading ? (
                              <div className="flex items-center justify-center py-12 bg-gray-50 rounded-2xl">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
                                <span className="text-gray-600">
                                  Loading members...
                                </span>
                              </div>
                            ) : (
                              <select
                                value={selectedMemberId}
                                onChange={(e) =>
                                  setSelectedMemberId(e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-gray-900"
                                required
                              >
                                <option value="">Choose a member</option>
                                {members.map((member) => (
                                  <option key={member._id} value={member._id}>
                                    {member.name} - {member.email}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                        {/* Payment Month */}
                        {isMember && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Payment Month
                            </label>
                            <input
                              type="month"
                              value={paymentMonth}
                              onChange={(e) => setPaymentMonth(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-gray-900"
                              required
                            />
                          </div>
                        )}
                        {/* Name & Email */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Full Name
                            </label>
                            <Field
                              type="text"
                              name="name"
                              placeholder="John Doe"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-gray-50 text-gray-900"
                              disabled={isMember && selectedMemberId !== ""}
                            />
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>

                          <div>
                            <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email Address
                            </label>
                            <Field
                              type="email"
                              name="email"
                              placeholder="john@example.com"
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-gray-50 text-gray-900"
                              disabled={isMember && selectedMemberId !== ""}
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        </div>
                        {/* Phone */}
                        <div>
                          <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone Number{" "}
                            {!isMember && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <Field
                            type="tel"
                            name="phone"
                            placeholder="9876543210"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none disabled:bg-gray-50 text-gray-900"
                            disabled={isMember && selectedMemberId !== ""}
                          />
                          <ErrorMessage
                            name="phone"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                        {/* Address */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Address <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="textarea"
                            name="address"
                            placeholder="Enter your complete address"
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none text-gray-900"
                          />
                          <ErrorMessage
                            name="address"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>
                        ){/* Amount */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" />
                            Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                              ₹
                            </span>
                            <Field
                              type="number"
                              name="amount"
                              min="200"
                              step="1"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-lg font-semibold text-gray-900"
                            />
                          </div>
                          <ErrorMessage
                            name="amount"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Minimum amount: ₹200
                          </p>
                        </div>
                        {/* 80G Certificate */}
                        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                          <div className="flex items-start gap-3">
                            <Field
                              type="checkbox"
                              name="needs80G"
                              id="needs80G"
                              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor="needs80G"
                                className="font-semibold text-gray-800 cursor-pointer flex items-center gap-2"
                              >
                                <FileText className="w-5 h-5 text-green-600" />I
                                need 80G Tax Certificate
                              </label>
                              <p className="text-sm text-gray-600 mt-1">
                                Claim 50% tax deduction on your donation amount
                              </p>

                              <button
                                type="button"
                                onClick={() => setShow80GInfo(!show80GInfo)}
                                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <Info className="w-4 h-4" />
                                {show80GInfo ? "Hide" : "Learn more about 80G"}
                              </button>

                              <AnimatePresence>
                                {show80GInfo && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-4 p-4 bg-white rounded-xl border border-green-200"
                                  >
                                    <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                                      What is 80G?
                                    </h4>
                                    <ul className="space-y-2 text-xs text-gray-600">
                                      <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                        <span>
                                          Section 80G allows tax deduction on
                                          donations to registered charitable
                                          organizations
                                        </span>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                        <span>
                                          You can claim 50% of your donation
                                          amount as deduction from taxable
                                          income
                                        </span>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                        <span>
                                          Valid PAN card is mandatory for
                                          issuing the certificate
                                        </span>
                                      </li>
                                      <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                        <span>
                                          Certificate can be used while filing
                                          your income tax returns
                                        </span>
                                      </li>
                                    </ul>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {values.needs80G && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-4"
                            >
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                PAN Card Number
                              </label>
                              <Field
                                type="text"
                                name="panCard"
                                placeholder="ABCDE1234F"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none uppercase text-gray-900"
                                maxLength={10}
                              />
                              <ErrorMessage
                                name="panCard"
                                component="div"
                                className="text-red-500 text-sm mt-1"
                              />
                            </motion.div>
                          )}
                        </div>
                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isLoading || !razorpayLoaded}
                          className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                        >
                          {!razorpayLoaded ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Loading Payment Gateway...
                            </>
                          ) : isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5" />
                              Pay ₹{values.amount} Securely
                            </>
                          )}
                        </button>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Shield className="w-4 h-4" />
                            <span>Secured by Razorpay • SSL Encrypted</span>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Processing
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Processing Payment
          </h2>
          <p className="text-gray-600 mb-8">
            Please wait while we securely process your transaction...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>Secure Payment Processing</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Step 4: Success
  if (step === "success" && completedPayment) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>

          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Thank you for your{" "}
            {isMember ? "membership payment" : "generous donation"} ❤️
          </p>

          {/* Payment Details */}
          <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl p-6 md:p-8 mb-8 text-left">
            <h3 className="font-bold text-gray-800 mb-6 text-lg text-center">
              Payment Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">
                  Invoice Number
                </span>
                <span className="font-bold text-gray-800">
                  {completedPayment.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Amount Paid</span>
                <span className="font-bold text-blue-600 text-2xl">
                  ₹{completedPayment.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Payment ID</span>
                <span className="font-mono text-sm text-gray-700 bg-white px-3 py-1 rounded-lg">
                  {completedPayment.razorpayPaymentId}
                </span>
              </div>
              {completedPayment.needs80G &&
                completedPayment.certificateNumber80G && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">
                      80G Certificate
                    </span>
                    <span className="font-bold text-green-600">
                      {completedPayment.certificateNumber80G}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* 80G Info */}
          {completedPayment.needs80G && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-green-800 mb-2">
                    80G Certificate Issued
                  </h4>
                  <p className="text-sm text-green-700">
                    Your tax deduction certificate has been generated. Download
                    it below to claim tax benefits.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={downloadInvoice}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-3"
            >
              <Download className="w-5 h-5" />
              Download{" "}
              {completedPayment.needs80G ? "80G Certificate" : "Invoice"}
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Return to Home
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Confirmation email sent to your registered email
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
