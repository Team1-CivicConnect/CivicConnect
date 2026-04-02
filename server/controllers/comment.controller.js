const Comment = require('../models/Comment.model');
const Issue = require('../models/Issue.model');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');

exports.getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ issueId: req.params.id })
            .populate('author', 'name avatar')
            .sort({ createdAt: 1 });
        res.status(200).json({ comments });
    } catch (err) {
        next(err);
    }
};

exports.createComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });

        const comment = new Comment({
            issueId: req.params.id,
            author: req.user.id,
            text,
            isAdminComment: req.user.role === 'admin'
        });

        await comment.save();

        // Increment comment count on issue
        issue.commentCount += 1;
        await issue.save();

        // Give 5 points to commenter
        const commenter = await User.findById(req.user.id);
        if (commenter) {
            commenter.contributionScore += 5;
            commenter.recalculateTier();
            await commenter.save();
        }

        // Create notification if reporter is not the commenter
        if (issue.reportedBy.toString() !== req.user.id) {
            await Notification.create({
                userId: issue.reportedBy,
                type: 'comment',
                title: 'New Comment',
                message: 'Someone commented on your reported issue',
                issueId: issue._id
            });
        }

        res.status(201).json({ message: 'Comment added', comment });
    } catch (err) {
        next(err);
    }
};

exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await comment.remove();
        await Issue.findByIdAndUpdate(req.params.id, { $inc: { commentCount: -1 } });

        // Remove 5 points from commenter when comment is deleted
        const commenter = await User.findById(comment.author);
        if (commenter) {
            commenter.contributionScore = Math.max(0, commenter.contributionScore - 5);
            commenter.recalculateTier();
            await commenter.save();
        }

        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        next(err);
    }
};