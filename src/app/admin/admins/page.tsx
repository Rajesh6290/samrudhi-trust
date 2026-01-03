"use client";

import { useAuth } from "@/features/hooks/useAuth";
import useMutation from "@/features/hooks/useMutation";
import useSwr from "@/features/hooks/useSwr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Shield,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  Mail,
  User,
  Phone,
  Lock,
  CheckCircle2,
  Trash2,
  Edit,
} from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Admin {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  memberId?: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "dashboard", label: "Dashboard", icon: "BarChart3" },
  { id: "members", label: "Members", icon: "Users" },
  { id: "services", label: "Services", icon: "Briefcase" },
  { id: "campaigns", label: "Campaigns", icon: "Megaphone" },
  { id: "volunteers", label: "Volunteers", icon: "UserPlus" },
  { id: "blogs", label: "Blogs", icon: "FileText" },
  { id: "stats", label: "Statistics", icon: "LineChart" },
  { id: "testimonials", label: "Testimonials", icon: "Star" },
  { id: "gallery", label: "Gallery", icon: "Image" },
  { id: "certificates", label: "Certificates", icon: "Award" },
  { id: "content", label: "Content", icon: "Globe" },
  { id: "feedback", label: "Feedback", icon: "MessageSquare" },
  { id: "contact", label: "Contact", icon: "Mail" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

export default function SubAdminsPage() {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creationMode, setCreationMode] = useState<"new" | "member">("new");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "subadmin",
    permissions: [] as string[],
    memberId: "",
  });

  const { data: adminsData, mutate: refetchAdmins } = useSwr("admin/users");
  const { data: membersData } = useSwr("members?all=true");

  const { mutation: createAdmin, isLoading: isCreating } = useMutation();
  const { mutation: updateAdmin, isLoading: isUpdating } = useMutation();
  const { mutation: deleteAdmin } = useMutation();

  const admins = adminsData?.users || [];
  const members = membersData?.members || [];

  const filteredAdmins = admins.filter(
    (admin: Admin) =>
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
    setFormData((prev) => ({
      ...prev,
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      memberId: member._id,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email) {
      Swal.fire({
        title: "Error",
        text: "Name and email are required",
        icon: "error",
      });
      return;
    }

    if (creationMode === "new" && !formData.password) {
      Swal.fire({
        title: "Error",
        text: "Password is required for new admin",
        icon: "error",
      });
      return;
    }

    if (formData.permissions.length === 0) {
      Swal.fire({
        title: "Error",
        text: "Please select at least one permission",
        icon: "error",
      });
      return;
    }

    try {
      const result = editingAdmin
        ? await updateAdmin("admin/users", {
            method: "PUT",
            body: { ...formData, id: editingAdmin._id },
          })
        : await createAdmin("admin/users", {
            method: "POST",
            body: formData,
          });

      if (result?.results?.success) {
        Swal.fire({
          title: "Success",
          text: editingAdmin
            ? "Admin updated successfully"
            : "Admin created successfully",
          icon: "success",
          timer: 2000,
        });
        setIsDrawerOpen(false);
        resetForm();
        refetchAdmins();
      } else {
        throw new Error(result?.results?.error || "Operation failed");
      }
    } catch (error: unknown) {
      Swal.fire({
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to save admin",
        icon: "error",
      });
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || "",
      password: "",
      role: admin.role,
      permissions: admin.permissions || [],
      memberId: admin.memberId || "",
    });
    if (admin.memberId) {
      setCreationMode("member");
      const member = members.find((m: Member) => m._id === admin.memberId);
      setSelectedMember(member || null);
    }
    setIsDrawerOpen(true);
  };

  const handleDelete = async (adminId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the admin account",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteAdmin("admin/users", {
          method: "DELETE",
          body: { id: adminId },
        });
        if (deleteResult?.results?.success) {
          Swal.fire("Deleted!", "Admin has been deleted.", "success");
          refetchAdmins();
        }
      } catch (_error) {
        Swal.fire("Error", "Failed to delete admin", "error");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "subadmin",
      permissions: [],
      memberId: "",
    });
    setSelectedMember(null);
    setEditingAdmin(null);
    setCreationMode("new");
  };

  const openDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  // Check if user has permission to manage admins
  if (user?.role !== "superadmin" && user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600">
            You don&apos;t have permission to manage admins
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-fit">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
              Admin <span className="text-orange-500">Management</span>
            </h1>
            <p className="text-slate-600 mt-2">
              Manage administrators and their permissions
            </p>
          </div>

          <button
            onClick={openDrawer}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Admin
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Admins Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins?.map((admin: Admin) => (
            <motion.div
              key={admin._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                    {admin.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{admin.name}</h3>
                    <p className="text-sm text-slate-600">{admin.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  {admin.role === "superadmin" ? (
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                  ) : admin.role === "admin" ? (
                    <Shield className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Shield className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="text-sm font-semibold text-slate-700 capitalize">
                    {admin.role}
                  </span>
                </div>
                {admin.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {admin.phone}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  PERMISSIONS ({admin.permissions?.length || 0})
                </p>
                <div className="flex flex-wrap gap-1">
                  {admin.permissions && admin.permissions.length > 0 ? (
                    <>
                      {admin.permissions.slice(0, 3).map((perm: string) => (
                        <span
                          key={perm}
                          className="px-2 py-1 capitalize bg-orange-100 text-orange-700 rounded text-xs font-medium"
                        >
                          {perm}
                        </span>
                      ))}
                      {admin.permissions.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                          +{admin.permissions.length - 3}
                        </span>
                      )}
                    </>
                  ) : admin.role === "superadmin" ? (
                    <span className="text-xs text-purple-600 font-medium">
                      All Permissions (Superadmin)
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">
                      No permissions assigned - Please edit to assign
                    </span>
                  )}
                </div>
              </div>

              {admin.role !== "superadmin" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(admin)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(admin._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {filteredAdmins.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No admins found</p>
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full md:w-150 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingAdmin ? "Edit Admin" : "Add New Admin"}
                  </h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Creation Mode Selection */}
                  {!editingAdmin && (
                    <div className="flex gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => {
                          setCreationMode("new");
                          resetForm();
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                          creationMode === "new"
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        Create New
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCreationMode("member");
                          setFormData((prev) => ({ ...prev, password: "" }));
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                          creationMode === "member"
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        From Member
                      </button>
                    </div>
                  )}

                  {/* Member Selection */}
                  {creationMode === "member" && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Select Member
                        </label>
                        <select
                          value={selectedMember?._id || ""}
                          onChange={(e) => {
                            const member = members.find(
                              (m: Member) => m._id === e.target.value
                            );
                            if (member) handleMemberSelect(member);
                          }}
                          className="w-full px-4 py-3 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          disabled={!!editingAdmin?.memberId}
                        >
                          <option value="">Choose a member...</option>
                          {members.map((member: Member) => (
                            <option key={member._id} value={member._id}>
                              {member.name} - {member.email}
                            </option>
                          ))}
                        </select>
                        {selectedMember && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-semibold text-slate-700">
                              Selected Member Details
                            </p>
                            <p className="text-sm text-slate-600 mt-2">
                              <strong>Name:</strong> {selectedMember.name}
                            </p>
                            <p className="text-sm text-slate-600">
                              <strong>Email:</strong> {selectedMember.email}
                            </p>
                            {selectedMember.phone && (
                              <p className="text-sm text-slate-600">
                                <strong>Phone:</strong> {selectedMember.phone}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="Enter password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  {creationMode === "new" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="Enter name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="Enter email"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="Enter phone"
                          />
                        </div>
                      </div>

                      {!editingAdmin && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-12 py-3 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                              placeholder="Enter password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="subadmin">Sub Admin</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Permissions * (Select features this admin can access)
                    </label>
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                      {AVAILABLE_PERMISSIONS.map((permission) => (
                        <label
                          key={permission.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            formData.permissions.includes(permission.id)
                              ? "bg-orange-100 border-2 border-orange-500"
                              : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(
                              permission.id
                            )}
                            onChange={() =>
                              handlePermissionToggle(permission.id)
                            }
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {permission.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating || isUpdating}
                      className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {isCreating || isUpdating
                        ? "Saving..."
                        : editingAdmin
                          ? "Update Admin"
                          : "Create Admin"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
