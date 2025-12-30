import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Stat from "@/models/Stat";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function verifyAuth(_request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token.value, JWT_SECRET);
    return decoded;
  } catch (_error) {
    return null;
  }
}

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
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
