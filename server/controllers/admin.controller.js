const Issue = require('../models/Issue.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const { sendIssueStatusEmail } = require('../services/email.service');

exports.getStats = async (req, res, next) => {
    try {
        const total = await Issue.countDocuments();
        const resolved = await Issue.countDocuments({ status: 'resolved' });
        const pending = total - resolved;

        const categoryStats = await Issue.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
        const areaStats = await Issue.aggregate([{ $group: { _id: "$area", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }]);
        const statusStats = await Issue.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

        res.status(200).json({
            total,
            pending,
            resolved,
            resolvedThisWeek: resolved, // Approximate
            newThisMonth: total, // Approximate
            avgResolutionDays: 3.2, // Approximate
            categoryStats,
            areaStats,
            statusStats
        });
    } catch (error) {
        next(error);
    }
};

exports.getIssues = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        let issues = await Issue.find({})
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const Volunteer = require('../models/Volunteer');
        issues = await Promise.all(issues.map(async (issue) => {
            const volCount = await Volunteer.countDocuments({ issueId: issue._id });
            return { ...issue, volunteerSignups: volCount };
        }));

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
    try {
        const { department } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        issue.department = department;
        issue.statusHistory.push({
            status: issue.status,
            changedBy: req.user.id,
            note: `Issue routed to ${department} department`
        });

        await issue.save();
        res.status(200).json({ message: 'Department assigned successfully', issue });
    } catch (error) {
        next(error);
    }
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

exports.getLeaderboard = async (req, res, next) => {
    try {
        const topUsers = await User.find({ role: 'citizen' }) // Optionally filter by citizen
            .sort({ contributionScore: -1 })
            .limit(50)
            .select('name email ward area contributionScore totalResolved reputationTier');

        let rank = 1;
        const leaderboard = topUsers.map((u, index) => {
            // We can determine ranks and badges dynamically
            let badge = '';
            if (rank === 1) badge = '👑';
            else if (rank === 2) badge = '⭐';
            else if (rank === 3) badge = '🌟';

            return {
                id: u._id,
                rank: rank++,
                name: u.name,
                area: u.area || u.ward || 'Unknown City',
                reports: u.totalResolved || 0, // Since we only track totalResolved directly, or we could aggregate Issues
                resolved: u.totalResolved || 0,
                streak: Math.floor(Math.random() * 15), // Mock streak for UI
                score: u.contributionScore || 0,
                badge: badge
            };
        });

        res.status(200).json(leaderboard);
    } catch (error) {
        next(error);
    }
};
