import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Member from "@/models/Member";
import Payment from "@/models/Payment";
import SiteSettings from "@/models/SiteSettings";
import { exportMember } from "@/features/templates/exportMember";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

interface MemberData {
  name: string;
  email: string;
  phone: string;
  bloodGroup?: string;
  joiningDate?: string;
  receivedIdCard?: boolean;
  receivedTshirt?: boolean;
  paymentStatus?: string;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get("type") || "all";

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

    // Fetch all members without pagination
    const members = await Member.find({}).sort({ createdAt: 1 }).lean();

    // Get current month for payment status check
    const currentDate = new Date();
    const currentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    // Prepare member data based on export type
    const membersData: MemberData[] = [];

    if (exportType === "all") {
      // All: Include all member details with payment status
      for (const member of members) {
        const payment = await Payment.findOne({
          member: member._id,
          month: currentMonth,
          status: "completed",
        }).lean();

        membersData.push({
          name: member.name,
          email: member.email,
          phone: member.phone || "",
          bloodGroup: member.bloodGroup || "",
          joiningDate: member.joiningDate
            ? new Date(member.joiningDate).toLocaleDateString("en-IN")
            : "",
          receivedIdCard: member.receivedIdCard,
          receivedTshirt: member.receivedTshirt,
          paymentStatus: payment ? "Paid" : "Unpaid",
        });
      }
    } else if (exportType === "payment") {
      // Payment: Only basic details with payment status
      for (const member of members) {
        const payment = await Payment.findOne({
          member: member._id,
          month: currentMonth,
          status: "completed",
        }).lean();

        membersData.push({
          name: member.name,
          email: member.email,
          phone: member.phone || "",
          paymentStatus: payment ? "Paid" : "Unpaid",
        });
      }
    } else if (exportType === "minimal") {
      // Minimal: only name, email, phone
      members.forEach((member) => {
        membersData.push({
          name: member.name,
          email: member.email,
          phone: member.phone || "",
        });
      });
    }

    // Generate HTML content
    const htmlContent = generateHTMLContent(
      membersData,
      exportType,
      currentMonth,
      settings,
      logoBase64
    );

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
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

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="members-export-${exportType}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Export PDF error:", error);
    return NextResponse.json(
      { error: "Failed to export members to PDF" },
      { status: 500 }
    );
  }
}

function generateHTMLContent(
  membersData: MemberData[],
  exportType: string,
  currentMonth: Date,
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

  // Prepare table headers based on export type
  let tableHeaders = "";
  if (exportType === "minimal") {
    tableHeaders = `
      <th style="width: 60px; text-align: center; padding: 10px 8px; font-weight: 600; font-size: 12px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">SL No</th>
      <th style="padding: 10px 8px; font-weight: 600; font-size: 12px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">Name</th>
      <th style="padding: 10px 8px; font-weight: 600; font-size: 12px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">Email</th>
      <th style="padding: 10px 8px; font-weight: 600; font-size: 12px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">Phone</th>
    `;
  } else if (exportType === "payment") {
    tableHeaders = `
      <th style="width: 30px; text-align: center; padding: 10px 5px; font-weight: 600; font-size: 11px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">SL</th>
      <th style="padding: 10px 8px; font-weight: 600; font-size: 11px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; width: 20%;">Name</th>
      <th style="padding: 10px 8px; font-weight: 600; font-size: 11px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; width: 25%;">Email</th>
      <th style="padding: 10px 8px; font-weight: 600; font-size: 11px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; width: 15%;">Phone</th>
      <th style="padding: 10px 8px; font-weight: 600; font-size: 11px; color: #555; text-transform: uppercase; text-align: center; border-bottom: 2px solid #e0e0e0; width: 15%;">Payment (${currentMonth.toLocaleDateString(
        "en-IN",
        {
          month: "short",
          year: "numeric",
        }
      )})</th>
    `;
  } else {
    // All - with all details
    tableHeaders = `
      <th style="width: 40px; text-align: center; padding: 10px 4px; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0;">SL</th>
      <th style="padding: 10px 6px; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; width: 13%;">Name</th>
      <th style="padding: 10px 6px; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; width: 16%;">Email</th>
      <th style="padding: 10px 6px; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; width: 11%;">Phone</th>
      <th style="padding: 10px 6px; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; text-align: center; width: 8%;">Blood</th>
      <th style="padding: 10px 6px; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; text-align: center; width: 11%;">Joining</th>
      <th style="padding: 10px 6px; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; text-align: center; width: 8%;">ID Card</th>
      <th style="padding: 10px 6px; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; text-align: center; width: 9%;">T-Shirt</th>
      <th style="padding: 10px 6px; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; border-bottom: 2px solid #e0e0e0; text-align: center; width: 10%;">Payment</th>
    `;
  }

  // Split data into pages (25 rows per page to prevent cutting)
  const itemsPerPage =
    exportType === "all" ? 27 : exportType === "minimal" ? 29 : 23;
  const totalPages = Math.ceil(membersData.length / itemsPerPage);
  let allPagesHTML = "";

  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
    const startIndex = pageNum * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, membersData.length);
    const pageData = membersData.slice(startIndex, endIndex);

    // Generate table rows for this page
    let tableRows = "";
    pageData.forEach((member, index) => {
      const serialNo = startIndex + index + 1;

      if (exportType === "minimal") {
        tableRows += `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="text-align: center; padding: 10px 5px; font-weight: 500; color: #7f8c8d; font-size: 11px;">${serialNo}</td>
            <td style="padding: 10px 8px; color: #2c3e50; font-size: 11px;">${member.name}</td>
            <td style="padding: 10px 8px; color: #2c3e50; font-size: 11px;">${member.email}</td>
            <td style="padding: 10px 8px; color: #2c3e50; font-size: 11px;">${member.phone}</td>
          </tr>
        `;
      } else if (exportType === "payment") {
        tableRows += `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="text-align: center; padding: 10px 5px; font-weight: 500; color: #7f8c8d; font-size: 10px;">${serialNo}</td>
            <td style="padding: 10px 8px; color: #2c3e50; font-size: 10px;">${member.name}</td>
            <td style="padding: 10px 8px; color: #2c3e50; font-size: 10px;">${member.email}</td>
            <td style="padding: 10px 8px; color: #2c3e50; font-size: 10px;">${member.phone}</td>
            <td style="text-align: center; padding: 10px 8px;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 10px; font-weight: 600; ${
                member.paymentStatus === "Paid"
                  ? "background-color: #d1fae5; color: #065f46;"
                  : "background-color: #fee2e2; color: #991b1b;"
              }">
                ${member.paymentStatus}
              </span>
            </td>
          </tr>
        `;
      } else {
        // All - with all details
        tableRows += `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="text-align: center; padding: 8px 4px; font-weight: 500; color: #7f8c8d; font-size: 9px;">${serialNo}</td>
            <td style="padding: 8px 6px; color: #2c3e50; font-size: 9px;">${member.name}</td>
            <td style="padding: 8px 6px; color: #2c3e50; font-size: 9px;">${member.email}</td>
            <td style="padding: 8px 6px; color: #2c3e50; font-size: 9px;">${member.phone}</td>
            <td style="text-align: center; padding: 8px 6px; color: #2c3e50; font-size: 9px; font-weight: 600;">${member.bloodGroup || "-"}</td>
            <td style="text-align: center; padding: 8px 6px; color: #2c3e50; font-size: 8px;">${member.joiningDate || "-"}</td>
            <td style="text-align: center; padding: 8px 6px;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 8px; font-weight: 600; ${
                member.receivedIdCard
                  ? "background-color: #d1fae5; color: #065f46;"
                  : "background-color: #fee2e2; color: #991b1b;"
              }">
                ${member.receivedIdCard ? "Yes" : "No"}
              </span>
            </td>
            <td style="text-align: center; padding: 8px 6px;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 10px; font-size: 8px; font-weight: 600; ${
                member.receivedTshirt
                  ? "background-color: #d1fae5; color: #065f46;"
                  : "background-color: #fee2e2; color: #991b1b;"
              }">
                ${member.receivedTshirt ? "Yes" : "No"}
              </span>
            </td>
            <td style="text-align: center; padding: 8px 6px;">
              <span style="display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 8px; font-weight: 600; ${
                member.paymentStatus === "Paid"
                  ? "background-color: #d1fae5; color: #065f46;"
                  : "background-color: #fee2e2; color: #991b1b;"
              }">
                ${member.paymentStatus}
              </span>
            </td>
          </tr>
        `;
      }
    });

    // Create page HTML
    const pageHTML = `
      <div class="container" style="${pageNum > 0 ? "page-break-before: always;" : ""}">
        <div class="header" style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; padding: 20px 15px; border-bottom: 1px solid #e0e0e0; width: 100%;">
          <div style="flex: 1;">
            <h1 style="font-size: 24px; font-weight: 600; color: #2c3e50; margin: 0 0 5px 0; line-height: 1.2;">${organizationName}</h1>
            <p style="font-size: 12px; color: #7f8c8d; margin: 0 0 2px 0; line-height: 1.4;">${address}</p>
            ${phone ? `<p style="font-size: 11px; color: #7f8c8d; margin: 0; line-height: 1.4;">Phone: ${phone}</p>` : ""}
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
          <div class="total-rows">Page ${pageNum + 1} of ${totalPages} | Total Members: ${membersData.length}</div>
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
