import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";
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
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
