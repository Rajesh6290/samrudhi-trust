import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Drawer, IconButton } from "@mui/material";
import { X, Upload, User } from "lucide-react";
import Image from "next/image";
import CustomButton from "@/common/CustomButton";
import useMutation from "@/features/hooks/useMutation";
import Swal from "sweetalert2";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  bloodGroup: string;
  joiningDate: string;
  role: string;
  bio?: string;
  receivedIdCard: boolean;
  receivedTshirt: boolean;
  isActive: boolean;
}

interface MemberFormValues {
  name: string;
  email: string;
  phone: string;
  photo: File | null;
  bloodGroup: string;
  joiningDate: string;
  role: string;
  bio: string;
  receivedIdCard: string;
  receivedTshirt: string;
  isActive: string;
}

const AddNewMember = ({
  open,
  onClose,
  mutate,
  editingMember,
}: {
  open: boolean;
  onClose: () => void;
  mutate: () => void;
  editingMember?: Member | null;
}) => {
  const [imagePreview, setImagePreview] = useState<string>("");
  const { isLoading, mutation } = useMutation();
  const isEditMode = !!editingMember;
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    bloodGroup: Yup.string().required("Blood group is required"),
    joiningDate: Yup.date().required("Joining date is required"),
    role: Yup.string().required("Role/Designation is required"),
    bio: Yup.string(),
    receivedIdCard: Yup.string().required("ID Card status is required"),
    receivedTshirt: Yup.string().required("T-shirt status is required"),
    isActive: Yup.string().required("Active status is required"),
  });

  const formik = useFormik<MemberFormValues>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      photo: null,
      bloodGroup: "",
      joiningDate: new Date().toISOString().split("T")[0],
      role: "Member",
      bio: "",
      receivedIdCard: "",
      receivedTshirt: "",
      isActive: "yes",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditMode && editingMember) {
          // PUT request for update
          const formdata = new FormData();
          formdata.append("name", values.name);
          formdata.append("email", values.email);
          formdata.append("phone", values.phone);
          if (values.photo) {
            formdata.append("photo", values.photo);
          }
          formdata.append("bloodGroup", values.bloodGroup);
          formdata.append("joiningDate", values.joiningDate);
          formdata.append("role", values.role);
          formdata.append("bio", values.bio);
          formdata.append("receivedIdCard", values.receivedIdCard);
          formdata.append("receivedTshirt", values.receivedTshirt);
          formdata.append("isActive", values.isActive);

          const res = await mutation(`members/${editingMember._id}`, {
            method: "PUT",
            body: formdata,
            isFormData: true,
            isAlert: false,
          });

          if (res?.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Member updated successfully!",
              timer: 2000,
              showConfirmButton: true,
              customClass: {
                container: "swal-z-index",
              },
            });
            formik.resetForm();
            setImagePreview("");
            mutate();
            onClose();
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",

              text:
                res?.results?.error ||
                res?.results?.message ||
                "Failed to update member",
              customClass: {
                container: "swal-z-index",
              },
            });
          }
        } else {
          // POST request for create
          const formdata = new FormData();
          formdata.append("name", values.name);
          formdata.append("email", values.email);
          formdata.append("phone", values.phone);
          if (values.photo) {
            formdata.append("photo", values.photo);
          }
          formdata.append("bloodGroup", values.bloodGroup);
          formdata.append("joiningDate", values.joiningDate);
          formdata.append("role", values.role);
          formdata.append("bio", values.bio);
          formdata.append("receivedIdCard", values.receivedIdCard);
          formdata.append("receivedTshirt", values.receivedTshirt);
          formdata.append("isActive", values.isActive);
          const res = await mutation("members", {
            method: "POST",
            body: formdata,
            isFormData: true,
            isAlert: false,
          });
          if (res?.status === 201 || res?.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Member added successfully!",
              timer: 2000,
              showConfirmButton: true,
              customClass: {
                container: "swal-z-index",
              },
            });
            formik.resetForm();
            setImagePreview("");
            mutate();
            onClose();
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                res?.results?.error ||
                res?.results?.message ||
                "Something went wrong",
              customClass: {
                container: "swal-z-index",
              },
            });
          }
        }
      } catch (error: unknown) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Something went wrong",
          customClass: {
            container: "swal-z-index",
          },
        });
      }
    },
  });

  // Load editing member data
  useEffect(() => {
    if (editingMember && open) {
      formik.setValues({
        name: editingMember.name || "",
        email: editingMember.email || "",
        phone: editingMember.phone || "",
        photo: null,
        bloodGroup: editingMember.bloodGroup || "",
        joiningDate: editingMember.joiningDate
          ? new Date(editingMember.joiningDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        role: editingMember.role || "Member",
        bio: editingMember.bio || "",
        receivedIdCard: editingMember.receivedIdCard ? "yes" : "no",
        receivedTshirt: editingMember.receivedTshirt ? "yes" : "no",
        isActive: editingMember.isActive ? "yes" : "no",
      });
      setImagePreview(editingMember.photo || "");
    } else if (!open) {
      // Reset form when drawer closes
      formik.resetForm();
      setImagePreview("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMember, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set the File object for form submission
      formik.setFieldValue("photo", file);

      // Create preview URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 500 },
          maxWidth: "100%",
        },
      }}
    >
      <div className="h-full flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit Member" : "Add New Member"}
          </h2>
          <IconButton onClick={onClose} size="small">
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo *
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name *
            </label>
            <input
              id="name"
              type="text"
              {...formik.getFieldProps("name")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                formik.touched.name && formik.errors.name
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter member name"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              id="email"
              type="email"
              {...formik.getFieldProps("email")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="member@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone *
            </label>
            <input
              id="phone"
              type="tel"
              {...formik.getFieldProps("phone")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                formik.touched.phone && formik.errors.phone
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.phone}</p>
            )}
          </div>

          {/* Blood Group */}
          <div className="mb-4">
            <label
              htmlFor="bloodGroup"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Blood Group *
            </label>
            <select
              id="bloodGroup"
              {...formik.getFieldProps("bloodGroup")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                formik.touched.bloodGroup && formik.errors.bloodGroup
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select blood group</option>
              {bloodGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            {formik.touched.bloodGroup && formik.errors.bloodGroup && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.bloodGroup}
              </p>
            )}
          </div>

          {/* Joining Date */}
          <div className="mb-4">
            <label
              htmlFor="joiningDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Joining Date *
            </label>
            <input
              id="joiningDate"
              type="date"
              {...formik.getFieldProps("joiningDate")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {formik.touched.joiningDate && formik.errors.joiningDate && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.joiningDate}
              </p>
            )}
          </div>

          {/* Role/Designation */}
          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role/Designation *
            </label>
            <select
              id="role"
              {...formik.getFieldProps("role")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                formik.touched.role && formik.errors.role
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="Member">Member</option>
              <option value="Founder">Founder</option>
              <option value="Chairman">Chairman</option>
              <option value="President">President</option>
              <option value="Vice President">Vice President</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Program Head">Program Head</option>
              <option value="Social Media Manager">Social Media Manager</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Volunteer Coordinator">
                Volunteer Coordinator
              </option>
            </select>
            {formik.touched.role && formik.errors.role && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.role}</p>
            )}
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              {...formik.getFieldProps("bio")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Brief bio about the member..."
            />
          </div>

          {/* Received ID Card */}
          <div className="mb-4">
            <label
              htmlFor="receivedIdCard"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Received ID Card *
            </label>
            <select
              id="receivedIdCard"
              {...formik.getFieldProps("receivedIdCard")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                formik.touched.receivedIdCard && formik.errors.receivedIdCard
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select status</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {formik.touched.receivedIdCard && formik.errors.receivedIdCard && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.receivedIdCard}
              </p>
            )}
          </div>

          {/* Received T-shirt */}
          <div className="mb-4">
            <label
              htmlFor="receivedTshirt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Received T-shirt *
            </label>
            <select
              id="receivedTshirt"
              {...formik.getFieldProps("receivedTshirt")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                formik.touched.receivedTshirt && formik.errors.receivedTshirt
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select status</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {formik.touched.receivedTshirt && formik.errors.receivedTshirt && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.receivedTshirt}
              </p>
            )}
          </div>

          {/* Active Member */}
          <div className="mb-4">
            <label
              htmlFor="isActive"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Active Member *
            </label>
            <select
              id="isActive"
              {...formik.getFieldProps("isActive")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                formik.touched.isActive && formik.errors.isActive
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select status</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {formik.touched.isActive && formik.errors.isActive && (
              <p className="text-red-500 text-xs mt-1">
                {formik.errors.isActive}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <CustomButton
            type="button"
            onClick={() => formik.handleSubmit()}
            loading={isLoading}
            loadingText={isEditMode ? "Updating..." : "Adding..."}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isEditMode ? "Update Member" : "Add Member"}
          </CustomButton>
        </div>
      </div>
    </Drawer>
  );
};

export default AddNewMember;
