const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for /issues/:id/comments
const commentController = require('../controllers/comment.controller');
const authenticate = require('../middleware/authenticate');

router.get('/', commentController.getComments);
router.post('/', authenticate, commentController.createComment);
router.delete('/:commentId', authenticate, commentController.deleteComment);

module.exports = router;
