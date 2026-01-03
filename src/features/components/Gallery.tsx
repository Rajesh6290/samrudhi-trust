"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Grid,
  Play,
  Pause,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface GalleryFile {
  id: string;
  url: string;
  type: string;
}

interface GalleryImage {
  _id: string;
  title: string;
  description?: string;
  files: GalleryFile[];
  category: string;
  createdAt: string;
  date: string;
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

// Lightbox Carousel Component for viewing multiple files in modal
const LightboxCarousel = ({ item }: { item: GalleryImage }) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const files = item.files || [];
  const currentFile = files[currentFileIndex];

  const handleNextFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length > 1) {
      setCurrentFileIndex((prev) => (prev + 1) % files.length);
    }
  };

  const handlePrevFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length > 1) {
      setCurrentFileIndex((prev) => (prev - 1 + files.length) % files.length);
    }
  };

  const getFileType = (file: GalleryFile) => {
    const url = file.url.toLowerCase();
    if (file.type === "video" || url.match(/\.(mp4|webm|mov|avi)$/))
      return "video";
    if (file.type === "pdf" || url.match(/\.pdf$/)) return "pdf";
    return "image";
  };

  const fileType = currentFile ? getFileType(currentFile) : "image";

  return (
    <>
      <div className="relative w-full h-[60vh] md:h-[75vh] rounded-2xl overflow-hidden bg-black/50 shadow-2xl border border-white/10">
        {currentFile && fileType === "video" ? (
          <video
            src={currentFile.url}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          />
        ) : currentFile && fileType === "pdf" ? (
          <div className="w-full h-full bg-white">
            <iframe
              src={`${currentFile.url}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              title="PDF Viewer"
              allowFullScreen
            />
          </div>
        ) : (
          currentFile && (
            <Image
              src={currentFile.url}
              alt={item.title || "Gallery image"}
              fill
              className="object-contain"
              priority
            />
          )
        )}

        {/* File Navigation - Show only if multiple files */}
        {files.length > 1 && (
          <>
            <button
              onClick={handlePrevFile}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full transition-all z-10"
            >
              <ChevronLeft className="text-white w-6 h-6" />
            </button>
            <button
              onClick={handleNextFile}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full transition-all z-10"
            >
              <ChevronRight className="text-white w-6 h-6" />
            </button>

            {/* File Counter */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-mono">
              {currentFileIndex + 1} / {files.length}
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {files?.map((file, idx) => (
                <button
                  key={file.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentFileIndex(idx);
                  }}
                  className={`transition-all ${
                    idx === currentFileIndex
                      ? "bg-orange-500 w-8 h-2"
                      : "bg-white/50 hover:bg-white/70 w-2 h-2"
                  } rounded-full`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

const Gallery: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery");
      if (response.ok) {
        const data = await response.json();
        // Process items to ensure they have files array
        const processedItems = (data.items || []).map((item: any) => {
          // Handle backward compatibility with single image field
          if (!item.files && item.image) {
            return {
              ...item,
              files: [
                {
                  id: item._id,
                  url: item.image,
                  type:
                    item.image.includes("video") ||
                    item.image.match(/\.(mp4|webm|mov)$/i)
                      ? "video"
                      : "image",
                },
              ],
            };
          }
          return item;
        });
        setGalleryImages(processedItems);
      }
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedImage !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedImage]);

  const categories = [
    "All",
    ...Array.from(
      new Set(
        galleryImages
          ?.map((img) => categoryMap[img.category] || img.category)
          .filter((cat) => cat.toLowerCase() !== "all")
      )
    ),
  ];

  const filteredImages = galleryImages?.filter(
    (img) =>
      selectedCategory === "All" ||
      categoryMap[img.category] === selectedCategory ||
      img.category === selectedCategory
  );

  const displayedImages = showAll
    ? filteredImages
    : filteredImages?.slice(0, 6);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null) {
      const currentIndex = filteredImages.findIndex(
        (img) => img._id === selectedImage
      );
      const nextIndex = (currentIndex + 1) % filteredImages.length;
      setSelectedImage(filteredImages[nextIndex]._id);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null) {
      const currentIndex = filteredImages.findIndex(
        (img) => img._id === selectedImage
      );
      const prevIndex =
        (currentIndex - 1 + filteredImages.length) % filteredImages.length;
      setSelectedImage(filteredImages[prevIndex]._id);
    }
  };

  const selectedImageData = filteredImages?.find(
    (img) => img._id === selectedImage
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-200 animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="h-3 bg-slate-300 rounded w-1/3 mb-2" />
        <div className="h-4 bg-slate-300 rounded w-2/3" />
      </div>
    </div>
  );

  // Card Carousel Component for multiple files
  const CardCarousel = ({
    item,
    index,
  }: {
    item: GalleryImage;
    index: number;
  }) => {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const files = item.files || [];
    const currentFile = files[currentFileIndex];

    const title =
      item.title || generateTitle(item.category, item.date || item.createdAt);
    const description = item.description || generateDescription(item.category);

    const handleNext = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (files.length > 1) {
        setCurrentFileIndex((prev) => (prev + 1) % files.length);
        setIsVideoPlaying(false);
      }
    };

    const handlePrev = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (files.length > 1) {
        setCurrentFileIndex((prev) => (prev - 1 + files.length) % files.length);
        setIsVideoPlaying(false);
      }
    };

    const handleVideoClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (videoRef.current) {
        if (isVideoPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsVideoPlaying(!isVideoPlaying);
      }
    };

    const getFileType = (file: GalleryFile) => {
      const url = file.url.toLowerCase();
      if (file.type === "video" || url.match(/\.(mp4|webm|mov|avi)$/))
        return "video";
      if (file.type === "pdf" || url.match(/\.pdf$/)) return "pdf";
      return "image";
    };

    const fileType = currentFile ? getFileType(currentFile) : "image";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        onClick={() => setSelectedImage(item._id)}
        className="group relative  h-104 rounded-3xl overflow-hidden cursor-pointer bg-slate-200 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
      >
        {/* File Display - Video, Image or PDF */}
        {currentFile && fileType === "video" ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={currentFile.url}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
            {/* Play/Pause Overlay */}
            <div
              onClick={handleVideoClick}
              className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${
                isVideoPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
              }`}
            >
              <div className="bg-orange-500/90 hover:bg-orange-400 p-4 rounded-full transition-all">
                {isVideoPlaying ? (
                  <Pause size={24} className="text-white" />
                ) : (
                  <Play size={24} className="text-white ml-1" fill="white" />
                )}
              </div>
            </div>
          </div>
        ) : currentFile && fileType === "pdf" ? (
          <div className="w-full h-full bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-500 text-white rounded-2xl p-6 inline-block mb-4">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18.5,9H13V3.5L18.5,9M6,20V4H12V10H18V20H6Z" />
                </svg>
              </div>
              <p className="text-slate-700 font-bold text-lg">PDF Document</p>
              <p className="text-slate-500 text-sm mt-1">Click to view</p>
            </div>
          </div>
        ) : (
          currentFile && (
            <Image
              src={currentFile.url}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )
        )}

        {/* File Type Indicator */}
        {currentFile && fileType === "video" && !isVideoPlaying && (
          <div className="absolute top-4 left-4 bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 z-10">
            <Play size={12} fill="white" />
            VIDEO
          </div>
        )}
        {currentFile && fileType === "pdf" && (
          <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2Z" />
            </svg>
            PDF
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-100 transition-opacity duration-300" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-0 transition-transform duration-300">
          <span className="text-orange-500 text-xs font-bold uppercase tracking-wider block mb-1">
            {categoryMap[item.category] || item.category}
          </span>
          <h3 className="text-white text-lg font-bold leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-slate-300 text-sm mt-1 line-clamp-1">
            {description}
          </p>
        </div>

        {/* Carousel Navigation - Show only if multiple files */}
        {files.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronLeft className="text-white w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronRight className="text-white w-5 h-5" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {files.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentFileIndex
                      ? "bg-orange-500 w-4"
                      : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Zoom Icon Button */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ZoomIn className="text-white w-5 h-5" />
        </div>
      </motion.div>
    );
  };

  return (
    <section id="gallery" className="py-24 md:py-32 bg-slate-50 relative z-0">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <span className="text-orange-500 font-bold uppercase tracking-widest text-sm mb-3 block">
              Visual Stories
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Moments That Matter
            </h2>
            <p className="text-slate-600 mt-4 text-lg">
              Witness the ground realities and impact of our work across
              communities.
            </p>
          </motion.div>

          {/* View All Button (Toggles Grid Expansion) */}
          {!showAll && filteredImages?.length > 6 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              onClick={() => setShowAll(true)}
              className="hidden md:flex bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-6 py-3 rounded-full font-bold text-sm tracking-wide transition-all shadow-sm hover:shadow-md items-center gap-2"
            >
              View Full Gallery <Grid size={16} />
            </motion.button>
          )}
        </div>

        {/* Category Filter Tabs */}
        {!loading && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setShowAll(false);
                }}
                className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* No Images */}
        {!loading && galleryImages?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Grid className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">
              No Images Yet
            </h3>
            <p className="text-slate-600 font-medium">
              Check back soon for gallery updates
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && displayedImages?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
            <AnimatePresence mode="popLayout">
              {displayedImages.map((image, index) => (
                <CardCarousel key={image._id} item={image} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Mobile View All Button */}
        {!showAll && filteredImages?.length > 6 && (
          <div className="mt-12 text-center md:hidden">
            <button
              onClick={() => setShowAll(true)}
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold w-full shadow-xl"
            >
              View All Photos
            </button>
          </div>
        )}
      </div>

      {/* --- Lightbox / Dialog Modal --- */}
      <AnimatePresence>
        {selectedImage !== null && selectedImageData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-slate-950/95 backdrop-blur-sm flex items-center mt-16 justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            {/* Modal Content Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 md:top-4 md:right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md group"
              >
                <X
                  size={24}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>

              {/* File Container - Handle multiple files with carousel */}
              <LightboxCarousel item={selectedImageData} />

              {/* Bottom Info Bar */}
              <div className="mt-6 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                <div>
                  <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">
                    {categoryMap[selectedImageData.category] ||
                      selectedImageData.category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">
                    {selectedImageData.title ||
                      generateTitle(
                        selectedImageData.category,
                        selectedImageData.date || selectedImageData.createdAt
                      )}
                  </h3>
                  <p className="text-slate-400 text-sm mt-2">
                    {selectedImageData.description ||
                      generateDescription(selectedImageData.category)}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    {formatDate(selectedImageData.createdAt)}
                  </p>
                </div>

                {/* Counter Badge */}
                <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm font-mono font-medium">
                  {filteredImages.findIndex(
                    (img) => img._id === selectedImage
                  ) + 1}
                  <span className="text-slate-500 mx-2">/</span>
                  {filteredImages.length}
                </div>
              </div>

              {/* Navigation Buttons (Floating) - Navigate between gallery items */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 md:px-0">
                <button
                  onClick={handlePrevious}
                  className="pointer-events-auto p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all hover:scale-110 -ml-2 md:-ml-16"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={handleNext}
                  className="pointer-events-auto p-3 md:p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all hover:scale-110 -mr-2 md:-mr-16"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
