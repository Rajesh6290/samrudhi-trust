/* eslint-disable no-console */
// Load environment variables FIRST
require("dotenv/config");

import connectDB from "../src/lib/mongodb";
import Member from "../src/models/Member";
import User from "../src/models/User";

/**
 * Script to automatically register all existing members as users
 * with member role and appropriate permissions
 */

const DEFAULT_PASSWORD = "Member@123"; // Members should change this on first login

const MEMBER_PERMISSIONS = [
  "profile",
  "dashboard",
  "my_donations",
  // Add audit_logs permission for members to see their activity
];

async function registerMembersAsUsers() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    console.log("📋 Fetching all active members...");
    const members = await Member.find({ isActive: true });
    console.log(`✅ Found ${members.length} active members`);

    let registered = 0;
    let alreadyExists = 0;
    let errors = 0;

    for (const member of members) {
      try {
        // Check if user already exists for this member
        const existingUser = await User.findOne({
          $or: [{ email: member.email }, { memberId: member._id }],
        });

        if (existingUser) {
          console.log(`⏭️  User already exists for member: ${member.name} (${member.email})`);
          
          // Update existing user to ensure they have member role and permissions
          if (existingUser.role !== "member") {
            existingUser.role = "member";
          }
          if (existingUser.memberId?.toString() !== member._id.toString()) {
            existingUser.memberId = member._id;
          }
          // Merge permissions
          const updatedPermissions = Array.from(
            new Set([...existingUser.permissions, ...MEMBER_PERMISSIONS])
          );
          existingUser.permissions = updatedPermissions;
          
          await existingUser.save();
          console.log(`✏️  Updated user for member: ${member.name}`);
          alreadyExists++;
          continue;
        }

        // Create new user for this member
        const newUser = new User({
          email: member.email,
          password: DEFAULT_PASSWORD, // Will be hashed by pre-save hook
          name: member.name,
          role: "member",
          phone: member.phone,
          photo: member.photo,
          memberId: member._id,
          permissions: MEMBER_PERMISSIONS,
          isActive: true,
        });

        await newUser.save();
        console.log(`✅ Registered new user for member: ${member.name} (${member.email})`);
        registered++;
      } catch (error) {
        console.error(`❌ Error processing member ${member.name}:`, error);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Registration Summary:");
    console.log("=".repeat(50));
    console.log(`✅ Newly registered: ${registered}`);
    console.log(`⏭️  Already existed: ${alreadyExists}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📝 Total members processed: ${members.length}`);
    console.log("=".repeat(50));
    console.log(`\n🔐 Default password for new accounts: ${DEFAULT_PASSWORD}`);
    console.log("⚠️  Members should change their password after first login\n");
    console.log("✅ Script completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the script
registerMembersAsUsers();
