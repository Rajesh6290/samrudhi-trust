import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { logAuditAction } from "@/lib/auditLogger";
import { parse } from "cookie";
import connectDB from "@/lib/mongodb";
import BlogComment from "@/models/BlogComment";

// GET - Fetch single comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const comment = await BlogComment.findById(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, comment }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();

    const oldComment = await BlogComment.findById(id);
    if (!oldComment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    const comment = await BlogComment.findByIdAndUpdate(
      id,
      { ...body, isEdited: true },
      { new: true, runValidators: true }
    );

    // Log audit
    await logAuditAction({
      userId: payload.userId,
      userName: (payload as any).name || "Admin",
      userEmail: payload.email || "",
      action: "update",
      module: "blogs",
      entityType: "BlogComment",
      entityId: id,
      entityName: `Comment by ${comment!.userName}`,
      changes: [
        {
          field: "status",
          oldValue: oldComment.status,
          newValue: body.status || oldComment.status,
        },
      ],
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "",
      userAgent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json(
      { success: true, message: "Comment updated successfully", comment },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const comment = await BlogComment.findByIdAndDelete(id);

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    // Log audit
    await logAuditAction({
      userId: payload.userId,
      userName: (payload as any).name || "Admin",
      userEmail: payload.email || "",
      action: "delete",
      module: "blogs",
      entityType: "BlogComment",
      entityId: id,
      entityName: `Comment by ${comment.userName}`,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "",
      userAgent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json(
      { success: true, message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
