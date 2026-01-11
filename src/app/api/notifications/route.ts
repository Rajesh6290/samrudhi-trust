import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { logAuditAction, getRequestMetadata } from "@/lib/auditLogger";
import { checkAuth } from "@/lib/auth-middleware";

// GET - Fetch notifications
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userRole = searchParams.get("userRole");
    const isRead = searchParams.get("isRead");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = {
      $and: [],
    };

    // Filter by user or role
    if (userId) {
      query.$and.push({
        $or: [{ userId }, { userRole: "all" }],
      });
    } else if (userRole) {
      query.$and.push({
        $or: [{ userRole }, { userRole: "all" }],
      });
    }

    // Exclude expired notifications
    query.$and.push({
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } },
      ],
    });

    if (isRead !== null && isRead !== undefined && isRead !== "") {
      query.isRead = isRead === "true";
    }
    if (type) query.type = type;

    // Clean up query if $and is empty
    if (query.$and.length === 0) {
      delete query.$and;
    }

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    return NextResponse.json(
      {
        success: true,
        notifications,
        unreadCount,
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

// POST - Create notification
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const { user } = await checkAuth(request);
    const notification = await Notification.create(body);

    // Log audit action
    if (user) {
      const metadata = getRequestMetadata(request);
      await logAuditAction({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        action: "create",
        module: "notifications",
        entityType: "Notification",
        entityId: notification._id.toString(),
        entityName:
          notification.title || notification.message?.substring(0, 50),
        ...metadata,
        status: "success",
      });
    }

    return NextResponse.json(
      { success: true, message: "Notification created", notification },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Mark as read
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, isRead, markAllAsRead, userId } = body;

    const { user } = await checkAuth(request);
    const metadata = getRequestMetadata(request);

    if (markAllAsRead && userId) {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      // Log bulk update
      if (user) {
        await logAuditAction({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          action: "bulk_update",
          module: "notifications",
          entityType: "Notification",
          ...metadata,
          status: "success",
          metadata: { count: result.modifiedCount },
        });
      }

      return NextResponse.json(
        { success: true, message: "All notifications marked as read" },
        { status: 200 }
      );
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead, readAt: isRead ? new Date() : null },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    // Log single update
    if (user) {
      await logAuditAction({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        action: "mark_read",
        module: "notifications",
        entityType: "Notification",
        entityId: notification._id.toString(),
        entityName:
          notification.title || notification.message?.substring(0, 50),
        ...metadata,
        status: "success",
      });
    }

    return NextResponse.json(
      { success: true, message: "Updated successfully", notification },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    // Log delete action
    const { user } = await checkAuth(request);
    if (user) {
      const metadata = getRequestMetadata(request);
      await logAuditAction({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        action: "delete",
        module: "notifications",
        entityType: "Notification",
        entityId: notification._id.toString(),
        entityName:
          notification.title || notification.message?.substring(0, 50),
        ...metadata,
        status: "success",
      });
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
