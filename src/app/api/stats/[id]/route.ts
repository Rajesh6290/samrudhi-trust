import dbConnect from "@/lib/mongodb";
import Stat from "@/models/Stat";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

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
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
