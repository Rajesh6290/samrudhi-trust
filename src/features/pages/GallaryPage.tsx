"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  X,
  Play,
  Filter,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import BackgroundSlider from "../components/BackgroundSlider";
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

const categoryMap: Record<string, string> = {
  "food-rescue": "Food Distribution",
  "blood-donation": "Blood Donation",
  "child-welfare": "Child Welfare",
  events: "Events",
  other: "Other",
};

// Auto-generate title based on category
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

// Auto-generate description based on category
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

const GallaryPage = () => {
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchGallery = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const url = params.toString()
        ? `/api/gallery?${params.toString()}`
        : "/api/gallery";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Process items to ensure they have files array
        const processedItems = (data.items || []).map((item: any) => {
          // Handle backward compatibility with single image field
          if (!item.files && item.image) {
            const images = [item.image, ...(item.images || [])].filter(Boolean);
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
        });
        setGalleryData(processedItems);
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const categories = [
    "All",
    ...Array.from(
      new Set(
        galleryData
          .map((item) => categoryMap[item.category] || item.category)
          .filter((cat) => cat.toLowerCase() !== "all")
      )
    ),
  ];

  const filteredItems =
    selectedCategory === "All"
      ? galleryData
      : galleryData.filter(
          (item) =>
            (categoryMap[item.category] || item.category) === selectedCategory
        );

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

  // Auto-rotating File Carousel Component for cards
  const CardFileCarousel = ({
    files,
  }: {
    files: GalleryFile[];
    onVideoClick?: (e: React.MouseEvent) => void;
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (files.length > 1 && !isVideoPlaying) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % files.length);
        }, 3000);

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
      <div className="relative h-80 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7 }}
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
                {/* Video Overlay with Play Button */}
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                    isVideoPlaying
                      ? "opacity-0 hover:opacity-100"
                      : "opacity-100"
                  }`}
                >
                  <div className="bg-orange-500 hover:bg-orange-600 rounded-full p-4 transition-all transform hover:scale-110 shadow-2xl">
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
                  <div className="bg-red-500 text-white rounded-2xl p-4 inline-block mb-2">
                    <svg
                      className="w-12 h-12"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H12V10H18V20H6Z" />
                    </svg>
                  </div>
                  <p className="text-slate-700 font-bold text-sm">
                    PDF Document
                  </p>
                </div>
              </div>
            ) : (
              <Image
                src={currentFile.url}
                alt={`File ${currentIndex + 1}`}
                fill
                className="object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* File counter badge */}
        {files.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold z-10"
          >
            {currentIndex + 1} / {files.length}
          </motion.div>
        )}

        {/* Indicators */}
        {files.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {files.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "bg-white w-8" : "bg-white/50 w-1.5"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Manual control File Carousel for modal
  const ModalFileCarousel = ({ files }: { files: GalleryFile[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = () => {
      setCurrentIndex((prev) => (prev + 1) % files.length);
    };

    const goToPrevious = () => {
      setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    };

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

        {/* Navigation buttons */}
        {files.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 z-10"
            >
              <ChevronLeft className="w-6 h-6 text-slate-900" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 z-10"
            >
              <ChevronRight className="w-6 h-6 text-slate-900" />
            </button>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold z-10">
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
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase">
                Our Journey
              </span>
            </div>

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

      {/* Category Filter */}
      <div className="sticky top-20 z-40 bg-white shadow-md border-b border-emerald-200">
        <div className="container mx-auto px-4 md:px-6 py-4">
          {/* Category Pills */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-2">
              <Filter className="w-4 h-4" />
              <span>Categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 md:px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-300"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div className="border-t border-slate-200 pt-3">
            {/* Quick Date Filters + Custom Range in one row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Date:</span>
              </div>

              <button
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setStartDate(today);
                  setEndDate(today);
                }}
                className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-md text-xs font-bold transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const sevenDaysAgo = new Date(today);
                  sevenDaysAgo.setDate(today.getDate() - 7);
                  setStartDate(sevenDaysAgo.toISOString().split("T")[0]);
                  setEndDate(today.toISOString().split("T")[0]);
                }}
                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-xs font-bold transition-colors"
              >
                Last 7D
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const oneMonthAgo = new Date(today);
                  oneMonthAgo.setMonth(today.getMonth() - 1);
                  setStartDate(oneMonthAgo.toISOString().split("T")[0]);
                  setEndDate(today.toISOString().split("T")[0]);
                }}
                className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md text-xs font-bold transition-colors"
              >
                30D
              </button>

              <div className="h-5 w-px bg-slate-300 mx-1"></div>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="From"
                className="px-3 py-1 border border-slate-300 rounded-md text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                style={{ colorScheme: "light" }}
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="To"
                className="px-3 py-1 border border-slate-300 rounded-md text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                style={{ colorScheme: "light" }}
              />

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="py-16 bg-linear-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg h-96 animate-pulse"
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <ImageIcon className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-bold">
                No gallery items available.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => {
                const files = item.files || [];
                const title =
                  item.title ||
                  generateTitle(item.category, item.date || item.createdAt);
                const description =
                  item.description || generateDescription(item.category);
                const hasVideo = files.some((f) => {
                  const url = f.url.toLowerCase();
                  return (
                    f.type === "video" || url.match(/\.(mp4|webm|mov|avi)$/)
                  );
                });

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                      hasVideo
                        ? "ring-2 ring-orange-300"
                        : "bg-white cursor-pointer"
                    }`}
                    onClick={() => {
                      // Only open modal for non-video items
                      if (!hasVideo) {
                        setSelectedItem(item);
                      }
                    }}
                  >
                    {/* File Carousel */}
                    <CardFileCarousel files={files} />

                    {hasVideo ? (
                      // Video Card - Full height with overlay info
                      <>
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                        {/* Video Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 pointer-events-none">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-lg font-black text-white line-clamp-2 tracking-wide flex-1 drop-shadow-lg">
                              {title}
                            </h3>
                            <div className="flex-shrink-0 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                              VIDEO
                            </div>
                          </div>

                          <p className="text-sm text-white/90 mb-3 line-clamp-2 font-medium drop-shadow-md">
                            {description}
                          </p>

                          <div className="flex items-center justify-between pointer-events-auto">
                            <div className="flex items-center gap-2 text-xs text-white/80 font-medium bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                              <Calendar className="w-4 h-4" />
                              {new Date(
                                item.date || item.createdAt
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(item._id);
                              }}
                              className={`p-2 rounded-full transition-all backdrop-blur-sm ${
                                likedItems.has(item._id)
                                  ? "bg-red-500 text-white shadow-lg"
                                  : "bg-white/20 text-white hover:bg-red-500 hover:text-white"
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

                        {/* Multiple Files Indicator */}
                        {files.length > 1 && (
                          <div className="absolute top-4 right-4 z-10 bg-orange-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                            <ImageIcon className="w-3 h-3 text-white" />
                            <span className="text-xs font-bold text-white">
                              {files.length}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      // Image Card - Keep white card at bottom
                      <>
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Multiple Files Indicator */}
                        {files.length > 1 && (
                          <div className="absolute top-4 right-4 z-10 bg-orange-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <ImageIcon className="w-3 h-3 text-white" />
                            <span className="text-xs font-bold text-white">
                              {files.length}
                            </span>
                          </div>
                        )}

                        {/* Content - White Card at Bottom */}
                        <div className="relative p-5 bg-white border-t-4 border-emerald-500">
                          <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-2 tracking-wide">
                            {title}
                          </h3>

                          <p className="text-sm text-slate-600 mb-3 line-clamp-2 font-medium">
                            {description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem(item);
                                }}
                                className="p-2 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 transition-all"
                                title="View Fullscreen"
                              >
                                <ZoomIn className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(item._id);
                                }}
                                className={`p-2 rounded-full transition-all ${
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
                      </>
                    )}
                  </motion.div>
                );
              })}
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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-6xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-50 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              >
                <X className="w-6 h-6 text-slate-900" />
              </button>

              {/* File Carousel */}
              <ModalFileCarousel files={selectedItem.files || []} />

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {categoryMap[selectedItem.category] ||
                      selectedItem.category}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
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

                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-wide">
                  {selectedItem.title ||
                    generateTitle(
                      selectedItem.category,
                      selectedItem.date || selectedItem.createdAt
                    )}
                </h2>

                <p className="text-slate-600 leading-relaxed font-medium text-lg">
                  {selectedItem.description ||
                    generateDescription(selectedItem.category)}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => handleLike(selectedItem._id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                      likedItems.has(selectedItem._id)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-500"
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
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DefaultLayouts>
  );
};

export default GallaryPage;
