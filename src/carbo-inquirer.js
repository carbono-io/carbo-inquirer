(function () {

    'use strict';

    /**
     * Carbo-inquirer is the component responsible for 
     * asking questions to the user.
     */

    // Globals: Q
    
    /**
     * The format of a 'question' object is as follows:
     * - name
     * - answer
     */

    Polymer({
        is: 'carbo-inquirer',

        behaviors: [Polymer.PaperDialogBehavior],

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
        },

        prompt: function (questions) {
            // cleanup
            delete this.defer;

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
         * Reads the answers and submits results
         */
        submit: function () {
            // solve the deferred object
            if (this.defer) {
                var answers = this.readAnswers();
                this.defer.resolve(answers);
            }

            this.close();
        },

        /**
         * Cancels the inquirer
         */
        cancel: function () {
            if (this.defer) {
                this.defer.reject();
            }

            this.close();
        },

        /**
         * Question navigation
         */
        previousQuestion: function () {

            if (this.get('isAtFirstQuestion')) {
                alert('you are just starting, c\'mon!');
            } else {
                // not the last, go on!
                this.set('currentQuestionIndex', this.get('currentQuestionIndex') - 1);
            }

        },

        nextQuestion: function () {

            if (this.get('isAtLastQuestion')) {
                alert('you have completed the stuff');
            } else {
                // not the last, go on!
                this.set('currentQuestionIndex', this.get('currentQuestionIndex') + 1);
            }
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
         * Whenever the currentQuestionIndex changes, we must notify the people.
         */
        _handleCurrentQuestionIndexChange: function (currentQuestionIndex, lastQuestionIndex) {
            var current = this.get('currentQuestionIndex');
            // check if the current question is the first one
            var isFirst = current === 0;
            // check if the current question is the first one
            var isLast  = (current === this.questions.length - 1);

            this.set('isAtFirstQuestion', isFirst);
            this.set('isAtLastQuestion', isLast);
        },
    });

})();