"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  Play,
  SlidersHorizontal,
  X,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import BackgroundSlider from "../components/BackgroundSlider";
import useSwr from "../hooks/useSwr";
import DefaultLayouts from "../layouts/DefaultLayouts";

interface GalleryFile {
  id: string;
  url: string;
  type: string;
}

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  files: GalleryFile[];
  category: string;
  isActive: boolean;
  date: string;
  createdAt: string;
}

interface GalleryGroup {
  date: string;
  fullDate: Date;
  items: GalleryItem[];
  count: number;
}

const categoryMap: Record<string, string> = {
  "food-rescue": "Food Distribution",
  "blood-donation": "Blood Donation",
  "child-welfare": "Child Welfare",
  events: "Events",
  other: "Other",
};

const generateTitle = (category: string, date: string): string => {
  const categoryTitles: Record<string, string> = {
    "food-rescue": "Community Food Distribution Drive",
    "blood-donation": "Blood Donation Camp",
    "child-welfare": "Child Welfare Program",
    events: "Community Event",
    other: "Community Initiative",
  };

  const month = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return `${categoryTitles[category] || "Community Activity"} - ${month}`;
};

const generateDescription = (category: string): string => {
  const categoryDescriptions: Record<string, string> = {
    "food-rescue":
      "Making a difference by providing nutritious meals to those in need",
    "blood-donation":
      "Saving lives through voluntary blood donation initiatives",
    "child-welfare":
      "Empowering children with education, care, and opportunities",
    events: "Bringing communities together for positive change",
    other: "Working together to create lasting impact",
  };

  return (
    categoryDescriptions[category] ||
    "Making a positive impact in the community"
  );
};

const GalleryPage = () => {
  const [category, setCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const getDefaultStartDate = () => {
    const today = new Date();
    const past = new Date(today);
    past.setDate(today.getDate() - 7);
    return past.toISOString().split("T")[0];
  };

  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Build query params for the API
  const params = new URLSearchParams();
  if (category && category !== "all") params.append("category", category);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const apiPath = params.toString()
    ? `gallery/grouped?${params.toString()}`
    : "gallery/grouped";

  // Use useSwr hook to fetch gallery data
  const { data: galleryData, isLoading } = useSwr(apiPath);
  const { data: servicesData } = useSwr("services");

  // Process the gallery data
  const groupedGalleryData = galleryData?.groups
    ? galleryData.groups.map((group: GalleryGroup) => ({
        ...group,
        items: group.items.map(
          (item: {
            _id: string;
            title: string;
            description?: string;
            files?: GalleryFile[];
            images?: string[];
            image?: string;
            category: string;
            isActive: boolean;
            date: string;
            createdAt: string;
          }) => {
            if (!item.files && item.image) {
              const images = [item.image, ...(item.images || [])].filter(
                Boolean
              );
              return {
                ...item,
                files: images.map((url: string, idx: number) => ({
                  id: `${item._id}-${idx}`,
                  url,
                  type: url.match(/\.(mp4|webm|mov|avi)$/i)
                    ? "video"
                    : url.match(/\.pdf$/i)
                      ? "pdf"
                      : "image",
                })),
              };
            }
            return item;
          }
        ),
      }))
    : [];

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

  const CardFileCarousel = ({ files }: { files: GalleryFile[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (files.length > 1 && !isVideoPlaying) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % files.length);
        }, 9000);
        return () => clearInterval(interval);
      }
    }, [files.length, isVideoPlaying]);

    if (files.length === 0) return null;

    const currentFile = files[currentIndex];
    const getFileType = (file: GalleryFile) => {
      const url = file.url.toLowerCase();
      if (file.type === "video" || url.match(/\.(mp4|webm|mov|avi)$/))
        return "video";
      if (file.type === "pdf" || url.match(/\.pdf$/)) return "pdf";
      return "image";
    };
    const fileType = getFileType(currentFile);

    const handleVideoClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (videoRef.current) {
        if (isVideoPlaying) {
          videoRef.current.pause();
          setIsVideoPlaying(false);
        } else {
          videoRef.current.play();
          setIsVideoPlaying(true);
        }
      }
    };

    return (
      <div className="relative h-80 w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {fileType === "video" ? (
              <div
                className="relative w-full h-full group/video"
                onClick={handleVideoClick}
              >
                <video
                  ref={videoRef}
                  src={currentFile.url}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                />
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                    isVideoPlaying
                      ? "opacity-0 hover:opacity-100"
                      : "opacity-100"
                  }`}
                >
                  <div className="bg-emerald-600 hover:bg-emerald-700 rounded-full p-5 transition-all transform hover:scale-110 shadow-2xl">
                    {isVideoPlaying ? (
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <Play
                        size={32}
                        fill="white"
                        className="text-white ml-1"
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : fileType === "pdf" ? (
              <div className="w-full h-full bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-red-500 text-white rounded-2xl p-5 inline-block mb-3">
                    <svg
                      className="w-14 h-14"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H12V10H18V20H6Z" />
                    </svg>
                  </div>
                  <p className="text-slate-700 font-bold">PDF Document</p>
                </div>
              </div>
            ) : (
              <Image
                src={currentFile.url}
                alt={`File ${currentIndex + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {files.length > 1 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold z-10"
            >
              {currentIndex + 1} / {files.length}
            </motion.div>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {files.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    currentIndex === index
                      ? "bg-white w-8 shadow-lg"
                      : "bg-white/40 w-1.5"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const ModalFileCarousel = ({ files }: { files: GalleryFile[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = () => setCurrentIndex((prev) => (prev + 1) % files.length);
    const goToPrevious = () =>
      setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);

    if (files.length === 0) return null;

    const currentFile = files[currentIndex];
    const getFileType = (file: GalleryFile) => {
      const url = file.url.toLowerCase();
      if (file.type === "video" || url.match(/\.(mp4|webm|mov|avi)$/))
        return "video";
      if (file.type === "pdf" || url.match(/\.pdf$/)) return "pdf";
      return "image";
    };
    const fileType = getFileType(currentFile);

    return (
      <div className="relative w-full h-[70vh] bg-black rounded-lg overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {fileType === "video" ? (
              <video
                src={currentFile.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            ) : fileType === "pdf" ? (
              <div className="w-full h-full bg-white">
                <iframe
                  src={`${currentFile.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                  allowFullScreen
                />
              </div>
            ) : (
              <Image
                src={currentFile.url}
                alt={`File ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {files.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 z-10"
            >
              <ChevronLeft className="w-6 h-6 text-slate-900" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 z-10"
            >
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-5 py-2 rounded-full text-sm font-bold z-10">
              {currentIndex + 1} / {files.length}
            </div>
          </>
        )}
      </div>
    );
  };

  const backgroundImages = [
    "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=1920&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
  ];

  const activeFilterCount = [
    category !== "all" ? 1 : 0,
    startDate ? 1 : 0,
    endDate ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <DefaultLayouts>
      {/* Hero Section */}
      <section className="relative text-white py-24 overflow-hidden">
        <BackgroundSlider
          images={backgroundImages}
          duration={6000}
          effect="fade-zoom"
          overlayOpacity="bg-emerald-950/90"
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Gallery of <span className="text-orange-400">Impact</span>
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto font-medium">
              Witness the moments that matter. Explore our collection of photos
              showcasing our initiatives and the lives {"we've"} touched.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Toggle Button */}
      <div className=" bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setCategory("all");
                }}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all duration-300"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Collapsible Filter Section */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2  w-full flex items-center justify-between">
                  {/* Quick Date Range */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-bold text-slate-700 ">
                      Quick Range:
                    </label>
                    <select
                      onChange={(e) => {
                        const days = parseInt(e.target.value);
                        if (days === -1) {
                          setStartDate("");
                          setEndDate("");
                          return;
                        }
                        const today = new Date();
                        const past = new Date(today);
                        past.setDate(today.getDate() - days);
                        setStartDate(past.toISOString().split("T")[0]);
                        setEndDate(today.toISOString().split("T")[0]);
                      }}
                      className="px-4 py-2.5 text-slate-900 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white font-medium"
                      value={startDate === "" ? "-1" : "7"}
                    >
                      <option value="-1">Select range</option>
                      <option value="0">Today</option>
                      <option value="7">Last 7 Days</option>
                      <option value="30">Last Month</option>
                      <option value="90">Last 3 Months</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-bold text-slate-700">
                      Category:
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="px-4 py-2.5 max-w-72 text-slate-900 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all bg-white font-medium min-w-50"
                    >
                      <option value="all">All Categories</option>
                      {servicesData?.services?.map(
                        (item: { title: string; _id: string }) => (
                          <option key={item._id} value={item.title}>
                            {categoryMap[item.title] || item.title}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Custom Date Range */}
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm font-bold text-slate-700 ">
                      Custom Range:
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-4 py-2 border-2 border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium"
                      />
                      <span className="text-slate-500 font-bold">to</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-4 py-2 border-2 border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="py-16 bg-linear-to-br from-slate-50 via-white to-emerald-50 min-h-screen">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-md h-96 animate-pulse"
                />
              ))}
            </div>
          ) : groupedGalleryData?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <ImageIcon className="w-24 h-24 text-slate-300 mx-auto mb-6" />
              <p className="text-slate-500 text-xl font-bold">
                No gallery items found.
              </p>
              <p className="text-slate-400 mt-2">Try adjusting your filters.</p>
            </motion.div>
          ) : (
            <div className="space-y-16">
              {groupedGalleryData?.map(
                (group: GalleryGroup, groupIndex: number) => (
                  <motion.div
                    key={group.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    {/* Date Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="shrink-0">
                        <div className="bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          <div className="flex items-center">
                            <div className="text-lg font-black pr-1">
                              {new Date(group.fullDate).toLocaleDateString(
                                "en-US",
                                { weekday: "short" }
                              )}
                              ,
                            </div>
                            <div className="text-lg font-black">
                              {new Date(group.fullDate).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 h-1 bg-linear-to-r from-emerald-300 via-emerald-200 to-transparent rounded-full"></div>
                      <div className="text-sm font-bold text-slate-600 bg-slate-100 px-5 py-2.5 rounded-full shadow-sm">
                        {group.count} {group.count === 1 ? "Item" : "Items"}
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
                      {group.items.map((item: GalleryItem, index: number) => {
                        const files = item.files || [];
                        const title =
                          item.title ||
                          generateTitle(
                            item.category,
                            item.date || item.createdAt
                          );
                        const description =
                          item.description ||
                          generateDescription(item.category);
                        const hasVideo = files.some((f: GalleryFile) => {
                          const url = f.url.toLowerCase();
                          return (
                            f.type === "video" ||
                            url.match(/\.(mp4|webm|mov|avi)$/)
                          );
                        });

                        return (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.4 }}
                            whileHover={{ y: -8 }}
                            className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
                            onClick={() => {
                              if (!hasVideo) {
                                setSelectedItem(item);
                              }
                            }}
                          >
                            {/* Image/Video Carousel */}
                            <CardFileCarousel files={files} />

                            {/* Card Content */}
                            <div className="p-5 bg-white border-t-4 border-emerald-500">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <h3 className="text-lg font-black text-slate-900 line-clamp-2 flex-1 leading-tight">
                                  {title}
                                </h3>
                              </div>

                              <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                                {description}
                              </p>

                              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(
                                    item.date || item.createdAt
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>

                                <div className="flex items-center gap-2">
                                  {!hasVideo && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItem(item);
                                      }}
                                      className="p-2 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition-all duration-300 hover:scale-110"
                                      title="View Fullscreen"
                                    >
                                      <ZoomIn className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLike(item._id);
                                    }}
                                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                                      likedItems.has(item._id)
                                        ? "bg-red-100 text-red-500"
                                        : "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500"
                                    }`}
                                  >
                                    <Heart
                                      className="w-4 h-4"
                                      fill={
                                        likedItems.has(item._id)
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Multiple Files Badge */}
                            {files.length > 1 && (
                              <div className="absolute top-3 left-3 z-10 bg-emerald-500/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                <ImageIcon className="w-3.5 h-3.5 text-white" />
                                <span className="text-xs font-bold text-white">
                                  {files.length}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-6xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-50 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 hover:rotate-90 duration-300"
              >
                <X className="w-6 h-6 text-slate-900" />
              </button>

              {/* File Carousel */}
              <ModalFileCarousel files={selectedItem.files || []} />

              {/* Content */}
              <div className="p-8 bg-linear-to-br from-white to-slate-50">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="px-5 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    {categoryMap[selectedItem.category] ||
                      selectedItem.category}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold bg-slate-100 px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4" />
                    {new Date(
                      selectedItem.date || selectedItem.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                  {selectedItem.title ||
                    generateTitle(
                      selectedItem.category,
                      selectedItem.date || selectedItem.createdAt
                    )}
                </h2>

                <p className="text-slate-600 leading-relaxed font-medium text-lg mb-6">
                  {selectedItem.description ||
                    generateDescription(selectedItem.category)}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    onClick={() => handleLike(selectedItem._id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-md ${
                      likedItems.has(selectedItem._id)
                        ? "bg-linear-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
                        : "bg-slate-100 text-slate-700 hover:bg-linear-to-r hover:from-red-100 hover:to-pink-100 hover:text-red-600"
                    }`}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={
                        likedItems.has(selectedItem._id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                    {likedItems.has(selectedItem._id) ? "Liked" : "Like"}
                  </button>

                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <ImageIcon className="w-4 h-4" />
                    <span>
                      {selectedItem.files?.length || 0}{" "}
                      {selectedItem.files?.length === 1 ? "File" : "Files"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DefaultLayouts>
  );
};

export default GalleryPage;
