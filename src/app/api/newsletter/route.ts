import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import { sendNewsletterEmail } from "@/lib/emailHelpers";

// GET - Fetch all subscribers
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const subscribers = await NewsletterSubscriber.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NewsletterSubscriber.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        subscribers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Subscribe
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const existing = await NewsletterSubscriber.findOne({ email: body.email });
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "active";
        existing.subscribedAt = new Date();
        await existing.save();
        return NextResponse.json(
          {
            success: true,
            message: "Resubscribed successfully!",
            subscriber: existing,
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Email already subscribed" },
        { status: 400 }
      );
    }

    const subscriber = await NewsletterSubscriber.create(body);

    // Send welcome email to new subscriber
    try {
      const welcomeContent = `<h2>Thank you for subscribing!</h2>
         <p>Dear ${subscriber.name || "Supporter"},</p>
         <p>Welcome to the Samriddhi Seva Trust community! We're excited to have you join us.</p>
         <p>You'll now receive regular updates about:</p>
         <ul>
           <li>Our latest campaigns and initiatives</li>
           <li>Impact stories from the field</li>
           <li>Volunteer opportunities</li>
           <li>Special events and announcements</li>
         </ul>
         <p>Thank you for your support in making a difference!</p>`;

      await sendNewsletterEmail(
        [subscriber.email],
        "Welcome to Samriddhi Seva Trust Newsletter",
        welcomeContent
      );
    } catch (emailError) {
      console.error("Failed to send newsletter welcome email:", emailError);
    }

    return NextResponse.json(
      { success: true, message: "Subscribed successfully!", subscriber },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update subscriber
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body;

    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: "Subscriber not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Updated successfully", subscriber },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete subscriber
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const subscriber = await NewsletterSubscriber.findByIdAndDelete(id);
    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: "Subscriber not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
