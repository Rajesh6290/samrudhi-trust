"use client";

import { useAuth } from "@/features/hooks/useAuth";
import useSwr from "@/features/hooks/useSwr";
import useMutation from "@/features/hooks/useMutation";
import { Dialog } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Eye,
  Gift,
  Heart,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  RefreshCw,
  Search,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

type DateRangeOption =
  | "current-month"
  | "last-6-months"
  | "last-year"
  | "custom";

interface Donation {
  _id: string;
  transactionType: "incoming";
  paymentType: "donation";
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  transactionDate: string;
  status: "pending" | "completed" | "failed";
  invoiceNumber?: string;
  paymentMethod?: string;
  razorpayPaymentId?: string;
  purpose?: string;
  month?: string;
  reconciliationStatus?:
    | "not_required"
    | "pending"
    | "reconciled"
    | "discrepancy";
  reconciliationNotes?: string;
  lastReconciliationDate?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export default function MyDonationsPage() {
  const { user } = useAuth();
  const { mutation } = useMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");
  const [periodFilter, setPeriodFilter] = useState<
    "all" | "current-month" | "last-6-months" | "last-year"
  >("all");
  const [page, setPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null
  );
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [donationSubmitted, setDonationSubmitted] = useState(false);
  const pageLimit = 10;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formikRef = useRef<any>(null);

  // Load Razorpay script
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

  // Populate form with user data
  useEffect(() => {
    if (user && formikRef.current && showDonateForm) {
      formikRef.current.setFieldValue("name", user.name || "");
      formikRef.current.setFieldValue("email", user.email || "");
      formikRef.current.setFieldValue("phone", user.phone || "");
    }
  }, [user, showDonateForm]);

  // Build query params - get all donations
  const queryParams = (() => {
    let params = `page=${page}&limit=100&transactionType=incoming&paymentType=donation`;
    if (statusFilter !== "all") params += `&status=${statusFilter}`;
    return params;
  })();

  const {
    data: donationsData,
    isLoading,
    mutate,
  } = useSwr(user?.email ? `transactions?${queryParams}` : null);

  // Filter donations to show only current user's donations
  const allDonations = (donationsData?.transactions || []) as Donation[];
  const userDonations = allDonations.filter(
    (donation) =>
      donation.donorEmail?.toLowerCase() === user?.email?.toLowerCase()
  );

  // Apply period filter
  const filteredByPeriod = userDonations.filter((donation) => {
    if (periodFilter === "all") return true;

    const donationDate = new Date(donation.transactionDate);
    const now = new Date();

    if (periodFilter === "current-month") {
      return (
        donationDate.getMonth() === now.getMonth() &&
        donationDate.getFullYear() === now.getFullYear()
      );
    } else if (periodFilter === "last-6-months") {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      return donationDate >= sixMonthsAgo;
    } else if (periodFilter === "last-year") {
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      return donationDate >= oneYearAgo;
    }
    return true;
  });

  // Check if current month payment is made
  const currentMonth = new Date().toISOString().slice(0, 7); // Format: "2026-01"
  const hasCurrentMonthDonation = userDonations.some((donation) => {
    if (donation.status !== "completed") return false;

    // Check both month field (for membership) and transactionDate (for donations)
    if (donation.month) {
      // If month field exists, compare it
      const donationMonth =
        typeof donation.month === "string"
          ? donation.month.slice(0, 7)
          : new Date(donation.month).toISOString().slice(0, 7);
      return donationMonth === currentMonth;
    } else if (donation.transactionDate) {
      // If no month field, check transaction date
      const transactionMonth = new Date(donation.transactionDate)
        .toISOString()
        .slice(0, 7);
      return transactionMonth === currentMonth;
    }
    return false;
  });

  // Calculate analytics based on filtered donations
  const analytics = {
    totalDonations: filteredByPeriod
      .filter((d) => d.status === "completed")
      .reduce((sum, d) => sum + d.amount, 0),
    totalCount: filteredByPeriod.filter((d) => d.status === "completed").length,
    pendingAmount: filteredByPeriod
      .filter((d) => d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0),
    currentMonthDonations: userDonations.filter(
      (d) => d.month === currentMonth && d.status === "completed"
    ).length,
  };

  // Apply search filter
  const filteredDonations = filteredByPeriod.filter((donation) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      donation.donorName?.toLowerCase().includes(query) ||
      donation.invoiceNumber?.toLowerCase().includes(query) ||
      donation.purpose?.toLowerCase().includes(query)
    );
  });

  // Client-side pagination
  const paginatedDonations = filteredDonations.slice(
    (page - 1) * pageLimit,
    page * pageLimit
  );
  const totalPages = Math.ceil(filteredDonations.length / pageLimit);

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone number is required"),
    address: Yup.string()
      .min(10, "Address must be at least 10 characters")
      .required("Address is required"),
    amount: Yup.number()
      .min(200, "Minimum amount is ₹200")
      .required("Amount is required"),
    purpose: Yup.string().optional(),
  });

  const initialValues = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    amount: "200",
    purpose: "",
  };

  const handleDonationSubmit = async (
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

    try {
      const orderResponse = await mutation("payments/create-order", {
        method: "POST",
        body: {
          paymentType: "donation",
          donorName: values.name,
          donorEmail: values.email,
          donorPhone: values.phone,
          donorAddress: values.address,
          amount: parseFloat(values.amount),
          month: new Date().toISOString().slice(0, 7),
          purpose: values.purpose || "General Donation",
        },
      });

      if (!orderResponse?.results?.success) {
        // Check if there's a pending payment
        if (
          orderResponse?.results?.isPending &&
          orderResponse?.results?.pendingPaymentId
        ) {
          toast.error(
            "You have a pending payment for this month. Please complete or retry the existing payment.",
            { autoClose: 5000 }
          );
          // Scroll to the pending payment in the list
          setTimeout(() => {
            const pendingElement = document.querySelector(
              `[data-payment-id="${orderResponse.results.pendingPaymentId}"]`
            );
            if (pendingElement) {
              pendingElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 500);
        } else {
          toast.error(
            orderResponse?.results?.error ||
              "Failed to create order. Please try again."
          );
        }
        setSubmitting(false);
        return;
      }

      const { orderId, amount, keyId, paymentId } = orderResponse.results;

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency: "INR",
        name: "Samrudhi Trust",
        description: values.purpose || "Donation",
        order_id: orderId,
        prefill: {
          name: values.name,
          email: values.email,
          contact: values.phone,
        },
        theme: {
          color: "#f97316",
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
            toast.success(
              "Donation successful! Thank you for your contribution."
            );
            setDonationSubmitted(true);
            mutate();
            resetForm();
            setTimeout(() => {
              setDonationSubmitted(false);
              setShowDonateForm(false);
            }, 3000);
          } else {
            toast.error("Payment verification failed");
            setSubmitting(false);
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
      console.error("Donation error:", error);
      toast.error("Failed to process donation");
      setSubmitting(false);
    }
  };

  const handleExport = async (
    option: DateRangeOption,
    customRange?: { start: string; end: string }
  ) => {
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      switch (option) {
        case "current-month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last-6-months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        case "last-year":
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          break;
        case "custom":
          if (!customRange) return;
          startDate = new Date(customRange.start);
          endDate = new Date(customRange.end);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const dateRangeLabel =
        option === "current-month"
          ? "Current Month"
          : option === "last-6-months"
            ? "Last 6 Months"
            : option === "last-year"
              ? "Last Year"
              : `${startDate.toLocaleDateString("en-IN")} - ${endDate.toLocaleDateString("en-IN")}`;

      // Filter by user email for export
      const pdfUrl = `/api/transactions/export-pdf?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&label=${encodeURIComponent(dateRangeLabel)}&donorEmail=${encodeURIComponent(user?.email || "")}`;
      window.open(pdfUrl, "_blank");

      toast.success("PDF export opened in new tab");
      setShowExportDialog(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleDownloadInvoice = async (invoiceNumber: string) => {
    try {
      // Open invoice in new tab
      const invoiceUrl = `/api/payments/invoice/${invoiceNumber}`;
      window.open(invoiceUrl, "_blank");

      toast.success("Invoice opened in new tab");
    } catch (error) {
      toast.error("Failed to open invoice. Please contact support.");
      console.error("Invoice error:", error);
    }
  };

  const handleRetryPayment = async (donation: Donation) => {
    try {
      // Generate payment link
      const data = await mutation("payments/generate-retry-link", {
        method: "POST",
        body: { transactionId: donation._id },
      });

      if (data?.results?.success) {
        // Open payment link in new tab
        window.open(data.results.paymentLink, "_blank");
        toast.success("Payment page opened in new tab");
      } else {
        throw new Error(
          data?.results?.error || "Failed to generate payment link"
        );
      }
    } catch (error) {
      console.error("Error generating payment link:", error);
      toast.error("Failed to generate payment link");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Please log in to view your donations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Donation Form Section */}
      {showDonateForm && (
        <div className="mb-8 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-linear-to-r from-orange-500 to-orange-600 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Gift className="w-7 h-7" />
                  Make a Donation
                </h2>
                <p className="text-orange-100 mt-1">
                  Support our mission with your contribution
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDonateForm(false);
                  setDonationSubmitted(false);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <div className="p-8">
            {donationSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle
                  className="mx-auto text-green-500 mb-4"
                  size={80}
                />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Thank You for Your Donation!
                </h3>
                <p className="text-slate-600 mb-4">
                  Your payment was successful. Receipt sent to your email.
                </p>
                <button
                  onClick={() => {
                    setDonationSubmitted(false);
                    setShowDonateForm(false);
                  }}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleDonationSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Name Field */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                          Full Name *
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={20}
                          />
                          <Field
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter your full name"
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-900"
                          />
                        </div>
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      {/* Email Field */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={20}
                          />
                          <Field
                            type="email"
                            id="email"
                            name="email"
                            placeholder="your@email.com"
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-900"
                          />
                        </div>
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={20}
                          />
                          <Field
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="10-digit phone number"
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-900"
                          />
                        </div>
                        <ErrorMessage
                          name="phone"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      {/* Amount Field */}
                      <div>
                        <label
                          htmlFor="amount"
                          className="block text-sm font-semibold text-slate-700 mb-2"
                        >
                          Donation Amount (₹) *
                        </label>
                        <div className="relative">
                          <IndianRupee
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                            size={20}
                          />
                          <Field
                            type="number"
                            id="amount"
                            name="amount"
                            placeholder="Minimum ₹200"
                            min="200"
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-900"
                          />
                        </div>
                        <ErrorMessage
                          name="amount"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    {/* Address Field */}
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-semibold text-slate-700 mb-2"
                      >
                        Address *
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-4 top-4 text-slate-400"
                          size={20}
                        />
                        <Field
                          as="textarea"
                          id="address"
                          name="address"
                          rows={3}
                          placeholder="Enter your complete address"
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-900 resize-none"
                        />
                      </div>
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Purpose Field */}
                    <div>
                      <label
                        htmlFor="purpose"
                        className="block text-sm font-semibold text-slate-700 mb-2"
                      >
                        Purpose (Optional)
                      </label>
                      <Field
                        type="text"
                        id="purpose"
                        name="purpose"
                        placeholder="e.g., Education, Healthcare, General"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-900"
                      />
                      <ErrorMessage
                        name="purpose"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setShowDonateForm(false)}
                        className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !razorpayLoaded}
                        className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Proceed to Payment
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      )}

      {/* Current Month Not Paid Alert */}
      {!hasCurrentMonthDonation && (
        <div className="mb-6 bg-linear-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-1">
                No Donation This Month
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                You haven&apos;t made any donations for{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
                . Your contribution helps us continue our mission.
              </p>
              <button
                onClick={() => {
                  if (hasCurrentMonthDonation) {
                    toast.info(
                      "You have already made a donation for this month. Thank you for your contribution!",
                      { autoClose: 4000 }
                    );
                  } else {
                    setShowDonateForm(true);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                <Gift className="w-5 h-5" />
                Donate Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-orange-500" />
            My Donations
          </h1>
          <p className="text-slate-600 mt-2">
            Track all your contributions and download invoices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (hasCurrentMonthDonation) {
                toast.info(
                  "You have already made a donation for this month. Thank you for your contribution!",
                  { autoClose: 4000 }
                );
              } else {
                setShowDonateForm(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Gift className="w-5 h-5" />
            Donate Now
          </button>
          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Donated</p>
          <h3 className="text-3xl font-bold">
            {formatCurrency(analytics.totalDonations)}
          </h3>
        </div>

        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Gift className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Donations</p>
          <h3 className="text-3xl font-bold">{analytics.totalCount}</h3>
        </div>

        <div className="bg-linear-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">Pending Amount</p>
          <h3 className="text-3xl font-bold">
            {formatCurrency(analytics.pendingAmount)}
          </h3>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm opacity-90 mb-1">This Month</p>
          <h3 className="text-3xl font-bold">
            {analytics.currentMonthDonations}
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, invoice, or purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          {/* Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => {
              setPeriodFilter(e.target.value as typeof periodFilter);
              setPage(1);
            }}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
          >
            <option value="all">All Time</option>
            <option value="current-month">Current Month</option>
            <option value="last-6-months">Last 6 Months</option>
            <option value="last-year">Last Year</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Donations Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : paginatedDonations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No donations yet
          </h3>
          <p className="text-slate-600">
            Your donation history will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedDonations.map((donation) => (
                    <tr
                      key={donation._id}
                      data-payment-id={donation._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900">
                            {formatDate(donation.transactionDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">
                          {donation.invoiceNumber || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900">
                          {donation.purpose || "General Donation"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(donation.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 capitalize">
                            {donation.paymentMethod || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                              donation.status
                            )}`}
                          >
                            {donation.status}
                          </span>
                          {donation.reconciliationStatus === "discrepancy" && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>Under Verification</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDonation(donation)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {donation.invoiceNumber &&
                            donation.status === "completed" && (
                              <button
                                onClick={() =>
                                  handleDownloadInvoice(donation.invoiceNumber!)
                                }
                                className="p-2 hover:bg-orange-100 rounded-lg transition-colors text-orange-600 hover:text-orange-700"
                                title="Download Invoice"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          {(donation.status === "failed" ||
                            donation.status === "pending") && (
                            <button
                              onClick={() => handleRetryPayment(donation)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                              title="Retry Payment"
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages} ({filteredDonations.length}{" "}
                donations)
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedDonation && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDonation(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Donation Details
                </h2>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Invoice Number
                    </p>
                    <p className="text-base text-slate-900">
                      {selectedDonation.invoiceNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Date
                    </p>
                    <p className="text-base text-slate-900">
                      {formatDate(selectedDonation.transactionDate)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">
                    Donor Name
                  </p>
                  <p className="text-base text-slate-900">
                    {selectedDonation.donorName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Email
                    </p>
                    <p className="text-base text-slate-900">
                      {selectedDonation.donorEmail}
                    </p>
                  </div>
                  {selectedDonation.donorPhone && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">
                        Phone
                      </p>
                      <p className="text-base text-slate-900">
                        {selectedDonation.donorPhone}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">
                    Amount
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(selectedDonation.amount)}
                  </p>
                </div>

                {selectedDonation.purpose && (
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Purpose
                    </p>
                    <p className="text-base text-slate-900">
                      {selectedDonation.purpose}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Payment Method
                    </p>
                    <p className="text-base text-slate-900 capitalize">
                      {selectedDonation.paymentMethod || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                        selectedDonation.status
                      )}`}
                    >
                      {selectedDonation.status}
                    </span>
                  </div>
                </div>

                {/* Reconciliation Status Warning */}
                {selectedDonation.reconciliationStatus === "discrepancy" && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 mb-1">
                          Payment Under Verification
                        </h4>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          {selectedDonation.reconciliationNotes ||
                            "This payment is being verified with the payment gateway. If money was deducted from your account, it will be reflected within 24-48 hours. You should have received an email with more details."}
                        </p>
                        <p className="text-xs text-amber-700 mt-2">
                          <strong>Need help?</strong> Contact our support team
                          at{" "}
                          <a href="/contact" className="underline">
                            support page
                          </a>{" "}
                          with your payment reference.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDonation.razorpayPaymentId && (
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-1">
                      Razorpay Payment ID
                    </p>
                    <p className="text-base text-slate-900 font-mono">
                      {selectedDonation.razorpayPaymentId}
                    </p>
                  </div>
                )}
              </div>

              {selectedDonation.invoiceNumber &&
                selectedDonation.status === "completed" && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <button
                      onClick={() =>
                        handleDownloadInvoice(selectedDonation.invoiceNumber!)
                      }
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download Invoice
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
      />
    </div>
  );
}

// Export Dialog Component
function ExportDialog({
  open,
  onClose,
  onExport,
}: {
  open: boolean;
  onClose: () => void;
  onExport: (
    option: DateRangeOption,
    customRange?: { start: string; end: string }
  ) => void;
}) {
  const [selectedOption, setSelectedOption] =
    useState<DateRangeOption>("current-month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handleExport = () => {
    if (selectedOption === "custom") {
      if (!customStart || !customEnd) {
        toast.error("Please select both start and end dates");
        return;
      }
      if (new Date(customStart) > new Date(customEnd)) {
        toast.error("Start date must be before end date");
        return;
      }
      onExport(selectedOption, { start: customStart, end: customEnd });
    } else {
      onExport(selectedOption);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Export Donation History
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Select a date range to export your donation history as PDF
        </p>

        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
            <input
              type="radio"
              name="dateRange"
              value="current-month"
              checked={selectedOption === "current-month"}
              onChange={(e) =>
                setSelectedOption(e.target.value as DateRangeOption)
              }
              className="w-4 h-4 text-orange-600"
            />
            <div>
              <div className="font-medium text-gray-900">Current Month</div>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
            <input
              type="radio"
              name="dateRange"
              value="last-6-months"
              checked={selectedOption === "last-6-months"}
              onChange={(e) =>
                setSelectedOption(e.target.value as DateRangeOption)
              }
              className="w-4 h-4 text-orange-600"
            />
            <div>
              <div className="font-medium text-gray-900">Last 6 Months</div>
              <div className="text-sm text-gray-600">
                Past 6 months of donation history
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
            <input
              type="radio"
              name="dateRange"
              value="last-year"
              checked={selectedOption === "last-year"}
              onChange={(e) =>
                setSelectedOption(e.target.value as DateRangeOption)
              }
              className="w-4 h-4 text-orange-600"
            />
            <div>
              <div className="font-medium text-gray-900">Last Year</div>
              <div className="text-sm text-gray-600">
                Past 12 months of donation history
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
            <input
              type="radio"
              name="dateRange"
              value="custom"
              checked={selectedOption === "custom"}
              onChange={(e) =>
                setSelectedOption(e.target.value as DateRangeOption)
              }
              className="w-4 h-4 text-orange-600 mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-3">Custom Range</div>
              {selectedOption === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
    </Dialog>
  );
}
