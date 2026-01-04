"use client";

import useSwr from "@/features/hooks/useSwr";
import {
  Calendar,
  CheckCircle,
  ClipboardList,
  Download,
  FileText,
  IndianRupee,
  Mail,
  Phone,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Payment {
  _id: string;
  amount: number;
  month: string;
  status: string;
  paymentDate: string;
  invoiceNumber: string;
  paymentMethod: string;
  razorpayPaymentId?: string;
}

interface MemberPaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
}

export default function MemberPaymentDrawer({
  isOpen,
  onClose,
  selectedMonth,
}: MemberPaymentDrawerProps) {
  const [activeTab, setActiveTab] = useState<"paid" | "unpaid" | "all">("all");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Fetch all members
  const { data: membersData, isLoading: membersLoading } =
    useSwr("members?all=true");
  const members = (membersData?.members || []) as Member[];

  // Fetch member payments for selected month
  const { data: paymentsData, isLoading: paymentsLoading } = useSwr(
    `payments?paymentType=member&month=${selectedMonth}`
  );
  const payments = (paymentsData?.payments || []) as Payment[];

  const isLoading = membersLoading || paymentsLoading;

  // Calculate paid and unpaid members
  const paidMemberIds = new Set(
    payments
      .filter((p) => p.status === "completed")
      .map((p) => {
        const payment = p as Payment & { member?: { _id: string } | string };
        if (typeof payment.member === "string") return payment.member;
        return payment.member?._id;
      })
  );

  const paidMembers = members.filter((m) => paidMemberIds.has(m._id));
  const unpaidMembers = members.filter((m) => !paidMemberIds.has(m._id));

  // Get payment history for selected member
  const { data: memberHistoryData, isLoading: historyLoading } = useSwr(
    selectedMember ? `payments?memberId=${selectedMember}` : null
  );
  const memberPaymentHistory = (memberHistoryData?.payments || []) as Payment[];

  const downloadInvoice = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/invoice/${paymentId}`);
      const data = await response.json();

      if (data.success && data.invoiceHTML) {
        const invoiceWindow = window.open("", "_blank");
        if (invoiceWindow) {
          invoiceWindow.document.write(data.invoiceHTML);
          invoiceWindow.document.close();
        }
      } else {
        toast.error("Failed to generate invoice");
      }
    } catch (_error) {
      toast.error("Failed to download invoice");
    }
  };

  const exportPaidMembersPDF = () => {
    // Create table HTML
    const tableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Paid Members - ${selectedMonth}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Paid Members Report - ${new Date(selectedMonth).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h1>
        <p>Total Paid Members: ${paidMembers.length}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Payment Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${paidMembers
              .map((member, index) => {
                const payment = payments.find((p) => {
                  const paymentWithMember = p as Payment & {
                    member?: { _id: string } | string;
                  };
                  const memberId =
                    typeof paymentWithMember.member === "string"
                      ? paymentWithMember.member
                      : paymentWithMember.member?._id;
                  return memberId === member._id && p.status === "completed";
                });
                return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${member.name}</td>
                  <td>${member.email}</td>
                  <td>${member.phone || "N/A"}</td>
                  <td>${payment ? new Date(payment.paymentDate).toLocaleDateString("en-IN") : "N/A"}</td>
                  <td>₹${payment?.amount || 0}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(tableHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportUnpaidMembersPDF = () => {
    const tableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unpaid Members - ${selectedMonth}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f44336; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Unpaid Members Report - ${new Date(selectedMonth).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h1>
        <p>Total Unpaid Members: ${unpaidMembers.length}</p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            ${unpaidMembers
              .map(
                (member, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${member.name}</td>
                <td>${member.email}</td>
                <td>${member.phone || "N/A"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(tableHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!isOpen) return null;

  const displayMembers =
    activeTab === "paid"
      ? paidMembers
      : activeTab === "unpaid"
        ? unpaidMembers
        : members;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Member Payment Tracking</h2>
              <p className="text-blue-100 mt-1">
                {new Date(selectedMonth).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="bg-gray-50 p-6 shrink-0 border-b">
          <div className="grid grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab("all")}
              className={`bg-linear-to-br rounded-xl p-4 border cursor-pointer transition-all ${
                activeTab === "all"
                  ? "from-blue-100 to-blue-200 border-blue-400 shadow-lg scale-105"
                  : "from-blue-50 to-blue-100 border-blue-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total</span>
              </div>
              <div className="text-3xl font-bold text-blue-900">
                {members.length}
              </div>
              <div className="text-sm text-blue-600 mt-1">All Members</div>
            </div>

            <div
              onClick={() => setActiveTab("paid")}
              className={`bg-linear-to-br rounded-xl p-4 border cursor-pointer transition-all ${
                activeTab === "paid"
                  ? "from-green-100 to-green-200 border-green-400 shadow-lg scale-105"
                  : "from-green-50 to-green-100 border-green-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportPaidMembersPDF();
                  }}
                  className="p-1 hover:bg-green-300 rounded transition-colors"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4 text-green-700" />
                </button>
              </div>
              <div className="text-3xl font-bold text-green-900">
                {paidMembers.length}
              </div>
              <div className="text-sm text-green-600 mt-1">Paid This Month</div>
            </div>

            <div
              onClick={() => setActiveTab("unpaid")}
              className={`bg-linear-to-br rounded-xl p-4 border cursor-pointer transition-all ${
                activeTab === "unpaid"
                  ? "from-red-100 to-red-200 border-red-400 shadow-lg scale-105"
                  : "from-red-50 to-red-100 border-red-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 text-red-600" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportUnpaidMembersPDF();
                  }}
                  className="p-1 hover:bg-red-300 rounded transition-colors"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4 text-red-700" />
                </button>
              </div>
              <div className="text-3xl font-bold text-red-900">
                {unpaidMembers.length}
              </div>
              <div className="text-sm text-red-600 mt-1">Not Paid Yet</div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-4 border-2 border-gray-200"
                    >
                      <div className="space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {activeTab === "paid" && (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Paid Members
                      </>
                    )}
                    {activeTab === "unpaid" && (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        Unpaid Members
                      </>
                    )}
                    {activeTab === "all" && (
                      <>
                        <Users className="w-5 h-5 text-blue-600" />
                        All Members
                      </>
                    )}
                    <span className="text-sm font-normal text-gray-500">
                      ({displayMembers.length})
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayMembers.map((member) => {
                    const isPaid = paidMemberIds.has(member._id);
                    return (
                      <div
                        key={member._id}
                        onClick={() => setSelectedMember(member._id)}
                        className={`bg-white rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer border-2 ${
                          selectedMember === member._id
                            ? "border-blue-500 shadow-lg"
                            : isPaid
                              ? "border-green-200 hover:border-green-300"
                              : "border-red-200 hover:border-red-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {member.name}
                            </h4>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Mail className="w-4 h-4 shrink-0" />
                                {member.email}
                              </p>
                              {member.phone && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <Phone className="w-4 h-4 shrink-0" />
                                  {member.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {isPaid ? (
                              <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                            )}
                            <span className="text-xs text-gray-500">
                              Click for history
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {displayMembers.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No members found</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Member Payment History Sidebar */}
          {selectedMember && (
            <div className="w-96 border-l bg-white overflow-y-auto shrink-0">
              <div className="sticky top-0 bg-white border-b p-4 z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                      Payment History
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {members.find((m) => m._id === selectedMember)?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {historyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  </div>
                ) : memberPaymentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {memberPaymentHistory.map((payment) => (
                      <div
                        key={payment._id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              {new Date(payment.month).toLocaleDateString(
                                "en-IN",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(payment.paymentDate).toLocaleDateString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-gray-500" />
                            <span className="text-lg font-bold text-gray-900">
                              ₹{payment.amount}
                            </span>
                          </div>
                          <button
                            onClick={() => downloadInvoice(payment._id)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            title="Download Invoice"
                          >
                            <FileText className="w-4 h-4" />
                            Invoice
                          </button>
                        </div>

                        {payment.invoiceNumber && (
                          <p className="text-xs text-gray-500 mt-2">
                            Invoice: {payment.invoiceNumber}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No payment history found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
