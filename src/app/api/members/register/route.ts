import { MediaService } from "@/lib/mediaService";
import dbConnect from "@/lib/mongodb";
import Member from "@/models/Member";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get form data
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const bloodGroup = formData.get("bloodGroup") as string;
    const joiningDate = formData.get("joiningDate") as string;
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
    let photoUrl = "/uploads/default-avatar.png";
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
      receivedIdCard,
      receivedTshirt,
      isActive: true,
    });

    // Send welcome email
    // try {
    //   await sendWelcomeEmail(name, email);
    // } catch (emailError) {
    //   console.error("Failed to send welcome email:", emailError);
    // }

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
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to register member",
      },
      { status: 500 }
    );
  }
}
