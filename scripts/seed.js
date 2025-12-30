#!/usr/bin/env node

/**
 * Database Seed Script
 * This script creates an admin user in the database
 * Run with: npm run seed or node scripts/seed.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/samrudhi-trust";

// Admin credentials from environment or defaults
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "admin@samrudhisevatrust.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin User";

// User Schema (same as model but for seeding)
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  try {
    console.log("🌱 Starting database seed...");
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI}`);

    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists");
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log("💡 To reset, delete the user from database and run again");
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin user
    const admin = await User.create({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: "admin",
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━".repeat(50));
    console.log("📧 Email:", admin.email);
    console.log("🔑 Password:", ADMIN_PASSWORD);
    console.log("👤 Name:", admin.name);
    console.log("🎭 Role:", admin.role);
    console.log("━".repeat(50));
    console.log("\n⚠️  IMPORTANT: Change the admin password after first login!");
    console.log("🌐 Login at: http://localhost:3000/admin/login\n");

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run seed
seed();
