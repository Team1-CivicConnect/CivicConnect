const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// ── OTP Email ─────────────────────────────────────────────────────────────────
const sendOtpEmail = async (email, name, otp) => {
    const mailOptions = {
        from: `"CivicConnect — Ubayog" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Your CivicConnect Verification Code',
        html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
                <tr><td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background:linear-gradient(135deg,#1a56db 0%,#0e9f6e 100%);padding:36px 40px;text-align:center;">
                                <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                                    <span style="color:#fff;font-size:26px;font-weight:900;line-height:52px;">C</span>
                                </div>
                                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">CivicConnect</h1>
                                <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;">Ubayog Civic Issue Reporting Portal</p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:40px 40px 32px;">
                                <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:800;">Verify Your Email Address</h2>
                                <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
                                    Hi <strong style="color:#111827;">${name}</strong>, welcome to the Ubayog platform! 
                                    Use the code below to verify your account. This code expires in <strong>10 minutes</strong>.
                                </p>

                                <!-- OTP Box -->
                                <div style="background:#f0f4ff;border:2px dashed #1a56db;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                                    <p style="margin:0 0 8px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
                                    <div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#1a56db;font-family:'Courier New',monospace;">${otp}</div>
                                </div>

                                <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;line-height:1.6;">
                                    🔒 If you didn't create a CivicConnect account, you can safely ignore this email. 
                                    Never share this code with anyone.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
                                <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 Ubayog Incorporated · CivicConnect Platform</p>
                            </td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

// ── Issue Status Notification Email ──────────────────────────────────────────
const sendIssueStatusEmail = async (email, name, issueTitle, issueId, newStatus) => {
    const statusConfig = {
        submitted:    { label: 'Submitted',       color: '#ef4444', emoji: '📋', msg: 'Your issue has been received and is in our queue.' },
        under_review: { label: 'Under Review',    color: '#f59e0b', emoji: '🔍', msg: 'A civic team is actively reviewing your report.' },
        in_progress:  { label: 'In Progress',     color: '#3b82f6', emoji: '🔧', msg: 'Work has begun on resolving your reported issue.' },
        resolved:     { label: 'Resolved ✓',      color: '#10b981', emoji: '✅', msg: 'Great news! Your reported issue has been resolved.' },
        closed:       { label: 'Closed',           color: '#6b7280', emoji: '🔒', msg: 'This issue has been closed.' },
        rejected:     { label: 'Rejected',         color: '#ef4444', emoji: '❌', msg: 'This issue has been reviewed and rejected.' },
    };
    const s = statusConfig[newStatus] || { label: newStatus, color: '#6b7280', emoji: '📌', msg: 'Your issue status has been updated.' };

    const mailOptions = {
        from: `"CivicConnect — Ubayog" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `${s.emoji} Issue Update: "${issueTitle}" is now ${s.label}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
                <tr><td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <tr>
                            <td style="background:linear-gradient(135deg,#1a56db 0%,#0e9f6e 100%);padding:36px 40px;text-align:center;">
                                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">CivicConnect</h1>
                                <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:600;">Issue Status Update</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:40px 40px 32px;">
                                <h2 style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:800;">Status Update on Your Issue</h2>
                                <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>, here's an update on your civic report:</p>

                                <div style="background:#f9fafb;border-left:4px solid ${s.color};border-radius:8px;padding:20px 24px;margin-bottom:24px;">
                                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Issue</p>
                                    <p style="margin:0 0 12px;font-size:17px;font-weight:800;color:#111827;">${issueTitle}</p>
                                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Reference ID</p>
                                    <p style="margin:0;font-size:13px;font-weight:700;color:#1a56db;font-family:monospace;">${issueId}</p>
                                </div>

                                <div style="background:${s.color}18;border:2px solid ${s.color}33;border-radius:10px;padding:18px 24px;text-align:center;margin-bottom:24px;">
                                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">New Status</p>
                                    <p style="margin:0;font-size:22px;font-weight:900;color:${s.color};">${s.emoji} ${s.label}</p>
                                    <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">${s.msg}</p>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
                                <p style="margin:0;color:#9ca3af;font-size:12px;">© 2025 Ubayog Incorporated · CivicConnect Platform</p>
                            </td>
                        </tr>
                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendIssueStatusEmail };
