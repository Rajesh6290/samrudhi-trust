"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Award,
  BarChart3,
  Briefcase,
  Calendar,
  Clock,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Stats {
  totalMembers: number;
  totalGallery: number;
  totalServices: number;
  totalTestimonials: number;
  totalFeedback: number;
  totalContact: number;
  recentMembers: number;
  recentGallery: number;
}

// Skeleton loader component
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
    <div className="flex items-start justify-between mb-4">
      <div className="h-12 w-12 bg-slate-200 animate-pulse rounded-xl" />
      <div className="h-6 w-16 bg-slate-200 animate-pulse rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-8 w-24 bg-slate-200 animate-pulse rounded" />
      <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
    </div>
  </div>
);

const DashboardOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalGallery: 0,
    totalServices: 0,
    totalTestimonials: 0,
    totalFeedback: 0,
    totalContact: 0,
    recentMembers: 0,
    recentGallery: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          membersRes,
          galleryRes,
          servicesRes,
          testimonialsRes,
          feedbackRes,
          contactRes,
        ] = await Promise.all([
          fetch("/api/members?limit=1000", { credentials: "include" }),
          fetch("/api/gallery?limit=1000", { credentials: "include" }),
          fetch("/api/services?limit=1000", { credentials: "include" }),
          fetch("/api/testimonials?limit=1000", { credentials: "include" }),
          fetch("/api/feedback?limit=1000", { credentials: "include" }),
          fetch("/api/admin/contact?limit=1000", { credentials: "include" }),
        ]);

        const [
          membersData,
          galleryData,
          servicesData,
          testimonialsData,
          feedbackData,
          contactData,
        ] = await Promise.all([
          membersRes.ok ? membersRes.json() : { pagination: { total: 0 } },
          galleryRes.ok ? galleryRes.json() : { pagination: { total: 0 } },
          servicesRes.ok ? servicesRes.json() : { pagination: { total: 0 } },
          testimonialsRes.ok
            ? testimonialsRes.json()
            : { pagination: { total: 0 } },
          feedbackRes.ok ? feedbackRes.json() : { pagination: { total: 0 } },
          contactRes.ok ? contactRes.json() : { pagination: { total: 0 } },
        ]);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentMembers =
          membersData.members?.filter(
            (member: { createdAt: string }) =>
              new Date(member.createdAt) > thirtyDaysAgo
          ).length || 0;

        const recentGallery =
          galleryData.items?.filter(
            (item: { createdAt: string }) =>
              new Date(item.createdAt) > thirtyDaysAgo
          ).length || 0;

        const newStats = {
          totalMembers: membersData.members?.length || 0,
          totalGallery: galleryData.items?.length || 0,
          totalServices: servicesData.services?.length || 0,
          totalTestimonials: testimonialsData.testimonials?.length || 0,
          totalFeedback: feedbackData.feedbacks?.length || 0,
          totalContact: contactData.contacts?.length || 0,
          recentMembers,
          recentGallery,
        };

        setStats(newStats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: Users,
      change: stats.recentMembers,
      changeType: "increase",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      linearFrom: "from-blue-500",
      linearTo: "to-blue-600",
      href: "/admin/members",
      description: "Active members",
    },
    {
      title: "Gallery Items",
      value: stats.totalGallery,
      icon: ImageIcon,
      change: stats.recentGallery,
      changeType: "increase",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      linearFrom: "from-purple-500",
      linearTo: "to-purple-600",
      href: "/admin/gallery",
      description: "Media uploaded",
    },
    {
      title: "Services",
      value: stats.totalServices,
      icon: Briefcase,
      change: 0,
      changeType: "neutral",
      color: "text-green-600",
      bgColor: "bg-green-50",
      linearFrom: "from-green-500",
      linearTo: "to-green-600",
      href: "/admin/services",
      description: "Active services",
    },
    {
      title: "Testimonials",
      value: stats.totalTestimonials,
      icon: Star,
      change: 0,
      changeType: "neutral",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      linearFrom: "from-amber-500",
      linearTo: "to-amber-600",
      href: "/admin/testimonials",
      description: "Client reviews",
    },
    {
      title: "Feedback",
      value: stats.totalFeedback,
      icon: MessageSquare,
      change: 0,
      changeType: "neutral",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      linearFrom: "from-indigo-500",
      linearTo: "to-indigo-600",
      href: "/admin/feedback",
      description: "Received",
    },
    {
      title: "Contact Messages",
      value: stats.totalContact,
      icon: Mail,
      change: 0,
      changeType: "neutral",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      linearFrom: "from-rose-500",
      linearTo: "to-rose-600",
      href: "/admin/contact",
      description: "Pending replies",
    },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full ">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
            <p className="text-slate-600 text-lg">
              Welcome back! {"Here's"} your organization overview
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">
                {currentDate}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200"
            >
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">
                {currentTime}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, index) => (
              <motion.a
                key={card.title}
                href={card.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block group"
              >
                <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 hover:border-slate-300 overflow-hidden">
                  {/* linear overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${card.linearFrom} ${card.linearTo} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className={`${card.bgColor} p-3 rounded-xl shadow-sm group-hover:shadow-md transition-shadow`}
                      >
                        <card.icon className={`w-6 h-6 ${card.color}`} />
                      </motion.div>

                      <AnimatePresence>
                        {card.change > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-xs font-semibold"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>+{card.change}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <motion.p
                        key={card.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-slate-900"
                      >
                        {card.value.toLocaleString()}
                      </motion.p>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {card.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-slate-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </motion.a>
            ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* New Members Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">New Members</h3>
                <p className="text-xs text-slate-500">Last 30 days</p>
              </div>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex items-end gap-3">
            {loading ? (
              <div className="h-12 w-24 bg-slate-200 animate-pulse rounded-lg" />
            ) : (
              <>
                <motion.span
                  key={stats.recentMembers}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {stats.recentMembers}
                </motion.span>
                <span className="text-slate-600 text-sm mb-2 font-medium">
                  new registrations
                </span>
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Growth rate</span>
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {stats.totalMembers > 0
                  ? ((stats.recentMembers / stats.totalMembers) * 100).toFixed(
                      1
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        </motion.div>

        {/* New Gallery Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-purple-500 to-purple-600 p-2.5 rounded-xl shadow-sm">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  New Gallery Items
                </h3>
                <p className="text-xs text-slate-500">Last 30 days</p>
              </div>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="flex items-end gap-3">
            {loading ? (
              <div className="h-12 w-24 bg-slate-200 animate-pulse rounded-lg" />
            ) : (
              <>
                <motion.span
                  key={stats.recentGallery}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-5xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  {stats.recentGallery}
                </motion.span>
                <span className="text-slate-600 text-sm mb-2 font-medium">
                  items uploaded
                </span>
              </>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Growth rate</span>
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {stats.totalGallery > 0
                  ? ((stats.recentGallery / stats.totalGallery) * 100).toFixed(
                      1
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-linear-to-br from-slate-700 to-slate-900 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">
            Quick Actions
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              href: "/admin/members",
              icon: Users,
              label: "Members",
              color: "blue",
            },
            {
              href: "/admin/gallery",
              icon: ImageIcon,
              label: "Gallery",
              color: "purple",
            },
            {
              href: "/admin/stats",
              icon: TrendingUp,
              label: "Statistics",
              color: "green",
            },
            {
              href: "/admin/services",
              icon: Award,
              label: "Services",
              color: "amber",
            },
          ].map((action, index) => (
            <motion.a
              key={action.label}
              href={action.href}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-3 p-5 rounded-xl hover:bg-slate-50 transition-all duration-200 group border border-transparent hover:border-slate-200"
            >
              <div
                className={`bg-${action.color}-50 p-3.5 rounded-xl group-hover:bg-${action.color}-100 transition-colors shadow-sm group-hover:shadow-md`}
              >
                <action.icon className={`w-6 h-6 text-${action.color}-600`} />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                {action.label}
              </span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardOverview;
