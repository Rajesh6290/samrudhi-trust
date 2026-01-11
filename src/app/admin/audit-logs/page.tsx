"use client";

import { useAuth } from "@/features/hooks/useAuth";
import useSwr from "@/features/hooks/useSwr";
import { Pagination } from "@mui/material";
import {
  Activity,
  Clock,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  module: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  changes?: {
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }[];
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed";
  errorMessage?: string;
  createdAt: string;
}

const modules = [
  "members",
  "payments",
  "campaigns",
  "volunteers",
  "blogs",
  "blog_comments",
  "gallery",
  "testimonials",
  "services",
  "certificates",
  "content",
  "faqs",
  "feedback",
  "contact",
  "settings",
  "admins",
  "notifications",
  "newsletter",
  "transactions",
  "payouts",
  "webhooks",
  "auth",
];

const actions = [
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "approve",
  "reject",
  "publish",
  "view",
  "export",
  "send_email",
  "upload",
  "mark_read",
  "verify",
  "cancel",
  "refund",
  "process",
  "fetch",
  "bulk_create",
  "bulk_update",
  "bulk_delete",
];

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Determine if user can see all logs (only superadmin and admin)
  const canSeeAllLogs = user?.role === "superadmin" || user?.role === "admin";

  // Build query params
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", "50");

  // If user is subadmin or member, filter by their userId
  if (!canSeeAllLogs && user?.id) {
    queryParams.append("userId", user.id);
  }

  if (moduleFilter) queryParams.append("module", moduleFilter);
  if (actionFilter) queryParams.append("action", actionFilter);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);

  const {
    data,
    isLoading: loading,
    mutate,
  } = useSwr(`audit-logs?${queryParams.toString()}`);

  const logs: AuditLog[] = data?.logs || [];
  const totalPages = data?.pagination?.totalPages || 1;

  // Client-side search filter
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.userName.toLowerCase().includes(query) ||
      log.userEmail.toLowerCase().includes(query) ||
      log.entityName?.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.module.toLowerCase().includes(query)
    );
  });

  const handleClearFilters = () => {
    setModuleFilter("");
    setActionFilter("");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setPage(1);
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "bg-green-100 text-green-700",
      update: "bg-blue-100 text-blue-700",
      delete: "bg-red-100 text-red-700",
      login: "bg-purple-100 text-purple-700",
      logout: "bg-slate-100 text-slate-700",
      approve: "bg-emerald-100 text-emerald-700",
      reject: "bg-orange-100 text-orange-700",
      publish: "bg-cyan-100 text-cyan-700",
      send_email: "bg-pink-100 text-pink-700",
      mark_read: "bg-indigo-100 text-indigo-700",
      verify: "bg-teal-100 text-teal-700",
      cancel: "bg-amber-100 text-amber-700",
      refund: "bg-rose-100 text-rose-700",
      process: "bg-violet-100 text-violet-700",
      fetch: "bg-sky-100 text-sky-700",
      bulk_create: "bg-green-200 text-green-800",
      bulk_update: "bg-blue-200 text-blue-800",
      bulk_delete: "bg-red-200 text-red-800",
      upload: "bg-fuchsia-100 text-fuchsia-700",
      download: "bg-lime-100 text-lime-700",
      export: "bg-yellow-100 text-yellow-700",
      view: "bg-slate-50 text-slate-600",
    };
    return colors[action] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status: string) => {
    return status === "success"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            Audit Logs
          </h1>
          <p className="text-slate-600 mt-2">
            {canSeeAllLogs
              ? "Track all administrative actions and changes"
              : "Track your actions and changes"}
          </p>
          {!canSeeAllLogs && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              <User className="w-4 h-4" />
              Showing only your activity logs
            </div>
          )}
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, entity, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              showFilters
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Advanced Filters - Only show when toggled */}
        {showFilters && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Module Filter */}
              <div>
                <select
                  value={moduleFilter}
                  onChange={(e) => {
                    setModuleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white text-gray-900"
                >
                  <option value="">All Modules</option>
                  {modules.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod.charAt(0).toUpperCase() + mod.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Filter */}
              <div>
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white text-gray-900"
                >
                  <option value="">All Actions</option>
                  {actions.map((act) => (
                    <option key={act} value={act}>
                      {act.replace("_", " ").charAt(0).toUpperCase() +
                        act.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              {/* End Date */}
              <div>
                <input
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            </div>
          </>
        )}
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">No logs found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr
                        key={log._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {log.userName}
                            </p>
                            <p className="text-sm text-slate-500">
                              {log.userEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getActionColor(log.action)}`}
                          >
                            {log.action.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-700 capitalize">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {log.entityType}
                            </p>
                            {log.entityName && (
                              <p className="text-xs text-slate-500">
                                {log.entityName}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(log.status)}`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4" />
                            {formatDate(log.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="flex items-center gap-2 px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold">{(page - 1) * 50 + 1}</span> to{" "}
                <span className="font-semibold">
                  {Math.min(page * 50, data?.pagination?.total || 0)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {data?.pagination?.total || 0}
                </span>{" "}
                logs
              </div>
              <Pagination
                count={totalPages}
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

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Audit Log Details
                </h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    User Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Name:</span>
                      <p className="font-medium">{selectedLog.userName}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Email:</span>
                      <p className="font-medium">{selectedLog.userEmail}</p>
                    </div>
                    {selectedLog.ipAddress && (
                      <div>
                        <span className="text-slate-600">IP Address:</span>
                        <p className="font-medium">{selectedLog.ipAddress}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Details */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Action Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Action:</span>
                      <p className="font-medium capitalize">
                        {selectedLog.action.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Module:</span>
                      <p className="font-medium capitalize">
                        {selectedLog.module}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Entity Type:</span>
                      <p className="font-medium">{selectedLog.entityType}</p>
                    </div>
                    {selectedLog.entityName && (
                      <div>
                        <span className="text-slate-600">Entity Name:</span>
                        <p className="font-medium">{selectedLog.entityName}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-600">Status:</span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(selectedLog.status)}`}
                      >
                        {selectedLog.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Time:</span>
                      <p className="font-medium">
                        {formatDate(selectedLog.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Changes */}
                {selectedLog.changes && selectedLog.changes.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-3">
                      Changes Made
                    </h3>
                    <div className="space-y-3">
                      {selectedLog.changes.map((change, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border border-slate-200"
                        >
                          <p className="font-semibold text-sm text-slate-900 mb-2 capitalize">
                            {change.field.replace("_", " ")}
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-slate-600">Old Value:</span>
                              <p className="font-mono text-xs bg-red-50 p-2 rounded mt-1">
                                {JSON.stringify(change.oldValue)}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-600">New Value:</span>
                              <p className="font-mono text-xs bg-green-50 p-2 rounded mt-1">
                                {JSON.stringify(change.newValue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {selectedLog.errorMessage && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-2">
                      Error Message
                    </h3>
                    <p className="text-sm text-red-700">
                      {selectedLog.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
