const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue.model');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.patch('/:id/priority', authenticate, authorize('admin'), async (req, res, next) => {
    try {
        const { priority } = req.body;
        if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority label' });
        }
        
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: 'Issue not found' });
        
        issue.priority = priority;
        issue.priorityOverride = true;
        
        await issue.save();
        res.status(200).json({ message: 'Priority updated successfully', issue });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
