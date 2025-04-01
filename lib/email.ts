import { createTransport } from 'nodemailer';

export async function sendClientCredentials(email: string, data: { 
  name: string; 
  password: string; 
  appDownloadLink: string;
}) {
  const transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const currentYear = new Date().getFullYear();

  try {
    const info = await transporter.sendMail({
      from: `"DearCare Health Services" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "DearCare Account Activation - Confidential Information",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DearCare Account Information</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f7f7f7;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="background-color: #0056b3; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-weight: 600;">DearCare Health Services</h1>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 30px 25px;">
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5;">Dear ${data.name},</p>
                
                <p style="font-size: 16px; line-height: 1.5;">We are pleased to inform you that your application for DearCare services has been reviewed and approved by our healthcare team. Your account has been created, and you may now access our secure mobile application.</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #0056b3; padding: 15px; margin: 25px 0;">
                  <h3 style="margin-top: 0; color: #0056b3; font-size: 18px;">Account Information</h3>
                  <p style="margin-bottom: 5px; font-size: 16px;"><strong>Email Address:</strong> ${email}</p>
                  <p style="margin-bottom: 0; font-size: 16px;"><strong>Temporary Access Code:</strong> ${data.password}</p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.5;"><strong>Important Security Notice:</strong> For your protection, please change your temporary access code immediately after your first login. This helps ensure the security of your personal health information.</p>
                
                <h3 style="color: #0056b3; font-size: 18px;">Next Steps:</h3>
                <ol style="font-size: 16px; line-height: 1.5;">
                  <li>Download the DearCare mobile application using <a href="${data.appDownloadLink}" style="color: #0056b3; text-decoration: underline;">this secure link</a></li>
                  <li>Enter your email address and temporary access code provided above</li>
                  <li>Follow the prompts to create a new personal password</li>
                  <li>Complete your health profile to receive personalized care</li>
                </ol>
                
                <p style="font-size: 16px; line-height: 1.5;">If you have any questions or require assistance with accessing your account, please contact our Support Team at <a href="mailto:support@dearcare.com" style="color: #0056b3; text-decoration: underline;">support@dearcare.com</a> or call us at (555) 123-4567.</p>
                
                <p style="font-size: 16px; line-height: 1.5;">Thank you for choosing DearCare for your healthcare needs.</p>
                
                <p style="font-size: 16px; line-height: 1.5;">Sincerely,</p>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 0;"><strong>The DearCare Team</strong></p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f2f2f2; padding: 20px 25px; border-top: 1px solid #dddddd;">
                <p style="font-size: 12px; color: #666666; margin-top: 0; margin-bottom: 10px;">This is a confidential communication with information intended only for the named recipient. If you have received this communication in error, please notify the sender immediately.</p>
                <p style="font-size: 12px; color: #666666; margin-bottom: 0;">&copy; ${currentYear} DearCare Health Services. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}


export async function sendClientFormLink(email: string, data: { 
  name: string;
  clientId: string;
  formLink: string;
}) {
  const transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const currentYear = new Date().getFullYear();

  try {
    const info = await transporter.sendMail({
      from: `"DearCare Health Services" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "DearCare Health Assessment Form - Action Required",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DearCare Health Assessment Form</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f7f7f7;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="background-color: #0056b3; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-weight: 600;">DearCare Health Services</h1>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding: 30px 25px;">
                <p style="margin-top: 0; font-size: 16px; line-height: 1.5;">Dear ${data.name},</p>
                
                <p style="font-size: 16px; line-height: 1.5;">Thank you for choosing DearCare for your healthcare needs. To provide you with the best possible care, we need some additional information about your health status.</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #0056b3; padding: 15px; margin: 25px 0;">
                  <h3 style="margin-top: 0; color: #0056b3; font-size: 18px;">Health Assessment Form</h3>
                  <p style="margin-bottom: 5px; font-size: 16px;">Please complete the health assessment form using the link below:</p>
                  <p style="text-align: center; margin: 20px 0;">
                    <a href="${data.formLink}" style="background-color: #0056b3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Complete Health Assessment</a>
                  </p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.5;"><strong>Important:</strong> This form should be completed within 7 days to ensure timely processing of your care requirements.</p>
                
                <p style="font-size: 16px; line-height: 1.5;">The information you provide will be kept confidential and used only for the purpose of creating your personalized care plan. If you have any questions or need assistance completing the form, please contact our Support Team at <a href="mailto:support@dearcare.com" style="color: #0056b3; text-decoration: underline;">support@dearcare.com</a> or call us at (555) 123-4567.</p>
                
                <p style="font-size: 16px; line-height: 1.5;">Thank you for your cooperation.</p>
                
                <p style="font-size: 16px; line-height: 1.5;">Sincerely,</p>
                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 0;"><strong>The DearCare Team</strong></p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f2f2f2; padding: 20px 25px; border-top: 1px solid #dddddd;">
                <p style="font-size: 12px; color: #666666; margin-top: 0; margin-bottom: 10px;">This is a confidential communication with information intended only for the named recipient. If you have received this communication in error, please notify the sender immediately.</p>
                <p style="font-size: 12px; color: #666666; margin-bottom: 0;">&copy; ${currentYear} DearCare Health Services. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Form email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending form email:", error);
    return { success: false, error };
  }
}