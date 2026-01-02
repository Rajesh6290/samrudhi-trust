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
  joiningDate: Yup.date().required("Joining date is required"),
  receivedIdCard: Yup.boolean().required(
    "Please select if you received ID card"
  ),
  receivedTshirt: Yup.boolean().required(
    "Please select if you received T-shirt"
  ),
});

export default function MemberRegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      photo: null as File | null,
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
        formData.append("joiningDate", values.joiningDate);
        formData.append(
          "receivedIdCard",
          String(values.receivedIdCard === "true")
        );
        formData.append(
          "receivedTshirt",
          String(values.receivedTshirt === "true")
        );
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Member Registration
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Join Samriddhi Seva Trust and make a difference
            </p>
          </div>

          <form
            onSubmit={formik.handleSubmit}
            className="space-y-4 sm:space-y-6"
          >
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg text-gray-900 border ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-400 focus:ring-indigo-500"
                } focus:ring-2 focus:border-transparent transition`}
                placeholder="Enter your full name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg text-gray-900 border ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-400 focus:ring-indigo-500"
                } focus:ring-2 focus:border-transparent transition`}
                placeholder="your.email@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Phone Field (Optional) */}
            <div>
              <label
                htmlFor="phone"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
              >
                Phone Number <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg text-gray-900 border ${
                  formik.touched.phone && formik.errors.phone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-400 focus:ring-indigo-500"
                } focus:ring-2 focus:border-transparent transition`}
                placeholder="10 digit phone number"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            {/* Photo File Upload */}
            <div>
              <label
                htmlFor="photo"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
              >
                Photo <span className="text-red-500">*</span>
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file size (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      alert("File size must be less than 5MB");
                      return;
                    }
                    setPhotoFile(file);
                    formik.setFieldValue("photo", file);
                    // Create preview
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
                <div className="mt-2 sm:mt-3 relative w-24 h-24 sm:w-32 sm:h-32">
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}
              {formik.touched.photo && formik.errors.photo && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600">
                  {formik.errors.photo as string}
                </p>
              )}
              <p className="mt-1.5 sm:mt-2 text-xs text-gray-500">
                Accepted formats: JPEG, PNG, WebP (Max 5MB)
              </p>
            </div>

            {/* Joining Date Field */}
            <div>
              <label
                htmlFor="joiningDate"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
              >
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                id="joiningDate"
                name="joiningDate"
                type="date"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.joiningDate}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg text-gray-900 border ${
                  formik.touched.joiningDate && formik.errors.joiningDate
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-400 focus:ring-indigo-500"
                } focus:ring-2 focus:border-transparent transition`}
              />
              {formik.touched.joiningDate && formik.errors.joiningDate && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600">
                  {formik.errors.joiningDate}
                </p>
              )}
            </div>

            {/* Materials Received Section */}
            <div className="space-y-4 sm:space-y-5">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-3">
                Materials Received
              </p>

              {/* Received ID Card Select */}
              <div>
                <label
                  htmlFor="receivedIdCard"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Received ID Card <span className="text-red-500">*</span>
                </label>
                <select
                  id="receivedIdCard"
                  name="receivedIdCard"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={String(formik.values.receivedIdCard)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg text-gray-900 border ${
                    formik.touched.receivedIdCard &&
                    formik.errors.receivedIdCard
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-400 focus:ring-indigo-500"
                  } focus:ring-2 focus:border-transparent transition bg-white`}
                >
                  <option value="">Select an option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                {formik.touched.receivedIdCard &&
                  formik.errors.receivedIdCard && (
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600">
                      {formik.errors.receivedIdCard as string}
                    </p>
                  )}
              </div>

              {/* Received T-Shirt Select */}
              <div>
                <label
                  htmlFor="receivedTshirt"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                >
                  Received T-Shirt <span className="text-red-500">*</span>
                </label>
                <select
                  id="receivedTshirt"
                  name="receivedTshirt"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={String(formik.values.receivedTshirt)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg text-gray-900 border ${
                    formik.touched.receivedTshirt &&
                    formik.errors.receivedTshirt
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-400 focus:ring-indigo-500"
                  } focus:ring-2 focus:border-transparent transition bg-white`}
                >
                  <option value="">Select an option</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                {formik.touched.receivedTshirt &&
                  formik.errors.receivedTshirt && (
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-600">
                      {formik.errors.receivedTshirt as string}
                    </p>
                  )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-white text-sm sm:text-base font-medium transition-all ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 active:scale-95"
              }`}
            >
              {isSubmitting ? "Registering..." : "Register as Member"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
