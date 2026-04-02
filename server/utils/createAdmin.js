const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User.model');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        let admin = await User.findOne({ email: 'admin@ubayog.com' });
        if (!admin) {
            const adminHash = await bcrypt.hash('admin123', 12);
            await User.create({
                name: 'Ubayog Admin',
                email: 'admin@ubayog.com',
                passwordHash: adminHash,
                role: 'admin',
                isVerified: true
            });
            console.log('Admin account successfully injected into Database: admin@ubayog.com / admin123');
        } else {
            // Force reset password to definitely be admin123 just in case
            const adminHash = await bcrypt.hash('admin123', 12);
            admin.passwordHash = adminHash;
            await admin.save();
            console.log('Admin account password reset successfully: admin@ubayog.com / admin123');
        }
        process.exit(0);
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });
