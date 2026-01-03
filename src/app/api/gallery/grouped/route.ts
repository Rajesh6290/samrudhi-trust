import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { NextRequest, NextResponse } from "next/server";

// GET gallery items grouped by date with aggregation
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build match stage for filtering
    const matchStage: Record<string, unknown> = { isActive: true };

    if (category && category !== "all") {
      matchStage.category = category;
    }

    // Add date filtering
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) {
        (matchStage.date as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day (23:59:59)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (matchStage.date as Record<string, unknown>).$lte = end;
      }
    }

    // Aggregation pipeline to group by date
    const groupedItems = await Gallery.aggregate([
      {
        $match: matchStage,
      },
      {
        $addFields: {
          dateOnly: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $group: {
          _id: "$dateOnly",
          date: { $first: "$date" },
          items: {
            $push: {
              _id: "$_id",
              title: "$title",
              description: "$description",
              files: "$files",
              category: "$category",
              isActive: "$isActive",
              date: "$date",
              createdAt: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          fullDate: "$date",
          items: 1,
          count: 1,
        },
      },
    ]);

    // Calculate total items
    const totalItems = groupedItems.reduce(
      (sum, group) => sum + group.count,
      0
    );

    return NextResponse.json(
      {
        success: true,
        groups: groupedItems,
        totalGroups: groupedItems.length,
        totalItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get grouped gallery error:", error);
    return NextResponse.json(
      { error: "Failed to fetch grouped gallery items" },
      { status: 500 }
    );
  }
}
