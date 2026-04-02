const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.model');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    // Mark all existing users as verified (pre-OTP migration)
    const result = await User.updateMany(
        { isVerified: { $ne: true } },
        { $set: { isVerified: true } }
    );
    console.log(`Migrated ${result.modifiedCount} users to isVerified: true`);

    const users = await User.find({}, 'email role isVerified isActive');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}).catch(console.error);
