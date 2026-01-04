import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WebhookLog from "@/models/WebhookLog";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const eventType = searchParams.get("eventType");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    const logs = await WebhookLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching webhook logs:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch webhook logs" },
      { status: 500 }
    );
  }
}
