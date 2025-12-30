"use client";

import AdminLayout from "@/features/layouts/AdminLayout";
import { motion } from "framer-motion";
import { Check, Mail, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const ContactPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchContacts = async () => {
    try {
      const url =
        filter === "all"
          ? "/api/admin/contact"
          : `/api/admin/contact?isRead=${filter === "read"}`;

      const response = await fetch(url, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isRead: !currentStatus }),
      });

      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to update contact:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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

  const unreadCount = contacts.filter((c) => !c.isRead).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              Contact Messages
            </h1>
            <p className="text-slate-600 font-medium mt-2">
              View and manage contact form submissions
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-orange-100 rounded-xl">
              <div className="text-sm text-orange-700 font-bold uppercase tracking-wider">
                Total
              </div>
              <div className="text-2xl font-black text-orange-900">
                {contacts.length}
              </div>
            </div>
            <div className="px-6 py-3 bg-red-100 rounded-xl">
              <div className="text-sm text-red-700 font-bold uppercase tracking-wider">
                Unread
              </div>
              <div className="text-2xl font-black text-red-900">
                {unreadCount}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {(["all", "unread", "read"] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                filter === filterOption
                  ? "bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Contact List */}
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all ${
                contact.isRead
                  ? "border-slate-100"
                  : "border-orange-200 bg-orange-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                          {contact.name}
                        </h3>
                        {!contact.isRead && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 font-medium text-sm">
                        {contact.email}
                      </p>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="pl-16">
                    <div className="inline-block px-3 py-1 bg-orange-100 rounded-lg mb-2">
                      <span className="text-orange-700 font-bold text-sm uppercase tracking-wider">
                        Subject
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {contact.subject}
                    </h4>
                  </div>

                  {/* Message */}
                  <div className="pl-16">
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {contact.message}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="pl-16">
                    <p className="text-slate-500 text-sm font-medium">
                      {formatDate(contact.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleMarkRead(contact._id, contact.isRead)}
                    className={`p-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                      contact.isRead
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        : "bg-green-100 hover:bg-green-200 text-green-700"
                    }`}
                    title={contact.isRead ? "Mark as Unread" : "Mark as Read"}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact._id)}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {contacts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Mail className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              No Messages Found
            </h3>
            <p className="text-slate-600 font-medium">
              {filter === "all"
                ? "No contact messages yet"
                : `No ${filter} messages found`}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContactPage;
