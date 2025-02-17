const express = require('express');
const commentsRouter = express.Router();
const {
  deleteComment,
  patchComment,
} = require('../controllers/comments.controllers');

commentsRouter.route('/:comment_id').delete(deleteComment);
commentsRouter.route('/:comment_id').patch(patchComment);

module.exports = commentsRouter;
