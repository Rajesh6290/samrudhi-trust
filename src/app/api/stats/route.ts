import dbConnect from "@/lib/mongodb";
import Stat from "@/models/Stat";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    const query = active === "true" ? { isActive: true } : {};

    const stats = await Stat.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ stats });
  } catch (error: unknown) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const stat = await Stat.create(body);

    return NextResponse.json({ stat }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create stat error:", error);
    return NextResponse.json(
      { error: "Failed to create stat" },
      { status: 500 }
    );
  }
}
