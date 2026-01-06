import { verifyToken } from "@/lib/auth";
import { logAuditAction } from "@/lib/auditLogger";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// GET settings
export async function GET() {
  try {
    await connectDB();

    // Get the first (and should be only) settings document
    let settings = await SiteSettings.findOne().lean();

    // If no settings exist, create default
    if (!settings) {
      settings = await SiteSettings.create({
        organizationName: "Samriddhi Seva Trust",
        email: "contact@samrudhisevatrust.org",
        phone: "+91 123 456 7890",
        address: "Mumbai, Maharashtra, India",
        officeMapLink: "",
        officeMapEmbedUrl: "",
      });
    } else {
      // Ensure new fields exist in old documents
      if (settings.officeMapLink === undefined) {
        settings.officeMapLink = "";
      }
      if (settings.officeMapEmbedUrl === undefined) {
        settings.officeMapEmbedUrl = "";
      }
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
    const settings = await SiteSettings.findByIdAndUpdate(body._id, body, {
      new: true,
    });

    // Log audit
    await logAuditAction({
      userId: payload.userId,
      userName: payload.name || "Admin",
      userEmail: payload.email || "",
      action: "update",
      module: "settings",
      entityType: "SiteSettings",
      entityId: body._id,
      entityName: "Site Settings",
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "",
      userAgent: request.headers.get("user-agent") || "",
    });

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
