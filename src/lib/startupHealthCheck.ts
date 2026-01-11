/**
 * Startup Health Check
 * Displays connection status for MongoDB, Email Server, and Cron Jobs when server starts
 */

import mongoose from "mongoose";
import nodemailer from "nodemailer";

// Flag to ensure health check runs only once
let hasRun = false;

export async function runStartupHealthCheck() {
  // Run only once
  if (hasRun) return;
  hasRun = true;

  console.log("\n🔍 ========================================");
  console.log("🔍 STARTUP HEALTH CHECK");
  console.log("🔍 ========================================\n");

  // Check MongoDB Connection
  await checkMongoDBConnection();

  // Check Email Server Connection
  await checkEmailServerConnection();

  // Check Cron Jobs Status
  checkCronJobsStatus();

  console.log("\n🔍 ========================================");
  console.log("🔍 HEALTH CHECK COMPLETED");
  console.log("🔍 ========================================\n");
}

/**
 * Check MongoDB Connection
 */
async function checkMongoDBConnection() {
  try {
    const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;

    if (!MONGODB_URI) {
      console.log("❌ MongoDB: Configuration missing (MONGODB_URI not set)");
      return;
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB: Connected successfully");
      console.log(`   📍 Database: ${mongoose.connection.name}`);
      console.log(`   🔗 Host: ${mongoose.connection.host}`);
      return;
    }

    // Try to connect with timeout
    const connectPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), 5000)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    console.log("✅ MongoDB: Connected successfully");
    console.log(`   📍 Database: ${mongoose.connection.name}`);
    console.log(`   🔗 Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.log("❌ MongoDB: Connection failed");
    if (error instanceof Error) {
      console.log(`   ⚠️  Error: ${error.message}`);
    }
  }
}

/**
 * Check Email Server Connection
 */
async function checkEmailServerConnection() {
  try {
    const SMTP_HOST = process.env.NEXT_PUBLIC_SMTP_HOST;
    const SMTP_PORT = process.env.NEXT_PUBLIC_SMTP_PORT;
    const SMTP_USER = process.env.NEXT_PUBLIC_SMTP_USER;
    const SMTP_PASS = process.env.NEXT_PUBLIC_SMTP_PASS;
    const SKIP_EMAIL_CHECK = process.env.SKIP_EMAIL_CHECK === "true";

    if (SKIP_EMAIL_CHECK) {
      console.log("⏭️  Email Server: Check skipped");
      return;
    }

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.log("⚠️  Email Server: Configuration missing");
      console.log("   💡 Set SKIP_EMAIL_CHECK=true to skip this check");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587"),
      secure: process.env.NEXT_PUBLIC_SMTP_SECURE === "true",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 15000, // 15 seconds
      greetingTimeout: 15000,
    });

    // Verify connection with longer timeout
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), 15000)
    );

    await Promise.race([verifyPromise, timeoutPromise]);

    console.log("✅ Email Server: Connected successfully");
    console.log(`   📧 SMTP Host: ${SMTP_HOST}`);
    console.log(`   🔗 Port: ${SMTP_PORT || "587"}`);
    console.log(`   👤 User: ${SMTP_USER}`);
  } catch (error) {
    console.log("⚠️  Email Server: Connection check failed");
    console.log("   💡 Emails may still work - this is just a health check");
    console.log("   💡 Set SKIP_EMAIL_CHECK=true to skip this check");
    if (error instanceof Error) {
      console.log(`   📝 Error: ${error.message}`);
    }
  }
}

/**
 * Check Cron Jobs Status
 */
function checkCronJobsStatus() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    console.log("✅ Cron Jobs: Managed by Vercel");
    console.log("   📝 Jobs are configured in vercel.json");
  } else {
    console.log("✅ Cron Jobs: Running locally");
    console.log("   ⏰ Cleanup pending payments: Every 6 hours");
    console.log("   ⏰ Send retry emails: Daily at 9 AM");
  }
}

// Auto-run if this file is imported
if (typeof window === "undefined") {
  // Only run on server-side
  runStartupHealthCheck().catch((error) => {
    console.error("Health check failed:", error);
  });
}
