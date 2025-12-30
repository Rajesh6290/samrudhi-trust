"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import BackgroundSlider from "../components/BackgroundSlider";
import DefaultLayouts from "../layouts/DefaultLayouts";

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  image: string;
  images: string[];
  category: string;
  isActive: boolean;
  date: string;
  createdAt: string;
}

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
        setGalleryData(data.items || []);
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
    ...Array.from(new Set(galleryData.map((item) => item.category))),
  ];

  const filteredItems =
    selectedCategory === "All"
      ? galleryData
      : galleryData.filter((item) => item.category === selectedCategory);

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

  // Auto-rotating Image Carousel Component for cards
  const CardImageCarousel = ({ images }: { images: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (images.length > 1) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 3000); // Auto-rotate every 3 seconds

        return () => clearInterval(interval);
      }
    }, [images.length]);

    if (images.length === 0) return null;

    return (
      <div className="relative h-64 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              fill
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Image counter badge */}
        {images.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold z-10"
          >
            {currentIndex + 1} / {images.length}
          </motion.div>
        )}

        {/* Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, index) => (
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

  // Manual control Image Carousel for modal
  const ModalImageCarousel = ({ images }: { images: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = () => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrevious = () => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (images.length === 0) return null;

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
            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              fill
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        {images.length > 1 && (
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
              {currentIndex + 1} / {images.length}
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
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-xl shadow-md py-6 border-b border-emerald-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-500/50"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {category.replace("-", " ")}
              </motion.button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex flex-col gap-3">
            {/* Quick Date Filters */}
            <div className="flex flex-wrap justify-center items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Quick Filter:
              </span>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setStartDate(today);
                  setEndDate(today);
                }}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition-colors uppercase tracking-wide"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const threeDaysAgo = new Date(today);
                  threeDaysAgo.setDate(today.getDate() - 3);
                  setStartDate(threeDaysAgo.toISOString().split("T")[0]);
                  setEndDate(today.toISOString().split("T")[0]);
                }}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-bold transition-colors uppercase tracking-wide"
              >
                Last 3 Days
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const sevenDaysAgo = new Date(today);
                  sevenDaysAgo.setDate(today.getDate() - 7);
                  setStartDate(sevenDaysAgo.toISOString().split("T")[0]);
                  setEndDate(today.toISOString().split("T")[0]);
                }}
                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs font-bold transition-colors uppercase tracking-wide"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const oneMonthAgo = new Date(today);
                  oneMonthAgo.setMonth(today.getMonth() - 1);
                  setStartDate(oneMonthAgo.toISOString().split("T")[0]);
                  setEndDate(today.toISOString().split("T")[0]);
                }}
                className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-xs font-bold transition-colors uppercase tracking-wide"
              >
                Last Month
              </button>
            </div>

            {/* Custom Date Range */}
            <div className="flex flex-wrap justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  From:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 border-2 border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  style={{ colorScheme: "light" }}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  To:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 border-2 border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  style={{ colorScheme: "light" }}
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
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
                const allImages = [item.image, ...(item.images || [])].filter(
                  Boolean
                );

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Image Carousel */}
                    <CardImageCarousel images={allImages} />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                          {item.category.replace("-", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Multiple Images Indicator */}
                    {allImages.length > 1 && (
                      <div className="absolute top-4 right-4 z-10 bg-orange-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white">
                          {allImages.length}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative p-5 bg-white">
                      <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-1 uppercase tracking-wider">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2 font-medium">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <Calendar className="w-4 h-4" />
                          {new Date(item.date).toLocaleDateString("en-US", {
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
                          className={`p-2 rounded-full transition-all ${
                            likedItems.has(item._id)
                              ? "bg-red-100 text-red-500"
                              : "bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={
                              likedItems.has(item._id) ? "currentColor" : "none"
                            }
                          />
                        </button>
                      </div>
                    </div>
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

              {/* Image Carousel */}
              <ModalImageCarousel
                images={[
                  selectedItem.image,
                  ...(selectedItem.images || []),
                ].filter(Boolean)}
              />

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                    {selectedItem.category.replace("-", " ")}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedItem.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-wider">
                  {selectedItem.title}
                </h2>

                {selectedItem.description && (
                  <p className="text-slate-600 leading-relaxed font-medium text-lg">
                    {selectedItem.description}
                  </p>
                )}

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
