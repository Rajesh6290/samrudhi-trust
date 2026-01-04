import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Member from "@/models/Member";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");

    let month: Date;
    if (monthParam) {
      month = new Date(monthParam);
    } else {
      // Default to current month
      month = new Date();
    }

    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Get all payments for the month
    const payments = await Payment.find({
      month: { $gte: startOfMonth, $lte: endOfMonth },
      status: "completed",
    }).populate("member", "name email phone");

    // Get all active members
    const allMembers = await Member.find({ isActive: true }).select(
      "name email phone"
    );

    // Get members who paid this month (filter out null members from deleted accounts)
    const validPayments = payments.filter((p: any) => p.member);
    const paidMemberIds = new Set(
      validPayments.map((p: any) => p.member._id.toString())
    );

    // Calculate statistics
    const totalAmount = validPayments.reduce(
      (sum: number, payment: any) => sum + payment.amount,
      0
    );
    const paidMembers = paidMemberIds.size; // Use Set size for unique members
    const unpaidMembers = allMembers.length - paidMembers;

    // Get unpaid members list
    const unpaidMembersList = allMembers.filter(
      (member: any) => !paidMemberIds.has(member._id.toString())
    );

    return NextResponse.json({
      success: true,
      report: {
        month: month.toISOString(),
        totalAmount,
        paidMembers,
        unpaidMembersCount: unpaidMembers,
        totalMembers: allMembers.length,
        payments: validPayments.map((p: any) => ({
          _id: p._id,
          member: p.member,
          amount: p.amount,
          paymentDate: p.paymentDate,
          invoiceNumber: p.invoiceNumber,
        })),
        unpaidMembers: unpaidMembersList.map((m: any) => ({
          _id: m._id,
          name: m.name,
          email: m.email,
          phone: m.phone,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error generating monthly report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate monthly report" },
      { status: 500 }
    );
  }
}
