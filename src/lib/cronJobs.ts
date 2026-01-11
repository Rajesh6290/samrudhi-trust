/**
 * Self-running cron jobs
 * Runs in all environments (development and production)
 */

import cron from "node-cron";
import { getBaseUrl } from "./getBaseUrl";

const BASE_URL = getBaseUrl() || "http://localhost:3000";

console.log("🚀 Starting cron jobs...");

// Periodic tasks - Every 6 hours (0:00, 6:00, 12:00, 18:00)
cron.schedule("0 */6 * * *", async () => {
  console.log("⏰ Running periodic tasks cron job...");
  try {
    const response = await fetch(`${BASE_URL}/api/cron/periodic-tasks`, {
      headers: {
        authorization: `Bearer ${process.env.CRON_SECRET || ""}`,
      },
    });
    const data = await response.json();
    console.log("✅ Periodic tasks completed:", data);
  } catch (error) {
    console.error("❌ Periodic tasks failed:", error);
  }
});

// Daily tasks - Daily at 2:00 AM
cron.schedule("0 2 * * *", async () => {
  console.log("⏰ Running daily tasks cron job...");
  try {
    const response = await fetch(`${BASE_URL}/api/cron/daily-tasks`, {
      headers: {
        authorization: `Bearer ${process.env.CRON_SECRET || ""}`,
      },
    });
    const data = await response.json();
    console.log("✅ Daily tasks completed:", data);
  } catch (error) {
    console.error("❌ Daily tasks failed:", error);
  }
});

console.log("✅ Cron jobs scheduled:");
console.log("   - Periodic tasks: Every 6 hours (cleanup pending payments)");
console.log(
  "   - Daily tasks: Daily at 2 AM (cleanup logs, notifications, update campaigns, send retry emails)"
);
