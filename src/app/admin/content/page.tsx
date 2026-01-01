"use client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface Content {
  _id: string;
  key: "about" | "story";
  title: string;
  content: string;
  images: string[];
  metadata: Record<string, unknown>;
}

export default function ContentPage() {
  const [aboutContent, setAboutContent] = useState<Content | null>(null);
  const [storyContent, setStoryContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "story">("about");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    images: [] as string[],
  });

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/content");
      const data = await res.json();

      const about = data.content.find((c: Content) => c.key === "about");
      const story = data.content.find((c: Content) => c.key === "story");

      setAboutContent(about || null);
      setStoryContent(story || null);

      // Set form data for active tab
      const activeContent = activeTab === "about" ? about : story;
      if (activeContent) {
        setFormData({
          title: activeContent.title || "",
          content: activeContent.content || "",
          images: activeContent.images || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, images: [...formData.images, data.url] });
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: activeTab,
          title: formData.title,
          content: formData.content,
          images: formData.images,
        }),
      });

      if (res.ok) {
        alert("Content saved successfully!");
        fetchContent();
      }
    } catch (error) {
      console.error("Failed to save content:", error);
    }
  };

  const handleTabChange = (tab: "about" | "story") => {
    setActiveTab(tab);
    const content = tab === "about" ? aboutContent : storyContent;
    if (content) {
      setFormData({
        title: content.title || "",
        content: content.content || "",
        images: content.images || [],
      });
    } else {
      setFormData({ title: "", content: "", images: [] });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black text-slate-900 mb-8">
        Content Management
      </h1>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => handleTabChange("about")}
          className={`px-6 py-3 font-bold transition-colors ${
            activeTab === "about"
              ? "text-emerald-600 border-b-2 border-emerald-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          About Us
        </button>
        <button
          onClick={() => handleTabChange("story")}
          className={`px-6 py-3 font-bold transition-colors ${
            activeTab === "story"
              ? "text-emerald-600 border-b-2 border-emerald-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Our Story
        </button>
      </div>

      {loading ? (
        <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-900 font-black text-sm uppercase tracking-wider mb-3">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              placeholder="Enter section title"
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black text-sm uppercase tracking-wider mb-3">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={12}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              required
              placeholder="Enter content here..."
            />
          </div>

          <div>
            <label className="block text-slate-900 font-black text-sm uppercase tracking-wider mb-3">
              Images
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {uploading && (
                <p className="text-sm text-blue-600">Uploading...</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Content
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
