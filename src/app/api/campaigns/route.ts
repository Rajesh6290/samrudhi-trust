import dbConnect from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import { MediaService } from "@/lib/mediaService";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};

    if (active === true.toString()) {
      query.isActive = "yes";
    }

    if (status) {
      query.status = status;
    }

    const campaigns = await Campaign.find(query).sort({
      order: 1,
      startDate: -1,
    });

    return NextResponse.json({ campaigns });
  } catch (error: unknown) {
    console.error("Get campaigns error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
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

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const address = formData.get("address") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;
    const isActive = formData.get("isActive") as string;
    const order = parseInt(formData.get("order") as string) || 0;
    const donationLink = formData.get("donationLink") as string;
    const eventLink = formData.get("eventLink") as string;
    const imageFile = formData.get("image") as File | null;

    // Validate required fields
    if (!title || !description || !location || !address || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary if provided
    let imageUrl = "";
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadedMedia = await MediaService.uploadFile(imageFile);
        imageUrl = uploadedMedia.url;
      } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Campaign image is required" },
        { status: 400 }
      );
    }

    const campaignData: any = {
      title,
      description,
      image: imageUrl,
      location,
      address,
      startDate,
      type: type || "campaign",
      status: status || "ongoing",
      isActive: isActive || "yes",
      order,
    };

    if (endDate) {
      campaignData.endDate = endDate;
    }

    if (type === "campaign" && donationLink) {
      campaignData.donationLink = donationLink;
    }

    if (type === "event" && eventLink) {
      campaignData.eventLink = eventLink;
    }

    const campaign = await Campaign.create(campaignData);

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create campaign error:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
