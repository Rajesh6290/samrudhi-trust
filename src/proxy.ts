import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

// Define route permissions mapping
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/admin/dashboard": "dashboard",
  "/admin/members": "members",
  "/admin/services": "services",
  "/admin/campaigns": "campaigns",
  "/admin/volunteers": "volunteers",
  "/admin/blogs": "blogs",
  "/admin/stats": "stats",
  "/admin/testimonials": "testimonials",
  "/admin/gallery": "gallery",
  "/admin/certificates": "certificates",
  "/admin/content": "content",
  "/admin/feedback": "feedback",
  "/admin/contact": "contact",
  "/admin/settings": "settings",
  "/admin/admins": "admins",
  "/admin/profile": "profile",
  "/admin/team": "team",
};

// Routes that require specific roles
const ROLE_RESTRICTED_ROUTES: Record<string, string[]> = {
  "/admin/admins": ["superadmin", "admin"],
};

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and public routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/) ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Check if route is an admin route
  if (pathname.startsWith("/admin")) {
    try {
      // Get token from cookies
      const cookies = parse(request.headers.get("cookie") || "");
      const token = cookies.token;

      // If no token, redirect to login
      if (!token) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }

      // Verify token
      const payload = verifyToken(token);
      if (!payload) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }

      // Get user data from token
      const userRole = payload.role as string;
      const userPermissions = payload.permissions as string[];

      // Superadmin has access to everything
      if (userRole === "superadmin") {
        return NextResponse.next();
      }

      // Check role-based restrictions
      const requiredRoles = ROLE_RESTRICTED_ROUTES[pathname];
      if (requiredRoles && !requiredRoles.includes(userRole)) {
        // Redirect to dashboard with error message
        const url = request.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        url.searchParams.set("error", "insufficient_permissions");
        return NextResponse.redirect(url);
      }

      // Check permission-based restrictions
      const requiredPermission = ROUTE_PERMISSIONS[pathname];
      if (requiredPermission) {
        const hasPermission = userPermissions?.includes(requiredPermission);

        if (!hasPermission) {
          // Redirect to dashboard with error message
          const url = request.nextUrl.clone();
          url.pathname = "/admin/dashboard";
          url.searchParams.set("error", "insufficient_permissions");
          return NextResponse.redirect(url);
        }
      }

      // Allow access
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
