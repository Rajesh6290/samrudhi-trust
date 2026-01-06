"use client";
import { Trash2, Eye, Plus } from "lucide-react";
import { useState } from "react";
import { Drawer } from "@mui/material";
import useSwr from "@/features/hooks/useSwr";
import useMutation from "@/features/hooks/useMutation";

interface Volunteer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  interests: string[];
  availability: string;
  whyVolunteer?: string;
  status: string;
  createdAt: string;
}

export default function VolunteersAdminPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewVolunteer, setViewVolunteer] = useState<Volunteer | null>(null);

  const {
    data: volunteersData,
    isLoading: loading,
    mutate,
  } = useSwr("volunteers");
  const volunteers: Volunteer[] = volunteersData?.volunteers || [];
  const { mutation } = useMutation();

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const response = await mutation(`volunteers/${id}`, {
      method: "PUT",
      body: { status: newStatus },
      isAlert: true,
    });

    if (response?.status === 200) {
      mutate();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this volunteer?")) return;

    const response = await mutation(`volunteers/${id}`, {
      method: "DELETE",
      isAlert: true,
    });

    if (response?.status === 200) {
      mutate();
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Volunteers</h1>
        <div className="text-sm text-gray-600">
          Total Applications: {volunteers.length}
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Applied On
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {volunteers.map((volunteer) => (
                <tr key={volunteer._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {volunteer.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {volunteer.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {volunteer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {volunteer.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={volunteer.status}
                      onChange={(e) =>
                        handleStatusUpdate(volunteer._id, e.target.value)
                      }
                      className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                        volunteer.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : volunteer.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : volunteer.status === "active"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="active">Active</option>
                      <option value="rejected">Rejected</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(volunteer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setViewVolunteer(volunteer);
                        setDrawerOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(volunteer._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MUI Drawer for Volunteer Details */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewVolunteer(null);
        }}
        PaperProps={{
          sx: { width: { xs: "100%", sm: "500px", md: "600px" } },
        }}
      >
        {viewVolunteer && (
          <div className="h-full flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-emerald-600 to-emerald-700">
              <h2 className="text-2xl font-bold text-white">
                Volunteer Details
              </h2>
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setViewVolunteer(null);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <label className="block text-sm font-semibold text-gray-500 mb-2">
                  Full Name
                </label>
                <p className="text-xl font-bold text-gray-900">
                  {viewVolunteer.name}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-5 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-500 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900">{viewVolunteer.email}</p>
                </div>
                <div className="bg-white rounded-lg p-5 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-500 mb-2">
                    Phone
                  </label>
                  <p className="text-gray-900">{viewVolunteer.phone}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm">
                <label className="block text-sm font-semibold text-gray-500 mb-2">
                  City
                </label>
                <p className="text-gray-900">{viewVolunteer.city}</p>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm">
                <label className="block text-sm font-semibold text-gray-500 mb-3">
                  Areas of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {viewVolunteer.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm">
                <label className="block text-sm font-semibold text-gray-500 mb-2">
                  Availability
                </label>
                <p className="text-gray-900 capitalize">
                  {viewVolunteer.availability}
                </p>
              </div>

              {viewVolunteer.whyVolunteer && (
                <div className="bg-white rounded-lg p-5 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-500 mb-2">
                    Why Volunteer?
                  </label>
                  <p className="text-gray-700 leading-relaxed">
                    {viewVolunteer.whyVolunteer}
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg p-5 shadow-sm">
                <label className="block text-sm font-semibold text-gray-500 mb-2">
                  Application Date
                </label>
                <p className="text-gray-900">
                  {new Date(viewVolunteer.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-200 bg-white">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setViewVolunteer(null);
                }}
                className="w-full px-6 py-3 bg-linear-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
