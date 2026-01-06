"use client";

import CustomButton from "@/common/CustomButton";
import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import { Drawer } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  HelpCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Filter,
} from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import * as Yup from "yup";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: "general", label: "General" },
  { value: "donation", label: "Donation" },
  { value: "volunteering", label: "Volunteering" },
  { value: "programs", label: "Programs" },
  { value: "other", label: "Other" },
];

const validationSchema = Yup.object({
  question: Yup.string()
    .min(10, "Question must be at least 10 characters")
    .required("Question is required"),
  answer: Yup.string()
    .min(20, "Answer must be at least 20 characters")
    .required("Answer is required"),
  category: Yup.string().required("Category is required"),
  order: Yup.number().min(0, "Order must be 0 or greater").required(),
  isActive: Yup.boolean(),
});

export default function FAQsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: faqsData, isLoading: loading, mutate } = useSwr("faqs");
  const { mutation } = useMutation();

  const faqs: FAQ[] = faqsData?.faqs || [];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm }: any
  ) => {
    const response = editingFAQ
      ? await mutation(`faqs/${editingFAQ._id}`, {
          method: "PUT",
          body: values,
          isAlert: true,
        })
      : await mutation("faqs", {
          method: "POST",
          body: values,
          isAlert: true,
        });

    if (response?.status === 200 || response?.status === 201) {
      mutate();
      setDrawerOpen(false);
      setEditingFAQ(null);
      resetForm();
    }
    setSubmitting(false);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This FAQ will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const response = await mutation(`faqs/${id}`, {
        method: "DELETE",
        isAlert: false,
      });

      if (response?.status === 200) {
        Swal.fire("Deleted!", "FAQ has been deleted.", "success");
        mutate();
      }
    }
  };

  const openDrawer = () => {
    setEditingFAQ(null);
    setDrawerOpen(true);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            FAQs Management
          </h1>
          <p className="text-slate-600 mt-2">
            Manage frequently asked questions
          </p>
        </div>
        <button
          onClick={openDrawer}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No FAQs found</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div
                key={faq._id}
                className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full capitalize">
                        {faq.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        Order: {faq.order}
                      </span>
                      {!faq.isActive && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-slate-600 text-sm">{faq.answer}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
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
      )}

      {/* Add/Edit Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingFAQ(null);
        }}
        PaperProps={{
          sx: { width: { xs: "100%", sm: "600px" } },
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {editingFAQ ? "Edit FAQ" : "Add New FAQ"}
            </h2>
            <button
              onClick={() => {
                setDrawerOpen(false);
                setEditingFAQ(null);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <Formik
            initialValues={{
              question: editingFAQ?.question || "",
              answer: editingFAQ?.answer || "",
              category: editingFAQ?.category || "general",
              order: editingFAQ?.order || 0,
              isActive: editingFAQ?.isActive ?? true,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="space-y-6">
                {/* Question */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Question *
                  </label>
                  <Field
                    name="question"
                    type="text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter question"
                  />
                  <ErrorMessage
                    name="question"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Answer *
                  </label>
                  <Field
                    name="answer"
                    as="textarea"
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="Enter answer"
                  />
                  <ErrorMessage
                    name="answer"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category *
                  </label>
                  <Field
                    name="category"
                    as="select"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="category"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Display Order *
                  </label>
                  <Field
                    name="order"
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0"
                  />
                  <ErrorMessage
                    name="order"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={values.isActive}
                      onChange={(e) =>
                        setFieldValue("isActive", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-slate-700">
                      Active
                    </span>
                  </label>
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
                      : editingFAQ
                        ? "Update FAQ"
                        : "Create FAQ"}
                  </CustomButton>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setEditingFAQ(null);
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
