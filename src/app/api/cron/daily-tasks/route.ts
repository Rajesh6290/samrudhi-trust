import { getBaseUrl } from "@/lib/getBaseUrl";
import { NextResponse } from "next/server";

/**
 * Master Daily Cron Job
 * Runs once per day at 2:00 AM
 * Consolidates all daily maintenance tasks
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

    // Task 1: Cleanup old audit logs (original time: 2 AM)
    try {
      const baseUrl = getBaseUrl();

      const auditResponse = await fetch(
        `${baseUrl}/api/audit-logs/cleanup-old`,
        {
          headers: { authorization: authHeader || "" },
        }
      );
      const auditData = await auditResponse.json();
      results.tasks.push({
        name: "cleanup-audit-logs",
        success: auditResponse.ok,
        message: auditData.message || "Completed",
      });
    } catch (error) {
      results.tasks.push({
        name: "cleanup-audit-logs",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Task 2: Cleanup old notifications (original time: 3 AM)
    try {
      const baseUrl = getBaseUrl();

      const notifResponse = await fetch(
        `${baseUrl}/api/notifications/cleanup-old`,
        {
          headers: { authorization: authHeader || "" },
        }
      );
      const notifData = await notifResponse.json();
      results.tasks.push({
        name: "cleanup-notifications",
        success: notifResponse.ok,
        message: notifData.message || "Completed",
      });
    } catch (error) {
      results.tasks.push({
        name: "cleanup-notifications",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Task 3: Update campaign statuses (original time: 4 AM)
    try {
      const baseUrl = getBaseUrl();

      const campaignResponse = await fetch(
        `${baseUrl}/api/campaigns/update-status`,
        {
          headers: { authorization: authHeader || "" },
        }
      );
      const campaignData = await campaignResponse.json();
      results.tasks.push({
        name: "update-campaign-status",
        success: campaignResponse.ok,
        message: campaignData.message || "Completed",
      });
    } catch (error) {
      results.tasks.push({
        name: "update-campaign-status",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Task 4: Send retry emails (original time: 9 AM)
    try {
      const baseUrl = getBaseUrl();

      const retryResponse = await fetch(
        `${baseUrl}/api/payments/send-retry-emails`,
        {
          headers: { authorization: authHeader || "" },
        }
      );
      const retryData = await retryResponse.json();
      results.tasks.push({
        name: "send-retry-emails",
        success: retryResponse.ok,
        message: retryData.message || "Completed",
      });
    } catch (error) {
      results.tasks.push({
        name: "send-retry-emails",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    const successCount = results.tasks.filter((t) => t.success).length;
    const totalCount = results.tasks.length;

    return NextResponse.json({
      success: true,
      message: `Daily tasks completed: ${successCount}/${totalCount} successful`,
      results,
    });
  } catch (error) {
    console.error("Daily cron error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
