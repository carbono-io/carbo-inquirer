'use strict';

/**
 * Methods related to navigation
 */

var aux = require('../auxiliary');

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
     * Validation of the current question
     * @type {Object}
     */
    currentQuestionValidation: {
        type: Object,
        notify: true,
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
        previous: this.previous.bind(this),
        next: this.next.bind(this)
    };
};

/**
 * Question navigation
 */

/**
 * Navigates to the previous question
 */
exports.previous = function () {

    if (this.get('isAtFirstQuestion')) {
        console.warn('carbo-inquirer already at first question');

        return;
    }

    var previousIndex = _getPreviousQuestionIndex.call(this);

    _gotoQuestion.call(this, previousIndex);
};

/**
 * Navigates to the next question
 */
exports.next = function () {

    if (this.get('isAtLastQuestion')) {
        console.warn('carbo-inquirer already at last question');

        return;
    }

    var qIndex   = this.get('currentQuestionIndex');
    var question = this.get('questions')[qIndex];

    // validate and go to next question
    this.validateQuestion(question)
        .then(function () {
            // get the next question
            var nextIndex = _getNextQuestionIndex.call(this);

            _gotoQuestion.call(this, nextIndex);
        }.bind(this))
        .fail(function (errorMessage) {
            console.warn('validation-error: ' + errorMessage);
        });
};

/**
 * Whenever the currentQuestionIndex changes, we must notify the people.
 */
exports._handleCurrentQuestionIndexChange = function (currentQuestionIndex, lastQuestionIndex) {

    var isFirst = false;
    var isLast  = false;

    if (this.questions) {
        var isFirst = _isFirstQuestion.call(this);
        var isLast  = _isLastQuestion.call(this);
    }

    console.log('isFirst %s', isFirst);
    console.log('isLast %s', isLast);

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
 * Verifies if a given question has to be asked to the user
 * @param  {QuestionObject}  question [description]
 * @return {Boolean}          [description]
 */
function _isQuestionNeeded(question) {
    var answers = this.answers;
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

    // partial index, because it only considers items starting from the
    // fromIndex
    var partial = _.findIndex(questions, _isQuestionNeeded.bind(this));

    return (partial === -1) ? -1 : fromIndex + 1 + partial;
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

/**
 * Checks if there are next questions that should be presented
 */
function _isLastQuestion() {
    var next = _getNextQuestionIndex.call(this);
    return next === -1;
}

/**
 * Checks if there are previous questions that should be presented
 */
function _isFirstQuestion() {
    var prev = _getPreviousQuestionIndex.call(this);
    return prev === -1;
}
