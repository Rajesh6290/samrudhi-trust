import { verifyToken } from "@/lib/auth";
import { logAuditAction } from "@/lib/auditLogger";
import { MediaService } from "@/lib/mediaService";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { notifyNewMember } from "@/lib/notificationService";

// GET all members
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true"; // Bypass pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

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

    // If all=true, fetch all members without pagination
    if (all) {
      const members = await Member.find(query).sort({ createdAt: 1 }).lean();

      return NextResponse.json(
        {
          success: true,
          members,
          pagination: {
            total: members.length,
            page: 1,
            limit: members.length,
            totalPages: 1,
          },
        },
        { status: 200 }
      );
    }

    // Regular paginated response
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      Member.find(query).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
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

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const bio = formData.get("bio") as string;
    const bloodGroup = formData.get("bloodGroup") as string;
    const joiningDate = formData.get("joiningDate") as string;
    const role = (formData.get("role") as string) || "Member";
    const receivedIdCard = formData.get("receivedIdCard") === "true";
    const receivedTshirt = formData.get("receivedTshirt") === "true";
    const photoFile = formData.get("photo") as File | null;
    // Validate required fields
    if (!name || !email || !bloodGroup) {
      return NextResponse.json(
        { error: "Name, email, and blood group are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingMember = await Member.findOne({ email: email.toLowerCase() });
    if (existingMember) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Upload photo to Cloudinary if provided
    let photoUrl = "";
    if (photoFile && photoFile.size > 0) {
      try {
        const uploadedMedia = await MediaService.uploadFile(photoFile);
        photoUrl = uploadedMedia.url;
      } catch (error) {
        console.error("Photo upload error:", error);
        return NextResponse.json(
          { error: "Failed to upload photo" },
          { status: 500 }
        );
      }
    }

    // Create new member
    const member = await Member.create({
      name,
      email,
      phone,
      photo: photoUrl,
      bloodGroup,
      joiningDate: joiningDate || new Date(),
      role,
      receivedIdCard,
      receivedTshirt,
      isActive: true,
      bio,
    });

    // Log audit
    await logAuditAction({
      userId: payload.userId,
      userName: payload.name || "Admin",
      userEmail: payload.email || "",
      action: "create",
      module: "members",
      entityType: "Member",
      entityId: member._id.toString(),
      entityName: member.name,
      ipAddress:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "",
      userAgent: request.headers.get("user-agent") || "",
    });

    // Create notification for new member
    await notifyNewMember(member.name, member.email, member._id.toString());

    return NextResponse.json(
      {
        message: "Member registered successfully",
        member: {
          id: member._id,
          name: member.name,
          email: member.email,
        },
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
