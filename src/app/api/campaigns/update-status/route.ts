import dbConnect from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import { NextRequest, NextResponse } from "next/server";

/**
 * Automatically updates campaign statuses based on current date
 * - upcoming: startDate is in the future
 * - ongoing: startDate has passed and (no endDate OR endDate is in the future)
 * - completed: endDate has passed
 *
 * This endpoint should be called by a cron job daily
 */
export async function GET(_request: NextRequest) {
  try {
    await dbConnect();

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    // Find all campaigns that might need status updates
    const campaigns = await Campaign.find({});

    let updated = 0;
    let upcomingCount = 0;
    let ongoingCount = 0;
    let completedCount = 0;
    const updatedCampaigns: string[] = [];

    for (const campaign of campaigns) {
      const startDate = new Date(campaign.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
      if (endDate) {
        endDate.setHours(23, 59, 59, 999); // End of the end date
      }

      let newStatus: "upcoming" | "ongoing" | "completed" = campaign.status;
      const oldStatus = campaign.status;

      // Determine the correct status
      if (endDate && now > endDate) {
        // Campaign has ended
        newStatus = "completed";
        completedCount++;
      } else if (now < startDate) {
        // Campaign hasn't started yet
        newStatus = "upcoming";
        upcomingCount++;
      } else {
        // Campaign is ongoing (started but not ended)
        newStatus = "ongoing";
        ongoingCount++;
      }

      // Update only if status has changed
      if (oldStatus !== newStatus) {
        campaign.status = newStatus;
        await campaign.save();
        updated++;
        updatedCampaigns.push(`${campaign.title}: ${oldStatus} → ${newStatus}`);
      }
    }

    const summary = {
      success: true,
      message: `Campaign status update completed`,
      timestamp: new Date().toISOString(),
      statistics: {
        totalCampaigns: campaigns.length,
        updatedCampaigns: updated,
        currentStatus: {
          upcoming: upcomingCount,
          ongoing: ongoingCount,
          completed: completedCount,
        },
      },
      updates: updatedCampaigns,
    };

    return NextResponse.json(summary);
  } catch (error: unknown) {
    console.error("❌ Campaign status update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update campaign statuses",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST(_request: NextRequest) {
  return GET(_request);
}
