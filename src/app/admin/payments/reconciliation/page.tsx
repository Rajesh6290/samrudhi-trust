"use client";

import { useState } from "react";
import useSwr from "@/features/hooks/useSwr";
import useMutation from "@/features/hooks/useMutation";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle,
  DollarSign,
  Mail,
  Calendar,
  FileText,
  Search,
  User,
  Users,
} from "lucide-react";

interface Payment {
  _id: string;
  paymentType: "member" | "donation";
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  paymentDate: string;
  status: "pending" | "completed" | "failed" | "refunded" | "disputed";
  reconciliationStatus:
    | "not_required"
    | "pending"
    | "reconciled"
    | "discrepancy";
  lastReconciliationDate?: string;
  reconciliationNotes?: string;
  failureReason?: string;
  failureCode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  invoiceNumber?: string;
  member?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function PaymentReconciliationPage() {
  const [activeTab, setActiveTab] = useState<
    "pending" | "discrepant" | "disputed"
  >("pending");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isReconciling, setIsReconciling] = useState(false);

  // Fetch reconciliation stats
  const { data: statsData, mutate: refetchStats } = useSwr(
    "admin/payments/reconciliation?action=stats"
  );

  // Fetch payments requiring intervention
  const { data: paymentsData, mutate: refetchPayments } = useSwr(
    "admin/payments/reconciliation?action=pending"
  );

  const { mutation: reconcilePayments } = useMutation();
  const { mutation: initiateRefund } = useMutation();
  const { mutation: updateNotes } = useMutation();

  const payments = (paymentsData?.payments || []) as Payment[];
  const stats = statsData?.stats || {
    total: 0,
    pending: 0,
    discrepant: 0,
    disputed: 0,
    refunded: 0,
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesTab =
      (activeTab === "pending" && payment.status === "pending") ||
      (activeTab === "discrepant" &&
        payment.reconciliationStatus === "discrepancy") ||
      (activeTab === "disputed" && payment.status === "disputed");

    const matchesSearch = searchQuery
      ? payment.donorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.donorEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.razorpayOrderId
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    return matchesTab && matchesSearch;
  });

  const handleReconcileAll = async (action: string) => {
    setIsReconciling(true);
    try {
      const response = await reconcilePayments(
        "admin/payments/reconciliation",
        {
          body: { action },
          method: "POST",
          isAlert: false,
        }
      );

      if (response?.results?.success) {
        toast.success(
          `Reconciliation completed: ${response.results.result.reconciled} reconciled, ${response.results.result.discrepancies} discrepancies`
        );
        refetchPayments();
        refetchStats();
      } else {
        toast.error(response?.results?.error || "Failed to reconcile payments");
      }
    } catch (_error) {
      toast.error("Failed to reconcile payments");
    } finally {
      setIsReconciling(false);
    }
  };

  const handleMarkPayment = async (paymentId: string, action: string) => {
    try {
      const response = await reconcilePayments(
        "admin/payments/reconciliation",
        {
          body: { action, paymentId },
          method: "POST",
          isAlert: false,
        }
      );

      if (response?.results?.success) {
        toast.success(`Payment marked as ${action.replace("mark-", "")}`);
        refetchPayments();
        refetchStats();
        setSelectedPayment(null);
      } else {
        toast.error(response?.results?.error || "Failed to update payment");
      }
    } catch (_error) {
      toast.error("Failed to update payment");
    }
  };

  const handleAddNotes = async (paymentId: string) => {
    if (!notes.trim()) return;
    try {
      const response = await updateNotes("admin/payments/reconciliation", {
        body: { paymentId, reconciliationNotes: notes },
        method: "PATCH",
        isAlert: false,
      });

      if (response?.results?.success) {
        toast.success("Notes added successfully");
        setNotes("");
        refetchPayments();
        setSelectedPayment(null);
      } else {
        toast.error(response?.results?.error || "Failed to add notes");
      }
    } catch (_error) {
      toast.error("Failed to add notes");
    }
  };

  const handleRefund = async (paymentId: string, amount: number) => {
    if (!confirm(`Are you sure you want to initiate a refund of ₹${amount}?`))
      return;

    try {
      const response = await initiateRefund("razorpay/refund", {
        body: {
          paymentId,
          refundAmount: amount,
          refundReason: "Payment reconciliation - customer complaint",
        },
        method: "POST",
        isAlert: false,
      });

      if (response?.results?.success) {
        toast.success("Refund initiated successfully");
        refetchPayments();
        refetchStats();
        setSelectedPayment(null);
      } else {
        toast.error(response?.results?.error || "Failed to initiate refund");
      }
    } catch (_error) {
      toast.error("Failed to initiate refund");
    }
  };

  return (
    <div className="w-full h-fit mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Reconciliation
        </h1>
        <p className="text-gray-600">
          Manage stuck payments, resolve discrepancies, and process refunds
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Discrepancies</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.discrepant}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disputed</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.disputed}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Refunded</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.refunded}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Bulk Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleReconcileAll("reconcile-pending")}
            disabled={isReconciling}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isReconciling ? "animate-spin" : ""}`}
            />
            Reconcile Pending Payments
          </button>

          <button
            onClick={() => handleReconcileAll("reconcile-discrepant")}
            disabled={isReconciling}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isReconciling ? "animate-spin" : ""}`}
            />
            Reconcile Discrepancies
          </button>

          <button
            onClick={() => handleReconcileAll("check-stuck")}
            disabled={isReconciling}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            Check Stuck Payments
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setActiveTab("discrepant")}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === "discrepant"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Discrepancies ({stats.discrepant})
            </button>
            <button
              onClick={() => setActiveTab("disputed")}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === "disputed"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Disputed ({stats.disputed})
            </button>
          </nav>
        </div>

        {/* Payments List */}
        <div className="divide-y divide-gray-200">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                No payments requiring attention
              </p>
              <p className="text-sm">
                All payments in this category are handled
              </p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div
                key={payment._id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {payment.donorName || payment.member?.name}
                      </h3>

                      {/* Member vs Non-Member Badge */}
                      {payment.paymentType === "member" ? (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          <Users className="w-3 h-3" />
                          Member
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          <User className="w-3 h-3" />
                          Donor
                        </span>
                      )}

                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : payment.status === "disputed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                      {payment.reconciliationStatus === "discrepancy" && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                          Discrepancy
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>₹{payment.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">
                          {payment.donorEmail || payment.member?.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                      {payment.razorpayOrderId && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="truncate font-mono text-xs">
                            {payment.razorpayOrderId}
                          </span>
                        </div>
                      )}
                    </div>

                    {payment.failureReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Failure:</strong> {payment.failureReason}
                      </div>
                    )}

                    {payment.reconciliationNotes && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                        <strong>Notes:</strong> {payment.reconciliationNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkPayment(payment._id, "mark-completed");
                      }}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRefund(payment._id, payment.amount);
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Refund
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Payment Details</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Payment Type
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedPayment.paymentType === "member" ? (
                      <>
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="text-lg font-semibold text-purple-600">
                          Member Payment
                        </span>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="text-lg font-semibold text-gray-600">
                          Outside Donor
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {selectedPayment.paymentType === "member"
                      ? "Member Name"
                      : "Donor Name"}
                  </label>
                  <p className="text-lg">
                    {selectedPayment.donorName || selectedPayment.member?.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Amount
                  </label>
                  <p className="text-lg font-bold">₹{selectedPayment.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <p className="text-lg capitalize">{selectedPayment.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Reconciliation
                  </label>
                  <p className="text-lg capitalize">
                    {selectedPayment.reconciliationStatus}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-sm truncate">
                    {selectedPayment.donorEmail ||
                      selectedPayment.member?.email}
                  </p>
                </div>
              </div>

              {selectedPayment.razorpayOrderId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Razorpay Order ID
                  </label>
                  <p className="font-mono text-sm">
                    {selectedPayment.razorpayOrderId}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">
                  Add Reconciliation Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add notes about this payment..."
                />
                <button
                  onClick={() => handleAddNotes(selectedPayment._id)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Notes
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() =>
                    handleMarkPayment(selectedPayment._id, "mark-completed")
                  }
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() =>
                    handleMarkPayment(selectedPayment._id, "mark-failed")
                  }
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Mark as Failed
                </button>
                <button
                  onClick={() =>
                    handleRefund(selectedPayment._id, selectedPayment.amount)
                  }
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Process Refund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
