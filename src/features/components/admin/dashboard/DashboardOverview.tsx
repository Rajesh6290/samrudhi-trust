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
  FileText,
  UserPlus,
  Megaphone,
  Globe,
  Filter,
  X,
} from "lucide-react";
import useSwr from "@/features/hooks/useSwr";
import { useState } from "react";

interface Stats {
  // Totals
  totalMembers: number;
  totalGallery: number;
  totalServices: number;
  totalTestimonials: number;
  totalFeedback: number;
  totalContact: number;
  totalCampaigns: number;
  totalVolunteers: number;
  totalBlogs: number;
  totalCertificates: number;
  totalContent: number;

  // Recent activity (30 days)
  recentMembers: number;
  recentGallery: number;
  recentCampaigns: number;
  recentVolunteers: number;
  recentBlogs: number;
  recentFeedback: number;
  recentContacts: number;

  // Weekly activity (7 days)
  weeklyMembers: number;
  weeklyGallery: number;
  weeklyVolunteers: number;
  weeklyBlogs: number;
  weeklyContacts: number;

  // Growth analytics
  memberGrowthRate: number;
  memberDailyGrowth: Array<{ _id: string; count: number }>;

  // Campaign analytics (corrected field names)
  ongoingCampaigns: number;
  completedCampaigns: number;
  upcomingCampaigns: number;
  campaignsByType: Array<{ _id: string; count: number }>;
  filteredCampaigns: number;

  // Additional analytics
  volunteerByStatus: Array<{ _id: string; count: number }>;
  publishedBlogs: number;
  draftBlogs: number;
  archivedBlogs: number;
  totalBlogViews: number;
  totalBlogLikes: number;
  filteredBlogs: number;
  averageRating: number;
  ratingDistribution: Array<{ _id: number; count: number }>;
  unreadContacts: number;
  readContacts: number;
  galleryByCategory: Array<{ _id: string; count: number }>;
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
  const [dateRange, setDateRange] = useState("30");
  const [campaignStatus, setCampaignStatus] = useState("");
  const [blogStatus, setBlogStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Build query string for filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (dateRange) params.append("dateRange", dateRange);
    if (campaignStatus) params.append("campaignStatus", campaignStatus);
    if (blogStatus) params.append("blogStatus", blogStatus);
    return params.toString();
  };

  const { data: stats, isLoading: loading } = useSwr(
    `admin/dashboard-stats?${buildQueryString()}`,
    {
      refreshInterval: 30000, // Auto-refresh every 30 seconds for real-time data
    }
  );

  const statsData: Stats = stats || {
    totalMembers: 0,
    totalGallery: 0,
    totalServices: 0,
    totalTestimonials: 0,
    totalFeedback: 0,
    totalContact: 0,
    totalCampaigns: 0,
    totalVolunteers: 0,
    totalBlogs: 0,
    totalCertificates: 0,
    totalContent: 0,
    recentMembers: 0,
    recentGallery: 0,
    recentCampaigns: 0,
    recentVolunteers: 0,
    recentBlogs: 0,
    recentFeedback: 0,
    recentContacts: 0,
    weeklyMembers: 0,
    weeklyGallery: 0,
    weeklyVolunteers: 0,
    weeklyBlogs: 0,
    weeklyContacts: 0,
    memberGrowthRate: 0,
    memberDailyGrowth: [],
    ongoingCampaigns: 0,
    completedCampaigns: 0,
    upcomingCampaigns: 0,
    campaignsByType: [],
    filteredCampaigns: 0,
    volunteerByStatus: [],
    publishedBlogs: 0,
    draftBlogs: 0,
    archivedBlogs: 0,
    totalBlogViews: 0,
    totalBlogLikes: 0,
    filteredBlogs: 0,
    averageRating: 0,
    ratingDistribution: [],
    unreadContacts: 0,
    readContacts: 0,
    galleryByCategory: [],
  };

  const handleResetFilters = () => {
    setDateRange("30");
    setCampaignStatus("");
    setBlogStatus("");
  };

  const statCards = [
    {
      title: "Total Members",
      value: statsData.totalMembers,
      icon: Users,
      change: statsData.recentMembers,
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
      value: statsData.totalGallery,
      icon: ImageIcon,
      change: statsData.recentGallery,
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
      value: statsData.totalServices,
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
      value: statsData.totalTestimonials,
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
      value: statsData.totalFeedback,
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
      value: statsData.totalContact,
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
    {
      title: "Campaigns",
      value: statsData.totalCampaigns,
      icon: Megaphone,
      change: statsData.recentCampaigns,
      changeType: "increase",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      linearFrom: "from-orange-500",
      linearTo: "to-orange-600",
      href: "/admin/campaigns",
      description: "Active campaigns",
    },
    {
      title: "Volunteers",
      value: statsData.totalVolunteers,
      icon: UserPlus,
      change: statsData.recentVolunteers,
      changeType: "increase",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      linearFrom: "from-teal-500",
      linearTo: "to-teal-600",
      href: "/admin/volunteers",
      description: "Registered volunteers",
    },
    {
      title: "Blog Posts",
      value: statsData.totalBlogs,
      icon: FileText,
      change: statsData.recentBlogs,
      changeType: "increase",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      linearFrom: "from-cyan-500",
      linearTo: "to-cyan-600",
      href: "/admin/blogs",
      description: "Published articles",
    },
    {
      title: "Certificates",
      value: statsData.totalCertificates,
      icon: Award,
      change: 0,
      changeType: "neutral",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      linearFrom: "from-yellow-500",
      linearTo: "to-yellow-600",
      href: "/admin/certificates",
      description: "Issued certificates",
    },
    {
      title: "Content Pages",
      value: statsData.totalContent,
      icon: Globe,
      change: 0,
      changeType: "neutral",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      linearFrom: "from-pink-500",
      linearTo: "to-pink-600",
      href: "/admin/content",
      description: "Managed content",
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

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Dashboard Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="180">Last 6 months</option>
                    <option value="365">Last year</option>
                  </select>
                </div>

                {/* Campaign Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Campaign Status
                  </label>
                  <select
                    value={campaignStatus}
                    onChange={(e) => setCampaignStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">All Campaigns</option>
                    <option value="ongoing">Ongoing Only</option>
                    <option value="completed">Completed Only</option>
                    <option value="upcoming">Upcoming Only</option>
                  </select>
                </div>

                {/* Blog Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blog Status
                  </label>
                  <select
                    value={blogStatus}
                    onChange={(e) => setBlogStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">All Blogs</option>
                    <option value="published">Published Only</option>
                    <option value="draft">Draft Only</option>
                    <option value="archived">Archived Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  {dateRange && (
                    <span className="mr-4">📅 Last {dateRange} days</span>
                  )}
                  {campaignStatus && (
                    <span className="mr-4">📢 {campaignStatus} campaigns</span>
                  )}
                  {blogStatus && (
                    <span className="mr-4">📝 {blogStatus} blogs</span>
                  )}
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
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
                  key={statsData.recentMembers}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {statsData.recentMembers}
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
                {statsData.totalMembers > 0
                  ? (
                      (statsData.recentMembers / statsData.totalMembers) *
                      100
                    ).toFixed(1)
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
                  key={statsData.recentGallery}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-5xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  {statsData.recentGallery}
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
                {statsData.totalGallery > 0
                  ? (
                      (statsData.recentGallery / statsData.totalGallery) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtered Results Indicator */}
      {(campaignStatus || blogStatus || dateRange !== "30") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Filter className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    Filtered Results
                  </p>
                  <p className="text-sm text-slate-600">
                    {campaignStatus && (
                      <>
                        Campaigns: {statsData.filteredCampaigns}{" "}
                        {campaignStatus}
                        {" • "}
                      </>
                    )}
                    {blogStatus && (
                      <>
                        Blogs: {statsData.filteredBlogs} {blogStatus}
                        {" • "}
                      </>
                    )}
                    Date Range: Last {dateRange} days
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics Section - Campaigns & Fundraising */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Campaign Analytics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-linear-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-sm">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Campaign Status</h3>
              <p className="text-xs text-slate-500">Active vs Completed</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-600 mb-1">Ongoing Campaigns</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? "..." : statsData.ongoingCampaigns}
                </p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-600 mb-1">
                  Completed Campaigns
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? "..." : statsData.completedCampaigns}
                </p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-linear-to-r from-purple-50 to-violet-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-600 mb-1">
                  Upcoming Campaigns
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? "..." : statsData.upcomingCampaigns}
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fundraising Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-2.5 rounded-xl shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Blog Engagement</h3>
              <p className="text-xs text-slate-500">Views and interactions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Views</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? "..." : statsData.totalBlogViews.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Likes</p>
                <p className="text-2xl font-bold text-rose-600">
                  {loading ? "..." : statsData.totalBlogLikes.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-rose-600" />
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-slate-500">
              From {statsData.publishedBlogs} published articles
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics Section - Feedback & Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Feedback Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-linear-to-br from-amber-500 to-amber-600 p-2.5 rounded-xl shadow-sm">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Average Feedback Rating
              </h3>
              <p className="text-xs text-slate-500">Customer satisfaction</p>
            </div>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
              className="inline-block"
            >
              <div className="text-6xl font-bold bg-linear-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                {loading ? "..." : statsData.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(statsData.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Based on {statsData.totalFeedback} reviews
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Contact Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-linear-to-br from-rose-500 to-rose-600 p-2.5 rounded-xl shadow-sm">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Contact Requests</h3>
              <p className="text-xs text-slate-500">Response status</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Unread</span>
              <span className="text-xl font-bold text-amber-600">
                {loading ? "..." : statsData.unreadContacts}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Read</span>
              <span className="text-xl font-bold text-green-600">
                {loading ? "..." : statsData.readContacts}
              </span>
            </div>
            <div className="mt-3 text-center text-xs text-slate-500">
              Weekly contacts: {statsData.weeklyContacts}
            </div>
          </div>
        </motion.div>

        {/* Blog Publishing Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-linear-to-br from-cyan-500 to-cyan-600 p-2.5 rounded-xl shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Blog Status</h3>
              <p className="text-xs text-slate-500">Published vs Draft</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">
                Published
              </span>
              <span className="text-xl font-bold text-green-600">
                {loading ? "..." : statsData.publishedBlogs}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Draft</span>
              <span className="text-xl font-bold text-slate-600">
                {loading ? "..." : statsData.draftBlogs}
              </span>
            </div>
            <div className="mt-3 text-center text-xs text-slate-500">
              This week: {statsData.weeklyBlogs} new posts
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
