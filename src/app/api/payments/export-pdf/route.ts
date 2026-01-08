import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
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
      month = new Date();
    }

    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const payments = await Payment.find({
      month: { $gte: startOfMonth, $lte: endOfMonth },
      status: "completed",
    })
      .populate("member", "name email phone")
      .lean();

    const allMembers = await Member.find({ status: "active" })
      .select("name email phone")
      .lean();

    interface PopulatedPayment {
      member: {
        _id: { toString(): string };
        name: string;
        email: string;
        phone?: string;
      };
    }

    const paidMemberIds = new Set(
      payments.map((p) =>
        (p as unknown as PopulatedPayment).member._id.toString()
      )
    );
    const unpaidMembersList = allMembers.filter(
      (member) => !paidMemberIds.has(member._id.toString())
    );

    const totalAmount = payments.reduce(
      (sum: number, p) => sum + (p.amount || 0),
      0
    );

    // Generate HTML report
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #4CAF50;
      margin: 0;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .summary-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
    }
    .summary-card .value {
      font-size: 28px;
      font-weight: bold;
      color: #4CAF50;
    }
    .table-container {
      margin: 30px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #4CAF50;
      color: white;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .section-title {
      color: #4CAF50;
      margin-top: 40px;
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 10px;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Samrudhi Trust</h1>
    <h2>Monthly Payment Report</h2>
    <p>${month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
  </div>

  <div class="summary">
    <div class="summary-card">
      <h3>Total Amount</h3>
      <div class="value">₹${totalAmount.toLocaleString("en-IN")}</div>
    </div>
    <div class="summary-card">
      <h3>Paid Members</h3>
      <div class="value">${payments.length}</div>
    </div>
    <div class="summary-card">
      <h3>Unpaid Members</h3>
      <div class="value">${unpaidMembersList.length}</div>
    </div>
    <div class="summary-card">
      <h3>Total Members</h3>
      <div class="value">${allMembers.length}</div>
    </div>
  </div>

  <div class="table-container">
    <h2 class="section-title">Completed Payments</h2>
    <table>
      <thead>
        <tr>
          <th>S.No</th>
          <th>Member Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Amount</th>
          <th>Payment Date</th>
          <th>Invoice No.</th>
        </tr>
      </thead>
      <tbody>
        ${payments
          .map((payment, index: number) => {
            const p = payment as unknown as PopulatedPayment & {
              amount: number;
              paymentDate: Date;
              invoiceNumber?: string;
            };
            return `
        <tr>
          <td>${index + 1}</td>
          <td>${p.member.name}</td>
          <td>${p.member.email}</td>
          <td>${p.member.phone || "N/A"}</td>
          <td>₹${p.amount.toLocaleString("en-IN")}</td>
          <td>${new Date(p.paymentDate).toLocaleDateString("en-IN")}</td>
          <td>${p.invoiceNumber || "N/A"}</td>
        </tr>
        `;
          })
          .join("")}
      </tbody>
    </table>
  </div>

  ${
    unpaidMembersList.length > 0
      ? `
  <div class="table-container">
    <h2 class="section-title">Unpaid Members</h2>
    <table>
      <thead>
        <tr>
          <th>S.No</th>
          <th>Member Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${unpaidMembersList
          .map((member, index: number) => {
            const m = member as { name: string; email: string; phone?: string };
            return `
        <tr>
          <td>${index + 1}</td>
          <td>${m.name}</td>
          <td>${m.email}</td>
          <td>${m.phone || "N/A"}</td>
          <td style="color: red; font-weight: bold;">UNPAID</td>
        </tr>
        `;
          })
          .join("")}
      </tbody>
    </table>
  </div>
  `
      : ""
  }

  <div class="footer">
    <p>Report generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
    <p>Samrudhi Trust - Payment Management System</p>
  </div>
</body>
</html>
    `;

    // Use different Chrome for local vs production
    const isProduction = process.env.NODE_ENV === "production";

    const browser = await puppeteer.launch({
      args: isProduction
        ? [...chromium.args, "--disable-dev-shm-usage"]
        : ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: isProduction
        ? await chromium.executablePath()
        : process.platform === "darwin"
          ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          : process.platform === "win32"
            ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            : "/usr/bin/google-chrome",
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    await browser.close();

    const monthStr = month.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="payment-report-${monthStr}.pdf"`,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error exporting payment report:", err);
    return NextResponse.json(
      { error: err.message || "Failed to export payment report" },
      { status: 500 }
    );
  }
}
