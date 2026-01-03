import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";

export async function GET() {
  try {
    await connectDB();

    // Fetch only members with leadership roles (not regular "Member" role)
    const leadershipMembers = await Member.find({
      isActive: true,
      role: { $ne: "Member" }, // $ne = not equal, excludes regular members
    })
      .select("name email phone photo role bio bloodGroup joiningDate")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: leadershipMembers,
    });
  } catch (error: any) {
    console.error("Error fetching leadership members:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch leadership members" },
      { status: 500 }
    );
  }
}
