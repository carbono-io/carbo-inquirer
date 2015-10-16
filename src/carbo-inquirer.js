'use strict';

/**
 * Carbo-inquirer is the component responsible for 
 * asking questions to the user.
 */

// Globals: Q

// Load behaviors
var NavigationBehavior = require('./scripts/behaviors/navigation');

/**
 * The format of a 'question' object is as follows:
 * - name
 * - answer
 */

var InquirerComponent = Polymer({
    is: 'carbo-inquirer',

    behaviors: [
        Polymer.PaperDialogBehavior,
        NavigationBehavior
    ],

    properties: {
        /**
         * Array of questions to be asked.
         * @type {Object}
         */
        questions: {
            type: Array,
            notify: true,
            observer: '_handleQuestionsChange',

            value: [],
        },
    },

    listeners: {
        'iron-overlay-closed': '_handleOverlayClosed',
    },

    /**
     * Prompts the user
     * open the modal
     * and set questions
     * 
     * @param  {Array[Question]} questions Array of questions
     * @return {Promise -> Answers}        Object containing the answers
     */
    prompt: function (questions) {
        // cleanup
        this.reset();

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
     * Reads the answers
     * @return {Object} Object keyed by 'question.name' and valued by 'question.answer'
     */
    readAnswers: function () {
        var questions = this.get('questions');
        return questions.reduce(function (answers, question) {
            answers[question.name] = question.answer;

            return answers;
        }, {});
    },

    /**
     * Resets the inquirer
     */
    reset: function () {
        // delete the defer
        delete this.defer;
        
        // reset answers
        var questions = this.get('questions');
        questions.forEach(function (question, index) {
            this.set('questions.' + index + '.answer', question.default);
        }.bind(this));

        // reset currentQuestionIndex
        this.set('currentQuestionIndex', 0);
    },

    /**
     * Reads the answers and submits results
     */
    submit: function () {
        // solve the deferred object
        if (this.defer) {
            var answers = this.readAnswers();
            this.defer.resolve(answers);
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
     * Whenever the questions array changes, we must notify the
     * 'currentQuestionIndex', so that the 'iron-pages' component updates itself
     */
    _handleQuestionsChange: function (questions, oldQuestions) {

    },

    /**
     * Deals with the close event of the dialog.
     * If it was canceled, reject the deferred object
     */
    _handleOverlayClosed: function (event) {
        // this.canceled is from PaperDialogBehavior
        if (this.canceled && this.defer) {
            this.defer.reject();
        }

        // reset after everything is done
        this.reset();
    },
});

// define some properties
Object.defineProperty(InquirerComponent.prototype, 'answers', {
    get: function () {
        return this.readAnswers();
    },
    set: function () {
        throw new Error('not settable answers')
    }
});
