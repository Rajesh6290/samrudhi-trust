import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

// PUT - Mark all notifications as read
export async function PUT() {
  try {
    await connectDB();

    await Notification.updateMany(
      { isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return NextResponse.json(
      { success: true, message: "All notifications marked as read" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
