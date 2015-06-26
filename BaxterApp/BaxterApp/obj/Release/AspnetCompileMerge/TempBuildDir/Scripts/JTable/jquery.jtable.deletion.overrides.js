(function ($) {
    var base = { _create: $.hik.jtable.prototype._create };

    $.extend(true, $.hik.jtable.prototype, {

        _create: function () {                       
            this._addDeleteToolbarItem();
            this._createMultiDeleteDialogDiv();
            base._create.apply(this, arguments);
        },

        _$deleteMultiRecordDialog: null,
        _$deleteRecordDialog: null,

        _addDeleteToolbarItem: function()
        {
            var self = this;
            if (!this.options.actions.deleteAction || !this.options.selecting) return;
            
            var item = {
                icon: "glyphicon glyphicon-trash",
                text: this.options.messages.deleteText,
                click: function () {
                    if (!IsEmptyArray(self.selectedRows(), Resources.Global.Error_NoRowsSelected))                    
                        self._$deleteMultiRecordDialog.open();
                }
            };                                    
            this._defaultToolbarItems.push(item);
        },

        _createMultiDeleteDialogDiv: function()
        {
            var self = this;

            //Check if deleteAction is supplied
            if (!self.options.actions.deleteAction || !self.options.selecting) {
                return;
            }
            
            self._$deleteMultiRecordDialog = new BootstrapDialog({
                title: $("<h3></h3>").text(self.options.messages.areYouSure),
                message: self.options.messages.deleteMulti,
                type: BootstrapDialog.TYPE_DANGER,
                autodestroy: false,
                buttons:
                [{
                    label: self.options.messages.cancel,
                    action: function (dialog) {
                        dialog.close();
                    }
                },
                {
                    label: self.options.messages.deleteText,
                    cssClass: "btn-danger",
                    id: "deleteButton",
                    icon: 'glyphicon glyphicon-send',
                    action: function (dialog) {                        
                        self.deleteRows(self.selectedRows());
                        dialog.close();
                    }
                }],
            });
        },

        /* Creates and prepares delete record confirmation dialog div.
         * Difference: Button ordering and dialog css
         *************************************************************************/
        _createDeleteDialogDiv: function () {
            var self = this;
                    
            self._$deleteRecordDialog = new BootstrapDialog({
                title: $("<h3></h3>").text(self.options.messages.areYouSure),                
                type: BootstrapDialog.TYPE_DANGER,
                autodestroy: false,
                buttons:
                [{
                    label: self.options.messages.cancel,
                    action: function (dialog) {
                        dialog.close();
                    }
                },
                {
                    label: self.options.messages.deleteText,
                    id: "deleteButton",
                    icon: 'glyphicon glyphicon-send',
                    cssClass: "btn-danger",
                    action: function (dialog) {
                        //row maybe removed by another source, if so, do nothing
                        if (self._$deletingRow.hasClass('jtable-row-removed')) {
                            dialog.close();
                            return;
                        }
                                                
                        dialog.enableButtons(false);
                        dialog.getButton('deleteButton').spin();

                        self._deleteRecordFromServer(
                            self._$deletingRow,
                            function () {
                                self._removeRowsFromTableWithAnimation(self._$deletingRow);
                                dialog.enableButtons(true);
                                dialog.getButton('deleteButton').stopSpin();
                                dialog.close();
                            },
                            function (message) { //error
                                self._showError(message);
                                dialog.enableButtons(true);
                                dialog.getButton('deleteButton').stopSpin();
                            }
                        );
                    }
                }],
            });                                         
        },

        /* This method is used to delete one or more rows from server and the table.
            *************************************************************************/
        deleteRows: function ($rows) {
            var self = this;
            var deferred = $.Deferred();

            if ($rows.length <= 0) {                
                self._logWarn('No rows specified to JTable deleteRows method.');
                return;
            }

            if (self._isBusy()) {
                self._logWarn('Can not delete rows since JTable is busy!');
                return;
            }

            //Deleting just one row
            if ($rows.length == 1) {
                self._deleteRecordFromServer(
                    $rows,
                    function () { //success
                        self._removeRowsFromTableWithAnimation($rows);
                        deferred.resolve();
                    },
                    function (message) { //error
                        self._showError(message);
                        deferred.resolve();
                    }
                );
                return deferred;
            }

            //Show that we are deleting multiple records
            self._showBusy(self._formatString(self.options.messages.deleteProggress, $rows.length));
                      
            //Build json object containing the ID's of the entities that will be deleted
            var postData = [];
            $rows.each(function () {
                var $row = $(this);
                postData.push(self._getKeyValueOfRecord($row.data('record')));
            });

            //deleteAction may be a function, check if it is
            if ($.isFunction(self.options.actions.deleteAction)) {

                //Execute the function
                var funcResult = self.options.actions.deleteAction(postData);

                //Check if result is a jQuery Deferred object
                if (self._isDeferredObject(funcResult)) {
                    //Wait promise
                    funcResult.done(function (data) {
                        self._hideBusy();
                        if (data.Result != 'OK') {
                            self._showError(data.Message);                            
                            return;
                        }

                        self._removeRowsFromTableWithAnimation($rows);
                    }).fail(function () {
                        $row.data('deleting', false);
                        if (error) {
                            error(self.options.messages.serverCommunicationError);
                        }
                    });
                } else { //assume it returned the deletion result
                    self._hideBusy();
                    self._removeRowsFromTableWithAnimation($rows);
                }

            } else { //Assume it's a URL string
                //Make ajax call to delete the records from server
                this._ajax({
                    url: self.options.actions.deleteAction,
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: JSON.stringify(postData),
                    success: function (data) {
                        self._hideBusy();
                        if (data.Result != 'OK') {
                            self._showError(data.Message);
                            deferred.resolve();
                            return;
                        }
                        deferred.resolve();

                        self._removeRowsFromTableWithAnimation($rows);
                    },
                    error: function () {
                        self._hideBusy();
                        self._showError(self.options.messages.serverCommunicationError);
                        deferred.resolve();
                    }
                });
            }           
            return deferred;
        },
      
        /* Performs an ajax call to server to delete record
         *  and removes row of record from table if ajax call success.
         *************************************************************************/
        _deleteRecordFromServer: function ($row, success, error, url) {
            var self = this;

            var completeDelete = function (data) {
                if (data.Result != 'OK') {
                    $row.data('deleting', false);
                    if (error) {
                        error(data.Message);
                    }

                    return;
                }

                self._trigger("recordDeleted", null, { record: $row.data('record'), row: $row, serverResponse: data });

                if (success) {
                    success(data);
                }
            };

            //Check if it is already being deleted right now
            if ($row.data('deleting') == true) {
                return;
            }

            $row.data('deleting', true);

            var postData = [];            
            postData.push(self._getKeyValueOfRecord($row.data('record')));

            //deleteAction may be a function, check if it is
            if (!url && $.isFunction(self.options.actions.deleteAction)) {

                //Execute the function
                var funcResult = self.options.actions.deleteAction(postData);

                //Check if result is a jQuery Deferred object
                if (self._isDeferredObject(funcResult)) {
                    //Wait promise
                    funcResult.done(function (data) {
                        completeDelete(data);
                    }).fail(function () {
                        $row.data('deleting', false);
                        if (error) {
                            error(self.options.messages.serverCommunicationError);
                        }
                    });
                } else { //assume it returned the deletion result
                    completeDelete(funcResult);
                }

            } else { //Assume it's a URL string
                //Make ajax call to delete the record from server
                this._ajax({
                    url: (url || self.options.actions.deleteAction),
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(postData),
                    success: function (data) {

                        if (data.Result != 'OK') {
                            $row.data('deleting', false);
                            if (error) {
                                error(data.Message);
                            }

                            return;
                        }

                        self._trigger("recordDeleted", null, { record: $row.data('record'), row: $row, serverResponse: data });

                        if (success) {
                            success(data);
                        }
                    },
                    error: function () {
                        $row.data('deleting', false);
                        if (error) {
                            error(self.options.messages.serverCommunicationError);
                        }
                    }
                });
            }
        },

        /* Removes a row or rows (jQuery selection) from table.
         *************************************************************************/
        _removeRowsFromTable: function ($rows, reason) {
            var self = this;

            //Check if any row specified
            if ($rows.length <= 0) {
                return;
            }

            //remove from DOM
            if (this.options.animationsEnabled) $rows.slideRow('up', 500, function () { $rows.addClass('jtable-row-removed').remove(); });
            else $rows.addClass('jtable-row-removed').remove();

            //remove from _$tableRows array
            $rows.each(function () {
                var index = self._findRowIndex($(this));
                if (index >= 0) {
                    self._$tableRows.splice(index, 1);
                }
            });

            self._onRowsRemoved($rows, reason);

            //Add 'no data' row if all rows removed from table
            if (self._$tableRows.length == 0) {
                self._addNoDataRow();
            }

            self._refreshRowStyles();
        },

        /* This method is called when user clicks delete button on a row.
        * Difference: setting deleteConfirmMessage as the message property of the deleteRecordDialog
        *************************************************************************/
        _deleteButtonClickedForRow: function ($row) {
            var self = this;
            var record = getRecordFromRow($row);

            //Check if deleting the record is allowed
            if (self.options.allowDelete == false) return;
            else if ($.isFunction(self.options.allowDelete) && !self.options.allowDelete(record)) return;

            var deleteConfirm;
            var deleteConfirmMessage = self.options.messages.deleteConfirmation;

            //If options.deleteConfirmation is function then call it
            if ($.isFunction(self.options.deleteConfirmation)) {
                var data = { row: $row, record: $row.data('record'), table: this, deleteConfirm: true, deleteConfirmMessage: deleteConfirmMessage, cancel: false, cancelMessage: null };
                self.options.deleteConfirmation(data);

                //If delete progress is cancelled
                if (data.cancel) {

                    //If a canlellation reason is specified
                    if (data.cancelMessage) {
                        self._showError(data.cancelMessage); //TODO: show warning/stop message instead of error (also show warning/error ui icon)!
                    }

                    return;
                }

                deleteConfirmMessage = data.deleteConfirmMessage;
                deleteConfirm = data.deleteConfirm;
            } else {
                deleteConfirm = self.options.deleteConfirmation;
            }

            if (deleteConfirm == true) {
                //Confirmation
                if (self._$deleteRecordDialog.getModalBody()) self._$deleteRecordDialog.getModalBody().html(deleteConfirmMessage);
                else self._$deleteRecordDialog.options.message = deleteConfirmMessage;
                self._showDeleteDialog($row);
            } else {
                //No confirmation
                self._deleteRecordFromServer(
                    $row,
                    function () { //success
                        self._removeRowsFromTableWithAnimation($row);
                    },
                    function (message) { //error
                        self._showError(message);
                    }
                );
            }
        },
     
        /* Shows delete comfirmation dialog.
         * Difference: opening boostrap dialog
        *************************************************************************/
        _showDeleteDialog: function ($row) {            
            this._$deletingRow = $row;
            this._$deleteRecordDialog.open();
        },
    });
})(jQuery);