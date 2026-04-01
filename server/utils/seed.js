const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User.model');
const Issue = require('../models/Issue.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

const seedDB = async () => {
    try {
        await User.deleteMany({});
        await Issue.deleteMany({});

        console.log('Cleared existing data.');

        const adminHash = await bcrypt.hash('admin123', 12);
        const citizenHash = await bcrypt.hash('citizen123', 12);

        // 1. Create Admins
        const adminUser = await User.create({
            name: 'Ubayog Admin',
            email: 'admin@ubayog.com',
            passwordHash: adminHash,
            role: 'admin',
            isVerified: true
        });

        // 2. Create Citizens
        const citizens = [];
        for (let i = 1; i <= 10; i++) {
            const citizen = await User.create({
                name: `Citizen ${i}`,
                email: `citizen${i}@example.com`,
                passwordHash: citizenHash,
                role: 'citizen',
                ward: `Ward ${Math.floor(Math.random() * 200)}`,
                area: 'Chennai',
                contributionScore: Math.floor(Math.random() * 100)
            });
            citizens.push(citizen);
        }

        console.log('Created Users.');

        // 3. Create sample issues
        const categories = ['pothole', 'street_light', 'garbage', 'water_leak', 'fallen_tree'];
        const statuses = ['submitted', 'under_review', 'in_progress', 'resolved'];

        // Chennai roughly around 13.0827° N, 80.2707° E
        const baseLat = 13.08;
        const baseLng = 80.27;

        for (let i = 1; i <= 50; i++) {
            const citizen = citizens[Math.floor(Math.random() * citizens.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            const lat = baseLat + (Math.random() - 0.5) * 0.1;
            const lng = baseLng + (Math.random() - 0.5) * 0.1;

            await Issue.create({
                issueId: `INC-2024-${String(i).padStart(4, '0')}`,
                title: `Sample ${category} issue in area ${i}`,
                description: `This is a randomly generated issue for testing the CivicConnect platform. It is categorized as ${category}.`,
                category: category,
                priority: 'medium',
                location: {
                    type: 'Point',
                    coordinates: [lng, lat]
                },
                address: 'Sample generated address in Chennai',
                status: status,
                reportedBy: citizen._id,
                photos: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', publicId: 'sample' }],
                upvoteCount: Math.floor(Math.random() * 50)
            });
        }

        console.log('Database seeded with 50 issues successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
