/**
 * Local development cron jobs
 * Only runs when NODE_ENV !== 'production'
 * In production, Vercel handles cron jobs via vercel.json
 */

import cron from "node-cron";
import { getBaseUrl } from "./getBaseUrl";

const BASE_URL = getBaseUrl() || "http://localhost:3000";

// Only run cron jobs in non-production environments
if (process.env.NODE_ENV !== "production") {
  console.log("🔧 Starting local cron jobs...");

  // Cleanup pending payments - Every 6 hours (0:00, 6:00, 12:00, 18:00)
  cron.schedule("0 */6 * * *", async () => {
    console.log("⏰ Running cleanup-pending cron job...");
    try {
      const response = await fetch(`${BASE_URL}/api/payments/cleanup-pending`);
      const data = await response.json();
      console.log("✅ Cleanup completed:", data);
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
    }
  });

  // Send retry emails - Daily at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Running send-retry-emails cron job...");
    try {
      const response = await fetch(
        `${BASE_URL}/api/payments/send-retry-emails`
      );
      const data = await response.json();
      console.log("✅ Retry emails sent:", data);
    } catch (error) {
      console.error("❌ Send retry emails failed:", error);
    }
  });

  // Cleanup old audit logs - Daily at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("⏰ Running audit logs cleanup cron job...");
    try {
      const response = await fetch(`${BASE_URL}/api/audit-logs/cleanup-old`);
      const data = await response.json();
      console.log("✅ Audit logs cleanup completed:", data);
    } catch (error) {
      console.error("❌ Audit logs cleanup failed:", error);
    }
  });

  // Cleanup old notifications - Daily at 3:00 AM
  cron.schedule("0 3 * * *", async () => {
    console.log("⏰ Running notifications cleanup cron job...");
    try {
      const response = await fetch(`${BASE_URL}/api/notifications/cleanup-old`);
      const data = await response.json();
      console.log("✅ Notifications cleanup completed:", data);
    } catch (error) {
      console.error("❌ Notifications cleanup failed:", error);
    }
  });

  // Update campaign statuses - Daily at 4:00 AM
  cron.schedule("0 4 * * *", async () => {
    console.log("⏰ Running campaign status update cron job...");
    try {
      const response = await fetch(`${BASE_URL}/api/campaigns/update-status`);
      const data = await response.json();
      console.log("✅ Campaign status update completed:", data);
    } catch (error) {
      console.error("❌ Campaign status update failed:", error);
    }
  });

  console.log("✅ Local cron jobs scheduled:");
  console.log("   - Cleanup pending: Every 6 hours");
  console.log("   - Send retry emails: Daily at 9 AM");
  console.log("   - Cleanup audit logs: Daily at 2 AM");
  console.log("   - Cleanup notifications: Daily at 3 AM");
  console.log("   - Update campaign statuses: Daily at 4 AM");
} else {
  console.log("🚀 Production mode: Cron jobs handled by Vercel");
}
