"use client";
import useSwr from "@/features/hooks/useSwr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  X,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

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
}

const Campaigns = () => {
  const { data, isLoading } = useSwr("campaigns?active=true");
  const campaigns: Campaign[] = data?.campaigns || [];

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [cardsPerView, setCardsPerView] = useState(3);

  // Detect screen size and set cards per view
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  // Auto-slide every 4 seconds (only if we have more campaigns than visible)
  useEffect(() => {
    if (!isAutoPlaying || campaigns.length <= cardsPerView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = campaigns.length - cardsPerView;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, campaigns.length, cardsPerView]);

  const handleAction = (campaign: Campaign) => {
    if (campaign.donationLink) {
      window.open(campaign.donationLink, "_blank");
    } else {
      const paymentSection = document.getElementById("payment");
      paymentSection?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCardTheme = (index: number) => {
    const themes = [
      {
        buttonBg: "bg-linear-to-br from-[#1db1b7] to-[#159ca1]",
        buttonHover: "hover:from-[#159ca1] hover:to-[#127b7f]",
        badgeBg: "bg-[#1db1b7]",
        icon: <Heart size={24} className="text-white fill-white" />,
      },
      {
        buttonBg: "bg-linear-to-br from-[#ff9fad] to-[#ff7a8f]",
        buttonHover: "hover:from-[#ff7a8f] hover:to-[#ff5571]",
        badgeBg: "bg-[#ff9fad]",
        icon: <Heart size={24} className="text-white fill-white" />,
      },
      {
        buttonBg: "bg-linear-to-br from-[#66cc91] to-[#4db87a]",
        buttonHover: "hover:from-[#4db87a] hover:to-[#3a9f63]",
        badgeBg: "bg-[#66cc91]",
        icon: <Heart size={24} className="text-white fill-white" />,
      },
    ];
    return themes[index % 3];
  };

  const nextSlide = () => {
    const maxIndex = campaigns.length - cardsPerView;
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    const maxIndex = campaigns.length - cardsPerView;
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    const maxIndex = campaigns.length - cardsPerView;
    setCurrentIndex(Math.min(index, maxIndex));
    setIsAutoPlaying(false);
  };

  // Get visible campaigns based on current index
  const getVisibleCampaigns = () => {
    return campaigns.slice(currentIndex, currentIndex + cardsPerView);
  };

  if (isLoading) {
    return (
      <div className="py-16 bg-linear-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-130 bg-gray-100 animate-pulse rounded-3xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <section
        id="campaigns"
        className="py-16 bg-linear-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No Active Campaigns
            </h3>
            <p className="text-gray-600">
              Check back soon for upcoming campaigns and events.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const visibleCampaigns = getVisibleCampaigns();
  const showNavigation = campaigns.length > cardsPerView;

  return (
    <section
      id="campaigns"
      className="py-16 bg-linear-to-b from-gray-50 to-white"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Active Campaigns
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join us in making a difference. Support our ongoing initiatives.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Cards Grid */}
          <div
            className={`grid grid-cols-1 ${campaigns.length === 1 ? "md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto" : "md:grid-cols-2 lg:grid-cols-3"} gap-8`}
          >
            <AnimatePresence mode="popLayout">
              {visibleCampaigns.map((campaign, idx) => {
                const actualIndex = campaigns.findIndex(
                  (c) => c._id === campaign._id
                );
                const theme = getCardTheme(actualIndex);

                return (
                  <motion.div
                    key={campaign._id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-white rounded-[2rem] overflow-hidden flex flex-col h-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                  >
                    {/* Image Section */}
                    <div className="relative h-64 m-4 overflow-hidden rounded-[1.5rem]">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {campaign.isOngoing && (
                        <div
                          className={`absolute top-4 right-4 ${theme.badgeBg} text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm bg-opacity-95`}
                        >
                          <Clock size={16} className="animate-pulse" />
                          <span className="text-sm font-bold">Ongoing</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content Section */}
                    <div className="px-8 pb-8 flex flex-col flex-grow">
                      <h3 className="text-[1.85rem] font-extrabold text-gray-900 leading-[1.15] mb-3 group-hover:text-gray-700 transition-colors">
                        {campaign.title}
                      </h3>

                      <p className="text-gray-600 text-[1.05rem] leading-relaxed mb-6 flex-grow line-clamp-3">
                        {campaign.description}
                      </p>

                      {/* Campaign Details */}
                      <div className="space-y-2 mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin
                            size={18}
                            className="text-red-500 flex-shrink-0"
                          />
                          <span className="text-sm font-medium truncate">
                            {campaign.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar
                            size={18}
                            className="text-blue-500 flex-shrink-0"
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
                          className={`relative w-full py-4 ${theme.buttonBg} ${theme.buttonHover} text-white font-bold text-lg rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl`}
                        >
                          <span className="relative z-10">Donate Now</span>
                          <div className="absolute right-5 flex items-center justify-center z-10">
                            {theme.icon}
                          </div>

                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                        </motion.button>

                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowLocationModal(true);
                          }}
                          className="w-full py-3 text-gray-600 text-sm font-semibold flex items-center justify-center gap-2 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 group/link"
                        >
                          <MapPin
                            size={16}
                            className="group-hover/link:animate-bounce"
                          />
                          <span>View Location Details</span>
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
          </div>

          {/* Navigation Buttons - Only show if more campaigns than visible */}
          {showNavigation && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 bg-white hover:bg-gray-100 p-4 rounded-full shadow-xl transition-all duration-300 z-10 group"
                aria-label="Previous slide"
              >
                <ChevronLeft
                  size={24}
                  className="text-gray-800 group-hover:scale-110 transition-transform"
                />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 bg-white hover:bg-gray-100 p-4 rounded-full shadow-xl transition-all duration-300 z-10 group"
                aria-label="Next slide"
              >
                <ChevronRight
                  size={24}
                  className="text-gray-800 group-hover:scale-110 transition-transform"
                />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots - Only show if more campaigns than visible */}
        {showNavigation && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {Array.from({ length: campaigns.length - cardsPerView + 1 }).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? "w-8 h-3 bg-gray-800"
                      : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Enhanced Location Modal */}
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
                  <MapPin size={22} className="flex-shrink-0" />
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
    </section>
  );
};

export default Campaigns;
