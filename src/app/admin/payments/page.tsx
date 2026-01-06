"use client";

import MemberPaymentDrawer from "@/features/components/admin/MemberPaymentDrawer";
import QRScanner from "@/features/components/admin/QRScanner";
import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Filter,
  Gift,
  Mail,
  Phone,
  Plus,
  QrCode,
  Receipt,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

interface Payment {
  _id: string;
  paymentType: "member" | "donation";
  member?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  month?: string;
  paymentDate: string;
  status: "pending" | "completed" | "failed";
  invoiceNumber?: string;
  paymentMethod?: string;
  razorpayPaymentId?: string;
  needs80G: boolean;
  certificateNumber80G?: string;
  panCard?: string;
}

export default function AdminPaymentsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<
    "all" | "members" | "donations" | "80g" | "payouts"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [qrScanData, setQrScanData] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const pageLimit = 15;

  useEffect(() => {
    const qrData = searchParams.get("qrScan");
    if (qrData) {
      startTransition(() => {
        setActiveTab("payouts");
        setQrScanData(qrData);
        setIsPayoutModalOpen(true);
      });
      window.history.replaceState({}, "", "/admin/payments");
    }
  }, [searchParams]);

  // Build query params that update when dependencies change
  const queryParams = (() => {
    let params = `page=${page}&limit=${pageLimit}`;
    if (activeTab === "members") params += "&paymentType=member";
    else if (activeTab === "donations") params += "&paymentType=donation";
    else if (activeTab === "80g") params += "&needs80G=true";
    if (statusFilter !== "all") params += `&status=${statusFilter}`;
    return params;
  })();

  const { data: paymentsData, isLoading: paymentsLoading } = useSwr(
    activeTab === "payouts" ? null : `payments?${queryParams}`
  );
  const { data: payoutsData } = useSwr(
    activeTab === "payouts" ? "payouts" : null
  );

  const payments = (paymentsData?.payments || []) as Payment[];
  const pagination = paymentsData?.pagination;
  const payouts = payoutsData?.payouts || [];

  const analytics = {
    total: payments.length,
    totalAmount: payments.reduce(
      (sum, p) => sum + (p.status === "completed" ? p.amount : 0),
      0
    ),
    completed: payments.filter((p) => p.status === "completed").length,
    pending: payments.filter((p) => p.status === "pending").length,
    members: payments.filter((p) => p.paymentType === "member").length,
    donations: payments.filter((p) => p.paymentType === "donation").length,
    with80G: payments.filter((p) => p.needs80G && p.certificateNumber80G)
      .length,
  };

  const filteredPayments = payments.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    const name = p.paymentType === "member" ? p.member?.name : p.donorName;
    const email = p.paymentType === "member" ? p.member?.email : p.donorEmail;
    return (
      name?.toLowerCase().includes(searchLower) ||
      email?.toLowerCase().includes(searchLower) ||
      p.invoiceNumber?.toLowerCase().includes(searchLower) ||
      p.certificateNumber80G?.toLowerCase().includes(searchLower)
    );
  });

  const downloadInvoice = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/invoice/${paymentId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.invoiceHTML) {
          const invoiceWindow = window.open("", "_blank");
          if (invoiceWindow) {
            invoiceWindow.document.write(data.invoiceHTML);
            invoiceWindow.document.close();
          } else {
            toast.error("Please allow pop-ups to view invoice");
          }
        } else {
          toast.error("Failed to generate invoice");
        }
      } else {
        toast.error("Failed to download invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const handleQRScan = async (qrData: string) => {
    setIsScannerOpen(false);
    setQrScanData(qrData);
    setIsPayoutModalOpen(true);
  };

  return (
    <div className="w-full h-fit">
      <div className="w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Payment Dashboard
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Real-time payment analytics and management
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                (window.location.href = "/admin/payments/reconciliation")
              }
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
            >
              <RefreshCw size={18} />
              Verify Payments
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
            >
              <QrCode size={18} />
              Scan QR
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                  Total
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{analytics.totalAmount.toLocaleString("en-IN")}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {analytics.completed} completed transactions
              </div>
            </div>
          </div>

          <div
            onClick={() => setIsDrawerOpen(true)}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <button className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">
                  <Eye className="w-3 h-3" />
                  View
                </button>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {analytics.members}
              </div>
              <div className="text-sm text-gray-600">Member subscriptions</div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-500 bg-purple-50 px-3 py-1 rounded-full">
                  Public
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {analytics.donations}
              </div>
              <div className="text-sm text-gray-600">Generous donations</div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-yellow-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform duration-300">
                  <BadgeCheck className="w-7 h-7 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-500 bg-yellow-50 px-3 py-1 rounded-full">
                  80G
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {analytics.with80G}
              </div>
              <div className="text-sm text-gray-600">
                Tax certificates issued
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                {
                  id: "all",
                  label: "All Payments",
                  icon: Receipt,
                  color: "blue",
                },
                {
                  id: "members",
                  label: "Members",
                  icon: Users,
                  color: "green",
                },
                {
                  id: "donations",
                  label: "Donations",
                  icon: Gift,
                  color: "purple",
                },
                {
                  id: "80g",
                  label: "80G Certs",
                  icon: BadgeCheck,
                  color: "yellow",
                },
                {
                  id: "payouts",
                  label: "Payouts",
                  icon: ArrowUpRight,
                  color: "orange",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-700 text-white shadow-lg scale-105`
                      : "bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 shadow-sm"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, invoice number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all font-medium"
              >
                <Filter className="w-5 h-5" />
                Filters
                {(statusFilter !== "all" || activeTab === "members") && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-xl border-2 border-gray-200 space-y-3 animate-in slide-in-from-top duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">
                    Filter Options
                  </span>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as typeof statusFilter)
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">✓ Completed</option>
                      <option value="pending">⏱ Pending</option>
                      <option value="failed">✗ Failed</option>
                    </select>
                  </div>
                  {activeTab === "members" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Month
                      </label>
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="overflow-x-auto">
            {activeTab === "payouts" ? (
              <PayoutsView
                payouts={payouts}
                onAddPayout={() => {
                  setQrScanData("");
                  setIsPayoutModalOpen(true);
                }}
                onScanQR={() => setIsScannerOpen(true)}
              />
            ) : paymentsLoading ? (
              <LoadingState />
            ) : filteredPayments.length === 0 ? (
              <EmptyState />
            ) : (
              <PaymentsTable
                payments={filteredPayments}
                onDownloadInvoice={downloadInvoice}
              />
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.pages}
              total={pagination.total}
              pageLimit={pageLimit}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Modals and Drawers */}
      <MemberPaymentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedMonth={selectedMonth}
      />
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQRScan}
      />
      {isPayoutModalOpen && (
        <PayoutModal
          qrData={qrScanData}
          onClose={() => {
            setIsPayoutModalOpen(false);
            setQrScanData("");
          }}
        />
      )}
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1s" }}
        />
      </div>
      <span className="mt-6 text-gray-600 font-medium">
        Loading payments...
      </span>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <Receipt className="w-12 h-12 text-gray-400" />
      </div>
      <p className="text-gray-900 text-xl font-semibold mb-2">
        No payments found
      </p>
      <p className="text-gray-500">
        Try adjusting your filters or search criteria
      </p>
    </div>
  );
}

// Payouts View Component
function PayoutsView({
  payouts,
  onAddPayout,
  onScanQR,
}: {
  payouts: any[];
  onAddPayout: () => void;
  onScanQR: () => void;
}) {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Manual Payouts & Expenses
          </h3>
          <p className="text-gray-600 mt-1">
            Track all manual payments and business expenses
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onScanQR}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
          >
            <QrCode size={18} />
            Scan QR
          </button>
          <button
            onClick={onAddPayout}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
          >
            <Plus size={18} />
            Add Payout
          </button>
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ArrowUpRight className="w-10 h-10 text-orange-500" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            No payouts recorded yet
          </p>
          <p className="text-gray-500 mt-2">
            Start by scanning a QR code or adding a manual entry
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payouts.map((payout: any) => (
            <div
              key={payout._id}
              className="bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-100 p-5 hover:shadow-lg transition-all duration-200 hover:border-orange-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <ArrowUpRight className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {payout.recipientName}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Phone className="w-4 h-4" />
                      {payout.recipientPhone}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {payout.purpose}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{payout.amount.toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold capitalize">
                      {payout.category}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold capitalize">
                      {payout.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(payout.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Payments Table Component
function PaymentsTable({
  payments,
  onDownloadInvoice,
}: {
  payments: Payment[];
  onDownloadInvoice: (id: string) => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-y-2 border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Donor/Member
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Invoice
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              80G
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-gray-100">
          {payments.map((payment) => {
            const name =
              payment.paymentType === "member"
                ? payment.member?.name
                : payment.donorName;
            const email =
              payment.paymentType === "member"
                ? payment.member?.email
                : payment.donorEmail;

            return (
              <tr
                key={payment._id}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {email || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {payment.paymentType === "member" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border-2 border-green-200">
                      <Users className="w-3.5 h-3.5" />
                      Member
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border-2 border-purple-200">
                      <Gift className="w-3.5 h-3.5" />
                      Donation
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 text-lg">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </div>
                  {payment.month && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(payment.month).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(payment.paymentDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {payment.invoiceNumber || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {payment.needs80G ? (
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border-2 border-yellow-200">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        Yes
                      </span>
                      {payment.certificateNumber80G && (
                        <div className="text-xs text-gray-500 mt-1 font-mono">
                          {payment.certificateNumber80G}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 font-medium">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${getStatusColor(payment.status)}`}
                  >
                    {getStatusIcon(payment.status)}
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {payment.status === "completed" && (
                    <button
                      onClick={() => onDownloadInvoice(payment._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      {payment.needs80G ? "80G" : "Invoice"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  total,
  pageLimit,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  total: number;
  pageLimit: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="p-6 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700 font-medium">
          Showing{" "}
          <span className="font-bold text-blue-600">
            {(currentPage - 1) * pageLimit + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold text-blue-600">
            {Math.min(currentPage * pageLimit, total)}
          </span>{" "}
          of <span className="font-bold text-blue-600">{total}</span> payments
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-110"
                      : "text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-300 hover:scale-105"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          >
            Next
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Payout Modal Component
function PayoutModal({
  qrData,
  onClose,
}: {
  qrData: string;
  onClose: () => void;
}) {
  const [paymentMode, setPaymentMode] = useState<"paynow" | "manual">("paynow");
  const { mutation: createPayout, isLoading: isMutating } = useMutation();

  const parseQRData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      return {
        name: parsed.name || parsed.recipientName || "",
        phone: parsed.phone || parsed.recipientPhone || parsed.mobile || "",
        upi: parsed.upi || parsed.upiId || "",
      };
    } catch {
      const upiMatch = data.match(/pa=([^&]+)/);
      const nameMatch = data.match(/pn=([^&]+)/);
      return {
        name: nameMatch ? decodeURIComponent(nameMatch[1]) : "",
        phone: "",
        upi: upiMatch ? upiMatch[1] : data,
      };
    }
  };

  const shopkeeperInfo = qrData
    ? parseQRData(qrData)
    : { name: "", phone: "", upi: "" };

  const payNowSchema = Yup.object({
    amount: Yup.number()
      .required("Amount is required")
      .min(1, "Amount must be at least ₹1")
      .max(100000, "Amount cannot exceed ₹1,00,000"),
    purpose: Yup.string().required("Purpose is required"),
  });

  const manualEntrySchema = Yup.object({
    recipientName: Yup.string().required("Recipient name is required"),
    recipientPhone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone number is required"),
    amount: Yup.number()
      .required("Amount is required")
      .min(1, "Amount must be at least ₹1"),
    purpose: Yup.string().required("Purpose is required"),
    category: Yup.string().required("Category is required"),
    paymentMethod: Yup.string().required("Payment method is required"),
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayNow = async (values: { amount: string; purpose: string }) => {
    try {
      const orderResponse = await createPayout("razorpay/create-order", {
        method: "POST",
        body: {
          amount: values.amount,
          notes: {
            recipientName: shopkeeperInfo.name,
            recipientPhone: shopkeeperInfo.phone,
            purpose: values.purpose,
          },
        },
        isAlert: false,
      });

      if (!orderResponse?.results?.id) {
        throw new Error("Failed to create order");
      }

      const order = orderResponse.results;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Samrudhi Trust",
        description: values.purpose,
        order_id: order.id,
        handler: async (response: { razorpay_payment_id: string }) => {
          const result = await createPayout("/api/payouts", {
            method: "POST",
            body: {
              recipientName: shopkeeperInfo.name,
              recipientPhone: shopkeeperInfo.phone,
              amount: values.amount,
              purpose: values.purpose,
              category: "supplies",
              paymentMethod: "upi",
              transactionId: response.razorpay_payment_id,
              qrData,
              status: "completed",
              notes: `Paid via Razorpay to UPI: ${shopkeeperInfo.upi}`,
            },
          });

          if (result?.results?.success) {
            toast.success("Payment successful!");
            onClose();
          } else {
            toast.error("Payment recorded but failed to save");
          }
        },
        prefill: {
          name: shopkeeperInfo.name,
          contact: shopkeeperInfo.phone,
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
    }
  };

  const handleManualEntry = async (values: Record<string, string>) => {
    const result = await createPayout("/api/payouts", {
      method: "POST",
      body: {
        ...values,
        status: "completed",
        qrData: "",
      },
    });

    if (result?.results?.success) {
      toast.success("Payment recorded successfully");
      onClose();
    } else {
      toast.error(result?.results?.error || "Failed to record payment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Payout Management</h2>
              <p className="text-blue-100 mt-1">
                Pay shopkeepers or record manual payments
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-6 flex gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setPaymentMode("paynow")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                paymentMode === "paynow"
                  ? "bg-white text-blue-600 shadow-lg scale-105"
                  : "text-white hover:bg-white/10"
              }`}
            >
              💳 Pay Now
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode("manual")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                paymentMode === "manual"
                  ? "bg-white text-blue-600 shadow-lg scale-105"
                  : "text-white hover:bg-white/10"
              }`}
            >
              ✍️ Manual Entry
            </button>
          </div>

          {qrData && shopkeeperInfo.name && paymentMode === "paynow" && (
            <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/30">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="text-white" size={20} />
                <span className="text-sm font-bold text-white">
                  Shopkeeper Details
                </span>
              </div>
              <div className="space-y-2 text-sm text-white">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Name:</span>{" "}
                  {shopkeeperInfo.name}
                </div>
                {shopkeeperInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {shopkeeperInfo.phone}
                  </div>
                )}
                {shopkeeperInfo.upi && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {shopkeeperInfo.upi}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          {paymentMode === "paynow" ? (
            <PayNowForm
              shopkeeperInfo={shopkeeperInfo}
              validationSchema={payNowSchema}
              onSubmit={handlePayNow}
              onCancel={onClose}
              isLoading={isMutating}
              hasQRData={!!qrData}
            />
          ) : (
            <ManualEntryForm
              validationSchema={manualEntrySchema}
              onSubmit={handleManualEntry}
              onCancel={onClose}
              isLoading={isMutating}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Pay Now Form Component
function PayNowForm({
  shopkeeperInfo,
  validationSchema,
  onSubmit,
  onCancel,
  isLoading,
  hasQRData,
}: {
  shopkeeperInfo: { name: string; phone: string; upi: string };
  validationSchema: any;
  onSubmit: (values: { amount: string; purpose: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  hasQRData: boolean;
}) {
  return (
    <Formik
      initialValues={{
        amount: "",
        purpose: "",
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched }) => (
        <Form className="space-y-6">
          {!hasQRData && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Please scan a QR code first to get shopkeeper details
              </p>
            </div>
          )}

          {hasQRData && shopkeeperInfo.name && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Paying To
              </label>
              <div className="text-xl font-bold text-gray-900">
                {shopkeeperInfo.name}
              </div>
              {shopkeeperInfo.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Phone className="w-4 h-4" />
                  {shopkeeperInfo.phone}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <Field
              name="amount"
              type="number"
              placeholder="Enter amount"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 text-lg font-semibold transition-all ${
                errors.amount && touched.amount
                  ? "border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              disabled={!hasQRData}
            />
            <ErrorMessage
              name="amount"
              component="div"
              className="text-red-500 text-sm mt-2 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Purpose *
            </label>
            <Field
              name="purpose"
              type="text"
              placeholder="What are you buying?"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 transition-all ${
                errors.purpose && touched.purpose
                  ? "border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              disabled={!hasQRData}
            />
            <ErrorMessage
              name="purpose"
              component="div"
              className="text-red-500 text-sm mt-2 font-medium"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !hasQRData}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-200 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {isLoading ? "Processing..." : "💳 Pay via Razorpay"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-all duration-200 font-bold hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

// Manual Entry Form Component
function ManualEntryForm({
  validationSchema,
  onSubmit,
  onCancel,
  isLoading,
}: {
  validationSchema: any;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <Formik
      initialValues={{
        recipientName: "",
        recipientPhone: "",
        amount: "",
        purpose: "",
        category: "supplies",
        paymentMethod: "cash",
        transactionId: "",
        notes: "",
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched }) => (
        <Form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Recipient Name *
              </label>
              <Field
                name="recipientName"
                type="text"
                placeholder="Full name"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 transition-all ${
                  errors.recipientName && touched.recipientName
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              <ErrorMessage
                name="recipientName"
                component="div"
                className="text-red-500 text-sm mt-1 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number *
              </label>
              <Field
                name="recipientPhone"
                type="tel"
                placeholder="10 digit number"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 transition-all ${
                  errors.recipientPhone && touched.recipientPhone
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              <ErrorMessage
                name="recipientPhone"
                component="div"
                className="text-red-500 text-sm mt-1 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Amount (₹) *
              </label>
              <Field
                name="amount"
                type="number"
                placeholder="0.00"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 text-lg font-semibold transition-all ${
                  errors.amount && touched.amount
                    ? "border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              <ErrorMessage
                name="amount"
                component="div"
                className="text-red-500 text-sm mt-1 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category *
              </label>
              <Field
                as="select"
                name="category"
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 font-medium transition-all border-gray-300 focus:border-blue-500"
              >
                <option value="supplies">📦 Supplies/Materials</option>
                <option value="labour">👷 Labour Payment</option>
                <option value="service">🔧 Service</option>
                <option value="rent">🏢 Rent</option>
                <option value="utilities">💡 Utilities</option>
                <option value="other">📋 Other</option>
              </Field>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Purpose *
            </label>
            <Field
              name="purpose"
              type="text"
              placeholder="Purpose of payment"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 transition-all ${
                errors.purpose && touched.purpose
                  ? "border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
            <ErrorMessage
              name="purpose"
              component="div"
              className="text-red-500 text-sm mt-1 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Payment Method *
              </label>
              <Field
                as="select"
                name="paymentMethod"
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 font-medium transition-all border-gray-300 focus:border-blue-500"
              >
                <option value="cash">💵 Cash</option>
                <option value="upi">📱 UPI</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="cheque">📝 Cheque</option>
              </Field>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Transaction ID
              </label>
              <Field
                name="transactionId"
                type="text"
                placeholder="Optional"
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 transition-all border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Notes
            </label>
            <Field
              as="textarea"
              name="notes"
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-gray-900 transition-all border-gray-300 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl hover:shadow-xl transition-all duration-200 font-bold text-lg disabled:opacity-50 hover:scale-105"
            >
              {isLoading ? "Saving..." : "✅ Record Payment"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl hover:bg-gray-300 transition-all duration-200 font-bold hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
