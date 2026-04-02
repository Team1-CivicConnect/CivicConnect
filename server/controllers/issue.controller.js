const Issue = require('../models/Issue.model');
const User = require('../models/User.model');
const generateIssueId = require('../utils/generateIssueId');
const { calculatePriority } = require('../utils/priorityEngine');

exports.createIssue = async (req, res, next) => {
    try {
        const { title, description, category, lat, lng } = req.body;
        const issueId = await generateIssueId();

        const photos = req.files ? req.files.map(file => {
            const isLocal = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === '123';
            return {
                url: isLocal ? `http://localhost:5000/uploads/${file.filename}` : file.path,
                publicId: file.filename || file.public_id || `sample_${Date.now()}`
            };
        }) : [];

        const issue = new Issue({
            issueId,
            title,
            description,
            category,
            location: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)] // GeoJSON is [lng, lat]
            },
            address: req.body.address,
            photos,
            reportedBy: req.user.id,
            statusHistory: [{
                status: 'submitted',
                changedBy: req.user.id,
                note: 'Issue reported by citizen'
            }]
        });

        const { priorityScore, priority } = calculatePriority(issue);
        issue.priorityScore = priorityScore;
        issue.priority = priority;

        await issue.save();

        // Reward active user
        const user = await User.findById(req.user.id);
        if (user) {
            user.totalReports += 1;
            user.contributionScore += 10;
            await user.save();
        }

        res.status(201).json({ message: 'Issue created successfully', issue });
    } catch (error) {
        next(error);
    }
};

exports.getAllIssues = async (req, res, next) => {
    try {
        const { status, category, area, sort, priority, page = 1, limit = 20 } = req.query;

        let query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (area) query.area = new RegExp(area, 'i');

        let sortOption = { createdAt: -1 };
        if (sort === 'upvotes') sortOption = { upvoteCount: -1 };
        if (sort === 'priority') sortOption = { priorityScore: -1 };

        const issues = await Issue.find(query)
            .populate('reportedBy', 'name avatar ward')
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Issue.countDocuments(query);

        res.status(200).json({
            issues,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total
        });
    } catch (err) {
        next(err);
    }
};

exports.getMapIssues = async (req, res, next) => {
    try {
        // Returns lightweight map pins
        const issues = await Issue.find({}, '_id issueId title location status category upvoteCount photos').lean();
        res.status(200).json({ issues });
    } catch (err) {
        next(err);
    }
};

exports.getMyIssues = async (req, res, next) => {
    try {
        const issues = await Issue.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ issues });
    } catch (err) {
        next(err);
    }
};

exports.getIssueById = async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('reportedBy', 'name avatar ward')
            .populate('statusHistory.changedBy', 'name role');

        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        // increment view count statelessly
        issue.viewCount += 1;
        await issue.save({ timestamps: false });

        res.status(200).json({ issue });
    } catch (err) {
        next(err);
    }
};

exports.toggleUpvote = async (req, res, next) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        if (issue.reportedBy.toString() === req.user.id) {
            return res.status(400).json({ message: 'You cannot upvote your own issue' });
        }

        const upvoteIndex = issue.upvotes.indexOf(req.user.id);
        const reporter = await User.findById(issue.reportedBy);

        if (upvoteIndex > -1) {
            issue.upvotes.splice(upvoteIndex, 1);
            issue.upvoteCount -= 1;
            if (reporter) reporter.contributionScore -= 2;
        } else {
            issue.upvotes.push(req.user.id);
            issue.upvoteCount += 1;
            if (reporter) reporter.contributionScore += 2;
        }

        if (!issue.priorityOverride) {
            const { priorityScore, priority } = calculatePriority(issue);
            issue.priorityScore = priorityScore;
            issue.priority = priority;
        }

        await issue.save();
        if (reporter) await reporter.save();

        res.status(200).json({
            message: upvoteIndex > -1 ? 'Upvote removed' : 'Upvote added',
            upvoteCount: issue.upvoteCount
        });
    } catch (err) {
        next(err);
    }
};

exports.updateIssue = async (req, res, next) => {
    res.status(501).json({ message: 'Not Implemented Yet' });
};

exports.deleteIssue = async (req, res, next) => {
    res.status(501).json({ message: 'Not Implemented Yet' });
};
