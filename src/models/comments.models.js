const { checkArticleExists, checkUserExists } = require('../db/seeds/utils');
const db = require('../db/connection');

function selectCommentsByArticle(
  { article_id },
  { sort_by = 'created_at', order = 'desc' }
) {
  const args = [];
  const validSortColumns = ['created_at'];
  const validOrders = ['asc', 'desc'];
  let sql = `SELECT comment_id, votes, created_at, author, body, article_id FROM comments`;

  if (!article_id) {
    return Promise.reject({
      msg: `Article ID is required`,
      status: 400,
    });
  }
  args.push(article_id);
  sql += ` WHERE comments.article_id = $1`;

  if (!validSortColumns.includes(sort_by)) {
    return Promise.reject({
      msg: `Invalid sort_by column: ${sort_by}`,
      status: 400,
    });
  }
  if (!validOrders.includes(order)) {
    return Promise.reject({
      msg: `Invalid order: ${order}. Must be 'asc' or 'desc'`,
      status: 400,
    });
  }
  sql += ` ORDER BY ${sort_by} ${order.toUpperCase()}`;

  return checkArticleExists(article_id)
    .then(() => db.query(sql, args))
    .then(({ rows }) => {
      return rows;
    });
}

function insertComment({ body, username }, { article_id }) {
  if (!article_id) {
    return Promise.reject({
      msg: `Article ID is required`,
      status: 400,
    });
  }
  if (!body || !body.trim()) {
    return Promise.reject({
      msg: `Body is required`,
      status: 400,
    });
  }
  if (!username || !username.trim()) {
    return Promise.reject({
      msg: `Username is required`,
      status: 400,
    });
  }
  const args = [body, username, article_id];

  const sql = `INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING *`;

  return Promise.all([
    checkUserExists(username),
    checkArticleExists(article_id),
  ])
    .then(() => db.query(sql, args))
    .then(({ rows, rowCount }) => {
      return rows[0];
    });
}

function removeComment({ comment_id }) {
  if (!comment_id) {
    return Promise.reject({
      msg: `Comment ID is required`,
      status: 400,
    });
  }
  const sql = `DELETE FROM comments WHERE comments.comment_id = $1`;
  const args = [comment_id];
  return db.query(sql, args).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: `Comment with ID "${comment_id}" is not found`,
      });
    }
  });
}

function updateComment(inc_votes, comment_id) {
  if (comment_id === undefined || comment_id === null) {
    return Promise.reject({
      msg: `Comment ID is required`,
      status: 400,
    });
  }
  if (inc_votes === undefined || inc_votes === null) {
    return Promise.reject({
      msg: `Number of increment votes is required`,
      status: 400,
    });
  }
  if (inc_votes === 0) {
    return Promise.reject({
      msg: `Number of increment votes must be a non-zero number`,
      status: 400,
    });
  }
  const args = [inc_votes, comment_id];

  const sql = `UPDATE comments 
      SET votes = 
        CASE 
          WHEN votes + $1 < 0 THEN 0 
          ELSE votes + $1 
        END
      WHERE comment_id = $2 
      RETURNING *;
    `;

  return db.query(sql, args).then(({ rows }) => {
    if (!rows.length) {
      return Promise.reject({
        msg: `Comment with ID "${comment_id}" is not found`,
        status: 404,
      });
    }
    return rows[0];
  });
}

module.exports = {
  selectCommentsByArticle,
  insertComment,
  removeComment,
  updateComment,
};
