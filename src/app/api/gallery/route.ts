import { verifyToken } from "@/lib/auth";
import { MediaService } from "@/lib/mediaService";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import Stat from "@/models/Stat";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// GET all gallery items
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { isActive: true };
    if (category && category !== "all") {
      query.category = category;
    }

    // Add date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (query.date as Record<string, unknown>).$lte = end;
      }
    }

    const [items, total] = await Promise.all([
      Gallery.find(query).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Gallery.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get gallery error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

// POST - Create new gallery item with file upload
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Get form data
    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const date = formData.get("date") as string;

    // Get all files
    const files: File[] = [];
    let index = 0;
    while (true) {
      const file = formData.get(`file_${index}`) as File | null;
      if (!file) break;
      files.push(file);
      index++;
    }

    if (!title || files.length === 0 || !category) {
      return NextResponse.json(
        { error: "Title, at least one file, and category are required" },
        { status: 400 }
      );
    }

    // Upload all files
    const uploadedMedia = await MediaService.uploadMultipleFiles(files);

    // Create gallery item with uploaded file objects (id, url, and type)
    const item = await Gallery.create({
      title,
      description,
      files: uploadedMedia.map((media) => ({
        id: media.id,
        url: media.url,
        type: media.type,
      })),
      category,
      date: date || new Date(),
    });
    await Stat.updateOne(
      { ref: category },
      { $inc: { value: 1 } },
      { upsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        item,
        uploadedMedia,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create gallery item error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create gallery item",
      },
      { status: 500 }
    );
  }
}
