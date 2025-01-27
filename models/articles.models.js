const db = require('./../db/connection');

function selectArticleById({ article_id }) {
  const MAX_VALID_ID = 2147483647; // Maximum value for a PostgreSQL INTEGER

  if (!article_id || isNaN(Number(article_id))) {
    return Promise.reject({ msg: 'Invalid article ID', status: 400 });
  }

  if (Number(article_id) > MAX_VALID_ID) {
    return Promise.reject({
      msg: `Article ID exceeds maximum allowed value of ${MAX_VALID_ID}`,
      status: 400,
    });
  }

  const sql = `SELECT * FROM articles WHERE article_id = $1`;
  const args = [article_id];

  return db.query(sql, args).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `Article with ID ${article_id} is not found`,
        status: 404,
      });
    }
    return rows[0];
  });
}

module.exports = { selectArticleById };
