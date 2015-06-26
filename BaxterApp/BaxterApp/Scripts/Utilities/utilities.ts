/// <reference path="modals.ts"/>

module Utilities {

    /*
     * Check whether an array is empty. Show a warning dialog when a message is supplied.
     */
    export function IsEmptyArray(array: Array<any>, message: string) {
        var emptyArray = array.length == 0;
        if (emptyArray) Modal.Utils.openWarningModal(message);
        return emptyArray;
    }

    export function disableElement(el: JQuery) {
        el.attr('disabled', 'true');
    }

    export function enableElement(el: JQuery) {
        el.removeAttr('disabled');
    }
}

 