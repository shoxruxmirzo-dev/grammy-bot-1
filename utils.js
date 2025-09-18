const questions = require('./questions.json');

const getRandomQuestion = (topic) => {
  const questionTopic = topic.toLowerCase();
  const randomQuestionIndex = Math.floor(Math.random() * questions[questionTopic].length);

  return questions[questionTopic][randomQuestionIndex];
};

module.exports = {
  getRandomQuestion,
};
