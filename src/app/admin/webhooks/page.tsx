"use client";

import useSwr from "@/features/hooks/useSwr";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Eye,
  Filter,
  RefreshCw,
  Webhook,
  X,
} from "lucide-react";
import { useState } from "react";

interface WebhookLog {
  _id: string;
  eventType: string;
  status: "success" | "failed";
  errorMessage?: string;
  payload: Record<string, unknown>;
  signature: string;
  processedAt: string;
  createdAt: string;
}

export default function WebhookLogsPage() {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "success" | "failed"
  >("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: logsData,
    isLoading,
    mutate,
  } = useSwr(
    `webhooks/logs${statusFilter !== "all" ? `?status=${statusFilter}` : ""}${
      eventTypeFilter !== "all"
        ? `${statusFilter !== "all" ? "&" : "?"}eventType=${eventTypeFilter}`
        : ""
    }`
  );
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const logs: WebhookLog[] = logsData?.logs || [];

  // Get unique event types for filter
  const eventTypes = Array.from(new Set(logs.map((log) => log.eventType)));

  // Categorize logs
  const razorpayLogs = logs.filter(
    (log) =>
      log.eventType.startsWith("payment.") ||
      log.eventType.startsWith("order.") ||
      log.eventType.startsWith("refund.")
  );
  const otherLogs = logs.filter(
    (log) =>
      !log.eventType.startsWith("payment.") &&
      !log.eventType.startsWith("order.") &&
      !log.eventType.startsWith("refund.")
  );

  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.status === "success").length,
    failed: logs.filter((l) => l.status === "failed").length,
    razorpay: razorpayLogs.length,
    other: otherLogs.length,
  };

  const handleRefresh = () => {
    mutate();
  };

  const handleViewDetails = (log: WebhookLog) => {
    setSelectedLog(log);
    setDialogOpen(true);
  };

  return (
    <div className="w-full h-fit">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Webhook Logs
            </h1>
            <p className="text-gray-600">
              Monitor and debug all webhook events
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Webhooks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Webhook className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.success}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.failed}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Razorpay</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.razorpay}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Other Events</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.other}
                </p>
              </div>
              <Webhook className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "success" | "failed"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Events</option>
                  <optgroup label="Razorpay Events">
                    <option value="payment.captured">Payment Captured</option>
                    <option value="payment.failed">Payment Failed</option>
                    <option value="order.paid">Order Paid</option>
                    <option value="refund.processed">Refund Processed</option>
                  </optgroup>
                  {eventTypes.filter(
                    (t) =>
                      !t.startsWith("payment.") &&
                      !t.startsWith("order.") &&
                      !t.startsWith("refund.")
                  ).length > 0 && (
                    <optgroup label="Other Events">
                      {eventTypes
                        .filter(
                          (t) =>
                            !t.startsWith("payment.") &&
                            !t.startsWith("order.") &&
                            !t.startsWith("refund.")
                        )
                        .map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Error
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No webhook logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {(log.eventType.startsWith("payment.") ||
                          log.eventType.startsWith("order.") ||
                          log.eventType.startsWith("refund.")) && (
                          <CreditCard className="w-4 h-4 text-purple-600" />
                        )}
                        <span className="font-mono">{log.eventType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "success" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.errorMessage ? (
                        <span className="text-red-600 text-xs">
                          {log.errorMessage}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {dialogOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Webhook Details
              </h2>
              <button
                onClick={() => setDialogOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Event Type:
                  </span>
                  <p className="text-base text-gray-900 mt-1">
                    {selectedLog.eventType}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Status:
                  </span>
                  <div className="mt-1">
                    {selectedLog.status === "success" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Timestamp:
                  </span>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(selectedLog.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Processed At:
                  </span>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(selectedLog.processedAt).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-semibold text-gray-600">
                    Signature:
                  </span>
                  <p className="text-xs font-mono text-gray-700 mt-1 break-all bg-gray-50 p-2 rounded">
                    {selectedLog.signature}
                  </p>
                </div>

                {selectedLog.errorMessage && (
                  <div>
                    <span className="text-sm font-semibold text-red-600">
                      Error:
                    </span>
                    <p className="text-base text-red-700 mt-1">
                      {selectedLog.errorMessage}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-semibold text-gray-600 mb-2 block">
                    Payload:
                  </span>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto border border-gray-200">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
