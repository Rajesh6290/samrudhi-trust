"use client";

import { useState } from "react";
import useSwr from "@/features/hooks/useSwr";
import { Eye, RefreshCw, AlertCircle, CheckCircle, X } from "lucide-react";

interface WebhookLog {
  _id: string;
  eventType: string;
  status: "success" | "failed";
  errorMessage?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export default function WebhookLogsPage() {
  const { data: logsData, isLoading, mutate } = useSwr("webhooks/logs");
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const logs: WebhookLog[] = logsData?.logs || [];

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Webhook Logs</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
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
                      {log.eventType}
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
