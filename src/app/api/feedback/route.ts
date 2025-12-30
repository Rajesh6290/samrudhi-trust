import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch all feedback (public)
export async function GET() {
  try {
    await connectDB();

    const feedback = await Feedback.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        feedbacks: feedback,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get feedback error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// POST - Submit feedback (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, phone, message, rating } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const feedback = await Feedback.create({
      name,
      email,
      phone,
      message,
      rating,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit feedback error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
