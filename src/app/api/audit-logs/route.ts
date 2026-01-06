import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/auditLogger";

// GET - Fetch audit logs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      userId: searchParams.get("userId") || undefined,
      module: searchParams.get("module") || undefined,
      action: searchParams.get("action") || undefined,
      startDate: searchParams.get("startDate")
        ? new Date(searchParams.get("startDate")!)
        : undefined,
      endDate: searchParams.get("endDate")
        ? new Date(searchParams.get("endDate")!)
        : undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
    };

    const result = await getAuditLogs(filters);

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
