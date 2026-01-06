"use client";

import CustomButton from "@/common/CustomButton";
import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import { Drawer, Pagination } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import * as Yup from "yup";
import ExportButton from "@/features/components/ExportButton";

interface NewsletterSubscriber {
  _id: string;
  email: string;
  name?: string;
  status: "active" | "unsubscribed" | "bounced";
  source: string;
  tags: string[];
  preferences?: Record<string, unknown>;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  lastEmailSent?: Date;
  createdAt: string;
  updatedAt: string;
}

const statusOptions = [
  { value: "all", label: "All Status", icon: Mail, color: "slate" },
  { value: "active", label: "Active", icon: CheckCircle, color: "green" },
  { value: "unsubscribed", label: "Unsubscribed", icon: XCircle, color: "red" },
  { value: "bounced", label: "Bounced", icon: AlertTriangle, color: "yellow" },
];

const sourceOptions = [
  { value: "website", label: "Website" },
  { value: "campaign", label: "Campaign" },
  { value: "event", label: "Event" },
  { value: "manual", label: "Manual" },
  { value: "import", label: "Import" },
];

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  name: Yup.string(),
  source: Yup.string().required("Source is required"),
  tags: Yup.string(),
  status: Yup.string().oneOf(["active", "unsubscribed", "bounced"]),
});

export default function NewsletterPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] =
    useState<NewsletterSubscriber | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: subscribersData,
    isLoading: loading,
    mutate,
  } = useSwr(
    `newsletter?page=${page}&limit=${limit}&search=${searchQuery}&status=${statusFilter !== "all" ? statusFilter : ""}`
  );
  const { mutation } = useMutation();

  const subscribers: NewsletterSubscriber[] =
    subscribersData?.subscribers || [];
  const pagination = subscribersData?.pagination || { total: 0, totalPages: 1 };

  const handleSubmit = async (
    values: Partial<NewsletterSubscriber> & { tags?: string | string[] },
    {
      setSubmitting,
      resetForm,
    }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    const payload = {
      ...values,
      tags:
        typeof values.tags === "string"
          ? values.tags.split(",").map((t: string) => t.trim())
          : values.tags || [],
    };

    const response = editingSubscriber
      ? await mutation(`newsletter`, {
          method: "PUT",
          body: { id: editingSubscriber._id, ...payload },
          isAlert: true,
        })
      : await mutation("newsletter", {
          method: "POST",
          body: payload,
          isAlert: true,
        });

    if (response?.status === 200 || response?.status === 201) {
      mutate();
      setDrawerOpen(false);
      setEditingSubscriber(null);
      resetForm();
    }
    setSubmitting(false);
  };

  const handleEdit = (subscriber: NewsletterSubscriber) => {
    setEditingSubscriber(subscriber);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This subscriber will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const response = await mutation(`newsletter?id=${id}`, {
        method: "DELETE",
        isAlert: false,
      });

      if (response?.status === 200) {
        Swal.fire("Deleted!", "Subscriber has been deleted.", "success");
        mutate();
      }
    }
  };

  const openDrawer = () => {
    setEditingSubscriber(null);
    setDrawerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
      unsubscribed: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Unsubscribed",
      },
      bounced: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Bounced",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <span
        className={`px-3 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-full`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Mail className="w-8 h-8 text-blue-600" />
            Newsletter Subscribers
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your newsletter subscriber list ({pagination.total} total)
          </p>
        </div>
        <div className="flex gap-3">
          <ExportButton
            data={subscribers.map((s) => ({
              email: s.email,
              name: s.name || "N/A",
              status: s.status,
              source: s.source,
              subscribedAt: new Date(s.subscribedAt).toLocaleDateString(),
            }))}
            filename="newsletter-subscribers"
          />
          <button
            onClick={openDrawer}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {statusOptions.map((status) => {
          const Icon = status.icon;
          const count =
            status.value === "all"
              ? pagination.total
              : subscribers.filter((s) => s.status === status.value).length;

          return (
            <div
              key={status.value}
              className={`bg-white rounded-xl shadow-sm p-4 border-l-4 border-${status.color}-500 hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setStatusFilter(status.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    {status.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {count}
                  </p>
                </div>
                <Icon className={`w-8 h-8 text-${status.color}-500`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {subscribers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No subscribers found</p>
              </div>
            ) : (
              subscribers.map((subscriber) => (
                <div
                  key={subscriber._id}
                  className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(subscriber.status)}
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full capitalize">
                          {subscriber.source}
                        </span>
                        {subscriber.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {subscriber.email}
                        </h3>
                        {subscriber.name && (
                          <p className="text-slate-600 text-sm">
                            {subscriber.name}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>
                          Subscribed:{" "}
                          {new Date(
                            subscriber.subscribedAt
                          ).toLocaleDateString()}
                        </p>
                        {subscriber.lastEmailSent && (
                          <p>
                            Last Email:{" "}
                            {new Date(
                              subscriber.lastEmailSent
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {subscriber.unsubscribedAt && (
                          <p>
                            Unsubscribed:{" "}
                            {new Date(
                              subscriber.unsubscribedAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(subscriber)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(subscriber._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </div>
          )}
        </>
      )}

      {/* Add/Edit Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingSubscriber(null);
        }}
        PaperProps={{
          sx: { width: { xs: "100%", sm: "600px" } },
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {editingSubscriber ? "Edit Subscriber" : "Add New Subscriber"}
            </h2>
            <button
              onClick={() => {
                setDrawerOpen(false);
                setEditingSubscriber(null);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <Formik
            initialValues={{
              email: editingSubscriber?.email || "",
              name: editingSubscriber?.name || "",
              source: editingSubscriber?.source || "manual",
              tags: (editingSubscriber?.tags.join(", ") ||
                "") as unknown as string[],
              status: editingSubscriber?.status || "active",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email *
                  </label>
                  <Field
                    name="email"
                    type="email"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="subscriber@example.com"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Name (Optional)
                  </label>
                  <Field
                    name="name"
                    type="text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="John Doe"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Source *
                  </label>
                  <Field
                    name="source"
                    as="select"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                  >
                    {sourceOptions.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="source"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <Field
                    name="tags"
                    type="text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="volunteer, donor, monthly"
                  />
                  <ErrorMessage
                    name="tags"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <Field
                    name="status"
                    as="select"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <CustomButton
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingSubscriber
                        ? "Update Subscriber"
                        : "Add Subscriber"}
                  </CustomButton>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setEditingSubscriber(null);
                    }}
                    className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Drawer>
    </div>
  );
}
