import { verifyToken } from "@/lib/auth";
import { MediaService } from "@/lib/mediaService";
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

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const bio = formData.get("bio") as string;
    const bloodGroup = formData.get("bloodGroup") as string;
    const joiningDate = formData.get("joiningDate") as string;
    const role = (formData.get("role") as string) || "Member";
    const receivedIdCard = formData.get("receivedIdCard") === "yes";
    const receivedTshirt = formData.get("receivedTshirt") === "yes";
    const isActive = formData.get("isActive") === "yes";
    const photoFile = formData.get("photo") as File | null;

    // Check if email is being changed and already exists
    if (email) {
      const existingMember = await Member.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingMember) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Find existing member
    const existingMemberData = await Member.findById(id);
    if (!existingMemberData) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Handle photo upload if provided
    let photoUrl = existingMemberData.photo;
    if (photoFile && photoFile.size > 0) {
      const uploadedPhotoUrl = await MediaService.uploadFile(photoFile);
      if (uploadedPhotoUrl) {
        photoUrl = uploadedPhotoUrl?.url;
        // Optionally delete old photo
        if (existingMemberData.photo) {
          await MediaService.deleteFile(existingMemberData.photo);
        }
      }
    }

    const updateData = {
      name,
      email: email.toLowerCase(),
      phone,
      photo: photoUrl,
      bloodGroup,
      joiningDate,
      role,
      bio,
      receivedIdCard,
      receivedTshirt,
      isActive,
    };

    const member = await Member.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Member updated successfully",
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
