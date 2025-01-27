const { selectTopics } = require('./../models/topics.models');

function getTopics(request, response, next) {
  return selectTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch(next);
}

module.exports = {
  getTopics,
};
