interface InvoiceData {
  organizationName: string;
  organizationEmail: string;
  organizationPhone: string;
  organizationAddress: string;
  chairmanName: string;
  chairmanPhoto?: string;
  invoiceNumber: string;
  date: string;
  donorName: string;
  donorAddress: string;
  donorEmail?: string;
  donorPhone?: string;
  panCard?: string;
  amount: number;
  amountInWords: string;
  transactionId?: string;
  paymentMode: string;
  paymentType?: string;
}

export const invoice = (data: InvoiceData) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Samriddhi Seva Trust</title>
    <style>
        @page {
            size: A4;
            margin: 8mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: white;
            padding: 0;
        }
        
        .invoice {
            width: 100%;
            height: 100%;
            margin: 0;
            background: white;
            padding: 15px;
            border: none;
            page-break-inside: avoid;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #000;
        }
        
        .company-info h1 {
            font-size: 18px;
            margin-bottom: 8px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .company-info p {
            font-size: 9px;
            line-height: 1.4;
            margin: 1px 0;
        }
        
        .logo-box {
            width: 100px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .logo-box img {
            max-width: 100%;
            max-height: 100%;
        }
        
        .invoice-title {
            text-align: right;
            margin-bottom: 10px;
        }
        
        .invoice-title h2 {
            font-size: 20px;
            font-weight: bold;
        }
        
        .details-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
        }
        
        .details-box {
            width: 48%;
            padding: 0;
        }
        
        .details-box h3 {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 6px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
        }
        
        .details-box p {
            font-size: 9px;
            line-height: 1.5;
            margin: 2px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            border: 1px solid #000;
        }
        
        table th {
            background: #e8e8e8;
            color: #000;
            padding: 6px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            border: 1px solid #000;
        }
        
        table td {
            padding: 6px;
            font-size: 9px;
            border: 1px solid #000;
        }
        
        table tbody tr:last-child td {
            border-bottom: 1px solid #000;
        }
        
        table th.right,
        table td.right {
            text-align: right;
        }
        
        table th.center,
        table td.center {
            text-align: center;
        }
        
        .totals {
            margin-top: 10px;
            margin-bottom: 15px;
            float: right;
            width: 250px;
        }
        
        .totals table {
            margin: 0;
            border: 1px solid #000;
        }
        
        .totals table td {
            padding: 5px 10px;
            border: none;
            border-bottom: 1px solid #000;
            font-size: 9px;
        }
        
        .totals table tr:last-child td {
            border-bottom: none;
        }
        
        .totals table tr.total td {
            border-top: 1px solid #000;
            padding: 6px 10px;
            font-weight: bold;
            font-size: 11px;
        }
        
        .amount-words {
            clear: both;
            margin-top: 15px;
            font-size: 9px;
            padding: 6px;
            border: 1px solid #000;
        }
        
        .terms {
            margin-top: 12px;
            font-size: 8px;
            line-height: 1.4;
            border: 1px solid #000;
            padding: 8px;
        }
        
        .terms h4 {
            font-size: 9px;
            margin-bottom: 3px;
        }
        
        .signature-area {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
        }
        
        .signature-box {
            width: 180px;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 30px;
            margin-bottom: 3px;
        }
        
        .signature-label {
            font-size: 8px;
            text-align: center;
        }
        
        .footer {
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 8px;
        }
        
        .print-buttons {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        }
        
        .print-btn {
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transition: all 0.3s;
        }
        
        .print-btn:hover {
            background: #2563eb;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateY(-2px);
        }
        
        .download-btn {
            background: #10b981;
        }
        
        .download-btn:hover {
            background: #059669;
        }
        
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
            }
            body {
                padding: 0;
            }
            .invoice {
                border: none;
                padding: 15px;
            }
            .print-buttons {
                display: none !important;
            }
        }
    </style>
    <script>
        function printInvoice() {
            window.print();
        }
        
        function downloadInvoice() {
            window.print();
        }
    </script>
</head>
<body>
    <div class="print-buttons">
        <button class="print-btn" onclick="printInvoice()">🖨️ Print Invoice</button>
        <button class="print-btn download-btn" onclick="downloadInvoice()">💾 Save as PDF</button>
    </div>
    
    <div class="invoice">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <h1>${data.organizationName.toUpperCase()}</h1>
                <p>${data.organizationAddress}</p>
                <p>Email: ${data.organizationEmail}</p>
                <p>Phone: ${data.organizationPhone}</p>
                <p>PAN: AABTI1433N | GSTIN: XXXXXXXXXXXXXXX</p>
            </div>
            <div class="logo-box">
                <img src="/logo.svg" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
        </div>
        
        <!-- Invoice Title -->
        <div class="invoice-title">
            <h2>INVOICE</h2>
        </div>
        
        <!-- Details Row -->
        <div class="details-row">
            <div class="details-box">
                <h3>BILL TO</h3>
                <p><strong>${data.donorName}</strong></p>
                <p>${data.donorAddress}</p>
                ${data.panCard ? `<p>PAN: ${data.panCard}</p>` : ""}
                ${data.donorEmail ? `<p>Email: ${data.donorEmail}</p>` : ""}
                ${data.donorPhone ? `<p>Phone: ${data.donorPhone}</p>` : ""}
            </div>
            <div class="details-box">
                <h3>INVOICE DETAILS</h3>
                <p><strong>Invoice No:</strong> ${data.invoiceNumber}</p>
                <p><strong>Invoice Date:</strong> ${data.date}</p>
                <p><strong>Payment Mode:</strong> ${data.paymentMode}</p>
                <p><strong>Transaction ID:</strong> ${data.transactionId || "N/A"}</p>
                <p><strong>Due Date:</strong> ${data.date}</p>
            </div>
        </div>
        
        <!-- Items Table -->
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 50%;">DESCRIPTION</th>
                    <th class="center" style="width: 10%;">QTY</th>
                    <th class="right" style="width: 15%;">RATE</th>
                    <th class="right" style="width: 20%;">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>${data.paymentType === "member" ? "Membership Payment" : "Donation/Contribution"}</td>
                    <td class="center">1</td>
                    <td class="right">${data.amount.toFixed(2)}</td>
                    <td class="right">${data.amount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td class="right">₹${data.amount.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Tax (0%):</td>
                    <td class="right">₹0.00</td>
                </tr>
                <tr class="total">
                    <td>TOTAL:</td>
                    <td class="right">₹${data.amount.toFixed(2)}</td>
                </tr>
            </table>
        </div>
        
        <!-- Amount in Words -->
        <div class="amount-words">
            <strong>Amount in Words:</strong> ${data.amountInWords}
        </div>
        
        <!-- Terms -->
        <div class="terms">
            <h4>Terms & Conditions:</h4>
            <p>1. Payment is due upon receipt of invoice.</p>
            <p>2. This is a computer-generated invoice and does not require a signature.</p>
            <p>3. For any queries, please contact us at ${data.organizationEmail} or ${data.organizationPhone}.</p>
        </div>
        
        <!-- Signatures -->
        <div class="signature-area">
            <div class="signature-box">
                <div class="signature-line"></div>
                <p class="signature-label">Customer Signature</p>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <p class="signature-label">Authorized Signatory</p>
                <p style="font-size: 10px; margin-top: 3px;">${data.chairmanName}</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Thank you for your business!</p>
        </div>
    </div>
</body>
</html>
    `;
};
