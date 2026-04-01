const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/uploadMiddleware');
const commentRoutes = require('./comment.routes');

router.use('/:id/comments', commentRoutes);

router.get('/', issueController.getAllIssues);
router.get('/map', issueController.getMapIssues);
router.get('/my', authenticate, issueController.getMyIssues);
router.get('/:id', issueController.getIssueById);

// Protected citizen actions
router.post('/', authenticate, upload.array('photos', 5), issueController.createIssue);
router.post('/:id/upvote', authenticate, issueController.toggleUpvote);
router.patch('/:id', authenticate, issueController.updateIssue);
router.delete('/:id', authenticate, issueController.deleteIssue);

module.exports = router;
