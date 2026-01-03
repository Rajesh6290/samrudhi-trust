"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  Heart,
  BookOpen,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import BackgroundSlider from "../components/BackgroundSlider";
import useSwr from "../hooks/useSwr";
import DefaultLayouts from "../layouts/DefaultLayouts";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  status: string;
  isActive: string;
  views: number;
  likes: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Background images for slider
  const backgroundImages = [
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920",
    "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=1920",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1920",
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1920",
  ];

  // Fetch all published blogs
  const { data, isLoading } = useSwr("blogs?active=true");
  const blogs: Blog[] = data?.blogs || [];
  const categories: string[] = data?.categories || [];
  const allTags: string[] = data?.tags || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || blog.category === selectedCategory;

    const matchesTag = !selectedTag || blog.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  // Get featured blog (most viewed)
  const featuredBlog =
    blogs.length > 0
      ? blogs.reduce((prev, current) =>
          prev.views > current.views ? prev : current
        )
      : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <DefaultLayouts>
      <div className="min-h-screen bg-linear-to-b from-blue-50 via-white to-gray-50">
        {/* Hero Section with Background Slider */}
        <section className="relative text-white py-24 overflow-hidden">
          <BackgroundSlider
            images={backgroundImages}
            duration={6000}
            effect="fade-zoom"
            overlayOpacity="bg-blue-950/80"
          />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Our Blog & Stories
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Discover inspiring stories, insights, and updates about our work
                and the communities we serve
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto relative">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search articles, topics, tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="mt-6 flex items-center gap-2 mx-auto px-6 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                <Filter size={18} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </motion.div>
          </div>
        </section>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-b shadow-sm overflow-hidden"
            >
              <div className="container mx-auto px-4 py-6">
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCategory === "all"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedCategory === category
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Popular Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTag && (
                        <button
                          onClick={() => setSelectedTag(null)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1 hover:bg-red-200"
                        >
                          Clear Tag
                          <X size={14} />
                        </button>
                      )}
                      {allTags.slice(0, 20).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedTag === tag
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4 py-16">
          {/* Featured Blog */}
          {featuredBlog &&
            !searchQuery &&
            selectedCategory === "all" &&
            !selectedTag && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16"
              >
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="text-yellow-500" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Featured Article
                  </h2>
                </div>
                <Link href={`/blog/${featuredBlog.slug}`}>
                  <div className="relative group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Image */}
                      <div className="relative h-80 md:h-full">
                        <Image
                          src={featuredBlog.coverImage}
                          alt={featuredBlog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent md:hidden"></div>
                      </div>

                      {/* Content */}
                      <div className="p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="px-4 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full font-semibold">
                            Featured
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md font-medium">
                            {featuredBlog.category}
                          </span>
                        </div>

                        <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                          {featuredBlog.title}
                        </h3>

                        <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                          {featuredBlog.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                          <div className="flex items-center gap-2">
                            {featuredBlog.author.avatar ? (
                              <Image
                                src={featuredBlog.author.avatar}
                                alt={featuredBlog.author.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                {featuredBlog.author.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-gray-700">
                              {featuredBlog.author.name}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {formatDate(featuredBlog.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {featuredBlog.readTime} min read
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={16} />
                            {featuredBlog.views} views
                          </span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {featuredBlog.tags.slice(0, 4).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery || selectedCategory !== "all" || selectedTag
                ? `${filteredBlogs.length} Results`
                : "Latest Articles"}
            </h2>
            <span className="text-gray-600">
              {filteredBlogs.length}{" "}
              {filteredBlogs.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading articles...</p>
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredBlogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedTag(null);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}

          {/* Blog Grid */}
          {!isLoading && filteredBlogs.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredBlogs.map((blog) => (
                <motion.div key={blog._id} variants={itemVariants}>
                  <Link href={`/blog/${blog.slug}`}>
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col group">
                      {/* Cover Image */}
                      <div className="relative h-56 overflow-hidden">
                        <Image
                          src={blog.coverImage}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-sm rounded-md font-medium shadow-lg">
                            {blog.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {blog.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                          {blog.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="px-2 py-1 text-gray-400 text-xs">
                              +{blog.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            {blog.author.avatar ? (
                              <Image
                                src={blog.author.avatar}
                                alt={blog.author.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                                {blog.author.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-gray-700">
                              {blog.author.name}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {blog.readTime} min
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(blog.createdAt)}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye size={14} />
                              {blog.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart size={14} />
                              {blog.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </DefaultLayouts>
  );
};

export default BlogPage;
