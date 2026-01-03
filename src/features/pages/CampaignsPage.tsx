"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Clock,
  Filter,
  Heart,
  MapPin,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import BackgroundSlider from "../components/BackgroundSlider";
import useSwr from "../hooks/useSwr";
import DefaultLayouts from "../layouts/DefaultLayouts";

interface Campaign {
  _id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  address: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  isOngoing?: boolean;
  type?: "campaign" | "event";
  donationLink?: string;
  eventLink?: string;
  status?: "ongoing" | "upcoming" | "completed";
}

const CampaignsPage = () => {
  const [filter, setFilter] = useState<
    "all" | "ongoing" | "upcoming" | "completed"
  >("all");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const { data, isLoading } = useSwr("campaigns");
  const campaigns: Campaign[] = data?.campaigns || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Categorize campaigns
  const categorizedCampaigns = {
    ongoing: campaigns.filter((c) => c.isActive && c.isOngoing),
    upcoming: campaigns.filter((c) => {
      const startDate = new Date(c.startDate);
      const now = new Date();
      return c.isActive && !c.isOngoing && startDate > now;
    }),
    completed: campaigns.filter((c) => {
      const endDate = c.endDate ? new Date(c.endDate) : new Date(c.startDate);
      const now = new Date();
      return !c.isActive || endDate < now;
    }),
  };

  const filteredCampaigns =
    filter === "all"
      ? [
          ...categorizedCampaigns.ongoing,
          ...categorizedCampaigns.upcoming,
          ...categorizedCampaigns.completed,
        ]
      : categorizedCampaigns[filter];

  const handleAction = (campaign: Campaign) => {
    if (campaign.donationLink) {
      window.open(campaign.donationLink, "_blank");
    } else {
      const paymentSection = document.getElementById("payment");
      paymentSection?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLike = (id: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCardTheme = (index: number, status?: string) => {
    if (status === "completed") {
      return {
        buttonBg: "bg-linear-to-br from-gray-400 to-gray-500",
        buttonHover: "hover:from-gray-500 hover:to-gray-600",
        badgeBg: "bg-gray-500",
        badgeText: "Completed",
      };
    }
    if (status === "upcoming") {
      return {
        buttonBg: "bg-linear-to-br from-blue-500 to-blue-600",
        buttonHover: "hover:from-blue-600 hover:to-blue-700",
        badgeBg: "bg-blue-500",
        badgeText: "Upcoming",
      };
    }

    const themes = [
      {
        buttonBg: "bg-linear-to-br from-[#1db1b7] to-[#159ca1]",
        buttonHover: "hover:from-[#159ca1] hover:to-[#127b7f]",
        badgeBg: "bg-[#1db1b7]",
        badgeText: "Ongoing",
      },
      {
        buttonBg: "bg-linear-to-br from-[#ff9fad] to-[#ff7a8f]",
        buttonHover: "hover:from-[#ff7a8f] hover:to-[#ff5571]",
        badgeBg: "bg-[#ff9fad]",
        badgeText: "Ongoing",
      },
      {
        buttonBg: "bg-linear-to-br from-[#66cc91] to-[#4db87a]",
        buttonHover: "hover:from-[#4db87a] hover:to-[#3a9f63]",
        badgeBg: "bg-[#66cc91]",
        badgeText: "Ongoing",
      },
    ];
    return themes[index % 3];
  };

  const getCampaignStatus = (
    campaign: Campaign
  ): "ongoing" | "upcoming" | "completed" => {
    if (categorizedCampaigns.ongoing.includes(campaign)) return "ongoing";
    if (categorizedCampaigns.upcoming.includes(campaign)) return "upcoming";
    return "completed";
  };

  return (
    <DefaultLayouts>
      {/* Hero Section with Background Slider */}
      <section className="relative text-white py-24 overflow-hidden">
        <BackgroundSlider
          images={[
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
            "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200",
            "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200",
            "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200",
          ]}
          duration={6000}
          overlayOpacity="bg-blue-900/80"
          effect="fade-zoom"
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Our <span className="text-orange-400">Campaigns</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium">
              Join us in making a difference. Support our initiatives and help
              us create lasting impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-2xl p-6 mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter size={20} className="text-gray-600" />
                <span className="text-lg font-bold text-gray-900">Filter:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      value: "all",
                      label: "All Campaigns",
                      count: campaigns.length,
                    },
                    {
                      value: "ongoing",
                      label: "Ongoing",
                      count: categorizedCampaigns.ongoing.length,
                    },
                    {
                      value: "upcoming",
                      label: "Upcoming",
                      count: categorizedCampaigns.upcoming.length,
                    },
                    {
                      value: "completed",
                      label: "Completed",
                      count: categorizedCampaigns.completed.length,
                    },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setFilter(item.value as any)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        filter === item.value
                          ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {item.label}
                      <span className="ml-2 text-xs opacity-75">
                        ({item.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-125 bg-white/80 backdrop-blur-sm animate-pulse rounded-3xl"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredCampaigns.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-16 text-center"
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No {filter !== "all" ? filter : ""} Campaigns Found
              </h3>
              <p className="text-gray-600">
                {filter !== "all"
                  ? `There are no ${filter} campaigns at the moment.`
                  : "Check back soon for upcoming campaigns and events."}
              </p>
            </motion.div>
          )}

          {/* Campaigns Grid */}
          {!isLoading && filteredCampaigns.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredCampaigns.map((campaign, index) => {
                  const status = getCampaignStatus(campaign);
                  const theme = getCardTheme(index, status);
                  const isLiked = likedItems.has(campaign._id);

                  return (
                    <motion.div
                      key={campaign._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                      className="bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      {/* Image Section */}
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={campaign.image}
                          alt={campaign.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />

                        {/* Status Badge */}
                        <div
                          className={`absolute top-4 right-4 ${theme.badgeBg} text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm bg-opacity-95`}
                        >
                          {status === "ongoing" && (
                            <Clock size={16} className="animate-pulse" />
                          )}
                          <span className="text-sm font-bold">
                            {theme.badgeText}
                          </span>
                        </div>

                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(campaign._id)}
                          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
                        >
                          <Heart
                            size={20}
                            className={`${
                              isLiked
                                ? "fill-red-500 text-red-500"
                                : "text-gray-600"
                            } transition-colors duration-200`}
                          />
                        </button>

                        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {campaign.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {campaign.description}
                        </p>

                        {/* Campaign Details */}
                        <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin
                              size={18}
                              className="text-red-500 shrink-0"
                            />
                            <span className="text-sm font-medium truncate">
                              {campaign.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar
                              size={18}
                              className="text-blue-500 shrink-0"
                            />
                            <span className="text-sm font-medium">
                              {formatDate(campaign.startDate)}
                              {campaign.endDate &&
                                campaign.endDate !== campaign.startDate &&
                                ` - ${formatDate(campaign.endDate)}`}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <motion.button
                            onClick={() => handleAction(campaign)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={status === "completed"}
                            className={`relative w-full py-3 ${theme.buttonBg} ${theme.buttonHover} text-white font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {status === "completed"
                              ? "Campaign Ended"
                              : "Donate Now"}
                          </motion.button>

                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowLocationModal(true);
                            }}
                            className="w-full py-2.5 text-gray-600 text-sm font-semibold flex items-center justify-center gap-2 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group/link"
                          >
                            <MapPin
                              size={16}
                              className="group-hover/link:animate-bounce"
                            />
                            <span>View Location</span>
                            <ArrowRight
                              size={16}
                              className="opacity-0 group-hover/link:opacity-100 -ml-2 group-hover/link:ml-0 transition-all duration-200"
                            />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Location Modal */}
      <AnimatePresence>
        {showLocationModal && selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowLocationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLocationModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={24} className="text-gray-600" />
              </button>

              <div className="mb-6">
                <h3 className="text-3xl font-extrabold text-gray-900 mb-2 pr-10">
                  {selectedCampaign.title}
                </h3>
                <div className="flex items-center gap-2 text-red-600 font-semibold text-lg">
                  <MapPin size={22} className="shrink-0" />
                  <span>{selectedCampaign.location}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <p className="text-gray-700 text-base leading-relaxed">
                  {selectedCampaign.address}
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCampaign.address)}`,
                      "_blank"
                    )
                  }
                  className="flex-1 py-4 bg-linear-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MapPin size={20} />
                  <span>Open in Maps</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DefaultLayouts>
  );
};

export default CampaignsPage;
