"use client";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Drawer from "@mui/material/Drawer";
import useSwr from "@/features/hooks/useSwr";
import useMutation from "@/features/hooks/useMutation";

interface Stat {
  _id: string;
  title: string;
  value: number;
  suffix: string;
  order: number;
  isActive: boolean;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  value: Yup.number()
    .required("Value is required")
    .min(0, "Value must be positive")
    .integer("Value must be an integer"),
  suffix: Yup.string().max(10, "Suffix must be less than 10 characters"),
  order: Yup.number()
    .required("Order is required")
    .min(0, "Order must be positive")
    .integer("Order must be an integer"),
  isActive: Yup.boolean().required(),
});
const services = [
  {
    title: "Food Distribution for Poor and Needy People",
    subtitle: "Food for the Needy",
  },
  {
    title: "Food Service in Hospitals",
    subtitle: "Hospital Food Care",
  },
  {
    title: "Food Distribution in Orphanages",
    subtitle: "Orphanage Meal Support",
  },
  {
    title:
      "Emergency Food Support During Natural Disasters and Critical Situations",
    subtitle: "Disaster Food Relief",
  },
  {
    title: "Blood Donation During Emergencies",
    subtitle: "Emergency Blood Support",
  },
  {
    title: "Distribution of Clothes and Essential Items to the Poor",
    subtitle: "Clothes & Essentials Aid",
  },
  {
    title: "Helping Helpless and Homeless People with Food and Basic Needs",
    subtitle: "Homeless Care Support",
  },
  {
    title: "Support to Elderly People Who Have No Family Support",
    subtitle: "Elderly Care Support",
  },
  {
    title: "Assistance to Economically Weak Families",
    subtitle: "Family Financial Aid",
  },
  {
    title: "Awareness Programs for Social Welfare",
    subtitle: "Social Awareness Drives",
  },
  {
    title: "Helping People During Accidents and Medical Emergencies",
    subtitle: "Emergency Help Services",
  },
  {
    title: "Other Humanitarian and Social Service Activities",
    subtitle: "Humanitarian Services",
  },
];

export default function StatsPage() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [initialValues, setInitialValues] = useState({
    title: "",
    value: 0,
    suffix: "",
    order: 0,
    isActive: true,
  });

  const { data: statsData, isLoading: loading, mutate } = useSwr("stats");
  const stats: Stat[] = statsData?.stats || [];
  const { mutation } = useMutation();

  const handleSubmit = async (
    values: any,
    { setSubmitting, resetForm }: any
  ) => {
    const refTitle =
      services.find((s) => s.subtitle === values.title)?.title || values.title;
    const path = editingStat ? `stats/${editingStat._id}` : "stats";
    const method = editingStat ? "PUT" : "POST";

    const response = await mutation(path, {
      method,
      body: { ...values, ref: refTitle },
      isAlert: true,
    });

    if (response?.status === 200 || response?.status === 201) {
      mutate();
      handleCloseDrawer();
      resetForm();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stat?")) return;

    const response = await mutation(`stats/${id}`, {
      method: "DELETE",
      isAlert: true,
    });

    if (response?.status === 200) {
      mutate();
    }
  };

  const handleEdit = (stat: Stat) => {
    setEditingStat(stat);
    setInitialValues({
      title: stat.title,
      value: stat.value,
      suffix: stat.suffix,
      order: stat.order,
      isActive: stat.isActive,
    });
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditingStat(null);
    setInitialValues({
      title: "",
      value: 0,
      suffix: "",
      order: 0,
      isActive: true,
    });
  };

  const handleAddNew = () => {
    setEditingStat(null);
    setInitialValues({
      title: "",
      value: 0,
      suffix: "",
      order: 0,
      isActive: true,
    });
    setShowDrawer(true);
  };

  return (
    <div className="w-full h-fit">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900">
          Statistics Management
        </h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-bold"
        >
          <Plus size={20} />
          Add Stat
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat._id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    stat.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {stat.isActive ? "Active" : "Inactive"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(stat)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(stat._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-3xl font-black text-orange-600 mb-2">
                {stat.value.toLocaleString()}
                {stat.suffix}
              </h3>
              <p className="text-slate-700 text-sm font-bold mb-2">
                {stat.title}
              </p>
              <p className="text-xs text-slate-400 font-bold">
                Order: {stat.order}
              </p>
            </div>
          ))}
        </div>
      )}

      <Drawer anchor="right" open={showDrawer} onClose={handleCloseDrawer}>
        <div className="w-screen max-w-md h-full flex flex-col bg-white">
          <div className="px-6 py-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">
                {editingStat ? "Edit Stat" : "Add Stat"}
              </h2>
              <button
                onClick={handleCloseDrawer}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <Formik
              key={editingStat?._id || "new"}
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-bold text-slate-700 mb-2"
                    >
                      Title
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      placeholder="e.g., People Fed Daily"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white ${
                        errors.title && touched.title
                          ? "border-red-500"
                          : "border-slate-200"
                      }`}
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="value"
                        className="block text-sm font-bold text-slate-700 mb-2"
                      >
                        Value
                      </label>
                      <Field
                        id="value"
                        name="value"
                        type="number"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white ${
                          errors.value && touched.value
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                      <ErrorMessage
                        name="value"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="suffix"
                        className="block text-sm font-bold text-slate-700 mb-2"
                      >
                        Suffix
                      </label>
                      <Field
                        id="suffix"
                        name="suffix"
                        type="text"
                        placeholder="e.g., +"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white ${
                          errors.suffix && touched.suffix
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                      <ErrorMessage
                        name="suffix"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="order"
                        className="block text-sm font-bold text-slate-700 mb-2"
                      >
                        Order
                      </label>
                      <Field
                        id="order"
                        name="order"
                        type="number"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white ${
                          errors.order && touched.order
                            ? "border-red-500"
                            : "border-slate-200"
                        }`}
                      />
                      <ErrorMessage
                        name="order"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="isActive"
                        className="block text-sm font-bold text-slate-700 mb-2"
                      >
                        Status
                      </label>
                      <Field
                        as="select"
                        id="isActive"
                        name="isActive"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </Field>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseDrawer}
                      className="flex-1 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : editingStat
                          ? "Update"
                          : "Create"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
