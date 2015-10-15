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

    console.log('qwejqwkjehqwke');
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
        alert('you are just starting, c\'mon!');
    } else {
        // not the last, go on!
        this.set('currentQuestionIndex', this.get('currentQuestionIndex') - 1);
    }

};

exports.nextQuestion = function () {

    if (this.get('isAtLastQuestion')) {
        alert('you have completed the stuff');
    } else {
        // not the last, go on!
        this.set('currentQuestionIndex', this.get('currentQuestionIndex') + 1);
    }
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
