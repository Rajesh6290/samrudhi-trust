import { NextRequest, NextResponse } from "next/server";
import { logAuditAction } from "@/lib/auditLogger";
import connectDB from "@/lib/mongodb";
import BlogComment from "@/models/BlogComment";

// GET - Fetch comments for a blog
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const blogSlug = searchParams.get("blogSlug");
    const blogId = searchParams.get("blogId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: any = {};
    if (blogSlug) query.blogSlug = blogSlug;
    if (blogId) query.blogId = blogId;
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const comments = await BlogComment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogComment.countDocuments(query);

    // Calculate stats
    const stats = {
      total: await BlogComment.countDocuments(),
      pending: await BlogComment.countDocuments({ status: "pending" }),
      approved: await BlogComment.countDocuments({ status: "approved" }),
      rejected: await BlogComment.countDocuments({ status: "rejected" }),
      spam: await BlogComment.countDocuments({ status: "spam" }),
    };

    return NextResponse.json(
      {
        success: true,
        comments,
        stats,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create comment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Get IP and User Agent from headers
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    const comment = await BlogComment.create({
      ...body,
      ipAddress,
      userAgent,
    });

    // Log audit
    await logAuditAction({
      userId: "public",
      userName: body.userName || "Anonymous",
      userEmail: body.userEmail || "",
      action: "create",
      module: "blogs",
      entityType: "BlogComment",
      entityId: comment._id.toString(),
      entityName: `Comment on ${body.blogSlug}`,
      ipAddress: ipAddress || "",
      userAgent: userAgent || "",
    });

    return NextResponse.json(
      { success: true, message: "Comment submitted for approval", comment },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update comment (admin approval/rejection)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body;

    const comment = await BlogComment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Updated successfully", comment },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const comment = await BlogComment.findByIdAndDelete(id);
    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
