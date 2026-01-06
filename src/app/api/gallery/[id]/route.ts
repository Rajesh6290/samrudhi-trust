import { verifyToken } from "@/lib/auth";
import { logAuditAction } from "@/lib/auditLogger";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// PUT - Update gallery item
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

    const payload = verifyToken(token) as {
      userId: string;
      name?: string;
      email?: string;
    } | null;
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const item = await Gallery.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Log audit
    await logAuditAction({
      userId: payload.userId,
      userName: payload.name || "Admin",
      userEmail: payload.email || "",
      action: "update",
      module: "gallery",
      entityType: "Gallery",
      entityId: id,
      entityName: item.title || item.category,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "",
      userAgent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json(
      {
        success: true,
        item,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update gallery item error:", error);
    return NextResponse.json(
      { error: "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

// DELETE gallery item
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

    const payload = verifyToken(token) as {
      userId: string;
      name?: string;
      email?: string;
    } | null;
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const item = await Gallery.findById(id);

    if (!item) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }
    await Gallery.findByIdAndDelete(id);

    // Log audit
    await logAuditAction({
      userId: payload.userId,
      userName: payload.name || "Admin",
      userEmail: payload.email || "",
      action: "delete",
      module: "gallery",
      entityType: "Gallery",
      entityId: id,
      entityName: item.title || item.category,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "",
      userAgent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Gallery item deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete gallery item error:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
