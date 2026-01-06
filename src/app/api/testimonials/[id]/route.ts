import { verifyToken } from "@/lib/auth";
import { logAuditAction } from "@/lib/auditLogger";
import connectDB from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// PUT - Update testimonial
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

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const testimonial = await Testimonial.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Log audit
    await logAuditAction({
      userId: payload.userId,
      userName: payload.name || "Admin",
      userEmail: payload.email || "",
      action: "update",
      module: "testimonials",
      entityType: "Testimonial",
      entityId: id,
      entityName: testimonial.name,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "",
      userAgent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json(
      {
        success: true,
        testimonial,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

// DELETE testimonial
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

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Log audit
    await logAuditAction({
      userId: payload.userId,
      userName: payload.name || "Admin",
      userEmail: payload.email || "",
      action: "delete",
      module: "testimonials",
      entityType: "Testimonial",
      entityId: id,
      entityName: testimonial.name,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "",
      userAgent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Testimonial deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
