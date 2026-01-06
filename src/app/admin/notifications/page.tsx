"use client";

import CustomButton from "@/common/CustomButton";
import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import { Pagination } from "@mui/material";
import {
  Bell,
  Search,
  Trash2,
  Filter,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import ExportButton from "@/features/components/ExportButton";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type:
    | "payment"
    | "donation"
    | "campaign"
    | "volunteer"
    | "member"
    | "system"
    | "approval"
    | "alert"
    | "reminder"
    | "other";
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  readAt?: Date;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

const typeOptions = [
  { value: "all", label: "All Types", icon: Bell, color: "slate" },
  { value: "payment", label: "Payment", icon: Info, color: "green" },
  { value: "member", label: "Member", icon: CheckCircle, color: "blue" },
  {
    value: "volunteer",
    label: "Volunteer",
    icon: CheckCircle,
    color: "purple",
  },
  { value: "system", label: "System", icon: AlertTriangle, color: "yellow" },
  { value: "campaign", label: "Campaign", icon: Info, color: "indigo" },
];

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: notificationsData,
    isLoading: loading,
    mutate,
  } = useSwr(
    `notifications?page=${page}&limit=${limit}&type=${typeFilter !== "all" ? typeFilter : ""}&isRead=${readFilter !== "all" ? readFilter : ""}`
  );
  const { mutation } = useMutation();

  const notifications: Notification[] = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;
  const pagination = notificationsData?.pagination || {
    total: 0,
    totalPages: 1,
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await mutation(`notifications/${id}/read`, {
        method: "PUT",
      });
      mutate();
      Swal.fire({
        icon: "success",
        title: "Marked as read",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (_error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to mark as read",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await Swal.fire({
      title: "Mark all as read?",
      text: "This will mark all notifications as read",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, mark all",
    });

    if (result.isConfirmed) {
      try {
        await mutation(`notifications/mark-all-read`, {
          method: "PUT",
        });
        mutate();
        Swal.fire({
          icon: "success",
          title: "All marked as read",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (_error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to mark all as read",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete notification?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        await mutation(`notifications/${id}`, {
          method: "DELETE",
        });
        mutate();
        Swal.fire({
          icon: "success",
          title: "Deleted",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (_error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete notification",
        });
      }
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: "Delete all notifications?",
      text: "This will permanently delete all notifications. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete all",
    });

    if (result.isConfirmed) {
      try {
        await mutation(`notifications/delete-all`, {
          method: "DELETE",
        });
        mutate();
        Swal.fire({
          icon: "success",
          title: "All notifications deleted",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (_error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete notifications",
        });
      }
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      payment: "bg-green-100 text-green-800",
      member: "bg-blue-100 text-blue-800",
      volunteer: "bg-purple-100 text-purple-800",
      system: "bg-yellow-100 text-yellow-800",
      campaign: "bg-indigo-100 text-indigo-800",
      donation: "bg-pink-100 text-pink-800",
      approval: "bg-orange-100 text-orange-800",
      alert: "bg-red-100 text-red-800",
      reminder: "bg-cyan-100 text-cyan-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-slate-100 text-slate-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">
              📬 Notifications
            </h1>
            <p className="text-slate-600 text-sm lg:text-base">
              System notifications and updates • {unreadCount} unread
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {unreadCount > 0 && (
              <CustomButton
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
              >
                <CheckCheck className="w-5 h-5" />
                Mark All Read
              </CustomButton>
            )}
            {notifications.length > 0 && (
              <CustomButton
                onClick={handleDeleteAll}
                className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg"
              >
                <Trash2 className="w-5 h-5" />
                Delete All
              </CustomButton>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              className="pl-9 pr-4 py-3 border border-slate-200 rounded-xl appearance-none bg-white cursor-pointer hover:border-slate-300"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Read Filter */}
          <div className="relative">
            <select
              className="px-4 py-3 border border-slate-200 rounded-xl appearance-none bg-white cursor-pointer hover:border-slate-300"
              value={readFilter}
              onChange={(e) => {
                setReadFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>

          <ExportButton
            data={notifications}
            filename="notifications"
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-slate-800">
              {pagination.total}
            </span>
          </div>
          <p className="text-slate-600 font-medium">Total</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span className="text-3xl font-bold text-slate-800">
              {unreadCount}
            </span>
          </div>
          <p className="text-slate-600 font-medium">Unread</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-slate-800">
              {pagination.total - unreadCount}
            </span>
          </div>
          <p className="text-slate-600 font-medium">Read</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <Info className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold text-slate-800">
              {notifications.filter((n) => n.priority === "urgent").length}
            </span>
          </div>
          <p className="text-slate-600 font-medium">Urgent</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No notifications found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {notifications
                .filter((notification) =>
                  searchQuery
                    ? notification.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      notification.message
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    : true
                )
                .map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-6 hover:bg-slate-50 transition-colors ${
                      !notification.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          !notification.isRead ? "bg-blue-100" : "bg-slate-100"
                        }`}
                      >
                        <Bell
                          className={`w-6 h-6 ${
                            !notification.isRead
                              ? "text-blue-600"
                              : "text-slate-400"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3
                                className={`text-lg font-bold ${
                                  !notification.isRead
                                    ? "text-slate-900"
                                    : "text-slate-600"
                                }`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-slate-600 mb-3">
                              {notification.message}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                                  notification.type
                                )}`}
                              >
                                {notification.type}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                                  notification.priority
                                )}`}
                              >
                                {notification.priority}
                              </span>
                              <span className="text-xs text-slate-500">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </span>
                            </div>
                            {notification.link && (
                              <a
                                href={notification.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
                              >
                                View Details
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification._id)
                                }
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-6 border-t border-slate-100">
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
