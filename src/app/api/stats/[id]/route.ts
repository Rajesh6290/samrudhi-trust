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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const stat = await Stat.findByIdAndUpdate(id, body, { new: true });

    if (!stat) {
      return NextResponse.json({ error: "Stat not found" }, { status: 404 });
    }

    return NextResponse.json({ stat });
  } catch (error: unknown) {
    console.error("Update stat error:", error);
    return NextResponse.json(
      { error: "Failed to update stat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const stat = await Stat.findByIdAndDelete(id);

    if (!stat) {
      return NextResponse.json({ error: "Stat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Stat deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete stat error:", error);
    return NextResponse.json(
      { error: "Failed to delete stat" },
      { status: 500 }
    );
  }
}
