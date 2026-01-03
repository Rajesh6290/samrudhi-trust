import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { MediaService } from "@/lib/mediaService";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// Auto-calculate reading time based on content (200 words per minute)
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / wordsPerMinute);
  return readTime < 1 ? 1 : readTime; // Minimum 1 minute
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const slug = searchParams.get("slug");

    const query: Record<string, unknown> = {};

    if (active === "true") {
      query.isActive = "yes";
      query.status = "published";
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (slug) {
      const blog = await Blog.findOne({ slug });
      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }

      // Increment views
      blog.views += 1;
      await blog.save();

      return NextResponse.json({ blog });
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(query).sort({
      order: 1,
      createdAt: -1,
    });

    // Get unique categories and tags for filtering
    const categories = await Blog.distinct("category");
    const tags = await Blog.distinct("tags");

    return NextResponse.json({ blogs, categories, tags });
  } catch (error: unknown) {
    console.error("Get blogs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const category = formData.get("category") as string;
    const tags = formData.get("tags") as string;
    const status = formData.get("status") as string;
    const isActive = formData.get("isActive") as string;
    const order = parseInt(formData.get("order") as string) || 0;
    const authorName = formData.get("authorName") as string;
    const authorAvatar = formData.get("authorAvatar") as string;
    const coverImageFile = formData.get("coverImage") as File | null;

    // Auto-calculate read time from content
    const readTime = calculateReadTime(content);

    // Validate required fields
    if (!title || !slug || !content || !excerpt || !category || !authorName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    // Upload cover image to Cloudinary if provided
    let coverImageUrl = "";
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        const uploadedMedia = await MediaService.uploadFile(coverImageFile);
        coverImageUrl = uploadedMedia.url;
      } catch (error) {
        console.error("Cover image upload error:", error);
        return NextResponse.json(
          { error: "Failed to upload cover image" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Cover image is required" },
        { status: 400 }
      );
    }

    // Handle multiple additional images
    const images: string[] = [];
    const imageFiles = formData.getAll("images") as File[];

    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file && file.size > 0) {
          try {
            const uploadedMedia = await MediaService.uploadFile(file);
            images.push(uploadedMedia.url);
          } catch (error) {
            console.error("Additional image upload error:", error);
          }
        }
      }
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      coverImage: coverImageUrl,
      images,
      author: {
        name: authorName,
        avatar: authorAvatar || "",
      },
      category,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      status,
      isActive,
      order,
      readTime,
      views: 0,
      likes: 0,
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create blog error:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
