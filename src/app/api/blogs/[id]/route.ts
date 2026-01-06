import dbConnect from "@/lib/mongodb";
import { logAuditAction } from "@/lib/auditLogger";
import { verifyToken } from "@/lib/auth";
import Blog from "@/models/Blog";
import { MediaService } from "@/lib/mediaService";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

interface TokenPayload {
  userId: string;
  name?: string;
  email?: string;
}

// Auto-calculate reading time based on content (200 words per minute)
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / wordsPerMinute);
  return readTime < 1 ? 1 : readTime; // Minimum 1 minute
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

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

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if slug is being changed and if it already exists
    if (slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug });
      if (existingBlog) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // Upload new cover image if provided
    let coverImageUrl = blog.coverImage;
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        // Delete old image if exists
        if (blog.coverImage) {
          await MediaService.deleteFile(blog.coverImage);
        }
        const uploadedMedia = await MediaService.uploadFile(coverImageFile);
        coverImageUrl = uploadedMedia.url;
      } catch (error) {
        console.error("Cover image upload error:", error);
      }
    }

    // Handle additional images
    const images: string[] = [...blog.images];
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

    // Handle image deletions
    const imagesToDelete = formData.get("deleteImages") as string;
    if (imagesToDelete) {
      const deleteList = imagesToDelete.split(",");
      for (const imageUrl of deleteList) {
        try {
          await MediaService.deleteFile(imageUrl);
          const index = images.indexOf(imageUrl);
          if (index > -1) {
            images.splice(index, 1);
          }
        } catch (error) {
          console.error("Image deletion error:", error);
        }
      }
    }

    blog.title = title;
    blog.slug = slug;
    blog.content = content;
    blog.excerpt = excerpt;
    blog.coverImage = coverImageUrl;
    blog.images = images;
    blog.author = {
      name: authorName,
      avatar: authorAvatar || "",
    };
    blog.category = category;
    blog.tags = tags ? tags.split(",").map((tag) => tag.trim()) : [];
    blog.status = status as "draft" | "published" | "archived";
    blog.isActive = isActive as "yes" | "no";
    blog.order = order;
    blog.readTime = readTime;

    await blog.save();

    // Log audit
    const payload = verifyToken(token) as TokenPayload | null;
    if (payload) {
      await logAuditAction({
        userId: payload.userId,
        userName: payload.name || "Admin",
        userEmail: payload.email || "",
        action: "update",
        module: "blogs",
        entityType: "Blog",
        entityId: id,
        entityName: blog.title,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "",
        userAgent: request.headers.get("user-agent") || "",
      });
    }

    return NextResponse.json({ blog });
  } catch (error: unknown) {
    console.error("Update blog error:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Delete cover image
    if (blog.coverImage) {
      try {
        await MediaService.deleteFile(blog.coverImage);
      } catch (error) {
        console.error("Cover image deletion error:", error);
      }
    }

    // Delete all additional images
    if (blog.images && blog.images.length > 0) {
      for (const imageUrl of blog.images) {
        try {
          await MediaService.deleteFile(imageUrl);
        } catch (error) {
          console.error("Image deletion error:", error);
        }
      }
    }

    await Blog.findByIdAndDelete(id);

    // Log audit
    const payload = verifyToken(token) as TokenPayload | null;
    if (payload) {
      await logAuditAction({
        userId: payload.userId,
        userName: payload.name || "Admin",
        userEmail: payload.email || "",
        action: "delete",
        module: "blogs",
        entityType: "Blog",
        entityId: id,
        entityName: blog.title,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "",
        userAgent: request.headers.get("user-agent") || "",
      });
    }

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete blog error:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { action } = await request.json();

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (action === "like") {
      blog.likes += 1;
      await blog.save();
    }

    return NextResponse.json({ blog });
  } catch (error: unknown) {
    console.error("Update blog action error:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}
