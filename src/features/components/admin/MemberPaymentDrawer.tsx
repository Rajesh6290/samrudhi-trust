"use client";

import useSwr from "@/features/hooks/useSwr";
import { Dialog } from "@mui/material";
import {
  Calendar,
  CheckCircle,
  Download,
  FileText,
  History,
  Mail,
  Phone,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  photo?: string;
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
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "unpaid">("all");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(selectedMonth);

  // Generate last 12 months for filter
  const getMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      months.push({ value, label });
    }
    return months;
  };

  const monthOptions = getMonthOptions();

  const { data: membersData, isLoading: membersLoading } =
    useSwr("members?all=true");
  const members = (membersData?.members || []) as Member[];

  const { data: paymentsData, isLoading: paymentsLoading } = useSwr(
    `payments?paymentType=member&month=${filterMonth}`
  );
  const payments = (paymentsData?.payments || []) as Payment[];

  const isLoading = membersLoading || paymentsLoading;

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

  const exportPDF = (type: "paid" | "unpaid") => {
    const targetMembers = type === "paid" ? paidMembers : unpaidMembers;
    const color = type === "paid" ? "#10b981" : "#ef4444";

    const tableHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${type === "paid" ? "Paid" : "Unpaid"} Members - ${filterMonth}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; background: #f9fafb; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          h1 { color: ${color}; margin-bottom: 8px; font-size: 32px; font-weight: 700; }
          .meta { color: #6b7280; margin-bottom: 24px; font-size: 14px; }
          .stats { background: ${color}; color: white; padding: 24px; border-radius: 12px; margin-bottom: 32px; }
          .stats h2 { font-size: 48px; margin: 0; font-weight: 700; }
          .stats p { margin-top: 8px; opacity: 0.95; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 16px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: ${color}; color: white; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; }
          tbody tr:hover { background: #f9fafb; }
          tbody tr:last-child td { border-bottom: none; }
          .index { color: #9ca3af; font-weight: 600; }
          @media print { body { padding: 0; } .container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${type === "paid" ? "Paid" : "Unpaid"} Members Report</h1>
          <p class="meta">${new Date(filterMonth).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
          <div class="stats">
            <h2>${targetMembers.length}</h2>
            <p>Total ${type === "paid" ? "Paid" : "Unpaid"} Members</p>
          </div>
          <table>
            <thead>
              <tr>
                <th width="60">#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                ${type === "paid" ? "<th>Payment Date</th><th>Amount</th>" : ""}
              </tr>
            </thead>
            <tbody>
              ${targetMembers
                .map((member, index) => {
                  const payment =
                    type === "paid"
                      ? payments.find((p) => {
                          const paymentWithMember = p as Payment & {
                            member?: { _id: string } | string;
                          };
                          const memberId =
                            typeof paymentWithMember.member === "string"
                              ? paymentWithMember.member
                              : paymentWithMember.member?._id;
                          return (
                            memberId === member._id && p.status === "completed"
                          );
                        })
                      : null;
                  return `
                  <tr>
                    <td class="index">${index + 1}</td>
                    <td><strong>${member.name}</strong></td>
                    <td>${member.email}</td>
                    <td>${member.phone || "N/A"}</td>
                    ${
                      type === "paid"
                        ? `
                      <td>${payment ? new Date(payment.paymentDate).toLocaleDateString("en-IN") : "N/A"}</td>
                      <td><strong>₹${payment?.amount || 0}</strong></td>
                    `
                        : ""
                    }
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
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

  const displayMembers =
    activeTab === "paid"
      ? paidMembers
      : activeTab === "unpaid"
        ? unpaidMembers
        : members;

  const selectedMemberData = members.find((m) => m._id === selectedMember);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth={false} fullWidth>
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Member Payments
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Filter by month and year
                </p>
              </div>
              <div className="ml-6">
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="shrink-0 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeTab === "all"
                  ? "bg-white border-blue-500 shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${activeTab === "all" ? "bg-blue-50" : "bg-gray-50"}`}
                >
                  <Users
                    className={`w-5 h-5 ${activeTab === "all" ? "text-blue-600" : "text-gray-600"}`}
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {members.length}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("paid")}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeTab === "paid"
                  ? "bg-white border-green-500 shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${activeTab === "paid" ? "bg-green-50" : "bg-gray-50"}`}
                >
                  <CheckCircle
                    className={`w-5 h-5 ${activeTab === "paid" ? "text-green-600" : "text-gray-600"}`}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm text-gray-600">Paid Members</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {paidMembers.length}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportPDF("paid");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("unpaid")}
              className={`p-4 rounded-xl border-2 transition-all ${
                activeTab === "unpaid"
                  ? "bg-white border-red-500 shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${activeTab === "unpaid" ? "bg-red-50" : "bg-gray-50"}`}
                >
                  <XCircle
                    className={`w-5 h-5 ${activeTab === "unpaid" ? "text-red-600" : "text-gray-600"}`}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm text-gray-600">Unpaid Members</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {unpaidMembers.length}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportPDF("unpaid");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl p-4 animate-pulse"
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activeTab === "paid" && "Paid Members"}
                    {activeTab === "unpaid" && "Unpaid Members"}
                    {activeTab === "all" && "All Members"}
                    <span className="text-gray-500 ml-2">
                      ({displayMembers.length})
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayMembers.map((member) => {
                    const isPaid = paidMemberIds.has(member._id);
                    const isSelected = selectedMember === member._id;
                    const memberPayment = payments.find((p) => {
                      const paymentWithMember = p as Payment & {
                        member?: { _id: string } | string;
                      };
                      const memberId =
                        typeof paymentWithMember.member === "string"
                          ? paymentWithMember.member
                          : paymentWithMember.member?._id;
                      return memberId === member._id;
                    });
                    const paymentStatus = memberPayment?.status || "unknown";

                    return (
                      <div
                        key={member._id}
                        onClick={() => setSelectedMember(member._id)}
                        className={`group bg-white rounded-xl p-4 cursor-pointer transition-all border-2 hover:shadow-md ${
                          isSelected
                            ? "border-blue-500 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="relative shrink-0">
                            {member.photo ? (
                              <Image
                                src={member.photo}
                                alt={member.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {member.name}
                              </h4>
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                  isPaid
                                    ? "bg-green-50 text-green-700"
                                    : paymentStatus === "unknown"
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-red-50 text-red-700"
                                }`}
                              >
                                {isPaid
                                  ? "Paid"
                                  : paymentStatus === "unknown"
                                    ? "Unknown"
                                    : "Unpaid"}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </div>
                              {member.phone && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <Phone className="w-3 h-3 shrink-0" />
                                  <span>{member.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors py-2 border-t border-gray-100">
                          <History className="w-3 h-3" />
                          View History
                        </button>
                      </div>
                    );
                  })}
                </div>

                {displayMembers.length === 0 && (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No members found</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Payment History Sidebar */}
          {selectedMember && (
            <div className="w-96 bg-gray-50 border-l border-gray-200 shrink-0 flex flex-col">
              <div className="shrink-0 p-4 bg-white border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {selectedMemberData?.photo ? (
                      <Image
                        src={selectedMemberData.photo}
                        alt={selectedMemberData.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedMemberData?.name}
                      </h3>
                      <p className="text-xs text-gray-500">Payment History</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
                  </div>
                ) : memberPaymentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {memberPaymentHistory.map((payment) => (
                      <div
                        key={payment._id}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(payment.month).toLocaleDateString(
                                "en-IN",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.paymentDate).toLocaleDateString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              payment.status === "completed"
                                ? "bg-green-50 text-green-700"
                                : payment.status === "pending"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="text-xl font-semibold text-gray-900">
                            ₹{payment.amount}
                          </div>
                          <button
                            onClick={() => downloadInvoice(payment._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Invoice
                          </button>
                        </div>

                        {payment.invoiceNumber && (
                          <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                            #{payment.invoiceNumber}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">No payment history</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
