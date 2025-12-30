import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// GET all contact messages (admin only)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const onlyUnread = searchParams.get("unread") === "true";

    const query = onlyUnread ? { isRead: false } : {};

    const contacts = await Contact.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        contacts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
