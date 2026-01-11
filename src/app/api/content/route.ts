import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import { logAuditAction, getRequestMetadata } from "@/lib/auditLogger";
import { checkAuth } from "@/lib/auth-middleware";

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
    const key = searchParams.get("key");

    const query = key ? { key } : {};

    const content = await Content.find(query);

    return NextResponse.json({ content });
  } catch (error: unknown) {
    console.error("Get content error:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
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

    // Check if content exists to determine action
    const existingContent = await Content.findOne({ key: body.key });
    const isUpdate = !!existingContent;

    // Upsert: update if exists, create if doesn't
    const content = await Content.findOneAndUpdate({ key: body.key }, body, {
      new: true,
      upsert: true,
    });

    // Log audit action
    const { user: authUser } = await checkAuth(request);
    if (authUser) {
      const metadata = getRequestMetadata(request);
      await logAuditAction({
        userId: authUser._id,
        userName: authUser.name,
        userEmail: authUser.email,
        action: isUpdate ? "update" : "create",
        module: "content",
        entityType: "Content",
        entityId: content._id.toString(),
        entityName: body.key,
        ...metadata,
        status: "success",
      });
    }

    return NextResponse.json({ content }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create/Update content error:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
