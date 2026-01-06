import dbConnect from "@/lib/mongodb";
import { logAuditAction } from "@/lib/auditLogger";
import { verifyToken } from "@/lib/auth";
import Volunteer from "@/models/Volunteer";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ volunteer });
  } catch (error: unknown) {
    console.error("Get volunteer error:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer" },
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
    const body = await request.json();
    const { id } = await params;

    const volunteer = await Volunteer.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 }
      );
    }

    // Log audit
    const payload = verifyToken(token);
    if (payload) {
      await logAuditAction({
        userId: payload.userId,
        userName: payload.name || "Admin",
        userEmail: payload.email || "",
        action: "update",
        module: "volunteers",
        entityType: "Volunteer",
        entityId: id,
        entityName: volunteer.name,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "",
        userAgent: request.headers.get("user-agent") || "",
      });
    }

    return NextResponse.json({ volunteer });
  } catch (error: unknown) {
    console.error("Update volunteer error:", error);
    return NextResponse.json(
      { error: "Failed to update volunteer" },
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
    const volunteer = await Volunteer.findByIdAndDelete(id);

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 }
      );
    }

    // Log audit
    const payload = verifyToken(token);
    if (payload) {
      await logAuditAction({
        userId: payload.userId,
        userName: payload.name || "Admin",
        userEmail: payload.email || "",
        action: "delete",
        module: "volunteers",
        entityType: "Volunteer",
        entityId: id,
        entityName: volunteer.name,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "",
        userAgent: request.headers.get("user-agent") || "",
      });
    }

    return NextResponse.json({ message: "Volunteer deleted successfully" });
  } catch (error: unknown) {
    console.error("Delete volunteer error:", error);
    return NextResponse.json(
      { error: "Failed to delete volunteer" },
      { status: 500 }
    );
  }
}
