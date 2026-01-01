import dbConnect from "@/lib/mongodb";
import Volunteer from "@/models/Volunteer";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const active = searchParams.get("active");

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (active === "true") {
      query.isActive = true;
    }

    const volunteers = await Volunteer.find(query).sort({
      createdAt: -1,
    });

    return NextResponse.json({ volunteers });
  } catch (error: unknown) {
    console.error("Get volunteers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const volunteer = await Volunteer.create(body);

    return NextResponse.json({ volunteer }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create volunteer error:", error);
    return NextResponse.json(
      { error: "Failed to create volunteer application" },
      { status: 500 }
    );
  }
}
