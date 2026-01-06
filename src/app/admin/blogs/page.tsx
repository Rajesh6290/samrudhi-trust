"use client";
import { Drawer, IconButton, Tabs, Tab, Box } from "@mui/material";
import {
  Pencil,
  Plus,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Eye,
  BookOpen,
  Save,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomButton from "@/common/CustomButton";
import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import Swal from "sweetalert2";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  images: string[];
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  isActive: "yes" | "no";
  order: number;
  views: number;
  likes: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export default function BlogsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const { isLoading, mutation } = useMutation();
  const { data: blogsData, isLoading: loading, mutate } = useSwr("blogs");
  const blogs: Blog[] = blogsData?.blogs || [];

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    slug: Yup.string()
      .required("Slug is required")
      .matches(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
    content: Yup.string().required("Content is required"),
    excerpt: Yup.string()
      .required("Excerpt is required")
      .max(300, "Excerpt must be less than 300 characters"),
    category: Yup.string().required("Category is required"),
    tags: Yup.string().required("At least one tag is required"),
    status: Yup.string()
      .oneOf(["draft", "published", "archived"])
      .required("Status is required"),
    isActive: Yup.string()
      .oneOf(["yes", "no"])
      .required("Active status is required"),
    order: Yup.number(),
    authorName: Yup.string().required("Author name is required"),
    authorAvatar: Yup.string().url("Must be a valid URL"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      coverPhoto: null as File | null,
      category: "",
      tags: "",
      status: "draft" as "draft" | "published" | "archived",
      isActive: "yes" as "yes" | "no",
      order: 0,
      authorName: "",
      authorAvatar: "",
      additionalPhotos: [] as File[],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("slug", values.slug);
        formData.append("content", values.content);
        formData.append("excerpt", values.excerpt);
        formData.append("category", values.category);
        formData.append("tags", values.tags);
        formData.append("status", values.status);
        formData.append("isActive", values.isActive);
        formData.append("order", values.order.toString());
        formData.append("authorName", values.authorName);
        formData.append("authorAvatar", values.authorAvatar);

        if (values.coverPhoto) {
          formData.append("coverImage", values.coverPhoto);
        }

        if (values.additionalPhotos.length > 0) {
          values.additionalPhotos.forEach((photo) => {
            formData.append("images", photo);
          });
        }

        const res = await mutation(
          editingBlog ? `blogs/${editingBlog._id}` : "blogs",
          {
            method: editingBlog ? "PUT" : "POST",
            body: formData,
            isFormData: true,
            isAlert: false,
          }
        );

        if (res?.status === 200 || res?.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: editingBlog
              ? "Blog updated successfully!"
              : "Blog created successfully!",
            timer: 2000,
            showConfirmButton: true,
          });
          formik.resetForm();
          setCoverImagePreview("");
          setAdditionalImages([]);
          mutate();
          handleCloseDrawer();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res?.results?.error || "Failed to save blog",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Something went wrong",
        });
      }
    },
  });

  useEffect(() => {
    if (editingBlog && drawerOpen) {
      formik.setValues({
        title: editingBlog.title || "",
        slug: editingBlog.slug || "",
        content: editingBlog.content || "",
        excerpt: editingBlog.excerpt || "",
        coverPhoto: null,
        category: editingBlog.category || "",
        tags: editingBlog.tags.join(", ") || "",
        status: editingBlog.status || "draft",
        isActive: editingBlog.isActive || "yes",
        order: editingBlog.order || 0,
        authorName: editingBlog.author.name || "",
        authorAvatar: editingBlog.author.avatar || "",
        additionalPhotos: [],
      });
      setCoverImagePreview(editingBlog.coverImage || "");
      setAdditionalImages(editingBlog.images || []);
    } else if (!drawerOpen) {
      formik.resetForm();
      setCoverImagePreview("");
      setAdditionalImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingBlog, drawerOpen]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      formik.setFieldValue("coverPhoto", file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      formik.setFieldValue("additionalPhotos", [
        ...formik.values.additionalPhotos,
        ...files,
      ]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newPhotos = [...formik.values.additionalPhotos];
    newPhotos.splice(index, 1);
    formik.setFieldValue("additionalPhotos", newPhotos);

    const newPreviews = [...additionalImages];
    newPreviews.splice(index, 1);
    setAdditionalImages(newPreviews);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingBlog(null);
    setCoverImagePreview("");
    setAdditionalImages([]);
    formik.resetForm();
    setTabValue(0);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This blog will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await mutation(`blogs/${id}`, {
        method: "DELETE",
        isAlert: false,
      });

      if (res?.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Blog deleted successfully.",
          timer: 2000,
        });
        mutate();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.results?.error || "Failed to delete blog",
        });
      }
    } catch (_error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-20">
          <p className="text-gray-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage blog posts with markdown support
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Add Blog Post
        </button>
      </div>

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">
            No blogs found. Create your first blog post!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Cover Image */}
              <div className="relative h-48 bg-gray-200">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      blog.status === "published"
                        ? "bg-green-100 text-green-700"
                        : blog.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                    {blog.category}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <BookOpen size={12} />
                    {blog.readTime} min read
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {blog.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {blog.excerpt}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {blog.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {blog.tags.length > 3 && (
                    <span className="px-2 py-1 text-gray-400 text-xs">
                      +{blog.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {blog.views}
                    </span>
                    <span>❤️ {blog.likes}</span>
                  </div>
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                  {blog.author.avatar ? (
                    <Image
                      src={blog.author.avatar}
                      alt={blog.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                      {blog.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 font-medium">
                    {blog.author.name}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer for Add/Edit */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          style: { width: "900px", maxWidth: "90vw" },
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBlog ? "Edit Blog Post" : "Add Blog Post"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Write your blog content in Markdown format
              </p>
            </div>
            <IconButton onClick={handleCloseDrawer}>
              <X />
            </IconButton>
          </div>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(_e, newValue) => setTabValue(newValue)}
            >
              <Tab
                label="Content"
                icon={<FileText size={18} />}
                iconPosition="start"
              />
              <Tab
                label="Preview"
                icon={<Eye size={18} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {tabValue === 0 ? (
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps("title")}
                      onChange={(e) => {
                        formik.handleChange(e);
                        if (!editingBlog) {
                          formik.setFieldValue(
                            "slug",
                            generateSlug(e.target.value)
                          );
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter blog title"
                    />
                    {formik.touched.title && formik.errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps("slug")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="blog-post-slug"
                    />
                    {formik.touched.slug && formik.errors.slug && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.slug}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt * (Max 300 characters)
                    </label>
                    <textarea
                      {...formik.getFieldProps("excerpt")}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Brief description of your blog post"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formik.values.excerpt.length}/300 characters
                    </p>
                    {formik.touched.excerpt && formik.errors.excerpt && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.excerpt}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content * (Markdown Supported)
                    </label>
                    <textarea
                      {...formik.getFieldProps("content")}
                      rows={15}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                      placeholder="Write your blog content in Markdown...&#10;&#10;# Heading 1&#10;## Heading 2&#10;&#10;**Bold text**&#10;*Italic text*&#10;&#10;- List item 1&#10;- List item 2&#10;&#10;[Link text](https://example.com)&#10;&#10;```javascript&#10;console.log('Code block');&#10;```"
                    />
                    {formik.touched.content && formik.errors.content && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.content}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image *
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload size={18} />
                      Choose Cover Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {coverImagePreview && (
                    <div className="mt-4 relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src={coverImagePreview}
                        alt="Cover preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Images (Optional)
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors w-fit">
                    <ImageIcon size={18} />
                    Add Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesChange}
                      className="hidden"
                    />
                  </label>
                  {additionalImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="relative h-32 rounded-lg overflow-hidden">
                            <Image
                              src={img}
                              alt={`Additional ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meta Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps("category")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Technology, Health, etc."
                    />
                    {formik.touched.category && formik.errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags * (comma-separated)
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps("tags")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="react, nextjs, tutorial"
                    />
                    {formik.touched.tags && formik.errors.tags && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.tags}
                      </p>
                    )}
                  </div>
                </div>

                {/* Author Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Name *
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps("authorName")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                    {formik.touched.authorName && formik.errors.authorName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.authorName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author Avatar URL
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps("authorAvatar")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                    {formik.touched.authorAvatar &&
                      formik.errors.authorAvatar && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.authorAvatar}
                        </p>
                      )}
                  </div>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      {...formik.getFieldProps("status")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Active Status *
                    </label>
                    <select
                      {...formik.getFieldProps("isActive")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="yes">Active</option>
                      <option value="no">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      {...formik.getFieldProps("order")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4 border-t">
                  <CustomButton
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save size={18} />
                    {editingBlog ? "Update Blog" : "Create Blog"}
                  </CustomButton>
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="prose max-w-none">
                <h1
                  style={{
                    color: "#1a202c",
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    marginBottom: "1.5rem",
                  }}
                >
                  {formik.values.title || "Blog Title"}
                </h1>
                <div
                  className="flex items-center gap-4 text-sm mb-6"
                  style={{ color: "#4a5568" }}
                >
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-medium">
                    {formik.values.category || "Category"}
                  </span>
                  <span>
                    {Math.ceil(
                      (formik.values.content.trim().split(/\s+/).length || 0) /
                        200
                    ) || 1}{" "}
                    min read (auto-calculated)
                  </span>
                  <span>By {formik.values.authorName || "Author"}</span>
                </div>
                {coverImagePreview && (
                  <div className="relative h-96 rounded-lg overflow-hidden mb-6">
                    <Image
                      src={coverImagePreview}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div
                  style={{
                    color: "#2d3748",
                    lineHeight: "1.75",
                  }}
                >
                  <style jsx global>{`
                    .preview-markdown h1 {
                      color: #1a202c;
                      font-size: 2.25rem;
                      font-weight: 700;
                      margin-top: 2rem;
                      margin-bottom: 1rem;
                    }
                    .preview-markdown h2 {
                      color: #2d3748;
                      font-size: 1.875rem;
                      font-weight: 700;
                      margin-top: 2rem;
                      margin-bottom: 0.75rem;
                      border-bottom: 2px solid #e2e8f0;
                      padding-bottom: 0.5rem;
                    }
                    .preview-markdown h3 {
                      color: #2d3748;
                      font-size: 1.5rem;
                      font-weight: 600;
                      margin-top: 1.5rem;
                      margin-bottom: 0.5rem;
                    }
                    .preview-markdown h4 {
                      color: #2d3748;
                      font-size: 1.25rem;
                      font-weight: 600;
                      margin-top: 1.5rem;
                      margin-bottom: 0.5rem;
                    }
                    .preview-markdown p {
                      color: #2d3748;
                      font-size: 1.125rem;
                      line-height: 1.75;
                      margin-bottom: 1rem;
                    }
                    .preview-markdown ul,
                    .preview-markdown ol {
                      color: #2d3748;
                      font-size: 1.125rem;
                      line-height: 1.75;
                      margin-bottom: 1rem;
                      padding-left: 1.5rem;
                    }
                    .preview-markdown li {
                      color: #2d3748;
                      margin-bottom: 0.5rem;
                    }
                    .preview-markdown strong {
                      color: #1a202c;
                      font-weight: 700;
                    }
                    .preview-markdown em {
                      color: #2d3748;
                      font-style: italic;
                    }
                    .preview-markdown a {
                      color: #3b82f6;
                      text-decoration: underline;
                      font-weight: 500;
                    }
                    .preview-markdown a:hover {
                      color: #2563eb;
                    }
                    .preview-markdown blockquote {
                      color: #4a5568;
                      border-left: 4px solid #3b82f6;
                      padding-left: 1rem;
                      margin: 1.5rem 0;
                      font-style: italic;
                      background-color: #f7fafc;
                      padding: 1rem;
                      border-radius: 0.5rem;
                    }
                    .preview-markdown code {
                      color: #c53030;
                      background-color: #fff5f5;
                      padding: 0.2rem 0.4rem;
                      border-radius: 0.25rem;
                      font-size: 0.875rem;
                      font-family: "Courier New", monospace;
                    }
                    .preview-markdown pre {
                      background-color: #1a202c;
                      padding: 1rem;
                      border-radius: 0.5rem;
                      overflow-x: auto;
                      margin: 1.5rem 0;
                    }
                    .preview-markdown pre code {
                      color: #e2e8f0;
                      background-color: transparent;
                      padding: 0;
                      font-size: 0.875rem;
                    }
                    .preview-markdown table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 1.5rem 0;
                      font-size: 1rem;
                    }
                    .preview-markdown table thead {
                      background-color: #edf2f7;
                    }
                    .preview-markdown table th {
                      color: #1a202c;
                      font-weight: 700;
                      padding: 0.75rem;
                      text-align: left;
                      border: 1px solid #cbd5e0;
                    }
                    .preview-markdown table td {
                      color: #2d3748;
                      padding: 0.75rem;
                      border: 1px solid #e2e8f0;
                    }
                    .preview-markdown table tr:nth-child(even) {
                      background-color: #f7fafc;
                    }
                    .preview-markdown img {
                      max-width: 100%;
                      height: auto;
                      border-radius: 0.5rem;
                      margin: 1.5rem 0;
                    }
                    .preview-markdown hr {
                      border: none;
                      border-top: 2px solid #e2e8f0;
                      margin: 2rem 0;
                    }
                  `}</style>
                  <div className="preview-markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      components={{
                        code({
                          className,
                          children,
                          ...props
                        }: {
                          className?: string;
                          children?: React.ReactNode;
                        }) {
                          const match = /language-(\w+)/.exec(className || "");
                          const inline = !className;
                          return !inline && match ? (
                            <SyntaxHighlighter
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              style={atomDark as any}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {formik.values.content || "*No content yet...*"}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
