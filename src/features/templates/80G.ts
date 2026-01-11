interface Certificate80GData {
  organizationName: string;
  organizationEmail: string;
  organizationPhone: string;
  organizationAddress: string;
  organizationPan: string;
  organizationGstin?: string;
  chairmanName: string;
  chairmanPhoto?: string;
  logoUrl?: string;
  receiptNo: string;
  certificateNumber?: string;
  date: string;
  donorName: string;
  donorAddress: string;
  city: string;
  state: string;
  pincode: string;
  panCard?: string;
  amount: number;
  amountInWords: string;
  transactionId?: string;
  paymentMode: string;
}

export const invoice80GTemplate = (data: Certificate80GData) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>80G Certificate</title>
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
        
        .certificate {
            width: 100%;
            height: 100%;
            margin: 0;
            background: white;
            padding: 20px;
            box-shadow: none;
            page-break-inside: avoid;
        }
        
        .title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            gap: 20px;
        }
        
        .donor-info {
            flex: 1;
            line-height: 1.5;
            font-size: 11px;
        }
        
        .donor-info p {
            margin: 3px 0;
        }
        
        .logo {
            width: 150px;
            height: 90px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .receipt-no {
            font-weight: bold;
        }
        
        .greeting {
            margin: 15px 0;
            font-weight: bold;
            font-size: 12px;
        }
        
        .message {
            margin: 10px 0;
            line-height: 1.5;
            text-align: justify;
            font-size: 11px;
        }
        
        .signature-section {
            margin: 20px 0;
        }
        
        .signature {
            font-family: 'Brush Script MT', cursive;
            font-size: 24px;
            margin: 12px 0;
        }
        
        .signatory {
            margin-top: 6px;
            font-size: 11px;
        }
        
        .divider {
            border: none;
            border-top: 2px solid #333;
            margin: 20px 0;
        }
        
        .receipt-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 15px 0;
        }
        
        .receipt-text {
            margin: 12px 0;
            line-height: 1.5;
            font-size: 11px;
        }
        
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .details-table td {
            border: 1px solid #333;
            padding: 6px;
            font-size: 10px;
        }
        
        .details-table td:first-child {
            width: 50%;
            font-weight: 500;
        }
        
        .tax-info {
            margin: 15px 0;
            line-height: 1.6;
            text-align: justify;
            font-size: 10px;
        }
        
        .note {
            margin: 12px 0;
            line-height: 1.5;
            font-size: 10px;
        }
        
        .computer-generated {
            margin: 15px 0;
            font-size: 9px;
            line-height: 1.5;
        }
        
        .footer {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #ddd;
        }
        
        .registered-office {
            font-size: 9px;
            line-height: 1.5;
        }
        
        .registered-office strong {
            font-weight: bold;
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
            background: #10b981;
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
            background: #059669;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transform: translateY(-2px);
        }
        
        .download-btn {
            background: #3b82f6;
        }
        
        .download-btn:hover {
            background: #2563eb;
        }
        
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
            }
            body {
                background: white;
            }
            .certificate {
                box-shadow: none;
                padding: 20px;
            }
            .print-buttons {
                display: none !important;
            }
        }
    </style>
    <script>
        function printCertificate() {
            window.print();
        }
        
        function downloadCertificate() {
            window.print();
        }
    </script>
</head>
<body>
    <div class="print-buttons">
        <button class="print-btn" onclick="printCertificate()">🖨️ Print Certificate</button>
        <button class="print-btn download-btn" onclick="downloadCertificate()">💾 Save as PDF</button>
    </div>
    
    <div class="certificate">
        <div class="title">80G Certificate</div>
        
        <div class="header">
            <div class="donor-info">
                <p class="receipt-no">Receipt No.: ${data.receiptNo}</p>
                ${data.certificateNumber ? `<p class="receipt-no">Certificate No.: ${data.certificateNumber}</p>` : ""}
                <p style="margin-top: 15px;">${data.date}</p>
                <p><strong>${data.donorName}</strong></p>
                <p>${data.donorAddress}</p>
                <p>${data.city}, ${data.state} - ${data.pincode}</p>
                <p>PAN No. - ${data.panCard}</p>
            </div>
            
            <div class="logo">
                <img src="${data.logoUrl || "/logo.svg"}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            </div>
        </div>
        
        <p class="greeting">Dear ${data.donorName}</p>
        
        <p class="message">
            Thank you for making a contribution of <strong>Rs ${data.amount}</strong> to Samriddhi Seva Trust. Please keep this written acknowledgement of your donation for your tax records.
        </p>
        
        <div class="signature-section">
            <p>For ${data.organizationName}</p>
            <div class="signature">${data.chairmanName}</div>
            <p class="signatory">(Authorised Signatory)</p>
        </div>
        
        <hr class="divider">
        
        <h2 class="receipt-title">DONATION RECEIPT</h2>
        
        <p class="receipt-text">
            We confirm the receipt of donation from Mr/Ms/Mrs <strong>${data.donorName}</strong> as per details below:-
        </p>
        
        <table class="details-table">
            <tr>
                <td>Donation Date</td>
                <td>${data.date}</td>
            </tr>
            <tr>
                <td>Transaction Reference Number</td>
                <td>${data.transactionId}</td>
            </tr>
            <tr>
                <td>Payment Mode</td>
                <td>${data.paymentMode}</td>
            </tr>
            <tr>
                <td>Total Contribution Received (Numbers)</td>
                <td>Rs ${data.amount}</td>
            </tr>
            <tr>
                <td>Total Contribution Received (Words)</td>
                <td>${data.amountInWords}</td>
            </tr>
        </table>
        
        <p class="tax-info">
            Donations to <strong>${data.organizationName}</strong> qualify for deduction u/s 80G(5) of Income Tax Act 1961 vide Unique Registration Number AABTI1433NF20217 approved on August 31, 2021 which is valid until AY2026-27. This receipt is invalid in case of non-realization of the instrument or reversal of the credit/debit card charge or reversal of donation amount for any reason. IT PAN: ${data.organizationPan}${data.organizationGstin ? ` | GSTIN: ${data.organizationGstin}` : ""}.
        </p>
        
        <p class="note">
            Please note that this is an acknowledgement for the receipt of donation. We will provide you the Form 10BE on which income-tax deduction can be claimed as per the Income-tax rules.
        </p>
        
        <p class="computer-generated">
            This Is A Computer Generated Receipt. Incase of any discrepancy or queries please email ${data.organizationEmail}
        </p>
        
        <div class="footer">
            <p class="registered-office">
                <strong>Registered office address:</strong> ${data.organizationAddress}
            </p>
        </div>
    </div>
</body>
</html>
`;
};
