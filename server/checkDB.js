const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.model');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const users = await User.find({}, 'email role passwordHash');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}).catch(console.error);
