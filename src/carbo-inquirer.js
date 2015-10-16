'use strict';

/**
 * Carbo-inquirer is the component responsible for 
 * asking questions to the user.
 */

// Globals: Q

// Constants
var QUESTION_DEFAULTS = {
    isValid: true,
};

// Load behaviors
var NavigationBehavior = require('./scripts/behaviors/navigation');
var DialogBehavior     = require('./scripts/behaviors/dialog');

/**
 * The format of a 'question' object is as follows:
 * - name
 * - answer
 */

var InquirerComponent = Polymer({
    is: 'carbo-inquirer',

    behaviors: [
        Polymer.PaperDialogBehavior,
        NavigationBehavior,
        DialogBehavior
    ],

    observers: [
        // do stuff whenever the questions array is changed
        '_handleQuestionsChange(questions)'
    ],
    /**
     * Prompts the user
     * open the modal
     * and set questions
     * 
     * @param  {Array[Question]} questions Array of questions
     * @return {Promise -> Answers}        Object containing the answers
     */
    prompt: function (questions) {

        var defer = Q.defer();

        // open modal, from PaperDialogBehavior
        this.open();

        // save reference to the defer object
        this.defer = defer;

        // set questions
        if (questions) {
            this.set('questions', questions);
        }

        // return promise
        return defer.promise;
    },

    /**
     * Resets the inquirer
     */
    reset: function () {
        // delete the defer
        delete this.defer;
        
        // set questions to empty array
        this.set('questions', []);

        // reset currentQuestionIndex
        this.set('currentQuestionIndex', 0);
    },

    /**
     * Reads the answers and submits results
     */
    submit: function () {
        // solve the deferred object
        if (this.defer) {
            this.defer.resolve(this.answers);
        }

        // close modal, from PaperDialogBehavior
        this.close();
    },

    // Auxiliary functions
    /**
     * Checks whether a question is of a given type.
     * Used during templating
     */
    isQuestionNotOfType: function (question, type) {
        return question.type !== type;
    },

    // Event handlers
    
    /**
     * Reset defaults
     */
    _handleQuestionsChange: function (questions, oldQuestions) {
        // set default question values
        questions.forEach(function (question) {
            _.defaults(question, QUESTION_DEFAULTS);

            // set default answer
            question.answer = question.default;
        });
    },
});

// define some properties
Object.defineProperty(InquirerComponent.prototype, 'answers', {
    get: function () {
        return _readAnswers.call(this);
    },
    
    set: function () {
        throw new Error('not settable answers')
    }
});



/**
 * Reads the answers
 * @return {Object} Object keyed by 'question.name' and valued by 'question.answer'
 */
function _readAnswers() {
    var questions = this.get('questions');
    return questions.reduce(function (answers, question) {
        answers[question.name] = question.answer;

        return answers;
    }, {});
}
