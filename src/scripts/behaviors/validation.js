'use strict';

/**
 * Methods related to validation
 */

var aux = require('../auxiliary');

exports.properties = {
    /**
     * Validation of the current question
     * @type {Boolean}
     */
    currentQuestionIsValid: {
        type: Boolean,
        notify: true,

        value: true,
    },

    /**
     * Validation error message of the current question
     * @type {String}
     */
    currentQuestionErrorMessage: {
        type: String,
        notify: true,
    }
};

/**
 * Validates the current question's answers
 */
exports.validateCurrent = function () {

    var qIndex   = this.get('currentQuestionIndex');
    var question = this.get('questions')[qIndex];

    return this.validateQuestion(question);
};

/**
 * Validates a question answer
 * @param  {QuestionObject} question that needs validation
 */
exports.validateQuestion = function(question) {

    // deferred object
    var defer = Q.defer();

    // the answers
    var qIndex  = this.get('questions').indexOf(question);
    var answer  = question.answer;
    var answers = this.answers;

    if (typeof question.validate !== 'function') {
        // resolve defer immediately
        defer.resolve();
    } else {

        // otherwise, execute the validate method of the question object
        // and wrap the response in a promise wrapper (Q.when)
        // so that validations may be synchronous or asynchronous
        Q.when(question.validate(answer, answers))
        .then(function (errorMessage) {

            if (!errorMessage) {
                // valid
                // set validation values onto the current question
                aux.setQuestionValue.call(this, qIndex, 'isValid', true);

                // if validated question is the current one,
                // set currentQuestionIsValid
                if (qIndex === this.get('currentQuestionIndex')) {
                    this.set('currentQuestionIsValid', true);
                    this.set('currentQuestionErrorMessage', false);
                }

                defer.resolve();
            } else {
                // invalid
                aux.setQuestionValue.call(this, qIndex, 'isValid', false);
                aux.setQuestionValue.call(this, qIndex, 'errorMessage', errorMessage);

                // if validated question is the current one,
                // set currentQuestionIsValid
                if (qIndex === this.get('currentQuestionIndex')) {
                    this.set('currentQuestionIsValid', false);
                    this.set('currentQuestionErrorMessage', errorMessage);
                }

                // reject the validation defer
                defer.reject(errorMessage);
            }
        }.bind(this))
        .done();
    }

    // return promise
    return defer.promise;
};
