require('dotenv').config();
const { sendOtpEmail, sendIssueStatusEmail } = require('./services/email.service');

const testEmail = async () => {
    try {
        console.log('--- Testing OTP Email ---');
        await sendOtpEmail(process.env.EMAIL_USER, 'Siddu', '123456');
        console.log('✅ OTP Email sent successfully');

        console.log('--- Testing Status Email ---');
        await sendIssueStatusEmail(process.env.EMAIL_USER, 'Siddu', 'Broken Street Light near KPHB', 'ISS-782', 'in_progress');
        console.log('✅ Status Update Email sent successfully');

        console.log('\n--- ALL TESTS COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Email Test Failed:', error);
        process.exit(1);
    }
};

testEmail();
