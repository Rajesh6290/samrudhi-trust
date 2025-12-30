"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryImage {
  _id: string;
  image: string;
  category: string;
  title: string;
  createdAt: string;
}

const categoryMap: Record<string, string> = {
  "food-rescue": "Food Distribution",
  "blood-donation": "Blood Donation",
  "child-welfare": "Child Welfare",
  events: "Events",
  other: "Other",
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
        setGalleryImages(data.items || []);
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
        galleryImages?.map((img) => categoryMap[img.category] || img.category)
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {displayedImages.map((image, index) => (
                <motion.div
                  key={image._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedImage(image._id)}
                  className="group relative aspect-4/3 rounded-3xl overflow-hidden cursor-pointer bg-slate-200 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                >
                  <Image
                    src={image.image}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-orange-400 text-xs font-bold uppercase tracking-wider block mb-1">
                      {categoryMap[image.category] || image.category}
                    </span>
                    <h3 className="text-white text-lg font-bold leading-tight">
                      {image.title}
                    </h3>
                  </div>

                  {/* Zoom Icon Button */}
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ZoomIn className="text-white w-5 h-5" />
                  </div>
                </motion.div>
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
            // FIX: Added high Z-index to ensure it sits above navbar
            className=" fixed inset-0 z-100 bg-slate-950/95 backdrop-blur-sm flex items-center mt-16 justify-center p-4 md:p-8"
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
              {/* FIX: Close Button moved INSIDE safe area and styled better */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 md:top-4 md:right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md group"
              >
                <X
                  size={24}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
              </button>

              {/* FIX: Image Container - switched to viewport height based sizing (vh) */}
              <div className="relative w-full h-[60vh] md:h-[75vh] rounded-2xl overflow-hidden bg-black/50 shadow-2xl border border-white/10">
                <Image
                  src={selectedImageData.image}
                  alt={selectedImageData.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Bottom Info Bar */}
              <div className="mt-6 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                <div>
                  <span className="text-orange-400 text-xs font-bold uppercase tracking-wider">
                    {categoryMap[selectedImageData.category] ||
                      selectedImageData.category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold mt-1">
                    {selectedImageData.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
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

              {/* Navigation Buttons (Floating) */}
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
