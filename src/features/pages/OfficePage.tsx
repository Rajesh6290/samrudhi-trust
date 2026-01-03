"use client";
import React, { useState } from "react";
import DefaultLayouts from "../layouts/DefaultLayouts";
import BackgroundSlider from "../components/BackgroundSlider";
import {
  MapPin,
  Phone,
  Mail,
  Users,
  Crown,
  Shield,
  Briefcase,
  Share2,
  X,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import useSwr from "../hooks/useSwr";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  photo: string;
  bloodGroup: string;
  role: string;
  bio?: string;
  isActive: boolean;
  joiningDate?: string;
}

interface Settings {
  address: string;
  phone: string;
  email: string;
  officeMapEmbedUrl?: string;
  officeMapLink?: string;
}

const backgroundImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200",
];

const getRoleIcon = (role: string) => {
  if (role.includes("Founder") || role.includes("Chairman")) return Crown;
  if (role.includes("President") || role.includes("Vice")) return Shield;
  if (role.includes("Social") || role.includes("Media")) return Share2;
  if (
    role.includes("Manager") ||
    role.includes("Secretary") ||
    role.includes("Treasurer")
  )
    return Briefcase;
  return Users;
};

const getRolePriority = (role: string) => {
  if (role.includes("Founder")) return 1;
  if (role.includes("Chairman")) return 2;
  if (role.includes("President") && !role.includes("Vice")) return 3;
  if (role.includes("Vice President")) return 4;
  if (role.includes("Secretary")) return 5;
  if (role.includes("Treasurer")) return 6;
  if (role.includes("Program Head")) return 7;
  if (role.includes("Manager")) return 8;
  if (role.includes("Coordinator")) return 9;
  return 10;
};

const maskContact = (contact: string, type: "email" | "phone") => {
  if (type === "email") {
    const [local, domain] = contact.split("@");
    return `${local.slice(0, 2)}${"x".repeat(Math.max(local.length - 2, 4))}@${domain}`;
  }
  if (type === "phone" && contact) {
    return (
      contact.slice(0, 3) + "x".repeat(contact.length - 6) + contact.slice(-3)
    );
  }
  return contact;
};

export default function OfficePage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch only leadership members for main display
  const { data: leadershipData, isLoading: loadingLeadership } =
    useSwr("members/leadership");

  // Fetch all members for "View All" dialog
  const { data: allMembersData } = useSwr("members?all=true");

  const { data: settingsData, isLoading: loadingSettings } = useSwr("settings");

  // Leadership team sorted by role priority
  const members: TeamMember[] = (leadershipData?.data || []).sort(
    (a: TeamMember, b: TeamMember) =>
      getRolePriority(a.role) - getRolePriority(b.role)
  );

  // All members for dialog display
  const allMembers: TeamMember[] = (allMembersData?.members || []).filter(
    (m: TeamMember) => m.isActive
  );

  const settings: Settings = settingsData?.settings || {
    address: "",
    phone: "",
    email: "",
  };

  const leadershipTeam = members.slice(0, 4); // Top 4 leaders

  return (
    <DefaultLayouts>
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
        <BackgroundSlider
          images={backgroundImages}
          duration={6000}
          effect="fade-zoom"
          overlayOpacity="bg-slate-900/85"
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Our <span className="text-orange-400">Office</span>
            </h1>
            <p className="text-xl text-slate-100 max-w-2xl mx-auto font-medium">
              Meet our dedicated team and find our office location. We&apos;re
              here to serve the community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our passionate leaders driving positive change in the community
            </p>
          </motion.div>

          {loadingLeadership ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-gray-200 animate-pulse rounded-3xl"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {leadershipTeam.map((member, index) => {
                  const RoleIcon = getRoleIcon(member.role);
                  return (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      {/* Photo */}
                      <div className="relative h-72 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500">
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-flex items-center gap-2 text-white text-sm font-semibold mb-2">
                            <RoleIcon size={14} />
                            {member.role}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {member.name}
                        </h3>

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} className="text-orange-500" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} className="text-orange-500" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center gap-3 mb-3 text-xs">
                          {member.joiningDate && (
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full font-semibold">
                              Since {new Date(member.joiningDate).getFullYear()}
                            </span>
                          )}
                        </div>

                        {member.bio && (
                          <p className="text-gray-600 text-sm line-clamp-2 border-t pt-3 mb-4">
                            {member.bio}
                          </p>
                        )}

                        {/* Get Connect Button */}
                        <a
                          href={`mailto:${member.email}?subject=Inquiry from Samrudhi Trust Website&body=Hello ${member.name},%0D%0A%0D%0AI would like to connect with you regarding Samrudhi Trust.%0D%0A%0D%0AThank you.`}
                          className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Get Connect
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* View All Members Button */}
              {allMembers.length > 4 && (
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDialogOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
                  >
                    <Users size={24} />
                    View All Members ({allMembers.length})
                  </motion.button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Office Location Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Visit Our Office
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;d love to meet you. Drop by our office or get in touch.
            </p>
          </motion.div>

          {loadingSettings ? (
            <div className="h-96 bg-gray-200 animate-pulse rounded-3xl" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Address Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-linear-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white"
              >
                <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                  <MapPin size={32} />
                  Contact Information
                </h3>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-100 mb-1">
                          Address
                        </p>
                        <p className="text-lg font-medium">
                          {settings.address || "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <Phone size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-100 mb-1">
                          Phone
                        </p>
                        <p className="text-lg font-medium">
                          {settings.phone || "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <Mail size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-100 mb-1">
                          Email
                        </p>
                        <p className="text-lg font-medium">
                          {settings.email || "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/20">
                    <p className="text-blue-100 text-sm font-medium mb-2">
                      Office Hours
                    </p>
                    <p className="text-lg font-semibold">Monday - Saturday</p>
                    <p className="text-lg font-semibold">9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </motion.div>

              {/* Google Map */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gray-100 rounded-3xl shadow-2xl overflow-hidden"
              >
                {settings.officeMapEmbedUrl ? (
                  <iframe
                    src={settings.officeMapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "500px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location Map"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-125 text-gray-500">
                    <div className="text-center">
                      <MapPin
                        size={64}
                        className="mx-auto mb-4 text-gray-400"
                      />
                      <p className="text-lg font-medium">Map not available</p>
                      <p className="text-sm">
                        Please contact us for directions
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* All Members Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 3, pr: 6 }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                All Team Members
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Meet our complete team of {allMembers.length} members
              </p>
            </div>
            <IconButton
              aria-label="close"
              onClick={() => setDialogOpen(false)}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
              }}
            >
              <X />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {allMembers.map((member, index) => {
                const RoleIcon = getRoleIcon(member.role);
                return (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-linear-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex gap-4">
                      {/* Photo */}
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-linear-to-br from-blue-500 to-purple-500">
                        <Image
                          src={member.photo}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0">
                            <RoleIcon size={12} />
                            {member.role}
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                          {member.name}
                        </h3>

                        {member.bio && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {member.bio}
                          </p>
                        )}

                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail
                              size={14}
                              className="text-gray-400 shrink-0"
                            />
                            <span className="truncate">
                              {maskContact(member.email, "email")}
                            </span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2">
                              <Phone
                                size={14}
                                className="text-gray-400 shrink-0"
                              />
                              <span>{maskContact(member.phone, "phone")}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-red-600">
                              Blood Group: {member.bloodGroup}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </DefaultLayouts>
  );
}
