import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import FAQ from "@/models/FAQ";
import { logAuditAction, getRequestMetadata } from "@/lib/auditLogger";
import { checkAuth } from "@/lib/auth-middleware";

// GET all FAQs (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const query: any = {};
    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ faqs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}

// POST new FAQ (admin only - add auth check)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { question, answer, category, order } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const faq = await FAQ.create({
      question,
      answer,
      category: category || "General",
      order: order || 0,
    });

    // Log audit action
    const { user } = await checkAuth(request);
    if (user) {
      const metadata = getRequestMetadata(request);
      await logAuditAction({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        action: "create",
        module: "faqs",
        entityType: "FAQ",
        entityId: faq._id.toString(),
        entityName: question.substring(0, 100),
        ...metadata,
        status: "success",
      });
    }

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
