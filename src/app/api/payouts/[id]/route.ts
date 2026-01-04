import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payout from "@/models/Payout";
import { requireAuth } from "@/lib/auth-middleware";

// GET - Get single payout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    await dbConnect();

    const { id } = await params;
    const payout = await Payout.findById(id)
      .populate("vendorId")
      .populate("paidBy", "name email")
      .populate("approvedBy", "name email")
      .lean();

    if (!payout) {
      return NextResponse.json(
        { success: false, error: "Payout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, payout });
  } catch (error) {
    console.error("Error fetching payout:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// PATCH - Update payout status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const { status, notes, transactionId, receiptUrl } = body;

    await dbConnect();

    const updateData: Record<string, unknown> = { status, notes };

    if (status === "approved") {
      updateData.approvedBy = authResult.user._id;
      updateData.approvedAt = new Date();
    }

    if (status === "paid") {
      updateData.paidAt = new Date();
      if (transactionId) updateData.transactionId = transactionId;
      if (receiptUrl) updateData.receiptUrl = receiptUrl;
    }

    const { id } = await params;
    const payout = await Payout.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("vendorId");

    if (!payout) {
      return NextResponse.json(
        { success: false, error: "Payout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, payout });
  } catch (error) {
    console.error("Error updating payout:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// DELETE - Delete payout
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    await dbConnect();

    const { id } = await params;
    const payout = await Payout.findByIdAndDelete(id);

    if (!payout) {
      return NextResponse.json(
        { success: false, error: "Payout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payout deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payout:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
