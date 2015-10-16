'use strict';

/**
 * Sets data onto the question
 * @param {String} key   
 * @param {*} value 
 */
exports.setQuestionValue = function(questionIndex, key, value) {
    this.set('questions.' + questionIndex + '.' + key, value);
};

/**
 * Reads the answers
 * @return {Object} Object keyed by 'question.name' and valued by 'question.answer'
 */
exports.readAnswers = function() {
    var questions = this.get('questions');
    return questions.reduce(function (answers, question) {
        answers[question.name] = question.answer;

        return answers;
    }, {});
};
