"use client";

import AdminLayout from "@/features/layouts/AdminLayout";
import { motion } from "framer-motion";
import {
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  Save,
  Twitter,
  Upload,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface Settings {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  email: string;
  phone: string;
  address: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  upiId?: string;
  upiQrCode?: string;
  organizationName: string;
  tagline?: string;
  aboutUs?: string;
}

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    organizationName: "Samriddhi Seva Trust",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSettings((prev) => ({ ...prev, upiQrCode: data.url }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Settings
          </h1>
          <p className="text-slate-600 font-medium mt-2">
            Configure your organization settings
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Organization Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Building2 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Organization Information
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={settings.organizationName}
              onChange={(e) =>
                setSettings({ ...settings, organizationName: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline || ""}
              onChange={(e) =>
                setSettings({ ...settings, tagline: e.target.value })
              }
              placeholder="Serving Humanity, One Meal at a Time"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              About Us
            </label>
            <textarea
              value={settings.aboutUs || ""}
              onChange={(e) =>
                setSettings({ ...settings, aboutUs: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium resize-none"
              placeholder="Brief description about your organization..."
            />
          </div>
        </div>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
      >
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-6">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              Email *
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              Address *
            </label>
            <textarea
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium resize-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Social Media Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
      >
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-6">
          Social Media Links
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </label>
            <input
              type="url"
              value={settings.facebook || ""}
              onChange={(e) =>
                setSettings({ ...settings, facebook: e.target.value })
              }
              placeholder="https://facebook.com/yourpage"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              <Twitter className="w-4 h-4 text-sky-500" />
              Twitter
            </label>
            <input
              type="url"
              value={settings.twitter || ""}
              onChange={(e) =>
                setSettings({ ...settings, twitter: e.target.value })
              }
              placeholder="https://twitter.com/yourhandle"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              <Instagram className="w-4 h-4 text-pink-600" />
              Instagram
            </label>
            <input
              type="url"
              value={settings.instagram || ""}
              onChange={(e) =>
                setSettings({ ...settings, instagram: e.target.value })
              }
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              <Linkedin className="w-4 h-4 text-blue-700" />
              LinkedIn
            </label>
            <input
              type="url"
              value={settings.linkedin || ""}
              onChange={(e) =>
                setSettings({ ...settings, linkedin: e.target.value })
              }
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              <Youtube className="w-4 h-4 text-red-600" />
              YouTube
            </label>
            <input
              type="url"
              value={settings.youtube || ""}
              onChange={(e) =>
                setSettings({ ...settings, youtube: e.target.value })
              }
              placeholder="https://youtube.com/@yourchannel"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>
        </div>
      </motion.div>

      {/* Bank Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
      >
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-6">
          Bank Account Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              Bank Name
            </label>
            <input
              type="text"
              value={settings.bankName || ""}
              onChange={(e) =>
                setSettings({ ...settings, bankName: e.target.value })
              }
              placeholder="State Bank of India"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              Account Holder Name
            </label>
            <input
              type="text"
              value={settings.accountHolderName || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  accountHolderName: e.target.value,
                })
              }
              placeholder="Samriddhi Seva Trust"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              Account Number
            </label>
            <input
              type="text"
              value={settings.accountNumber || ""}
              onChange={(e) =>
                setSettings({ ...settings, accountNumber: e.target.value })
              }
              placeholder="1234567890"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              IFSC Code
            </label>
            <input
              type="text"
              value={settings.ifscCode || ""}
              onChange={(e) =>
                setSettings({ ...settings, ifscCode: e.target.value })
              }
              placeholder="SBIN0001234"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>
        </div>
      </motion.div>

      {/* UPI Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
      >
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider mb-6">
          UPI Payment Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={settings.upiId || ""}
              onChange={(e) =>
                setSettings({ ...settings, upiId: e.target.value })
              }
              placeholder="trust@upi"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-bold text-sm uppercase tracking-wider mb-2">
              UPI QR Code
            </label>
            <div className="space-y-3">
              {settings.upiQrCode && (
                <div className="relative w-48 h-48 mx-auto">
                  <Image
                    src={settings.upiQrCode}
                    alt="UPI QR Code"
                    fill
                    className="object-contain rounded-xl"
                  />
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors font-bold text-sm uppercase tracking-wider">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload QR Code"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
