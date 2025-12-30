"use client";

import AdminLayout from "@/features/layouts/AdminLayout";
import { motion } from "framer-motion";
import { Check, MessageSquare, Star, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Feedback {
  _id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  isRead: boolean;
  createdAt: string;
}

const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchFeedbacks = async () => {
    try {
      const url =
        filter === "all"
          ? "/api/admin/feedback"
          : `/api/admin/feedback?isRead=${filter === "read"}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks);
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isRead: !currentStatus }),
      });

      if (response.ok) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("Failed to update feedback:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("Failed to delete feedback:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
          />
        </div>
      </AdminLayout>
    );
  }

  const unreadCount = feedbacks.filter((f) => !f.isRead).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Feedback
            </h1>
            <p className="text-slate-600 font-medium mt-2">
              View and manage user feedback submissions
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-orange-100 rounded-xl">
              <div className="text-sm text-orange-700 font-bold uppercase tracking-wider">
                Total
              </div>
              <div className="text-2xl font-black text-orange-900">
                {feedbacks.length}
              </div>
            </div>
            <div className="px-6 py-3 bg-red-100 rounded-xl">
              <div className="text-sm text-red-700 font-bold uppercase tracking-wider">
                Unread
              </div>
              <div className="text-2xl font-black text-red-900">
                {unreadCount}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {(["all", "unread", "read"] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                filter === filterOption
                  ? "bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedbacks.map((feedback, index) => (
            <motion.div
              key={feedback._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all ${
                feedback.isRead
                  ? "border-slate-100"
                  : "border-orange-200 bg-orange-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <MessageSquare className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                          {feedback.name}
                        </h3>
                        {!feedback.isRead && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 font-medium text-sm">
                        {feedback.email}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < feedback.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="pl-16">
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {feedback.message}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="pl-16">
                    <p className="text-slate-500 text-sm font-medium">
                      {formatDate(feedback.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() =>
                      handleMarkRead(feedback._id, feedback.isRead)
                    }
                    className={`p-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                      feedback.isRead
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        : "bg-green-100 hover:bg-green-200 text-green-700"
                    }`}
                    title={feedback.isRead ? "Mark as Unread" : "Mark as Read"}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(feedback._id)}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {feedbacks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              No Feedback Found
            </h3>
            <p className="text-slate-600 font-medium">
              {filter === "all"
                ? "No feedback submissions yet"
                : `No ${filter} feedback found`}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FeedbackPage;
