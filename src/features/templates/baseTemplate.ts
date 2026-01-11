/**
 * Base Email Template
 * Used as a foundation for all email templates
 */

import { getBaseUrl } from "@/lib/getBaseUrl";

interface BaseTemplateProps {
  title: string;
  content: string;
  footerText?: string;
  preheader?: string;
}

export function getBaseEmailTemplate({
  title,
  content,
  footerText = "Thank you for your support!",
  preheader = "",
}: BaseTemplateProps): string {
  const currentYear = new Date().getFullYear();
  const logoUrl = `/logo.svg`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f7fa;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .preheader {
      display: none;
      max-height: 0;
      overflow: hidden;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 14px 30px;
      background-color: #667eea;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #5568d3;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px 20px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #667eea;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px !important;
      }
      .header {
        padding: 30px 20px !important;
      }
    }
  </style>
</head>
<body>
  <span class="preheader">${preheader}</span>
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container">
          
          <!-- Header with Logo -->
          <tr>
            <td class="header">
              <img src="${logoUrl}" alt="Samriddhi Seva Trust Logo" class="logo" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #333;">${footerText}</p>
              <p style="margin: 0 0 10px 0;">Samriddhi Seva Trust</p>
              <p style="margin: 0 0 20px 0;">Empowering Communities, Transforming Lives</p>
              
              <div class="divider"></div>
              
              <p style="margin: 10px 0; font-size: 12px; color: #6c757d;">
                © ${currentYear} Samriddhi Seva Trust. All rights reserved.<br>
                This email was sent to you because you are associated with Samriddhi Seva Trust.
              </p>
              
              <p style="margin: 10px 0; font-size: 12px;">
                <a href="${getBaseUrl()}" style="color: #667eea; text-decoration: none;">Visit Website</a> |
                <a href="${getBaseUrl()}/contact" style="color: #667eea; text-decoration: none;">Contact Us</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
