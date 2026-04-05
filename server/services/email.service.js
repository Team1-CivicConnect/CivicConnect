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
        from: `"CivicConnect HQ" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Account Verification: CivicConnect',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
                body { margin: 0; padding: 0; background-color: #070B14; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #FFFFFF; }
                .wrapper { width: 100%; background-color: #070B14; padding: 40px 0; }
                .container { width: 500px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
                .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 60px 40px; text-align: center; position: relative; }
                .header-logo { width: 48px; hieght: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.3); }
                .body { padding: 40px; }
                .otp-box { background: #1E293B; border-radius: 16px; padding: 30px; text-align: center; border: 1px solid #334155; margin: 30px 0; }
                .footer { background: #0F172A; padding: 30px; text-align: center; border-top: 1px solid #1E293B; color: #64748B; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; font-weight: 800; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <div style="font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px;">Civic<span style="color:rgba(255,255,255,0.6)">Connect</span></div>
                        <div style="font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); text-transform: uppercase; margin-top: 8px; letter-spacing: 2px;">Identity Verification</div>
                    </div>
                    <div class="body">
                        <h2 style="margin: 0; color: #fff; font-size: 24px; font-weight: 800;">Welcome, ${name}</h2>
                        <p style="color: #94A3B8; font-size: 15px; line-height: 1.6; margin-top: 10px;">Security is our top priority. Please use the following code to finalize your registration on the platform.</p>
                        
                        <div class="otp-box">
                            <div style="font-size: 48px; font-weight: 800; color: #3B82F6; letter-spacing: 10px;">${otp}</div>
                            <div style="font-size: 10px; color: #64748B; font-weight: 800; text-transform: uppercase; margin-top: 12px; letter-spacing: 2px;">Expires in 10 minutes</div>
                        </div>

                        <div style="display: flex; align-items: center; gap: 10px; padding: 16px; background: #FFF7ED; border-radius: 12px; border: 1px solid #FFEDD5; color: #9A3412; font-size: 12px; font-weight: 600;">
                           ⚠️ If you didn't request this code, your account might be at risk.
                        </div>
                    </div>
                    <div class="footer">
                        © 2024 UBAYOG INC · CIVICCONNECT INFRASTRUCTURE
                    </div>
                </div>
            </div>
        </body>
        </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

// ── Issue Status Notification Email ──────────────────────────────────────────
const sendIssueStatusEmail = async (email, name, issueTitle, issueId, newStatus) => {
    const statusConfig = {
        submitted:    { label: 'Submitted',       color: '#EF4444', bg: '#450A0A', emoji: '📋', msg: 'The network has registered your report.' },
        under_review: { label: 'Under Review',    color: '#F59E0B', bg: '#451A03', emoji: '🔍', msg: 'A diagnostic team is analyzing your report.' },
        in_progress:  { label: 'In Progress',     color: '#3B82F6', bg: '#1E3A8A', emoji: '🔧', msg: 'Active infrastructure repair is underway.' },
        resolved:     { label: 'Resolved ✓',      color: '#10B981', bg: '#064E3B', emoji: '✅', msg: 'This node is now fully operational.' },
        closed:       { label: 'Closed',           color: '#6B7280', bg: '#1F2937', emoji: '🔒', msg: 'Final audit complete. Case closed.' },
        rejected:     { label: 'Rejected',         color: '#EF4444', bg: '#450A0A', emoji: '❌', msg: 'Report rejected post-evaluation.' },
    };
    const s = statusConfig[newStatus] || { label: newStatus, color: '#3B82F6', bg: '#1E3A8A', emoji: '📌', msg: 'Status update successful.' };

    const mailOptions = {
        from: `"CivicConnect Matrix" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `[STATUS] ${s.emoji} "${issueTitle}" updated to ${s.label}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
                body { margin: 0; padding: 0; background-color: #070B14; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #FFFFFF; }
                .wrapper { width: 100%; background-color: #070B14; padding: 40px 0; }
                .container { width: 520px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
                .header { background: linear-gradient(135deg, ${s.color} 0%, #070B14 100%); padding: 50px 40px; text-align: left; }
                .body { padding: 40px; }
                .status-badge { display: inline-flex; align-items: center; background: ${s.bg}; border: 1px solid ${s.color}40; color: ${s.color}; padding: 8px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
                .issue-card { background: #1E293B; border-radius: 16px; padding: 24px; border: 1px solid #334155; margin: 24px 0; }
                .footer { background: #0F172A; padding: 30px; text-align: center; border-top: 1px solid #1E293B; color: #64748B; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; font-weight: 800; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <div class="status-badge">${s.emoji} ${newStatus}</div>
                        <h1 style="margin: 20px 0 0; color: #fff; font-size: 28px; font-weight: 800; letter-spacing: -1px; line-height: 1;">Status <span style="color:${s.color}">Updated</span></h1>
                    </div>
                    <div class="body">
                        <p style="color: #94A3B8; font-size: 15px; font-weight: 600;">Hi ${name}, there is progress on your report.</p>
                        
                        <div class="issue-card">
                            <div style="font-size: 10px; color: #64748B; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1.5px;">Problem Summary</div>
                            <div style="font-size: 18px; font-weight: 800; color: #fff;">${issueTitle}</div>
                            <div style="border-top: 1px solid #334155; margin: 16px 0; padding-top: 16px;">
                                <div style="font-size: 10px; color: #64748B; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1.5px;">Reference ID</div>
                                <div style="font-size: 12px; font-weight: 700; color: ${s.color}; opacity: 0.8; font-family: monospace;">${issueId}</div>
                            </div>
                        </div>

                        <p style="color: #64748B; font-size: 14px; font-weight: 600; line-height: 1.6; text-align: center; border-top: 1px solid #1E293B; padding-top: 24px; margin-top: 24px;">
                            ${s.msg} To view detailed logs or photos, please visit your citizen dashboard.
                        </p>
                    </div>
                    <div class="footer">
                        NETWORK STATUS: ACTIVE · OPS TEAM: UBAYOG
                    </div>
                </div>
            </div>
        </body>
        </html>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendIssueStatusEmail };
