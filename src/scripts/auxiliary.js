'use strict';

/**
 * Sets data onto the question
 * @param {String} key   
 * @param {*} value 
 */
exports.setQuestionValue = function(questionIndex, key, value) {
    this.set('questions.' + questionIndex + '.' + key, value);
};
