const {
  selectCommentsByArticle,
  insertComment,
} = require('./../models/comments.models');

function getCommentsByArticle(request, response, next) {
  return selectCommentsByArticle(request.params, request.query)
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch(next);
}

function postComment(request, response, next) {
  return insertComment(request.body, request.params)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch(next);
}

module.exports = {
  postComment,
  getCommentsByArticle,
};
