import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

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

    const query: any = {};

    // Filter by user or role
    if (userId) {
      query.$or = [{ userId }, { userRole: "all" }];
    } else if (userRole) {
      query.$or = [{ userRole }, { userRole: "all" }];
    }

    if (isRead !== null && isRead !== undefined) {
      query.isRead = isRead === "true";
    }
    if (type) query.type = type;

    // Exclude expired notifications
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } },
    ];

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

    const notification = await Notification.create(body);
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

    if (markAllAsRead && userId) {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
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
