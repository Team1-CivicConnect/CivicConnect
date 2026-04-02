const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const Issue = require('../models/Issue.model');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// POST /api/v1/issues/:id/volunteer — citizen signs up to volunteer
router.post('/issues/:id/volunteer', authenticate, authorize('citizen'), async (req, res, next) => {
    try {
        const { message, skills } = req.body;
        const issue = await Issue.findById(req.params.id);

        if (!issue) return res.status(404).json({ message: 'Issue not found' });
        if (issue.reportedBy.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot volunteer on your own issue' });
        }
        if (issue.status === 'resolved') {
            return res.status(400).json({ message: 'Cannot volunteer on a resolved issue' });
        }

        // Check for duplicate
        const existing = await Volunteer.findOne({ issueId: req.params.id, userId: req.user.id });
        if (existing) {
            return res.status(409).json({ message: 'You have already signed up for this issue' });
        }

        const volunteer = new Volunteer({
            issueId: req.params.id,
            userId: req.user.id,
            message: message || '',
            skills: skills || []
        });

        await volunteer.save();
        res.status(201).json({ message: 'Volunteer signup successful', volunteer });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'You have already signed up for this issue' });
        }
        next(err);
    }
});

// GET /api/v1/issues/:id/volunteers — admin views volunteers for an issue
router.get('/issues/:id/volunteers', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const volunteers = await Volunteer.find({ issueId: req.params.id })
            .populate('userId', 'name email avatar')
            .sort({ signedUpAt: -1 });

        res.status(200).json({ volunteers });
    } catch (err) {
        next(err);
    }
});

// GET /api/v1/volunteers/my — citizen views their own volunteer records
router.get('/volunteers/my', authenticate, async (req, res, next) => {
    try {
        const volunteers = await Volunteer.find({ userId: req.user.id })
            .populate('issueId', 'title status issueId priority')
            .sort({ signedUpAt: -1 });

        res.status(200).json({ volunteers });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/v1/volunteers/:volunteerId — admin approves/rejects
router.patch('/volunteers/:volunteerId', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { status, adminNote } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved or rejected' });
        }

        const volunteer = await Volunteer.findById(req.params.volunteerId);
        if (!volunteer) return res.status(404).json({ message: 'Volunteer record not found' });

        volunteer.status = status;
        if (adminNote) volunteer.adminNote = adminNote;
        await volunteer.save();

        // If approving, push into Issue volunteers array
        if (status === 'approved') {
            await Issue.findByIdAndUpdate(volunteer.issueId, {
                $push: {
                    volunteers: {
                        userId: volunteer.userId,
                        approvedAt: new Date()
                    }
                }
            });
        }

        res.status(200).json({ message: `Volunteer ${status}`, volunteer });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/v1/volunteers/:volunteerId — citizen withdraws (pending only)
router.delete('/volunteers/:volunteerId', authenticate, async (req, res, next) => {
    try {
        const volunteer = await Volunteer.findById(req.params.volunteerId);
        if (!volunteer) return res.status(404).json({ message: 'Volunteer record not found' });

        if (volunteer.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You can only withdraw your own signup' });
        }
        if (volunteer.status !== 'pending') {
            return res.status(400).json({ message: 'Can only withdraw pending signups' });
        }

        await Volunteer.findByIdAndDelete(req.params.volunteerId);
        res.status(200).json({ message: 'Volunteer signup withdrawn' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
