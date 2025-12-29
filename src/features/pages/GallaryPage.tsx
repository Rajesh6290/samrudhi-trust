"use client";
import React, { useState } from "react";
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
  id: number;
  type: "image" | "video";
  src: string;
  thumbnail: string;
  title: string;
  category: string;
  date: string;
  likes: number;
}

const galleryData: GalleryItem[] = [
  // Food Distribution
  {
    id: 1,
    type: "image",
    src: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800",
    thumbnail:
      "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=400",
    title: "Community Food Distribution Drive",
    category: "Food Distribution",
    date: "Dec 2024",
    likes: 245,
  },
  {
    id: 2,
    type: "image",
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
    thumbnail:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
    title: "Feeding the Underprivileged",
    category: "Food Distribution",
    date: "Nov 2024",
    likes: 189,
  },
  // Blood Donation
  {
    id: 3,
    type: "image",
    src: "https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800",
    thumbnail:
      "https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=400",
    title: "Annual Blood Donation Camp",
    category: "Blood Donation",
    date: "Dec 2024",
    likes: 312,
  },
  {
    id: 4,
    type: "video",
    src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=400",
    title: "Life-Saving Blood Drive",
    category: "Blood Donation",
    date: "Oct 2024",
    likes: 456,
  },
  // Child Welfare
  {
    id: 5,
    type: "image",
    src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
    thumbnail:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400",
    title: "Children's Education Program",
    category: "Child Welfare",
    date: "Nov 2024",
    likes: 523,
  },
  {
    id: 6,
    type: "image",
    src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800",
    thumbnail:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
    title: "Joy of Learning",
    category: "Child Welfare",
    date: "Dec 2024",
    likes: 398,
  },
  // Community Events
  {
    id: 7,
    type: "video",
    src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400",
    title: "Community Awareness Event",
    category: "Events",
    date: "Nov 2024",
    likes: 267,
  },
  {
    id: 8,
    type: "image",
    src: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
    thumbnail:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400",
    title: "Volunteer Team Building",
    category: "Events",
    date: "Oct 2024",
    likes: 445,
  },
  // Healthcare
  {
    id: 9,
    type: "image",
    src: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=800",
    thumbnail:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400",
    title: "Free Health Checkup Camp",
    category: "Healthcare",
    date: "Dec 2024",
    likes: 334,
  },
  {
    id: 10,
    type: "image",
    src: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800",
    thumbnail:
      "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400",
    title: "Medical Assistance Drive",
    category: "Healthcare",
    date: "Nov 2024",
    likes: 289,
  },
  // Women Empowerment
  {
    id: 11,
    type: "image",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
    thumbnail:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    title: "Women Skill Development",
    category: "Women Empowerment",
    date: "Dec 2024",
    likes: 412,
  },
  {
    id: 12,
    type: "video",
    src: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail:
      "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400",
    title: "Empowering Women Leaders",
    category: "Women Empowerment",
    date: "Nov 2024",
    likes: 378,
  },
];

const categories = [
  "All",
  ...Array.from(new Set(galleryData.map((item) => item.category))),
];

const GallaryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const filteredItems =
    selectedCategory === "All"
      ? galleryData
      : galleryData.filter((item) => item.category === selectedCategory);

  const handleLike = (id: number) => {
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
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-500/50"
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
      <section className="py-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
                onClick={() => setSelectedItem(item)}
              >
                {/* Image/Video Thumbnail */}
                <div className="relative h-64 overflow-hidden bg-slate-200">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Video Indicator */}
                  {item.type === "video" && (
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
                      {item.type === "video" ? (
                        <Video className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                      )}
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        {item.type}
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
                      <span className="font-medium">{item.date}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(item.id);
                      }}
                      className="flex items-center gap-1 hover:scale-110 transition-transform"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          likedItems.has(item.id)
                            ? "fill-red-500 text-red-500"
                            : "text-slate-400"
                        }`}
                      />
                      <span className="font-bold text-slate-600">
                        {item.likes + (likedItems.has(item.id) ? 1 : 0)}
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
            ))}
          </div>
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
              {selectedItem.type === "video" ? (
                <div className="aspect-video">
                  <iframe
                    src={selectedItem.src}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedItem.title}
                  />
                </div>
              ) : (
                <div className="relative aspect-video">
                  <Image
                    src={selectedItem.src}
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
                      {selectedItem.date}
                    </span>
                    <span className="inline-block px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold">
                      {selectedItem.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(selectedItem.id);
                  }}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all hover:scale-110"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      likedItems.has(selectedItem.id)
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    }`}
                  />
                  <span className="font-bold">
                    {selectedItem.likes +
                      (likedItems.has(selectedItem.id) ? 1 : 0)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 py-20">
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
