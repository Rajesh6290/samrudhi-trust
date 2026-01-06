import { verifyToken } from "@/lib/auth";
import { logAuditAction } from "@/lib/auditLogger";
import { parse, serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user info from token before logging out
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;
    let shouldLogAudit = false;
    let userId = "";
    let userName = "Unknown";
    let userEmail = "";

    if (token) {
      const payload = verifyToken(token) as TokenPayload | null;
      if (payload && payload.userId && payload.email) {
        shouldLogAudit = true;
        userId = payload.userId;
        userName = payload.name || payload.email;
        userEmail = payload.email;
      }
    }

    // Clear the token cookie
    const cookie = serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    response.headers.set("Set-Cookie", cookie);

    // Log audit only if we have valid user info
    if (shouldLogAudit) {
      try {
        await logAuditAction({
          userId,
          userName,
          userEmail,
          action: "logout",
          module: "auth",
          entityType: "User",
          entityId: userId,
          entityName: userName,
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "",
          userAgent: request.headers.get("user-agent") || "",
        });
      } catch (auditError) {
        // Log the error but don't fail the logout
        console.error("Failed to log audit action:", auditError);
      }
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
