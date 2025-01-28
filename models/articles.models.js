const db = require('./../db/connection');

function selectArticleById({ article_id }) {
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

module.exports = {
  selectArticleById,
};
