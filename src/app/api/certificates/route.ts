import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Certificate from "@/models/Certificate";
import { sendCertificateGeneratedEmail } from "@/lib/emailHelpers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function verifyAuth(_request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token.value, JWT_SECRET);
    return decoded;
  } catch (_error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");

    const query = active === "true" ? { isActive: true } : {};

    const certificates = await Certificate.find(query).sort({
      order: 1,
      issuedDate: -1,
    });

    return NextResponse.json({ certificates });
  } catch (error: unknown) {
    console.error("Get certificates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const certificate = await Certificate.create(body);

    // Send certificate email to recipient
    if (certificate.recipientEmail) {
      try {
        await sendCertificateGeneratedEmail(
          certificate.recipientName,
          certificate.recipientEmail,
          certificate.type,
          certificate.certificateNumber,
          certificate.issuedDate.toLocaleDateString()
        );
      } catch (emailError) {
        console.error("Failed to send certificate email:", emailError);
      }
    }

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create certificate error:", error);
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    );
  }
}
