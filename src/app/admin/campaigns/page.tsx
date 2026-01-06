"use client";
import { Drawer, IconButton } from "@mui/material";
import {
  Calendar,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CustomButton from "@/common/CustomButton";
import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import Swal from "sweetalert2";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  address: string;
  startDate: string;
  endDate?: string;
  type: "campaign" | "event";
  status: "ongoing" | "upcoming" | "completed";
  isActive: "yes" | "no";
  order: number;
  donationLink?: string;
  eventLink?: string;
}

export default function CampaignsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { isLoading, mutation } = useMutation();
  const {
    data: campaignsData,
    isLoading: loading,
    mutate,
  } = useSwr("campaigns");
  const campaigns: Campaign[] = campaignsData?.campaigns || [];

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    location: Yup.string().required("Location is required"),
    address: Yup.string().required("Address is required"),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date(),
    type: Yup.string()
      .oneOf(["campaign", "event"])
      .required("Type is required"),
    status: Yup.string()
      .oneOf(["ongoing", "upcoming", "completed"])
      .required("Status is required"),
    isActive: Yup.string()
      .oneOf(["yes", "no"])
      .required("Active status is required"),
    order: Yup.number(),
    donationLink: Yup.string().url("Must be a valid URL"),
    eventLink: Yup.string().url("Must be a valid URL"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      photo: null as File | null,
      location: "",
      address: "",
      startDate: "",
      endDate: "",
      type: "campaign" as "campaign" | "event",
      status: "ongoing" as "ongoing" | "upcoming" | "completed",
      isActive: "yes" as "yes" | "no",
      order: 0,
      donationLink: "",
      eventLink: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("location", values.location);
        formData.append("address", values.address);
        formData.append("startDate", values.startDate);
        formData.append("endDate", values.endDate);
        formData.append("type", values.type);
        formData.append("status", values.status);
        formData.append("isActive", values.isActive);
        formData.append("order", values.order.toString());

        if (values.type === "campaign" && values.donationLink) {
          formData.append("donationLink", values.donationLink);
        }
        if (values.type === "event" && values.eventLink) {
          formData.append("eventLink", values.eventLink);
        }

        if (values.photo) {
          formData.append("image", values.photo);
        }

        const res = await mutation(
          editingCampaign ? `campaigns/${editingCampaign._id}` : "campaigns",
          {
            method: editingCampaign ? "PUT" : "POST",
            body: formData,
            isFormData: true,
            isAlert: false,
          }
        );

        if (res?.status === 200 || res?.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: editingCampaign
              ? "Campaign updated successfully!"
              : "Campaign created successfully!",
            timer: 2000,
            showConfirmButton: true,
          });
          formik.resetForm();
          setImagePreview("");
          mutate();
          handleCloseDrawer();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res?.results?.error || "Failed to save campaign",
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
    if (editingCampaign && drawerOpen) {
      formik.setValues({
        title: editingCampaign.title || "",
        description: editingCampaign.description || "",
        photo: null,
        location: editingCampaign.location || "",
        address: editingCampaign.address || "",
        startDate: editingCampaign.startDate
          ? new Date(editingCampaign.startDate).toISOString().split("T")[0]
          : "",
        endDate: editingCampaign.endDate
          ? new Date(editingCampaign.endDate).toISOString().split("T")[0]
          : "",
        type: editingCampaign.type || "campaign",
        status: editingCampaign.status || "ongoing",
        isActive: editingCampaign.isActive || "yes",
        order: editingCampaign.order || 0,
        donationLink: editingCampaign.donationLink || "",
        eventLink: editingCampaign.eventLink || "",
      });
      setImagePreview(editingCampaign.image || "");
    } else if (!drawerOpen) {
      formik.resetForm();
      setImagePreview("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCampaign, drawerOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      formik.setFieldValue("photo", file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingCampaign(null);
    setImagePreview("");
    formik.resetForm();
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This campaign will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await mutation(`campaigns/${id}`, {
        method: "DELETE",
        isAlert: false,
      });

      if (res?.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Campaign deleted successfully.",
          timer: 2000,
        });
        mutate();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.results?.error || "Failed to delete campaign",
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
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Campaigns & Events
          </h1>
          <p className="text-gray-600 mt-1">Manage your campaigns and events</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Add Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">
            No campaigns found. Create your first campaign!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                <Image
                  src={campaign.image}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {campaign.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(campaign)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(campaign._id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>

                <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  <span>{campaign.location}</span>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span>
                    {new Date(campaign.startDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      campaign.status === "ongoing"
                        ? "bg-emerald-100 text-emerald-700"
                        : campaign.status === "upcoming"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {campaign.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      campaign.type === "campaign"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {campaign.type}
                  </span>
                  {campaign.isActive === "no" && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 500 },
            maxWidth: "100%",
          },
        }}
      >
        <div className="flex flex-col h-full bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingCampaign ? "Edit Campaign" : "Add New Campaign"}
            </h2>
            <IconButton onClick={handleCloseDrawer}>
              <X />
            </IconButton>
          </div>

          {/* Form Content */}
          <form
            onSubmit={formik.handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-6"
          >
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image *
              </label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title *
              </label>
              <input
                id="title"
                type="text"
                {...formik.getFieldProps("title")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  formik.touched.title && formik.errors.title
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Campaign title"
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description *
              </label>
              <textarea
                id="description"
                {...formik.getFieldProps("description")}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  formik.touched.description && formik.errors.description
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Campaign description"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Type & Order */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type *
                </label>
                <select
                  id="type"
                  {...formik.getFieldProps("type")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="campaign">Campaign</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="order"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Display Order
                </label>
                <input
                  id="order"
                  type="number"
                  {...formik.getFieldProps("order")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Location & Address */}
            <div className="mb-4">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location *
              </label>
              <input
                id="location"
                type="text"
                {...formik.getFieldProps("location")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  formik.touched.location && formik.errors.location
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="City/Area"
              />
              {formik.touched.location && formik.errors.location && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.location}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Address *
              </label>
              <textarea
                id="address"
                {...formik.getFieldProps("address")}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  formik.touched.address && formik.errors.address
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Complete address"
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.address}
                </p>
              )}
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Date *
                </label>
                <input
                  id="startDate"
                  type="date"
                  {...formik.getFieldProps("startDate")}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formik.touched.startDate && formik.errors.startDate
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.startDate && formik.errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  {...formik.getFieldProps("endDate")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Conditional Link Field */}
            {formik.values.type === "campaign" && (
              <div className="mb-4">
                <label
                  htmlFor="donationLink"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Donation Link
                </label>
                <input
                  id="donationLink"
                  type="url"
                  {...formik.getFieldProps("donationLink")}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formik.touched.donationLink && formik.errors.donationLink
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="https://..."
                />
                {formik.touched.donationLink && formik.errors.donationLink && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.donationLink}
                  </p>
                )}
              </div>
            )}

            {formik.values.type === "event" && (
              <div className="mb-4">
                <label
                  htmlFor="eventLink"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Registration / Google Form Link
                </label>
                <input
                  id="eventLink"
                  type="url"
                  {...formik.getFieldProps("eventLink")}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                    formik.touched.eventLink && formik.errors.eventLink
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="https://forms.google.com/..."
                />
                {formik.touched.eventLink && formik.errors.eventLink && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.eventLink}
                  </p>
                )}
              </div>
            )}

            {/* Status & Active Selects */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status *
                </label>
                <select
                  id="status"
                  {...formik.getFieldProps("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="isActive"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Active Status *
                </label>
                <select
                  id="isActive"
                  {...formik.getFieldProps("isActive")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="yes">Active</option>
                  <option value="no">Inactive</option>
                </select>
              </div>
            </div>
          </form>

          {/* Footer Buttons */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
            <CustomButton
              type="button"
              onClick={handleCloseDrawer}
              className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              onClick={() => formik.handleSubmit()}
              disabled={isLoading || (!editingCampaign && !imagePreview)}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
              loading={isLoading}
            >
              {editingCampaign ? "Update" : "Create"}
            </CustomButton>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
