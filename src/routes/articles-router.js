const express = require('express');
const articlesRouter = express.Router();
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require('../controllers/articles.controllers');
const {
  getCommentsByArticle,
  postComment,
} = require('../controllers/comments.controllers');

articlesRouter.route('/').get(getArticles);
articlesRouter.route('/:article_id').get(getArticleById).patch(patchArticle);
articlesRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticle)
  .post(postComment);

module.exports = articlesRouter;
