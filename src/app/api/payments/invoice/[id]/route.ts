import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import SiteSettings from "@/models/SiteSettings";
import Member from "@/models/Member";
import { invoice80GTemplate } from "@/features/templates/80G";
import { invoice } from "@/features/templates/invoice";

// Helper function to convert number to words (Indian style)
function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  if (num === 0) return "Zero";

  function convertTwoDigits(n: number): string {
    if (n < 10) return ones[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
  }

  function convertThreeDigits(n: number): string {
    if (n < 100) return convertTwoDigits(n);
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " " + convertTwoDigits(n % 100) : "")
    );
  }

  if (num < 1000) return convertThreeDigits(num);
  if (num < 100000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    return (
      convertThreeDigits(thousands) +
      " Thousand" +
      (remainder !== 0 ? " " + convertThreeDigits(remainder) : "")
    );
  }
  if (num < 10000000) {
    const lakhs = Math.floor(num / 100000);
    const remainder = num % 100000;
    return (
      convertTwoDigits(lakhs) +
      " Lakh" +
      (remainder !== 0 ? " " + numberToWords(remainder) : "")
    );
  }
  const crores = Math.floor(num / 10000000);
  const remainder = num % 10000000;
  return (
    convertTwoDigits(crores) +
    " Crore" +
    (remainder !== 0 ? " " + numberToWords(remainder) : "")
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const payment = await Payment.findById(id).populate("member");

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "completed") {
      return NextResponse.json(
        { error: "Invoice only available for completed payments" },
        { status: 400 }
      );
    }

    // Fetch site settings for organization details
    let settings = await SiteSettings.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = await SiteSettings.create({
        organizationName: "Samrudhi Trust",
        email: "info@samrudhitrust.org",
        phone: "+91-XXXXXXXXXX",
        address:
          "Building no.1, First Floor, Mathan One, Sunlight Colony - 2, Ashram, New Delhi - 110014",
      });
    }

    // Fetch chairman for signature
    const chairman = await Member.findOne({
      role: { $regex: /chairman/i },
      isActive: true,
    }).sort({ createdAt: 1 });

    // Get donor/member details with proper type checking
    const memberData =
      payment.member &&
      typeof payment.member === "object" &&
      "name" in payment.member
        ? (payment.member as any)
        : null;

    const donorName =
      payment.paymentType === "member" && memberData
        ? memberData.name
        : payment.donorName || "N/A";
    const donorEmail =
      payment.paymentType === "member" && memberData
        ? memberData.email
        : payment.donorEmail || "N/A";
    const donorPhone =
      payment.paymentType === "member" && memberData
        ? memberData.phone || payment.donorPhone || "N/A"
        : payment.donorPhone || "N/A";
    const donorAddress =
      payment.paymentType === "member" && memberData && memberData.address
        ? memberData.address
        : payment.donorAddress || settings.address;

    // Parse address for 80G template (assuming format: address, city, state - pincode)
    const addressParts = donorAddress.split(",").map((s: string) => s.trim());
    const lastPart = addressParts[addressParts.length - 1] || "";
    const pincodeMatch = lastPart.match(/(\d{6})/);
    const pincode = pincodeMatch ? pincodeMatch[1] : "000000";
    const stateCity = lastPart.replace(/\s*-?\s*\d{6}/, "").trim();

    const city = stateCity || "N/A";
    const state =
      addressParts.length > 2 ? addressParts[addressParts.length - 2] : "N/A";
    const addressLine = addressParts.slice(0, -1).join(", ") || donorAddress;

    // Format date
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    // Convert amount to words
    const amountInWords = `Rupees ${numberToWords(Math.floor(payment.amount))} Only`;

    // Prepare data for templates
    const invoiceData = {
      // Organization details
      organizationName: settings.organizationName,
      organizationEmail: settings.email,
      organizationPhone: settings.phone,
      organizationAddress: settings.address,

      // Chairman details
      chairmanName: chairman?.name || "Authorized Signatory",
      chairmanPhoto: chairman?.photo || "",

      // Payment details
      receiptNo: payment.invoiceNumber || payment._id.toString(),
      invoiceNumber: payment.invoiceNumber || payment._id.toString(),
      certificateNumber: payment.certificateNumber80G,
      date: formatDate(payment.paymentDate),
      donorName,
      donorEmail: donorEmail || "",
      donorPhone: donorPhone || "",
      donorAddress: addressLine,
      city,
      state,
      pincode,
      panCard: payment.panCard || "",
      amount: payment.amount,
      amountInWords,
      transactionId: payment.razorpayPaymentId || "",
      paymentMode: payment.paymentMethod
        ? payment.paymentMethod.charAt(0).toUpperCase() +
          payment.paymentMethod.slice(1)
        : "Online",
      paymentType: payment.paymentType,
      month: payment.month,
    };

    // Generate invoice HTML using your templates
    const invoiceHTML = payment.needs80G
      ? invoice80GTemplate(invoiceData)
      : invoice(invoiceData);

    return NextResponse.json({
      success: true,
      invoiceHTML,
      payment: {
        _id: payment._id,
        invoiceNumber: payment.invoiceNumber,
        amount: payment.amount,
        needs80G: payment.needs80G,
        certificateNumber80G: payment.certificateNumber80G,
        razorpayPaymentId: payment.razorpayPaymentId,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching invoice:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
