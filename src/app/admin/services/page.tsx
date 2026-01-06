"use client";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import useSwr from "@/features/hooks/useSwr";
import useMutation from "@/features/hooks/useMutation";

interface Service {
  _id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

const iconOptions = [
  "Utensils",
  "Gift",
  "Zap",
  "Droplet",
  "GraduationCap",
  "Globe",
  "Heart",
  "Users",
  "Home",
  "Shield",
];

export default function ServicesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    icon: "",
    title: "",
    description: "",
    order: 0,
    isActive: true,
  });

  const { data: servicesData, isLoading: loading, mutate } = useSwr("services");
  const services: Service[] = servicesData?.services || [];
  const { mutation } = useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const path = editingService ? `services/${editingService._id}` : "services";
    const method = editingService ? "PUT" : "POST";

    const response = await mutation(path, {
      method,
      body: formData,
      isAlert: true,
    });

    if (response?.status === 200 || response?.status === 201) {
      mutate();
      handleCloseModal();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    const response = await mutation(`services/${id}`, {
      method: "DELETE",
      isAlert: true,
    });

    if (response?.status === 200) {
      mutate();
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      icon: service.icon,
      title: service.title,
      description: service.description,
      order: service.order,
      isActive: service.isActive,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      icon: "",
      title: "",
      description: "",
      order: 0,
      isActive: true,
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900">
          Services Management
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors font-bold"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{service.icon}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      service.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                {service.title}
              </h3>
              <p className="text-slate-600 text-sm mb-3">
                {service.description}
              </p>
              <p className="text-xs text-slate-400 font-bold">
                Order: {service.order}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-black text-slate-900">
                {editingService ? "Edit Service" : "Add Service"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-900 font-black text-sm uppercase tracking-wider mb-3">
                  Icon *
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                >
                  <option value="">Select Icon</option>
                  {iconOptions.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-900 font-black text-sm uppercase tracking-wider mb-3">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-900 font-black text-sm uppercase tracking-wider mb-3">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-900 font-black text-sm uppercase tracking-wider mb-3">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-black text-sm uppercase tracking-wider mb-3">
                    Status
                  </label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold"
                >
                  {editingService ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
