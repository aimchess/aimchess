import { Resend } from 'resend';

interface WelcomeEmailParams {
  studentName: string;
  studentEmail: string;
  aimStudentId: string;
  packageName: string;
  packageType: string;
  totalClasses: number;
  loginPassword?: string;
  coachName?: string;
  portalUrl?: string;
}

export async function sendOfficialWelcomeEmail(params: WelcomeEmailParams) {
  const {
    studentName,
    studentEmail,
    aimStudentId,
    packageName,
    packageType,
    totalClasses,
    loginPassword,
    coachName,
    portalUrl = process.env.NEXTAUTH_URL || 'https://aimchess.com/crm/login',
  } = params;

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'AIM Chess Academy <onboarding@resend.dev>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AIM Chess Academy</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e2e8f0;">
        <div style="max-width: 600px; margin: 20px auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #0284c7 0%, #3b82f6 50%, #4f46e5 100%); padding: 36px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; tracking: -0.02em;">Welcome to the AIM Chess Family! 🎉</h1>
            <p style="color: #e0f2fe; margin: 8px 0 0 0; font-size: 15px;">Your online admission & enrollment has been official verified.</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 28px;">
            <p style="font-size: 16px; line-height: 1.6; color: #f1f5f9; margin-top: 0;">
              Dear <strong>${studentName}</strong>,
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">
              We are thrilled to officially welcome you to AIM Chess Academy! Your admission has been reviewed and approved by our management team. Below are your official student credentials and enrollment details:
            </p>

            <!-- Student ID & Credentials Card -->
            <div style="background: #0f172a; border-left: 4px solid #38bdf8; border-radius: 10px; padding: 20px; margin: 24px 0;">
              <div style="font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                Official AIM Student ID
              </div>
              <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em;">
                ${aimStudentId}
              </div>
            </div>

            <!-- Enrollment Breakdown Table -->
            <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #334155;">
              <h3 style="margin: 0 0 14px 0; color: #f8fafc; font-size: 16px; border-b: 1px solid #1e293b; padding-bottom: 8px;">
                Enrollment Summary
              </h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Selected Package:</td>
                  <td style="padding: 6px 0; color: #f8fafc; font-weight: 600; text-align: right;">${packageName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Session Mode:</td>
                  <td style="padding: 6px 0; color: #f8fafc; font-weight: 600; text-align: right;">${packageType === 'ONE_ON_ONE' ? '1-on-1 Personal Coaching' : 'Interactive Group Session'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Total Classes Enrolled:</td>
                  <td style="padding: 6px 0; color: #f8fafc; font-weight: 600; text-align: right;">${totalClasses} Classes</td>
                </tr>
                ${coachName ? `
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Assigned Coach:</td>
                  <td style="padding: 6px 0; color: #38bdf8; font-weight: 700; text-align: right;">${coachName}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- Portal Login Instructions -->
            <div style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 12px; padding: 20px; border: 1px dashed #38bdf8; margin-bottom: 28px;">
              <h3 style="margin: 0 0 10px 0; color: #38bdf8; font-size: 16px;">
                🔐 Access Your AIM Student Portal
              </h3>
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #cbd5e1; line-height: 1.5;">
                You can now log into your personal AIM Student Dashboard to view your schedule, class timings, assignments, and live chess boards.
              </p>
              <div style="font-size: 14px; color: #e2e8f0; margin-bottom: 6px;">
                <strong>Login Portal:</strong> <a href="${portalUrl}" style="color: #38bdf8; text-decoration: underline;">${portalUrl}</a>
              </div>
              <div style="font-size: 14px; color: #e2e8f0; margin-bottom: 6px;">
                <strong>Username / Email:</strong> ${studentEmail}
              </div>
              ${loginPassword ? `
              <div style="font-size: 14px; color: #e2e8f0; margin-bottom: 14px;">
                <strong>Temporary Password:</strong> <code style="background: #334155; padding: 2px 6px; border-radius: 4px; color: #38bdf8;">${loginPassword}</code>
              </div>
              ` : `
              <div style="font-size: 14px; color: #94a3b8; margin-bottom: 14px; font-style: italic;">
                (Use the password created during your admission application)
              </div>
              `}
              
              <div style="text-align: center; margin-top: 18px;">
                <a href="${portalUrl}" style="display: inline-block; background: #0284c7; color: #ffffff; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.4);">
                  Log In to Student Portal →
                </a>
              </div>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 0;">
              If you have any questions regarding your class timings or schedule, feel free to reply directly to this email or contact your assigned coach.
              <br><br>
              Best regards,<br>
              <strong style="color: #f1f5f9;">AIM Chess Academy Management Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #0f172a; padding: 18px; text-align: center; border-t: 1px solid #334155; font-size: 12px; color: #64748b;">
            © ${new Date().getFullYear()} AIM Chess Academy. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const data = await resend.emails.send({
        from: fromEmail,
        to: [studentEmail],
        subject: `🎉 Admission Approved! Welcome to AIM Chess (Student ID: ${aimStudentId})`,
        html: htmlContent,
      });
      console.log('Official Welcome Email dispatched via Resend:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error sending welcome email via Resend:', error);
      return { success: false, error };
    }
  } else {
    console.log('RESEND_API_KEY not set. Mock email dispatched to:', studentEmail);
    console.log('Generated Welcome Email HTML:\n', htmlContent);
    return { success: true, mock: true };
  }
}
