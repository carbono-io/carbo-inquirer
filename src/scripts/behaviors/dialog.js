'use strict';

/**
 * Listeners that match the PaperDialogBehavior
 * @type {Object}
 */
exports.listeners = {
    'iron-overlay-closed': '_handleOverlayClosed',
};

/**
 * Deals with the close event of the dialog.
 * If it was canceled, reject the deferred object
 */
exports._handleOverlayClosed = function (event) {
    // this.canceled is from PaperDialogBehavior
    if (this.canceled && this.defer) {
        this.defer.reject();
    }

    // reset after everything is done
    this.reset();
};
