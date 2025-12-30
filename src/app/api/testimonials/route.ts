import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// GET all testimonials
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get("active") === "true";

    const query = onlyActive ? { isActive: true } : {};

    const testimonials = await Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        testimonials,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get testimonials error:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

// POST - Create new testimonial
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { name, role, content, image, rating, order } = body;

    if (!name || !role || !content || !image) {
      return NextResponse.json(
        { error: "Name, role, content, and image are required" },
        { status: 400 }
      );
    }

    const testimonial = await Testimonial.create({
      name,
      role,
      content,
      image,
      rating: rating || 5,
      order: order || 0,
    });

    return NextResponse.json(
      {
        success: true,
        testimonial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
