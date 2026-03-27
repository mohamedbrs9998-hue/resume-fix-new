import { Resend } from 'resend';

let resendClient;

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY');
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendCompletionEmail(order) {
  if (process.env.MOCK_MODE === 'true') return { skipped: true };

  const resend = getResend();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resultUrl = `${appUrl}/results/${order.accessToken}`;

  const attachments = [];
  const artifact = order.generatedFiles?.pdf;
  if (artifact?.storagePath) {
    attachments.push({
      filename: artifact.filename,
      path: `${appUrl}/api/results/${order.accessToken}/download?file=pdf`,
    });
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: [order.email],
    subject: `Your ResumeFix AI order is ready`,
    attachments,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Your order is ready</h2>
        <p>Hello ${order.fullName},</p>
        <p>Your <strong>${order.plan}</strong> package has been completed.</p>
        <p><a href="${resultUrl}">Open your private results page</a></p>
        <p>Your page includes secure downloads for the PDF, DOCX, text package, and ATS report.</p>
      </div>
    `,
  });

  if (error) throw error;
  return data;
}
