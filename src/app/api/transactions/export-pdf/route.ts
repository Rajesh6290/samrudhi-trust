import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import SiteSettings from "@/models/SiteSettings";
import { exportMember } from "@/features/templates/exportMember";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import path from "path";
import fs from "fs";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const dateRangeLabel = searchParams.get("label") || "Transaction History";

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    // Fetch settings
    const settings = await SiteSettings.findOne({}).lean();

    // Read logo file
    const logoPath = path.join(process.cwd(), "public", "logo.svg");
    let logoBase64 = "";
    try {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = logoBuffer.toString("base64");
    } catch (error) {
      console.error("Error reading logo:", error);
    }

    // Fetch transactions for the date range
    const transactions = await Transaction.find({
      transactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate("member", "name")
      .sort({ transactionDate: -1 })
      .lean();

    // Generate HTML content
    const htmlContent = generateHTMLContent(
      transactions,
      dateRangeLabel,
      settings,
      logoBase64
    );

    // Generate PDF using puppeteer-core with chromium
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
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });

    await browser.close();

    // Return PDF as response - open in browser preview
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="transactions-${dateRangeLabel.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Export PDF error:", error);
    return NextResponse.json(
      { error: "Failed to export transactions to PDF" },
      { status: 500 }
    );
  }
}

function generateHTMLContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[],
  dateRangeLabel: string,
  settings: {
    organizationName?: string;
    address?: string;
    phone?: string;
  } | null,
  logoBase64: string
): string {
  const template = exportMember();

  const organizationName = settings?.organizationName || "Samrudhi Trust";
  const address = settings?.address || "";
  const phone = settings?.phone || "";

  // Calculate totals
  const incomingTotal = transactions
    .filter((t) => t.transactionType === "incoming" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const outgoingTotal = transactions
    .filter((t) => t.transactionType === "outgoing" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  // Prepare table headers
  const tableHeaders = `
    <th style="width: 50px; text-align: center; padding: 8px 5px; font-weight: 600; font-size: 13px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">SL</th>
    <th style="padding: 8px 8px; font-weight: 600; font-size: 13px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">Date</th>
    <th style="padding: 8px 8px; font-weight: 600; font-size: 13px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">Name</th>
    <th style="padding: 8px 8px; font-weight: 600; font-size: 13px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">Invoice/ID</th>
    <th style="padding: 8px 8px; font-weight: 600; font-size: 13px; color: #555; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e0e0e0;">Status</th>
    <th style="padding: 8px 8px; font-weight: 600; font-size: 13px; color: #555; text-transform: uppercase; text-align: right; border-bottom: 2px solid #e0e0e0;">Amount</th>
  `;

  // Split data into pages (25 rows per page)
  const itemsPerPage = 25;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  let allPagesHTML = "";

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const startIndex = pageNum * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, transactions.length);
    const pageData = transactions.slice(startIndex, endIndex);

    // Generate table rows for this page
    let tableRows = "";
    pageData.forEach((transaction, index) => {
      const serialNo = startIndex + index + 1;
      const name =
        transaction.transactionType === "incoming"
          ? transaction.paymentType === "member"
            ? transaction.member?.name || "N/A"
            : transaction.donorName || "N/A"
          : transaction.recipientName || "N/A";

      tableRows += `
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="text-align: center; padding: 8px 5px; font-weight: 500; color: #7f8c8d; font-size: 12px;">${serialNo}</td>
          <td style="padding: 8px 8px; color: #2c3e50; font-size: 12px;">${new Date(transaction.transactionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
          <td style="padding: 8px 8px; color: #2c3e50; font-size: 12px;">${name}</td>
          <td style="padding: 8px 8px; color: #2c3e50; font-size: 12px;">${transaction.invoiceNumber || transaction.payoutId || "N/A"}</td>
          <td style="text-align: center; padding: 8px 8px;">
            <span style="display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; ${
              transaction.status === "completed"
                ? "background-color: #d1fae5; color: #065f46;"
                : transaction.status === "pending"
                  ? "background-color: #fef3c7; color: #92400e;"
                  : "background-color: #fee2e2; color: #991b1b;"
            }">
              ${transaction.status.toUpperCase()}
            </span>
          </td>
          <td style="text-align: right; padding: 8px 8px; font-weight: 600; font-size: 12px; color: ${transaction.transactionType === "incoming" ? "#059669" : "#dc2626"};">
            ${transaction.transactionType === "incoming" ? "+" : "-"}₹${transaction.amount.toLocaleString("en-IN")}
          </td>
        </tr>
      `;
    });

    // Create page HTML
    const pageHTML = `
      <div class="container" style="${pageNum > 0 ? "page-break-before: always;" : ""}">
        <div class="header" style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; padding: 20px 15px; border-bottom: 1px solid #e0e0e0; width: 100%;">
          <div style="flex: 1;">
            <h1 style="font-size: 24px; font-weight: 600; color: #2c3e50; margin: 0 0 5px 0; line-height: 1.2;">${organizationName}</h1>
            <p style="font-size: 12px; color: #7f8c8d; margin: 0 0 2px 0; line-height: 1.4;">${address}</p>
            ${phone ? `<p style="font-size: 11px; color: #7f8c8d; margin: 0; line-height: 1.4;">Phone: ${phone}</p>` : ""}
            <p style="font-size: 13px; color: #2c3e50; margin-top: 8px; font-weight: 500;">Transaction History - ${dateRangeLabel}</p>
          </div>
          ${logoBase64 ? `<img src="data:image/svg+xml;base64,${logoBase64}" alt="Logo" style="width: 60px; height: 60px; object-fit: contain; flex-shrink: 0;" />` : ""}
        </div>
        <div class="content" style="padding: 0;">
          <table style="width: 100%; border-collapse: collapse; background: white;">
            <thead style="background: #fafafa;">
              <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        <div class="info-bar" style="padding: 8px 15px; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; font-size: 10px; color: #555;">
          <div class="date-time">Date: ${new Date().toLocaleDateString("en-IN")}</div>
          <div class="total-rows">Page ${pageNum + 1} of ${totalPages} | Total: ${transactions.length} | Incoming: ₹${incomingTotal.toLocaleString("en-IN")} | Outgoing: ₹${outgoingTotal.toLocaleString("en-IN")}</div>
        </div>
      </div>
    `;

    allPagesHTML += pageHTML;
  }

  // Replace the container section in template with all pages
  const htmlContent = template.replace(
    /<div class="container">[\s\S]*?<\/div>\s*<script>/,
    allPagesHTML + "\n<script>"
  );

  return htmlContent;
}
