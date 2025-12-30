"use client";

import AdminLayout from "@/features/layouts/AdminLayout";
import { motion } from "framer-motion";
import { Edit, Plus, Star, Trash2, Upload, User, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  image?: string;
  rating: number;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    image: "",
    rating: 5,
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials");
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/testimonials/${editingId}`
        : "/api/testimonials";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchTestimonials();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Failed to save testimonial:", error);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial._id);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      image: testimonial.image || "",
      rating: testimonial.rating,
      order: testimonial.order,
      isActive: testimonial.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchTestimonials();
      }
    } catch (error) {
      console.error("Failed to delete testimonial:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      role: "",
      content: "",
      image: "",
      rating: 5,
      order: 0,
      isActive: true,
    });
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Testimonials
            </h1>
            <p className="text-slate-600 font-medium mt-2">
              Manage customer testimonials and reviews
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Testimonial
          </button>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl shadow-lg p-6 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              {/* Image and Rating */}
              <div className="flex items-start justify-between mb-4">
                {testimonial.image && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 ring-4 ring-orange-100">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Name and Role */}
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                {testimonial.name}
              </h3>
              <p className="text-orange-600 font-bold text-sm uppercase tracking-wider mb-3">
                {testimonial.role}
              </p>

              {/* Content */}
              <p className="text-slate-600 font-medium text-sm leading-relaxed line-clamp-3 mb-4">
                {testimonial.content}
              </p>

              {/* Status Badge */}
              <div className="mb-4">
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    testimonial.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {testimonial.isActive ? "Active" : "Inactive"}
                </span>
                <span className="ml-2 text-xs text-slate-500 font-medium">
                  Order: {testimonial.order}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(testimonial._id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Star className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              No Testimonials Yet
            </h3>
            <p className="text-slate-600 font-medium">
              Add your first testimonial to get started
            </p>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  {editingId ? "Edit Testimonial" : "Add New Testimonial"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Image Upload - Optional */}
                <div>
                  <label className="block text-slate-900 font-black text-sm uppercase tracking-wider mb-3">
                    Profile Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-orange-100 bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                      {formData.image ? (
                        <Image
                          src={formData.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors font-bold text-sm uppercase tracking-wider">
                        <Upload className="w-5 h-5" />
                        {uploading
                          ? "Uploading..."
                          : formData.image
                            ? "Change Image"
                            : "Upload Image"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, image: "" })
                          }
                          className="mt-2 text-sm text-red-600 hover:text-red-700 font-bold"
                        >
                          Remove Image
                        </button>
                      )}
                      <p className="text-xs text-slate-500 font-medium mt-2">
                        💡 If no image is uploaded, a user icon will be shown
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                    placeholder="John Doe"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                    Role/Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                    placeholder="Volunteer"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                    Testimonial Content *
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium resize-none"
                    placeholder="Write the testimonial content here..."
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-3">
                    Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= formData.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order and Status */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                      Status
                    </label>
                    <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-slate-900 font-bold text-sm uppercase tracking-wider">
                        Active
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-sm uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    {editingId ? "Update" : "Create"} Testimonial
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TestimonialsPage;
