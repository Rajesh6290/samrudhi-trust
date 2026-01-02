"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Edit,
  Mail,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  photo: string;
  bloodGroup: string;
  joiningDate: string;
  role?: string;
  bio?: string;
  isActive: boolean;
}

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    photo: "",
    bloodGroup: "",
    role: "Member",
    bio: "",
    joiningDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/members?search=${searchQuery}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setFormData((prev) => ({ ...prev, photo: data.url }));
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
      const url = editingMember
        ? `/api/members/${editingMember._id}`
        : "/api/members";
      const method = editingMember ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingMember(null);
        resetForm();
        fetchMembers();
      }
    } catch (error) {
      console.error("Failed to save member:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      photo: member.photo,
      bloodGroup: member.bloodGroup,
      role: member.role || "Member",
      bio: member.bio || "",
      joiningDate: new Date(member.joiningDate).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      photo: "",
      bloodGroup: "",
      role: "Member",
      bio: "",
      joiningDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMember(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Members
          </h1>
          <p className="text-slate-600 font-medium mt-2">
            Manage your organization members
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search members by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && fetchMembers()}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
        />
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse"
            >
              <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4" />
              <div className="h-6 bg-slate-200 rounded mb-2" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-12 text-center border border-slate-200"
        >
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-2">
            No Members Found
          </h3>
          <p className="text-slate-600 font-medium mb-6">
            Start by adding your first team member
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:scale-105 transition-all"
          >
            Add Member
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:-translate-y-1"
            >
              {/* Photo */}
              <div className="relative h-48 bg-linear-to-br from-orange-500 to-amber-500">
                <Image
                  src={member.photo || "/logo.svg"}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-slate-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 bg-red-500/90 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-1">
                    {member.name}
                  </h3>
                  <p className="text-orange-500 font-bold text-sm uppercase tracking-wider">
                    {member.role || "Member"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-600 font-medium truncate">
                      {member.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-600 font-medium">
                      Joined{" "}
                      {new Date(member.joiningDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-slate-600 text-sm font-medium leading-relaxed line-clamp-2">
                    {member.bio}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-orange-500 to-amber-500 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                {editingMember ? "Edit Member" : "Add New Member"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Photo Upload */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  {formData.photo ? (
                    <Image
                      src={formData.photo}
                      alt="Preview"
                      fill
                      className="rounded-full object-cover border-4 border-orange-500"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-300">
                      <User className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors font-bold text-sm uppercase tracking-wider">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
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

              {/* Email */}
              <div>
                <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                  placeholder="+1 234 567 8900"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                  Blood Group *
                </label>
                <select
                  required
                  value={formData.bloodGroup}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodGroup: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
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
              </div>

              {/* Role */}
              <div>
                <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                  placeholder="Team Member"
                />
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) =>
                    setFormData({ ...formData, joiningDate: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium resize-none"
                  placeholder="Brief description about the member..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-sm uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  {editingMember ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;
