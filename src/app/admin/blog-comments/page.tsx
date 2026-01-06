"use client";

import CustomButton from "@/common/CustomButton";
import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import { Drawer, Pagination } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  MessageSquare,
  Pencil,
  Search,
  Trash2,
  X,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import * as Yup from "yup";
import ExportButton from "@/features/components/ExportButton";

interface BlogComment {
  _id: string;
  blogId: string;
  blogSlug: string;
  userName: string;
  userEmail: string;
  comment: string;
  status: "pending" | "approved" | "rejected" | "spam";
  parentCommentId?: string;
  likes: number;
  isEdited: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: "all", label: "All Comments", icon: MessageSquare, color: "gray" },
  { value: "pending", label: "Pending", icon: AlertCircle, color: "yellow" },
  { value: "approved", label: "Approved", icon: CheckCircle, color: "green" },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "red" },
  { value: "spam", label: "Spam", icon: XCircle, color: "orange" },
];

const validationSchema = Yup.object({
  comment: Yup.string().required("Comment is required"),
  status: Yup.string()
    .oneOf(["pending", "approved", "rejected", "spam"])
    .required(),
});

export default function BlogCommentsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<BlogComment | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: commentsData,
    isLoading: loading,
    mutate,
  } = useSwr(
    `blog-comments?page=${page}&limit=${limit}&search=${searchQuery}&status=${statusFilter !== "all" ? statusFilter : ""}`
  );
  const { mutation } = useMutation();

  const comments: BlogComment[] = commentsData?.comments || [];
  const pagination = commentsData?.pagination || { total: 0, totalPages: 1 };
  const stats = commentsData?.stats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    spam: 0,
  };

  const handleSubmit = async (
    values: Partial<BlogComment>,
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    const endpoint = editingComment
      ? `blog-comments/${editingComment._id}`
      : "blog-comments";
    const method = editingComment ? "PUT" : "POST";

    const response = await mutation(endpoint, {
      method,
      body: values,
      isAlert: true,
    });

    if (response?.results?.success) {
      mutate();
      setDrawerOpen(false);
      setEditingComment(null);
      resetForm();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Comment?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const response = await mutation(`blog-comments/${id}`, {
        method: "DELETE",
        isAlert: true,
      });

      if (response?.results?.success) {
        mutate();
      }
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const response = await mutation(`blog-comments/${id}`, {
      method: "PUT",
      body: { status, isApproved: status === "approved" },
      isAlert: true,
    });

    if (response?.results?.success) {
      mutate();
    }
  };

  const handleEdit = (comment: BlogComment) => {
    setEditingComment(comment);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingComment(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Blog Comments Moderation
          </h1>
          <p className="text-slate-600">Moderate and manage blog comments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Total Comments</p>
                <p className="text-3xl font-bold text-slate-800">
                  {stats.total}
                </p>
              </div>
              <MessageSquare className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <AlertCircle className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.approved}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.rejected}
                </p>
              </div>
              <XCircle className="text-red-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Spam</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.spam}
                </p>
              </div>
              <XCircle className="text-orange-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by author, email, or content..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Export */}
            <ExportButton
              data={comments}
              filename="blog-comments"
              label="Export Comments"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <Filter size={20} className="text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">
              Status:
            </span>
            {statusOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    statusFilter === option.value
                      ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon size={16} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center">
            <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              No Comments Found
            </h3>
            <p className="text-slate-600">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Comments will appear here when users post them"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {comment.userName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          comment.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : comment.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : comment.status === "spam"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {comment.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      {comment.userEmail}
                    </p>
                    <p className="text-xs text-slate-500">
                      Blog Slug:{" "}
                      <span className="font-semibold">{comment.blogSlug}</span>{" "}
                      •{" "}
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(comment)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 leading-relaxed">
                  {comment.comment}
                </p>

                {/* Quick Actions */}
                {comment.status !== "approved" && (
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() =>
                        handleStatusChange(comment._id, "approved")
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    {comment.status !== "rejected" && (
                      <button
                        onClick={() =>
                          handleStatusChange(comment._id, "rejected")
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    )}
                    {comment.status !== "spam" && (
                      <button
                        onClick={() => handleStatusChange(comment._id, "spam")}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                      >
                        <XCircle size={16} />
                        Mark as Spam
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
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

        {/* Edit Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={handleCloseDrawer}
          PaperProps={{
            sx: { width: { xs: "100%", sm: 500 } },
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Edit Comment
              </h2>
              <button
                onClick={handleCloseDrawer}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <Formik
              initialValues={{
                comment: editingComment?.comment || "",
                status: editingComment?.status || "pending",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Comment Content *
                    </label>
                    <Field
                      as="textarea"
                      name="comment"
                      rows={6}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <ErrorMessage
                      name="comment"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Status *
                    </label>
                    <Field
                      as="select"
                      name="status"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="spam">Spam</option>
                    </Field>
                    <ErrorMessage
                      name="status"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="flex gap-3 pt-6">
                    <CustomButton
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </CustomButton>
                    <CustomButton
                      type="button"
                      onClick={handleCloseDrawer}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800"
                    >
                      Cancel
                    </CustomButton>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
