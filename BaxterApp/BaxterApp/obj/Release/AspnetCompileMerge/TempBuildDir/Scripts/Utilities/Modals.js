﻿(function ($) {
    Resources.LogUndfinedResources(["General_Error", "General_LoadingMessage", "General_Warning", "General_Success",
        "Error_NoRowsSelected", "General_No", "General_Yes", "General_Cancel", "General_ConfirmCancel",
        "JTable_ServerCommunicationError"]);
})(jQuery);

var loadingScreen = new BootstrapDialog({
    closable: false,
    autodestroy: false,
    type: BootstrapDialog.TYPE_DEFAULT,
    title: '<h1>' + Resources.Global.General_LoadingMessage + '</h1>',
    message: '<div class="progress progress-striped active"><div class="progress-bar" style="width: 100%;"><span class="sr-only">60% Complete</span></div></div>'
});

function createLoadingDialog(message, openCb, closeCb) {
    return new BootstrapDialog({
        closable: false,
        autodestroy: false,
        type: BootstrapDialog.TYPE_DEFAULT,
        title: '<h1>' + message + '</h1>',
        message: '<div class="progress progress-striped active"><div class="progress-bar" style="width: 100%;"><span class="sr-only">60% Complete</span></div></div>',
        onshow: openCb,
        onhidden: closeCb
    });
}

function defaultDialog (title, message, openCb, closeCb)
{
    BootstrapDialog.show({
        autodestroy: false,
        type: BootstrapDialog.TYPE_DEFAULT,
        title: '<h3>' + title + '</h3>',
        message: message,
        onshow: openCb,
        onhidden: closeCb
    });
}

function primaryDialog (title, message, openCb, closeCb)
{
    BootstrapDialog.show({
        autodestroy: false,
        type: BootstrapDialog.TYPE_PRIMARY,
        title: '<h3>' + title + '</h3>',
        message: message,
        onshow: openCb,
        onhidden: closeCb
    });
}

function dangerDialog (message, openCb, closeCb) {
    BootstrapDialog.show({
        autodestroy: false,
        type: BootstrapDialog.TYPE_DANGER,
        title: '<h3>' + Resources.Global.General_Error + '</h3>',
        message: message,
        onshow: openCb,
        onhidden: closeCb
    });
}

function warningDialog (message, openCb, closeCb) {
    BootstrapDialog.show({
        autodestroy: false,
        type: BootstrapDialog.TYPE_WARNING,
        title: '<h3>' + Resources.Global.General_Warning + '</h3>',
        message: message,
        onshow: openCb,
        onhidden: closeCb
    });
}

function successDialog(message, openCb, closeCb) {
    BootstrapDialog.show({
        autodestroy: false,
        type: BootstrapDialog.TYPE_SUCCESS,
        title: '<h3>' + Resources.Global.General_Success + '</h3>',
        message: message,
        onshow: openCb,
        onhidden: closeCb
    });
}

/*
Creates a modal dialog containing the form.
*/
function formDialog(form, actionUrl, title, confirmCaption, succesCb) {  
    var dialog = new BootstrapDialog({
        type: BootstrapDialog.TYPE_DEFAULT,
        title: $("<h3 />").text(title),
        closable: false,
        autodestroy: false,
        message: form,
        buttons: [
        {
            label: Resources.Global.General_Cancel,
            cssClass: "btn btn-default",
            action: function (dialog) {
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_WARNING,
                    closable: false,
                    title: $("<h3 />").text(Resources.Global.General_Warning),
                    message: Resources.Global.General_ConfirmCancel,
                    buttons: [
                    {
                        label: Resources.Global.General_No,
                        action: function (confirmDialog) {
                            confirmDialog.close();
                        }
                    },
                    {
                        label: Resources.Global.General_Yes,
                        action: function (confirmDialog) {
                            form.validationEngine('hide');
                            form.validationEngine('detach');
                            form.find(".formError").remove();
                            dialog.close();
                            confirmDialog.close();
                        }
                    }]
                });
            }
        },
        {
            id: "saveButton",
            icon: 'glyphicon glyphicon-send',
            label: confirmCaption,
            cssClass: "btn btn-primary",
            action: function (dialog) {
                save();
            }
        }],
        onshow: function (dialog) {
            dialog.getMessage().validationEngine('attach', {
                focusFirstField: false,
                promptPosition: "topRight:-100,10",
                binded: false,
                scroll: false
            });
        }
    });

    form.keydown(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            save();
            return false;
        }
    });

    function save() {
        if (!form.validationEngine('validate')) return;

        dialog.enableButtons(false);
        dialog.getButton('saveButton').spin();

        var data = {};
        var a = form.serializeArray();
        $.each(a, function () {
            if (data[this.name] !== undefined) {
                if (!data[this.name].push) {
                    data[this.name] = [data[this.name]];
                }
                data[this.name].push(this.value);
            } else {
                data[this.name] = this.value;
            }
        });

        $.ajax({
            url: actionUrl,
            async: true,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function (result) {
                dialog.enableButtons(true);
                dialog.getButton('saveButton').stopSpin();

                if (result.Result == "OK") {
                    if ($.isFunction(succesCb)) succesCb(result, data);
                    dialog.close();
                }
                else {
                    dangerDialog(result.Message);
                }
            },
            error: function () {
                dialog.enableButtons(true);
                dialog.getButton('saveButton').stopSpin();
                dangerDialog(Resources.Global.JTable_ServerCommunicationError);
            }
        });
    }

    return dialog;
}