"use client";
import React, { useState, useEffect } from "react";
import DefaultLayouts from "../layouts/DefaultLayouts";
import BackgroundSlider from "../components/BackgroundSlider";
import {
  X,
  Play,
  Image as ImageIcon,
  Video,
  Heart,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  image: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

const GallaryPage = () => {
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch("/api/gallery");
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
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wider uppercase">
                Our Journey
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Gallery of <span className="text-orange-400">Impact</span>
            </h1>

            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Witness the moments that matter. Explore our collection of photos
              and videos showcasing our initiatives and the lives {"we've"}{" "}
              touched.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-xl shadow-md py-6 border-b border-emerald-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                    px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider
                    transition-all duration-300 hover:scale-105 active:scale-95 shadow-md
                    ${
                      selectedCategory === category
                        ? "bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-500/50"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }
                  `}
              >
                {category}
              </button>
            ))}
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
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">
                No gallery items available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => {
                const isVideo =
                  item.image &&
                  (item.image.includes(".mp4") ||
                    item.image.includes(".mov") ||
                    item.image.includes(".webm") ||
                    item.image.includes("video"));

                return (
                  <div
                    key={item._id}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Image/Video Thumbnail */}
                    <div className="relative h-64 overflow-hidden bg-slate-200">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Video Indicator */}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                            <Play
                              className="w-8 h-8 text-emerald-600 ml-1"
                              fill="currentColor"
                            />
                          </div>
                        </div>
                      )}

                      {/* Type Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                          {isVideo ? (
                            <Video className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-emerald-600" />
                          )}
                          <span className="text-xs font-bold text-slate-700 uppercase">
                            {isVideo ? "video" : "image"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item._id);
                          }}
                          className="flex items-center gap-1 hover:scale-110 transition-transform"
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              likedItems.has(item._id)
                                ? "fill-red-500 text-red-500"
                                : "text-slate-400"
                            }`}
                          />
                          <span className="font-bold text-slate-600">
                            {likedItems.has(item._id) ? 1 : 0}
                          </span>
                        </button>
                      </div>

                      <div className="mt-3">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div
            className="max-w-6xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Content */}
            <div className="relative bg-black">
              {selectedItem.image &&
              (selectedItem.image.includes(".mp4") ||
                selectedItem.image.includes(".mov") ||
                selectedItem.image.includes(".webm") ||
                selectedItem.image.includes("video")) ? (
                <div className="aspect-video">
                  <video
                    src={selectedItem.image}
                    controls
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="relative aspect-video">
                  <Image
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8 text-white">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-3xl font-black mb-2">
                    {selectedItem.title}
                  </h2>
                  <div className="flex items-center gap-4 text-slate-300">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedItem.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                    <span className="inline-block px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
                      {selectedItem.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(selectedItem._id);
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all hover:scale-110"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedItems.has(selectedItem._id)
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    }`}
                  />
                  <span className="font-bold">
                    {likedItems.has(selectedItem._id) ? 1 : 0}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="bg-linear-to-r from-emerald-600 to-emerald-800 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-6">
            Be Part of Our Story
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join us in creating more moments that matter. Volunteer, donate, or
            simply spread the word.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 shadow-2xl active:scale-95"
            >
              Get Involved
            </a>
            <Link
              href="/"
              className="inline-block bg-white hover:bg-slate-50 text-emerald-700 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:scale-105 shadow-2xl active:scale-95"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </DefaultLayouts>
  );
};

export default GallaryPage;
