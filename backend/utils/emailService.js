const nodemailer = require('nodemailer');

// Configure transporter
let transporter = null;

const initTransporter = () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
};

initTransporter();

/**
 * Send an email notification (gracefully logs in dev/test if SMTP not provided)
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      console.log(`\n📧 [EMAIL NOTIFICATION SIMULATION]`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Message: ${text || (html ? html.replace(/<[^>]*>?/gm, '') : '')}\n`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'PawConnect'}" <${
        process.env.FROM_EMAIL || 'notifications@pawconnect.org'
      }>`,
      to,
      subject,
      text: text || '',
      html: html || `<p>${text}</p>`,
    });

    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error.message);
    // Don't crash main transaction if email fails
    return { success: false, error: error.message };
  }
};

/**
 * Helper template for adoption request status update
 */
const sendAdoptionStatusEmail = async (userEmail, userName, petName, status, reason = '') => {
  const isApproved = status === 'Approved';
  const subject = `PawConnect: Adoption Request ${status} for ${petName} 🐾`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: ${isApproved ? '#059669' : '#dc2626'};">
        Adoption Request ${status}!
      </h2>
      <p>Hi ${userName},</p>
      <p>
        Your adoption application for <strong>${petName}</strong> has been <strong>${status}</strong> by the shelter/rescuer.
      </p>
      ${
        reason
          ? `<div style="background: #f8fafc; padding: 12px; border-left: 4px solid #94a3b8; margin: 16px 0;">
              <strong>Note:</strong> ${reason}
             </div>`
          : ''
      }
      <p>
        ${
          isApproved
            ? 'The rescuer will contact you shortly to schedule a meet-and-greet and finalize the adoption paperwork.'
            : 'Feel free to browse other wonderful pets currently waiting for their forever homes on PawConnect!'
        }
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">
        PawConnect - Connecting loving homes with pets in need.
      </p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject,
    html,
    text: `Hi ${userName}, your adoption application for ${petName} was ${status}.`,
  });
};

module.exports = { sendEmail, sendAdoptionStatusEmail };
