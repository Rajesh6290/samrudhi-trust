export function exportMember() {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Management System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            background: white;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: white;
            display: flex;
            flex-direction: column;
        }

        .header {
            padding: 30px 40px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }

        .trust-name h1 {
            font-size: 28px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
            letter-spacing: -0.5px;
        }

        .trust-name p {
            font-size: 14px;
            color: #7f8c8d;
            font-weight: 400;
        }

        .logo {
            width: 70px;
            height: 70px;
            background: #2c3e50;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 600;
            color: white;
            letter-spacing: 1px;
        }

        .content {
            padding: 0;
            flex: 1;
            overflow: auto;
        }

        .info-bar {
            padding: 8px 40px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #555;
        }

        .date-time {
            font-weight: 500;
        }

        .total-rows {
            font-weight: 500;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        thead {
            background: #fafafa;
            border-top: 1px solid #e0e0e0;
            border-bottom: 2px solid #e0e0e0;
        }

        th {
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        tbody tr {
            border-bottom: 1px solid #f0f0f0;
            transition: background-color 0.2s ease;
        }

        tbody tr:hover {
            background-color: #fafafa;
        }

        tbody tr:last-child {
            border-bottom: none;
        }

        td {
            padding: 12px 15px;
            color: #2c3e50;
            font-size: 14px;
        }

        .sl-no {
            width: 100px;
            text-align: center;
            font-weight: 500;
            color: #7f8c8d;
        }

        th.sl-no {
            text-align: center;
        }

        @media print {
            .info-bar {
                display: none;
            }
        }

        @media (max-width: 768px) {
            .header {
                flex-direction: column;
                gap: 20px;
                text-align: center;
            }

            .content {
                padding: 30px 20px;
            }

            table {
                font-size: 14px;
            }

            th, td {
                padding: 12px 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="trust-name">
                <h1>Excellence Trust Foundation</h1>
                <p>Employee Management System</p>
            </div>
            <div class="logo">ET</div>
        </div>

        <div class="content">
            <table>
                <thead>
                    <tr>
                        <th class="sl-no">SL No</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="sl-no">1</td>
                        <td>John Smith</td>
                        <td>john.smith@excellencetrust.com</td>
                        <td>+1 (555) 123-4567</td>
                    </tr>
                    <tr>
                        <td class="sl-no">2</td>
                        <td>Sarah Johnson</td>
                        <td>sarah.j@excellencetrust.com</td>
                        <td>+1 (555) 234-5678</td>
                    </tr>
                    <tr>
                        <td class="sl-no">3</td>
                        <td>Michael Chen</td>
                        <td>m.chen@excellencetrust.com</td>
                        <td>+1 (555) 345-6789</td>
                    </tr>
                    <tr>
                        <td class="sl-no">4</td>
                        <td>Emily Davis</td>
                        <td>emily.davis@excellencetrust.com</td>
                        <td>+1 (555) 456-7890</td>
                    </tr>
                    <tr>
                        <td class="sl-no">5</td>
                        <td>Robert Martinez</td>
                        <td>r.martinez@excellencetrust.com</td>
                        <td>+1 (555) 567-8901</td>
                    </tr>
                    <tr>
                        <td class="sl-no">6</td>
                        <td>Jennifer Wilson</td>
                        <td>j.wilson@excellencetrust.com</td>
                        <td>+1 (555) 678-9012</td>
                    </tr>
                    <tr>
                        <td class="sl-no">7</td>
                        <td>David Brown</td>
                        <td>david.b@excellencetrust.com</td>
                        <td>+1 (555) 789-0123</td>
                    </tr>
                    <tr>
                        <td class="sl-no">8</td>
                        <td>Lisa Anderson</td>
                        <td>lisa.anderson@excellencetrust.com</td>
                        <td>+1 (555) 890-1234</td>
                    </tr>
                    <tr>
                        <td class="sl-no">9</td>
                        <td>James Taylor</td>
                        <td>james.t@excellencetrust.com</td>
                        <td>+1 (555) 901-2345</td>
                    </tr>
                    <tr>
                        <td class="sl-no">10</td>
                        <td>Amanda White</td>
                        <td>amanda.white@excellencetrust.com</td>
                        <td>+1 (555) 012-3456</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="info-bar">
            <div class="date-time">
                Date: <span id="currentDate"></span> | Time: <span id="currentTime"></span>
            </div>
            <div class="total-rows">
                Total Rows: 10
            </div>
        </div>
    </div>

    <script>
        // Display current date and time
        const now = new Date();
        document.getElementById('currentDate').textContent = now.toLocaleDateString();
        document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    </script>
</body>
</html>
    
    `;
}
