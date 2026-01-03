import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { hasPermission, hasRole, UserRole } from "@/lib/rbac";
import User from "@/models/User";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
}

export async function checkAuth(
  request: NextRequest
): Promise<{ user: AuthUser | null; error: NextResponse | null }> {
  try {
    await connectDB();

    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        ),
      };
    }

    const payload = verifyToken(token);
    if (!payload) {
      return {
        user: null,
        error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
      };
    }

    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return {
        user: null,
        error: NextResponse.json({ error: "User not found" }, { status: 404 }),
      };
    }

    if (!user.isActive) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Account is inactive" },
          { status: 403 }
        ),
      };
    }

    const authUser: AuthUser = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      permissions: user.permissions || [],
      isActive: user.isActive,
    };

    return { user: authUser, error: null };
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      user: null,
      error: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      ),
    };
  }
}

export async function requireAuth(
  request: NextRequest,
  options?: {
    requiredPermission?: string;
    requiredRoles?: UserRole[];
  }
): Promise<
  { user: AuthUser; error: null } | { user: null; error: NextResponse }
> {
  const { user, error } = await checkAuth(request);

  if (error || !user) {
    return {
      user: null,
      error:
        error || NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Check role requirement
  if (options?.requiredRoles && !hasRole(user.role, options.requiredRoles)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  // Check permission requirement
  if (
    options?.requiredPermission &&
    !hasPermission(
      user.permissions || [],
      options.requiredPermission,
      user.role
    )
  ) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}
