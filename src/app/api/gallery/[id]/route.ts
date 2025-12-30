import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import Stat from "@/models/Stat";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// Helper function to update stats when gallery changes
async function updateStatsOnGalleryChange(
  category: string,
  action: "add" | "remove"
) {
  try {
    // Map categories to stat titles
    const categoryStatMap: Record<string, string> = {
      "food-rescue": "Meals Served",
      "blood-donation": "Blood Donations",
      "child-welfare": "Children Helped",
      events: "Events Hosted",
    };

    const statTitle = categoryStatMap[category];
    if (!statTitle) return;

    const stat = await Stat.findOne({ title: statTitle });
    if (stat) {
      stat.value =
        action === "add" ? stat.value + 1 : Math.max(0, stat.value - 1);
      await stat.save();
    }
  } catch (error) {
    console.error("Failed to update stats:", error);
  }
}

// PUT - Update gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const item = await Gallery.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        item,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update gallery item error:", error);
    return NextResponse.json(
      { error: "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

// DELETE gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const item = await Gallery.findById(id);

    if (!item) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Store category before deletion for stats update
    const category = item.category;

    await Gallery.findByIdAndDelete(id);

    // Auto-update stats based on category
    await updateStatsOnGalleryChange(category, "remove");

    return NextResponse.json(
      {
        success: true,
        message: "Gallery item deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete gallery item error:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}
