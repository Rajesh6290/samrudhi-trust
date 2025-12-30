import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// GET single member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const member = await Member.findById(id);

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        member,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get member error:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}

// PUT - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
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
    const { name, email, phone, photo, joiningDate, role, bio, isActive } =
      body;

    // Check if email is being changed and already exists
    if (email) {
      const existingMember = await Member.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingMember) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    const member = await Member.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        photo,
        joiningDate,
        role,
        bio,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        member,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update member error:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
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

    const member = await Member.findByIdAndDelete(id);

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Member deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete member error:", error);
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}
