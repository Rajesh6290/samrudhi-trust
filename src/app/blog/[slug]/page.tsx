"use client";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ArrowLeft,
  BookOpen,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSwr from "@/features/hooks/useSwr";
import useMutation from "@/features/hooks/useMutation";
import DefaultLayouts from "@/features/layouts/DefaultLayouts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Swal from "sweetalert2";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  images: string[];
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

export default function BlogPost() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(0);

  const { mutation } = useMutation();

  // Fetch current blog
  const { data: blogData, isLoading } = useSwr(
    slug ? `blogs?slug=${slug}` : null
  );
  const blog: Blog | null = blogData?.blog || null;

  // Fetch related blogs
  const { data: relatedData } = useSwr(
    blog ? `blogs?active=true&category=${blog.category}` : null
  );
  const allBlogs: Blog[] = relatedData?.blogs || [];
  const relatedBlogs = allBlogs.filter((b) => b._id !== blog?._id).slice(0, 3);

  useEffect(() => {
    if (blog) {
      // Check if user has liked this blog (localStorage)
      const likedBlogs = JSON.parse(localStorage.getItem("likedBlogs") || "[]");
      const liked = likedBlogs.includes(blog._id);
      setHasLiked(liked);
      setCurrentLikes(blog.likes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog?._id, blog?.likes]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleLike = async () => {
    if (!blog || hasLiked) return;

    try {
      const res = await mutation(`blogs/${blog._id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "like" }),
        isAlert: false,
      });

      if (res?.status === 200) {
        setCurrentLikes((prev) => prev + 1);
        setHasLiked(true);

        // Save to localStorage
        const likedBlogs = JSON.parse(
          localStorage.getItem("likedBlogs") || "[]"
        );
        likedBlogs.push(blog._id);
        localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs));

        Swal.fire({
          icon: "success",
          title: "Thank you!",
          text: "You liked this article",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = blog?.title || "";

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      Swal.fire({
        icon: "success",
        title: "Link Copied!",
        text: "Blog link copied to clipboard",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowShareMenu(false);
      return;
    }

    window.open(shareUrls[platform], "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  if (isLoading) {
    return (
      <DefaultLayouts>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </DefaultLayouts>
    );
  }

  if (!blog) {
    return (
      <DefaultLayouts>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Article Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The article you&apos;re looking for doesn&apos;t exist
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Blog
            </Link>
          </div>
        </div>
      </DefaultLayouts>
    );
  }

  return (
    <DefaultLayouts>
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
        {/* Top Background for Navbar Visibility */}
        <div className="h-20 lg:h-24 bg-linear-to-r from-blue-600 to-purple-600"></div>

        {/* Back Button */}
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              <span>Back to Blog</span>
            </button>
          </div>
        </div>

        {/* Article Header */}
        <article className="container mx-auto px-4 py-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Category & Read Time */}
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg font-semibold">
                {blog.category}
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <Clock size={16} />
                {blog.readTime} min read
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <Eye size={16} />
                {blog.views} views
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {blog.excerpt}
            </p>

            {/* Author & Meta */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b">
              <div className="flex items-center gap-4">
                {blog.author.avatar ? (
                  <Image
                    src={blog.author.avatar}
                    alt={blog.author.name}
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {blog.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {blog.author.name}
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Calendar size={16} />
                    {formatDate(blog.createdAt)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    hasLiked
                      ? "bg-red-100 text-red-600 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600"
                  }`}
                >
                  <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
                  <span className="font-medium">{currentLikes}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 size={20} />
                    <span className="font-medium">Share</span>
                  </button>

                  {showShareMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowShareMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 animate-fadeIn">
                        <button
                          onClick={() => handleShare("facebook")}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                        >
                          <Facebook size={20} className="text-blue-600" />
                          <span className="font-medium text-gray-700">
                            Share on Facebook
                          </span>
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 transition-colors text-left"
                        >
                          <Twitter size={20} className="text-sky-500" />
                          <span className="font-medium text-gray-700">
                            Share on Twitter
                          </span>
                        </button>
                        <button
                          onClick={() => handleShare("linkedin")}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                        >
                          <Linkedin size={20} className="text-blue-700" />
                          <span className="font-medium text-gray-700">
                            Share on LinkedIn
                          </span>
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => handleShare("copy")}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <LinkIcon size={20} className="text-gray-600" />
                          <span className="font-medium text-gray-700">
                            Copy Link
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="relative h-96 md:h-125 rounded-2xl overflow-hidden mb-12 shadow-2xl">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-12">
                <Tag size={18} className="text-gray-400" />
                {blog.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/blog?tag=${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <style jsx global>{`
                .prose {
                  color: #374151;
                }
                .prose h1 {
                  color: #111827;
                  font-weight: 800;
                  margin-top: 2rem;
                  margin-bottom: 1.5rem;
                }
                .prose h2 {
                  color: #1f2937;
                  font-weight: 700;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  border-bottom: 2px solid #e5e7eb;
                  padding-bottom: 0.5rem;
                }
                .prose h3 {
                  color: #374151;
                  font-weight: 600;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                }
                .prose p {
                  color: #4b5563;
                  line-height: 1.8;
                  margin-bottom: 1.25rem;
                }
                .prose strong {
                  color: #111827;
                  font-weight: 700;
                }
                .prose em {
                  color: #6b7280;
                  font-style: italic;
                }
                .prose a {
                  color: #2563eb;
                  text-decoration: underline;
                  font-weight: 500;
                }
                .prose a:hover {
                  color: #1d4ed8;
                }
                .prose code {
                  color: #db2777;
                  background-color: #fdf2f8;
                  padding: 0.125rem 0.375rem;
                  border-radius: 0.25rem;
                  font-size: 0.875em;
                  font-weight: 600;
                }
                .prose pre {
                  background-color: #1f2937;
                  color: #f3f4f6;
                  border-radius: 0.5rem;
                  padding: 1rem;
                  overflow-x: auto;
                  margin: 1.5rem 0;
                }
                .prose pre code {
                  background-color: transparent;
                  color: inherit;
                  padding: 0;
                }
                .prose blockquote {
                  border-left: 4px solid #3b82f6;
                  padding-left: 1rem;
                  color: #6b7280;
                  font-style: italic;
                  background-color: #f0f9ff;
                  padding: 1rem;
                  border-radius: 0.25rem;
                  margin: 1.5rem 0;
                }
                .prose ul,
                .prose ol {
                  color: #4b5563;
                  padding-left: 1.5rem;
                  margin: 1rem 0;
                }
                .prose li {
                  margin: 0.5rem 0;
                }
                .prose li::marker {
                  color: #3b82f6;
                  font-weight: 600;
                }
                .prose table {
                  border-collapse: collapse;
                  width: 100%;
                  margin: 2rem 0;
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                  border-radius: 0.5rem;
                  overflow: hidden;
                }
                .prose th {
                  background-color: #f3f4f6;
                  color: #111827;
                  font-weight: 700;
                  text-align: left;
                  padding: 0.75rem 1.5rem;
                  border-bottom: 2px solid #e5e7eb;
                }
                .prose td {
                  padding: 0.75rem 1.5rem;
                  border-bottom: 1px solid #e5e7eb;
                  color: #374151;
                }
                .prose tr:hover {
                  background-color: #f9fafb;
                }
                .prose img {
                  border-radius: 0.75rem;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  margin: 2rem 0;
                }
                .prose hr {
                  border-color: #e5e7eb;
                  margin: 2rem 0;
                }
              `}</style>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  code({
                    className,
                    children,
                    ...props
                  }: {
                    className?: string;
                    children?: React.ReactNode;
                  }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const inline = !className;
                    return !inline && match ? (
                      <SyntaxHighlighter
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        style={atomDark as any}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  img: (props: any) => (
                    <div className="relative h-96 my-8 rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src={String(props.src) || ""}
                        alt={String(props.alt) || ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-8">
                      <table className="min-w-full divide-y divide-gray-200 border">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {children}
                    </td>
                  ),
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Additional Images Gallery */}
            {blog.images && blog.images.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Image Gallery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {blog.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative h-64 rounded-xl overflow-hidden shadow-lg group"
                    >
                      <Image
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-4 py-8 border-y mb-12">
              <button
                onClick={handleLike}
                disabled={hasLiked}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
                  hasLiked
                    ? "bg-red-100 text-red-600 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600"
                }`}
              >
                <Heart size={24} fill={hasLiked ? "currentColor" : "none"} />
                <span>{hasLiked ? "Liked" : "Like this article"}</span>
              </button>

              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Share2 size={24} />
                <span>Share Article</span>
              </button>
            </div>
          </motion.div>

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Related Articles
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog) => (
                  <Link
                    key={relatedBlog._id}
                    href={`/blog/${relatedBlog.slug}`}
                  >
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col group">
                      <div className="relative h-48">
                        <Image
                          src={relatedBlog.coverImage}
                          alt={relatedBlog.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium w-fit mb-3">
                          {relatedBlog.category}
                        </span>

                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {relatedBlog.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                          {relatedBlog.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {relatedBlog.readTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {relatedBlog.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </article>
      </div>
    </DefaultLayouts>
  );
}
