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

    // not the last, go on!
    var question = _getCurrentQuestion.call(this);
    
    // validate
    this.validateCurrent()
        .then(function (validation) {
            if (validation.isValid) {    

                // get the next question
                var nextIndex = _getNextQuestionIndex.call(this);

                _gotoQuestion.call(this, nextIndex);
            } else {
                // do nothing

            }
        }.bind(this));
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
            _setQuestionValue.call(this, currentQuestionIndex, key, value);
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
 * Whenever the currentQuestionIndex changes, we must notify the people.
 */
exports._handleCurrentQuestionIndexChange = function (currentQuestionIndex, lastQuestionIndex) {

    // var isFirst = true;
    // var isLast  = false;

    if (this.questions) {
        var isFirst = _isFirstQuestion.call(this);
        var isLast  = _isLastQuestion.call(this);
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
    return _getNextQuestionIndex.call(this) === -1;
}

/**
 * Checks if there are previous questions that should be presented
 */
function _isFirstQuestion() {
    return _getPreviousQuestionIndex.call(this) === -1;
}

/**
 * Sets data onto the question
 * @param {String} key   
 * @param {*} value 
 */
function _setQuestionValue(questionIndex, key, value) {

    console.log(arguments);
    this.set('questions.' + questionIndex + '.' + key, value);
}
