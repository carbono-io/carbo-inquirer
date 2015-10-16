'use strict';

/**
 * Methods related to navigation
 */

exports.properties = {
    /**
     * Index of the current question being asked
     */
    currentQuestionIndex: {
        type: Number,
        notify: true,
        observer: '_handleCurrentQuestionIndexChange',

        value: 0,
    },

    /**
     * Whether the inquirer is at the last question
     * @type {Object}
     */
    isAtLastQuestion: {
        type: Boolean,
        notify: true,

        value: false,
    },

    /**
     * Whether the inquirer is at the first question
     * @type {Object}
     */
    isAtFirstQuestion: {
        type: Boolean,
        notify: true,

        value: true,
    }
};

exports.ready = function () {
    // Auxiliary object for navigation within fields
    this.navigator = {
        previousQuestion: this.previousQuestion.bind(this),
        nextQuestion: this.nextQuestion.bind(this)
    };
};

/**
 * Question navigation
 */
exports.previousQuestion = function () {

    if (this.get('isAtFirstQuestion')) {
        console.warn('carbo-inquirer already at first question');

        return;
    }

    var previousIndex = _getPreviousQuestionIndex.call(this);

    _gotoQuestion.call(this, previousIndex);
};

exports.nextQuestion = function () {

    if (this.get('isAtLastQuestion')) {
        console.warn('carbo-inquirer already at last question');

        return;
    }

    // not the last, go on!
    var question = _getCurrentQuestion.call(this);
    
    // validate
    _validateAnswer.call(this, question)
        .then(function (validation) {
            if (validation.valid) {    

                // get the next question
                var nextIndex = _getNextQuestionIndex.call(this);

                _gotoQuestion.call(this, nextIndex);
            } else {
                alert(validation.errorMessage);
            }
        }.bind(this));
};

/**
 * Whenever the currentQuestionIndex changes, we must notify the people.
 */
exports._handleCurrentQuestionIndexChange = function (currentQuestionIndex, lastQuestionIndex) {

    var isFirst = true;
    var isLast  = false;

    if (this.questions) {
        var current = this.get('currentQuestionIndex');
        // check if the current question is the first one
        isFirst = current === 0;
        // check if the current question is the first one
        isLast  = (current === this.questions.length - 1);
    }

    this.set('isAtFirstQuestion', isFirst);
    this.set('isAtLastQuestion', isLast);
};

/**
 * Auxiliary functions
 */

/**
 * Navigates to the given question object
 */
function _gotoQuestion(index) {
    this.set('currentQuestionIndex', index);
}

/**
 * Moves the question index a given delta
 * @param  {Number} delta
 */
function _deltaQuestion(delta) {
    this.set('currentQuestionIndex', this.get('currentQuestionIndex') + delta);
}

/**
 * Retrieves the current question
 * @return {QuestionObject}
 */
function _getCurrentQuestion() {
    var qs = this.get('questions');

    return qs[this.get('currentQuestionIndex')];
}

/**
 * Validates a question answer
 * @param  {QuestionObject} question that needs validation
 */
function _validateAnswer(question) {
    var answer  = question.answer;
    var answers = this.readAnswers();

    // object containing the validation results
    var validation = {
        valid: true,
    };

    if (typeof question.validate === 'function') {
        return Q.when(question.validate(answer, answers)).then(function (errorMessage) {
            if (errorMessage) {
                validation.valid = false;
                validation.errorMessage = errorMessage;
            }

            return validation;
        });
    } else {
        return Q(validation);
    }
}

/**
 * Verifies if a given question has to be asked to the user
 * @param  {QuestionObject}  question [description]
 * @return {Boolean}          [description]
 */
function _isQuestionNeeded(question) {
    var answers = this.readAnswers();
    var needed = true;

    if (typeof question.when === 'function') {
        needed = question.when(answers);
    }

    return needed;
}

/**
 * Loops through possible next questions
 * and retrieves the immediate next one.
 *
 * Skips all questions whose `.when` method returns false
 * @param  {Number} from Optional index from which start looking for the next question
 * @return {Number}      Index
 */
function _getNextQuestionIndex(fromIndex) {
    fromIndex = arguments.length === 1 ? fromIndex : this.get('currentQuestionIndex');

    var questions = this.get('questions');

    // look for questions starting fromIndex the next one
    questions = questions.slice(fromIndex + 1, questions.length);

    return fromIndex + 1 + _.findIndex(questions, _isQuestionNeeded.bind(this));
}

/**
 * Loops through possible previous questions
 * and retrieves the immediate previous one.
 *
 * Skips all questions whose `.when` method returns false
 * @param  {Number} from Optional index from which start looking for the next question
 * @return {Number}      Index
 */
function _getPreviousQuestionIndex(fromIndex) {
    fromIndex = arguments.length === 1 ? fromIndex : this.get('currentQuestionIndex');

    // look for questions fromIndex start until the current one
    var questions = this.get('questions').slice(0, fromIndex);

    return _.findLastIndex(questions, _isQuestionNeeded.bind(this));
}
