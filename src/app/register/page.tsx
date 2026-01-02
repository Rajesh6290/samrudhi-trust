"use client";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import Swal from "sweetalert2";

const memberRegistrationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phone: Yup.string()
    .optional()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits"),
  photo: Yup.mixed().required("Photo is required"),
  bloodGroup: Yup.string()
    .required("Blood group is required")
    .oneOf(
      ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      "Please select a valid blood group"
    ),
  joiningDate: Yup.date().required("Joining date is required"),
  receivedIdCard: Yup.string()
    .required("Please select if you received ID card")
    .oneOf(["true", "false"], "Please select an option"),
  receivedTshirt: Yup.string()
    .required("Please select if you received T-shirt")
    .oneOf(["true", "false"], "Please select an option"),
});

export default function MemberRegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      photo: null as File | null,
      bloodGroup: "",
      joiningDate: new Date().toISOString().split("T")[0],
      receivedIdCard: "",
      receivedTshirt: "",
    },
    validationSchema: memberRegistrationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true);
      try {
        // Validate photo is uploaded
        if (!photoFile) {
          formik.setFieldError("photo", "Photo is required");
          formik.setFieldTouched("photo", true);
          setIsSubmitting(false);
          return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        if (values.phone) formData.append("phone", values.phone);
        formData.append("bloodGroup", values.bloodGroup);
        formData.append("joiningDate", values.joiningDate);
        formData.append("receivedIdCard", values.receivedIdCard);
        formData.append("receivedTshirt", values.receivedTshirt);
        formData.append("photo", photoFile);

        const response = await fetch("/api/members/register", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to register member");
        }

        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "You have been registered as a member successfully.",
        });

        resetForm();
        setPhotoFile(null);
        setPhotoPreview("");
      } catch (error: unknown) {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text:
            error instanceof Error
              ? error.message
              : "Failed to register. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-6 sm:py-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Member Registration
            </h1>
            <p className="text-sm sm:text-base text-indigo-100">
              Join Samriddhi Seva Trust and make a difference
            </p>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6"
          >
            {/* Name Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:border-transparent transition"
                placeholder="Enter your full name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:border-transparent transition"
                placeholder="your.email@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Phone Field (Optional) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:border-transparent transition"
                placeholder="9876543210"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            {/* Blood Group Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Blood Group *
              </label>
              <select
                name="bloodGroup"
                value={formik.values.bloodGroup}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:border-transparent transition"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {formik.touched.bloodGroup && formik.errors.bloodGroup && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {formik.errors.bloodGroup}
                </p>
              )}
            </div>

            {/* Photo File Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Photo *
              </label>
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert("File size must be less than 5MB");
                      return;
                    }
                    setPhotoFile(file);
                    formik.setFieldValue("photo", file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPhotoPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                onBlur={formik.handleBlur}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:border-transparent transition file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-md file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer"
              />
              {photoPreview && (
                <div className="mt-3 sm:mt-4">
                  <Image
                    src={photoPreview}
                    alt="Photo preview"
                    width={150}
                    height={150}
                    className="rounded-lg object-cover border-2 border-indigo-200"
                  />
                </div>
              )}
              {formik.touched.photo && formik.errors.photo && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {formik.errors.photo as string}
                </p>
              )}
              <p className="mt-1.5 sm:mt-2 text-xs text-gray-500">
                Accepted formats: JPEG, PNG, WebP (Max 5MB)
              </p>
            </div>

            {/* Joining Date Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Joining Date *
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formik.values.joiningDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:border-transparent transition"
              />
              {formik.touched.joiningDate && formik.errors.joiningDate && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">
                  {formik.errors.joiningDate}
                </p>
              )}
            </div>

            {/* Materials Received Section */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-4 sm:space-y-5">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                Materials Received
              </h3>

              {/* Received ID Card Select */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Received ID Card *
                </label>
                <select
                  name="receivedIdCard"
                  value={formik.values.receivedIdCard}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:border-transparent transition"
                >
                  <option value="">Select an option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                {formik.touched.receivedIdCard &&
                  formik.errors.receivedIdCard && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                      {formik.errors.receivedIdCard as string}
                    </p>
                  )}
              </div>

              {/* Received T-Shirt Select */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Received T-Shirt *
                </label>
                <select
                  name="receivedTshirt"
                  value={formik.values.receivedTshirt}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-lg border border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:border-transparent transition"
                >
                  <option value="">Select an option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                {formik.touched.receivedTshirt &&
                  formik.errors.receivedTshirt && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                      {formik.errors.receivedTshirt as string}
                    </p>
                  )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? "Registering..." : "Register as Member"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
