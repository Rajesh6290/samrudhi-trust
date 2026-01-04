"use client";

import { useState, useEffect, startTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  DollarSign,
  Users,
  Download,
  Gift,
  Search,
  Loader2,
  BadgeCheck,
  Receipt,
  Eye,
  QrCode,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import useSwr from "@/features/hooks/useSwr";
import useMutation from "@/features/hooks/useMutation";
import { toast } from "react-toastify";
import MemberPaymentDrawer from "@/features/components/admin/MemberPaymentDrawer";
import QRScanner from "@/features/components/admin/QRScanner";

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
  const pageLimit = 15;

  // Check for QR scan data from URL params (from header QR button)
  useEffect(() => {
    const qrData = searchParams.get("qrScan");
    if (qrData) {
      startTransition(() => {
        setActiveTab("payouts");
        setQrScanData(qrData);
        setIsPayoutModalOpen(true);
      });
      // Clean up URL
      window.history.replaceState({}, "", "/admin/payments");
    }
  }, [searchParams]);

  // Fetch payments based on active tab
  const getQueryParams = () => {
    let params = `page=${page}&limit=${pageLimit}`;

    if (activeTab === "members") {
      params += "&paymentType=member";
    } else if (activeTab === "donations") {
      params += "&paymentType=donation";
    } else if (activeTab === "80g") {
      params += "&needs80G=true";
    }

    if (statusFilter !== "all") {
      params += `&status=${statusFilter}`;
    }

    return params;
  };

  const { data: paymentsData, isLoading: paymentsLoading } = useSwr(
    `payments?${getQueryParams()}`
  );

  // Fetch payouts data
  const { data: payoutsData } = useSwr(
    activeTab === "payouts" ? "payouts" : null
  );

  const payments = (paymentsData?.payments || []) as Payment[];
  const pagination = paymentsData?.pagination;
  const payouts = payoutsData?.payouts || [];

  // Calculate analytics
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

  // Filter payments by search
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
      const response = await fetch(`/api/payments/invoice/${paymentId}`);
      const data = await response.json();

      if (data.success && data.invoiceHTML) {
        // Create a new window with the invoice
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
    <div className="space-y-6 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Analytics
        </h1>
        <p className="text-gray-600">
          Comprehensive payment management and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Total Revenue
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₹{analytics.totalAmount.toLocaleString("en-IN")}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {analytics.completed} completed
          </div>
        </div>
        <div
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-300 transition-all cursor-pointer group"
          onClick={() => setIsDrawerOpen(true)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-medium text-gray-500">
                Member Payments
              </span>
              <button className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                <Eye className="w-3 h-3" />
                View Details
              </button>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.members}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Monthly subscriptions
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Donations</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.donations}
          </div>
          <div className="text-sm text-gray-500 mt-1">Public contributions</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BadgeCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">
              80G Certificates
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analytics.with80G}
          </div>
          <div className="text-sm text-gray-500 mt-1">Tax exemption</div>
        </div>
      </div>
      {/* Tabs and Filters */}
      <div className="bg-white w-full rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setActiveTab("all");
                setPage(1);
              }}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "all"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Payments
            </button>
            <button
              onClick={() => {
                setActiveTab("members");
                setPage(1);
              }}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "members"
                  ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Member Payments
            </button>
            <button
              onClick={() => {
                setActiveTab("donations");
                setPage(1);
              }}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "donations"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Gift className="w-4 h-4 inline mr-2" />
              Donations
            </button>
            <button
              onClick={() => {
                setActiveTab("80g");
                setPage(1);
              }}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "80g"
                  ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BadgeCheck className="w-4 h-4 inline mr-2" />
              80G Certificates
            </button>
            <button
              onClick={() => {
                setActiveTab("payouts");
                setPage(1);
              }}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "payouts"
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ArrowUpRight className="w-4 h-4 inline mr-2" />
              Payouts
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {activeTab === "members" && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          {activeTab === "payouts" ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  Manual Payouts & Expenses
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <QrCode size={18} />
                    Scan QR
                  </button>
                  <button
                    onClick={() => {
                      setQrScanData("");
                      setIsPayoutModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Plus size={18} />
                    Add Payout
                  </button>
                </div>
              </div>

              {payouts.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowUpRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No payouts recorded yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Record manual payments and expenses here
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Recipient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Purpose
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payouts.map((payout: (typeof payouts)[0]) => (
                      <tr key={payout._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {payout.recipientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payout.recipientPhone}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          ₹{payout.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">{payout.purpose}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                            {payout.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm capitalize">
                          {payout.paymentMethod.replace("_", " ")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {payout.transactionId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : paymentsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading payments...</span>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-20">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No payments found</p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Donor/Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    80G
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => {
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
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {email || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {payment.paymentType === "member" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Users className="w-3 h-3 mr-1" />
                            Member
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Gift className="w-3 h-3 mr-1" />
                            Donation
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          ₹{payment.amount.toLocaleString("en-IN")}
                        </div>
                        {payment.month && (
                          <div className="text-xs text-gray-500">
                            {new Date(payment.month).toLocaleDateString(
                              "en-IN",
                              { month: "short", year: "numeric" }
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.paymentDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-gray-600">
                          {payment.invoiceNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {payment.needs80G ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <BadgeCheck className="w-3 h-3 mr-1" />
                              Yes
                            </span>
                            {payment.certificateNumber80G && (
                              <div className="text-xs text-gray-500 mt-1 font-mono">
                                {payment.certificateNumber80G}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {payment.status === "completed" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                        {payment.status === "pending" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                        {payment.status === "failed" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {payment.status === "completed" && (
                          <button
                            onClick={() => downloadInvoice(payment._id)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            {payment.needs80G ? "80G" : "Invoice"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * pageLimit + 1} to{" "}
              {Math.min(page * pageLimit, pagination.total)} of{" "}
              {pagination.total} payments
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          page === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Member Payment Drawer */}
      <MemberPaymentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedMonth={selectedMonth}
      />

      {/* QR Scanner */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleQRScan}
      />

      {/* Payout Modal */}
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

  // Parse QR data to extract shopkeeper details
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

  // Validation schemas
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

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle Pay Now with Razorpay
  const handlePayNow = async (values: { amount: string; purpose: string }) => {
    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: values.amount,
          notes: {
            recipientName: shopkeeperInfo.name,
            recipientPhone: shopkeeperInfo.phone,
            purpose: values.purpose,
          },
        }),
      });

      const order = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Samrudhi Trust",
        description: values.purpose,
        order_id: order.id,
        handler: async (response: { razorpay_payment_id: string }) => {
          // Payment successful, record in database
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

  // Handle Manual Entry
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Payout Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pay shopkeepers or record manual payments
          </p>

          {/* Mode Toggle */}
          <div className="mt-4 flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setPaymentMode("paynow")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                paymentMode === "paynow"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pay Now
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode("manual")}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                paymentMode === "manual"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Manual Entry
            </button>
          </div>

          {qrData && shopkeeperInfo.name && paymentMode === "paynow" && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="text-green-600" size={20} />
                <span className="text-sm font-medium text-green-900">
                  Shopkeeper Details
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Name:</span>{" "}
                  {shopkeeperInfo.name}
                </div>
                {shopkeeperInfo.phone && (
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {shopkeeperInfo.phone}
                  </div>
                )}
                {shopkeeperInfo.upi && (
                  <div>
                    <span className="font-medium">UPI:</span>{" "}
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
  validationSchema: unknown;
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
        <Form className="space-y-4">
          {!hasQRData && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please scan a QR code first to get shopkeeper details
              </p>
            </div>
          )}

          {hasQRData && shopkeeperInfo.name && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paying To
              </label>
              <div className="text-lg font-semibold">{shopkeeperInfo.name}</div>
              {shopkeeperInfo.phone && (
                <div className="text-sm text-gray-600">
                  {shopkeeperInfo.phone}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <Field
              name="amount"
              type="number"
              placeholder="Enter amount"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.amount && touched.amount
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              disabled={!hasQRData}
            />
            <ErrorMessage
              name="amount"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose *
            </label>
            <Field
              name="purpose"
              type="text"
              placeholder="What are you buying?"
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.purpose && touched.purpose
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              disabled={!hasQRData}
            />
            <ErrorMessage
              name="purpose"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !hasQRData}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Pay via Razorpay"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
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
  validationSchema: unknown;
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
        <Form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Name *
              </label>
              <Field
                name="recipientName"
                type="text"
                placeholder="Name"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.recipientName && touched.recipientName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="recipientName"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Field
                name="recipientPhone"
                type="tel"
                placeholder="10 digit number"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.recipientPhone && touched.recipientPhone
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="recipientPhone"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹) *
              </label>
              <Field
                name="amount"
                type="number"
                placeholder="0.00"
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.amount && touched.amount
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              <ErrorMessage
                name="amount"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Field
                as="select"
                name="category"
                className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="supplies">Supplies/Materials</option>
                <option value="labour">Labour Payment</option>
                <option value="service">Service</option>
                <option value="rent">Rent</option>
                <option value="utilities">Utilities</option>
                <option value="other">Other</option>
              </Field>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose *
            </label>
            <Field
              name="purpose"
              type="text"
              placeholder="Purpose of payment"
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.purpose && touched.purpose
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            <ErrorMessage
              name="purpose"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </label>
              <Field
                as="select"
                name="paymentMethod"
                className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </Field>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID
              </label>
              <Field
                name="transactionId"
                type="text"
                placeholder="Optional"
                className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <Field
              as="textarea"
              name="notes"
              rows={3}
              placeholder="Additional notes..."
              className="w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Record Payment"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
