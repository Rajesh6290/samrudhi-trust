import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// GET settings
export async function GET() {
  try {
    await connectDB();

    // Get the first (and should be only) settings document
    let settings = await SiteSettings.findOne();

    // If no settings exist, create default
    if (!settings) {
      settings = await SiteSettings.create({
        organizationName: "Samriddhi Seva Trust",
        email: "contact@samrudhisevatrust.org",
        phone: "+91 123 456 7890",
        address: "Mumbai, Maharashtra, India",
      });
    }

    return NextResponse.json(
      {
        success: true,
        settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings (admin only)
export async function PUT(request: NextRequest) {
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

    // Update or create settings
    let settings = await SiteSettings.findOne();

    if (settings) {
      settings = await SiteSettings.findByIdAndUpdate(settings._id, body, {
        new: true,
        runValidators: true,
      });
    } else {
      settings = await SiteSettings.create(body);
    }

    return NextResponse.json(
      {
        success: true,
        settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
