import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { NextRequest, NextResponse } from "next/server";
import { sendContactFormNotification } from "@/lib/emailHelpers";
import User from "@/models/User";

// POST - Submit contact message (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    // Send notification to all admins
    try {
      const admins = await User.find({
        role: { $in: ["superadmin", "admin"] },
      }).select("email");
      const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

      if (adminEmails.length > 0) {
        await sendContactFormNotification(
          name,
          email,
          phone || "",
          subject,
          message,
          adminEmails
        );
      }
    } catch (emailError) {
      console.error("Failed to send contact form notification:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        contact,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit contact error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
