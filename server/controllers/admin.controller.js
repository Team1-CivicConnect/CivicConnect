const Issue = require('../models/Issue.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const { sendIssueStatusEmail } = require('../services/email.service');

// Basic stub implementation for admin analytics
exports.getStats = async (req, res, next) => {
    try {
        const total = await Issue.countDocuments();
        const resolved = await Issue.countDocuments({ status: 'resolved' });
        const pending = total - resolved;

        res.status(200).json({
            total,
            pending,
            resolvedThisWeek: resolved, // mock
            avgResolutionDays: 3.2,
            byStatus: {},
            byCategory: {}
        });
    } catch (error) {
        next(error);
    }
};

exports.getIssues = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const issues = await Issue.find({})
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Issue.countDocuments();
        res.status(200).json({ issues, total });
    } catch (error) {
        next(error);
    }
};

exports.updateIssueStatus = async (req, res, next) => {
    try {
        const { status, note, expectedDate } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        issue.status = status;
        if (expectedDate) issue.expectedResolutionDate = expectedDate;
        if (status === 'resolved') issue.resolvedAt = new Date();
        if (note) issue.resolutionNote = note;

        issue.statusHistory.push({
            status,
            changedBy: req.user.id,
            note: note || 'Status updated by admin'
        });

        await issue.save();

        // Reward points + recalculate tier + send email + create notification
        const reporter = await User.findById(issue.reportedBy);
        if (reporter) {
            if (status === 'resolved') {
                reporter.contributionScore += 25;
                reporter.totalResolved += 1;
            }
            reporter.recalculateTier();
            await reporter.save();

            // 1. In-app notification (shows in bell)
            const statusLabels = {
                submitted: 'Submitted',
                under_review: 'Under Review',
                in_progress: 'In Progress',
                resolved: 'Resolved ✓',
                closed: 'Closed',
                rejected: 'Rejected'
            };
            await Notification.create({
                userId: reporter._id,
                type: 'status_change',
                title: `Issue ${statusLabels[status] || status}`,
                message: `Your issue "${issue.title}" is now ${statusLabels[status] || status}.`,
                issueId: issue._id,
                isRead: false
            });

            // 2. Email notification
            try {
                await sendIssueStatusEmail(
                    reporter.email,
                    reporter.name,
                    issue.title,
                    issue.issueId,
                    status
                );
            } catch (emailErr) {
                console.error('Status notification email failed:', emailErr.message);
            }
        }

        res.status(200).json({ message: 'Issue updated', issue });
    } catch (error) {
        next(error);
    }
};

exports.assignIssue = async (req, res, next) => {
    res.status(501).json({ message: 'Not implemented' });
};

exports.exportIssues = async (req, res, next) => {
    res.status(501).json({ message: 'Not implemented' });
};

exports.getHeatmap = async (req, res, next) => {
    try {
        const issues = await Issue.find({}, 'location.coordinates status');
        const heatmapData = issues.map(i => [i.location.coordinates[1], i.location.coordinates[0], 1]); // [lat, lng, intensity]
        res.status(200).json({ heatmap: heatmapData });
    } catch (error) {
        next(error);
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-passwordHash -refreshToken');
        res.status(200).json({ users });
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true });
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};
