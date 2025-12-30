"use client";

import AdminLayout from "@/features/layouts/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Edit,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
  FileText,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface GalleryFile {
  id: string;
  url: string;
  type: string;
  _id?: string;
}

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  files: GalleryFile[];
  category: string;
  date: string;
  isActive: boolean;
}

const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    date: new Date().toISOString().split("T")[0],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  const categories = [
    {
      value: "all",
      label: "All Categories",
      color: "from-purple-500 to-pink-500",
    },
    {
      value: "food-rescue",
      label: "Food Rescue",
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "blood-donation",
      label: "Blood Donation",
      color: "from-red-500 to-rose-500",
    },
    {
      value: "child-welfare",
      label: "Child Welfare",
      color: "from-blue-500 to-cyan-500",
    },
    { value: "events", label: "Events", color: "from-orange-500 to-amber-500" },
    { value: "other", label: "Other", color: "from-slate-500 to-gray-500" },
  ];

  useEffect(() => {
    fetchGallery();
  }, [category, startDate, endDate]);

  const fetchGallery = async () => {
    try {
      const params = new URLSearchParams();
      params.append("category", category);
      params.append("limit", "100");
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/gallery?${params.toString()}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (file: File | string): "image" | "video" | "pdf" => {
    if (typeof file === "string") {
      if (file.includes(".pdf")) return "pdf";
      if (file.includes(".mp4") || file.includes(".webm")) return "video";
      return "image";
    }
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type === "application/pdf") return "pdf";
    return "image";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxSize) {
        alert(`${file.name} exceeds 10MB limit`);
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(`${file.name} is not a valid file type`);
        continue;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...validPreviews]);

    e.target.value = "";
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("date", formData.date);

      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`file_${index}`, file);
      });

      const url = editingItem
        ? `/api/gallery/${editingItem._id}`
        : "/api/gallery";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formDataToSend,
      });

      if (response.ok) {
        setShowModal(false);
        setEditingItem(null);
        resetForm();
        fetchGallery();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save gallery item");
      }
    } catch (error) {
      console.error("Failed to save gallery item:", error);
      alert("An error occurred while saving");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchGallery();
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      date: new Date(item.date).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "other",
      date: new Date().toISOString().split("T")[0],
    });
    filePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    resetForm();
  };

  // Enhanced Media Carousel Component
  const MediaCarousel = ({ files }: { files: GalleryFile[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);

    useEffect(() => {
      if (files.length > 1 && autoPlay) {
        const currentFile = files[currentIndex];
        // Don't auto-advance on videos
        if (currentFile.type !== "video") {
          const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % files.length);
          }, 4000);
          return () => clearInterval(interval);
        }
      }
    }, [files.length, currentIndex, autoPlay]);

    if (files.length === 0) return null;

    const currentFile = files[currentIndex];

    const nextSlide = () => {
      setCurrentIndex((prev) => (prev + 1) % files.length);
      setAutoPlay(false);
    };

    const prevSlide = () => {
      setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
      setAutoPlay(false);
    };

    return (
      <div className="relative h-64 w-full bg-slate-900 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {currentFile.type === "video" ? (
              <div className="relative h-full w-full">
                <video
                  src={currentFile.url}
                  controls
                  className="w-full h-full object-contain"
                  poster={currentFile.url.replace(/\.[^/.]+$/, ".jpg")}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5" />
                  Video
                </div>
              </div>
            ) : currentFile.type === "pdf" ? (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <button
                  onClick={() => setPdfPreview(currentFile.url)}
                  className="flex flex-col items-center gap-4 group/pdf"
                >
                  <div className="p-6 bg-white/10 rounded-2xl group-hover/pdf:bg-white/20 transition-colors">
                    <FileText className="w-20 h-20 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg mb-1">
                      PDF Document
                    </p>
                    <p className="text-white/70 text-sm">Click to preview</p>
                  </div>
                </button>
                <div className="absolute top-4 left-4 bg-blue-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </div>
              </div>
            ) : (
              <img
                src={currentFile.url}
                alt={`Media ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {files.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicators */}
        {files.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {files.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setAutoPlay(false);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === index
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75 w-1.5"
                }`}
              />
            ))}
          </div>
        )}

        {/* File Count Badge */}
        {files.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold z-10">
            {currentIndex + 1} / {files.length}
          </div>
        )}
      </div>
    );
  };

  // PDF Preview Modal
  const PDFPreviewModal = () => {
    if (!pdfPreview) return null;

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-bold">PDF Preview</h3>
            <div className="flex items-center gap-2">
              <a
                href={pdfPreview}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => setPdfPreview(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <iframe
            src={pdfPreview}
            className="flex-1 w-full"
            title="PDF Preview"
          />
        </motion.div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2">
              Gallery Manager
            </h1>
            <p className="text-slate-600 text-lg">
              Manage your media with style ✨
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5" />
            Add New Media
          </motion.button>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat.value)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                category === cat.value
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                  : "bg-white text-slate-700 hover:shadow-md"
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Date Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
            Filter by Date
          </h3>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {[
              { label: "Today", days: 0 },
              { label: "Last 3 Days", days: 3 },
              { label: "Last Week", days: 7 },
              { label: "Last Month", days: 30 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  const today = new Date();
                  const past = new Date(today);
                  past.setDate(today.getDate() - preset.days);
                  setStartDate(past.toISOString().split("T")[0]);
                  setEndDate(today.toISOString().split("T")[0]);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-600">
                From:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-600">
                To:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-64 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-16 text-center shadow-lg"
          >
            <ImageIcon className="w-24 h-24 text-slate-300 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-slate-900 mb-3">
              No Media Found
            </h3>
            <p className="text-slate-600 text-lg mb-8">
              Start by uploading your first gallery item
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Upload Now
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Media Carousel */}
                <div className="relative">
                  <MediaCarousel files={item.files || []} />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-purple-600 font-bold text-xs uppercase tracking-wider rounded-full shadow-lg">
                      {item.category.replace("-", " ")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(item)}
                      className="p-2.5 bg-white/90 hover:bg-white rounded-xl transition-colors shadow-lg"
                    >
                      <Edit className="w-5 h-5 text-slate-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(item._id)}
                      className="p-2.5 bg-red-500/90 hover:bg-red-600 rounded-xl transition-colors shadow-lg"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-black text-slate-900 line-clamp-1">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>

                    {item.files.length > 1 && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                        <ImageIcon className="w-3 h-3" />
                        {item.files.length} files
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between z-10 rounded-t-3xl">
                  <h2 className="text-2xl font-black text-white">
                    {editingItem ? "Edit Media" : "Add New Media"}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-3">
                      Upload Files *
                    </label>

                    {filePreviews.length > 0 ? (
                      <>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {filePreviews.map((preview, index) => {
                            const fileType = getFileType(selectedFiles[index]);
                            return (
                              <div key={index} className="relative group">
                                <div className="relative h-32 rounded-xl overflow-hidden border-2 border-slate-200">
                                  {fileType === "video" ? (
                                    <video
                                      src={preview}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : fileType === "pdf" ? (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                      <FileText className="w-12 h-12 text-slate-400" />
                                    </div>
                                  ) : (
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <label className="inline-flex items-center gap-2 px-5 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl cursor-pointer transition-colors font-bold text-sm">
                          <Plus className="w-5 h-5" />
                          Add More Files
                          <input
                            type="file"
                            accept="image/*,video/*,application/pdf"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="h-64 rounded-2xl border-2 border-dashed border-slate-300 hover:border-purple-400 flex items-center justify-center bg-slate-50 hover:bg-purple-50 transition-all">
                          <div className="text-center">
                            <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-700 font-bold text-lg mb-2">
                              Click to upload files
                            </p>
                            <p className="text-slate-500 text-sm">
                              Images, Videos, or PDFs (Max 10MB each)
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="image/*,video/*,application/pdf"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-3">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="Enter a catchy title..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-3">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                      placeholder="Add a brief description..."
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-3">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    >
                      {categories
                        .filter((cat) => cat.value !== "all")
                        .map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-slate-900 font-bold text-sm mb-3">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      📊 Statistics will update automatically based on this date
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-all"
                      disabled={uploading}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={selectedFiles.length === 0 || uploading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {uploading
                        ? "Uploading..."
                        : editingItem
                          ? "Update Media"
                          : "Upload Media"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PDF Preview Modal */}
        <PDFPreviewModal />
      </div>
    </AdminLayout>
  );
};

export default GalleryPage;
