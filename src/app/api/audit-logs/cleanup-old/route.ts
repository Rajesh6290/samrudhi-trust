import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";

/**
 * Cron job to delete audit logs older than 7 days
 * Called by Vercel Cron (production) or local cron (development)
 */
export async function GET() {
  try {
    await connectDB();

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete audit logs older than 7 days
    const result = await AuditLog.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
    });

    console.warn(
      `✅ Deleted ${result.deletedCount} audit logs older than 7 days`
    );

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} audit logs older than 7 days`,
      deletedCount: result.deletedCount,
      cutoffDate: sevenDaysAgo.toISOString(),
    });
  } catch (error) {
    console.error("❌ Error cleaning up audit logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to cleanup audit logs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
