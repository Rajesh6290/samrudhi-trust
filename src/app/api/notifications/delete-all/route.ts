import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

// DELETE - Delete all notifications
export async function DELETE() {
  try {
    await connectDB();

    await Notification.deleteMany({});

    return NextResponse.json(
      { success: true, message: "All notifications deleted" },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
