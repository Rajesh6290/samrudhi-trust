import dbConnect from "@/lib/mongodb";
import { logAuditAction } from "@/lib/auditLogger";
import { verifyToken } from "@/lib/auth";
import Campaign from "@/models/Campaign";
import { MediaService } from "@/lib/mediaService";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

interface AuthPayload {
  userId: string;
  name?: string;
  email?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error: unknown) {
    console.error("Get campaign error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

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

    // Build update object
    const updateData: Record<string, unknown> = {
      title,
      description,
      location,
      address,
      startDate,
      type: type || "campaign",
      status: status || "ongoing",
      isActive: isActive || "yes",
      order,
    };

    if (endDate) {
      updateData.endDate = endDate;
    }

    if (type === "campaign" && donationLink) {
      updateData.donationLink = donationLink;
      updateData.eventLink = undefined;
    }

    if (type === "event" && eventLink) {
      updateData.eventLink = eventLink;
      updateData.donationLink = undefined;
    }

    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadedMedia = await MediaService.uploadFile(imageFile);
        updateData.image = uploadedMedia.url;
      } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    const campaign = await Campaign.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Log audit
    const payload = verifyToken(token) as AuthPayload | null;
    if (payload) {
      await logAuditAction({
        userId: payload.userId,
        userName: payload.name || "Admin",
        userEmail: payload.email || "",
        action: "update",
        module: "campaigns",
        entityType: "Campaign",
        entityId: id,
        entityName: campaign.title,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "",
        userAgent: request.headers.get("user-agent") || "",
      });
    }

    return NextResponse.json({ campaign });
  } catch (error: unknown) {
    console.error("Update campaign error:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
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
    const campaign = await Campaign.findByIdAndDelete(id);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Log audit
    const payload = verifyToken(token) as AuthPayload | null;
    if (payload) {
      await logAuditAction({
        userId: payload.userId,
        userName: payload.name || "Admin",
        userEmail: payload.email || "",
        action: "delete",
        module: "campaigns",
        entityType: "Campaign",
        entityId: id,
        entityName: campaign.title,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "",
        userAgent: request.headers.get("user-agent") || "",
      });
    }

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete campaign error:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
