'use strict';

/**
 * Methods related to validation
 */

var aux = require('../auxiliary');

exports.properties = {
    /**
     * Validation of the current question
     * @type {Object}
     */
    currentQuestionValidation: {
        type: Object,
        notify: true,
    },
};

/**
 * Validates the current question's answers
 */
exports.validateCurrent = function () {

    var currentQuestionIndex = this.get('currentQuestionIndex');
    var currentQuestion      = this.get('questions')[currentQuestionIndex];

    var validationPromise = _validateAnswer.call(this, currentQuestion);

    validationPromise.then(function (validation) {

        // set validation values onto the current question
        _.each(validation, function (value, key) {
            aux.setQuestionValue.call(this, currentQuestionIndex, key, value);
        }.bind(this));

        // set values onto the inquirer scope
        this.set('currentQuestionValidation', validation);

        // fire corresponding events
        // if (!validation.isValid) {

        //     this.set('currentQuestionValidation')

        //     this.fire('question-invalid', {
        //         questionIndex: currentQuestionIndex,
        //         question: currentQuestion,
        //         errorMessage: validation.errorMessage,
        //     });
        // }

    }.bind(this));

    return validationPromise;
};

/**
 * Auxiliary functions
 */

/**
 * Validates a question answer
 * @param  {QuestionObject} question that needs validation
 */
function _validateAnswer(question) {
    var answer  = question.answer;
    var answers = this.answers;

    // object containing the validation results
    var validation = {
        isValid: true,
    };

    if (typeof question.validate === 'function') {
        return Q.when(question.validate(answer, answers)).then(function (errorMessage) {
            if (errorMessage) {
                validation.isValid = false;
                validation.errorMessage = errorMessage;
            }

            return validation;
        });
    } else {
        return Q(validation);
    }
}
