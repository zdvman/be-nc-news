const db = require('./../db/connection');

function selectTopics() {
  const sql = `SELECT * FROM topics`;
  return db.query(sql).then(({ rows }) => rows);
}

module.exports = {
  selectTopics,
};
