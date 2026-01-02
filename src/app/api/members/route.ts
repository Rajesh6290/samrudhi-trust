import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// GET all members
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
        ],
      };
    }

    const [members, total] = await Promise.all([
      Member.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Member.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        members,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST - Create new member
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, email, phone, photo, bloodGroup, joiningDate, role, bio } =
      body;

    // Validate required fields
    if (!name || !email || !photo || !bloodGroup) {
      return NextResponse.json(
        { error: "Name, email, photo, and blood group are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Create new member
    const member = await Member.create({
      name,
      email,
      phone,
      photo,
      bloodGroup,
      joiningDate: joiningDate || new Date(),
      role: role || "Member",
      bio,
    });

    return NextResponse.json(
      {
        success: true,
        member,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create member error:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
