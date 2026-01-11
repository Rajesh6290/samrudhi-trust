import { getBaseUrl } from "@/lib/getBaseUrl";
import { NextResponse } from "next/server";

/**
 * Master Periodic Cron Job
 * Runs every 6 hours (00:00, 06:00, 12:00, 18:00)
 * Handles payment cleanup tasks
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      tasks: [] as Array<{
        name: string;
        success: boolean;
        message?: string;
        error?: string;
      }>,
    };

    // Task: Cleanup pending payments
    try {
      const baseUrl = getBaseUrl();

      const cleanupResponse = await fetch(
        `${baseUrl}/api/payments/cleanup-pending`,
        {
          headers: { authorization: authHeader || "" },
        }
      );
      const cleanupData = await cleanupResponse.json();
      results.tasks.push({
        name: "cleanup-pending-payments",
        success: cleanupResponse.ok,
        message: cleanupData.message || "Completed",
      });
    } catch (error) {
      results.tasks.push({
        name: "cleanup-pending-payments",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    const successCount = results.tasks.filter((t) => t.success).length;
    const totalCount = results.tasks.length;

    return NextResponse.json({
      success: true,
      message: `Periodic tasks completed: ${successCount}/${totalCount} successful`,
      results,
    });
  } catch (error) {
    console.error("Periodic cron error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
