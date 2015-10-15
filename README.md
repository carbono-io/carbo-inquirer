# Polymer component project

This is the base project for creating a polymer component for carbono.

To develop, run `gulp develop` on the command line.
To rename the component, run `gulp rename` on the command line.


# COPIED FROM: inquirer (node module)

#### Question
A question object is a `hash` containing question related values:

- **type**: (String) Type of the prompt. Defaults: `input` - Possible values: `input`, `confirm`,
`list`, `rawlist`, `password`
- **name**: (String) The name to use when storing the answer in the answers hash.
- **message**: (String|Function) The question to print. If defined as a function, the first parameter will be the current inquirer session answers.
- **default**: (String|Number|Array|Function) Default value(s) to use if nothing is entered, or a function that returns the default value(s). If defined as a function, the first parameter will be the current inquirer session answers.
- **choices**: (Array|Function) Choices array or a function returning a choices array. If defined as a function, the first parameter will be the current inquirer session answers.  
Array values can be simple `strings`, or `objects` containing a `name` (to display) and a `value` properties (to save in the answers hash). Values can also be [a `Separator`](#separator).
- **validate**: (Function) Receive the user input and should return `true` if the value is valid, and an error message (`String`) otherwise. If `false` is returned, a default error message is provided.
- **filter**: (Function) Receive the user input and return the filtered value to be used inside the program. The value returned will be added to the _Answers_ hash.
- **when**: (Function, Boolean) Receive the current user answers hash and should return `true` or `false` depending on whether or not this question should be asked. The value can also be a simple boolean.

`default`, `choices`(if defined as functions), `validate`, `filter` and `when` functions can be called asynchronously using `this.async()`. You just have to pass the value you'd normally return to the callback option.
