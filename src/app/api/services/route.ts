import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

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

    const services = await Service.find(query).sort({
      order: 1,
      createdAt: -1,
    });

    return NextResponse.json({ services });
  } catch (error: unknown) {
    console.error("Get services error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
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

    const service = await Service.create(body);

    return NextResponse.json({ service }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create service error:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
