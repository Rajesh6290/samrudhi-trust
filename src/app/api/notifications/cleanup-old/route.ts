import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

/**
 * Cron job to delete notifications older than 7 days
 * Called by Vercel Cron (production) or local cron (development)
 */
export async function GET() {
  try {
    await connectDB();

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete notifications older than 7 days
    const result = await Notification.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
    });

    console.warn(
      `✅ Deleted ${result.deletedCount} notifications older than 7 days`
    );

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} notifications older than 7 days`,
      deletedCount: result.deletedCount,
      cutoffDate: sevenDaysAgo.toISOString(),
    });
  } catch (error) {
    console.error("❌ Error cleaning up notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup notifications",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
