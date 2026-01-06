import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import {
  sendAdminCredentials,
  sendAdminCreatedNotification,
} from "@/lib/emailHelpers";

export async function GET(_req: NextRequest) {
  try {
    const cookies = parse(_req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !["superadmin", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await User.find({
      role: { $in: ["superadmin", "admin", "subadmin"] },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error: unknown) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !["superadmin", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, permissions, memberId } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    if (!memberId && !password) {
      return NextResponse.json(
        { error: "Password is required for new users" },
        { status: 400 }
      );
    }

    if (!permissions || permissions.length === 0) {
      return NextResponse.json(
        { error: "At least one permission is required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create(body);
    console.log("user========>", user);

    // Send admin credentials email
    if (password && user.email) {
      try {
        await sendAdminCredentials(user.name, user.email, password, user.role);
      } catch (emailError) {
        console.error("Failed to send admin credentials email:", emailError);
      }
    }

    // Notify superadmin about new admin creation
    if (currentUser.email) {
      try {
        await sendAdminCreatedNotification(
          user.name,
          user.email,
          user.role,
          currentUser.name,
          currentUser.email
        );
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      user,
    });
  } catch (error: unknown) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create admin",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !["superadmin", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, phone, role, permissions } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Admin updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error: unknown) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update admin",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookies = parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !["superadmin", "admin"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting superadmin
    if (user.role === "superadmin") {
      return NextResponse.json(
        { error: "Cannot delete super admin" },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete admin",
      },
      { status: 500 }
    );
  }
}
