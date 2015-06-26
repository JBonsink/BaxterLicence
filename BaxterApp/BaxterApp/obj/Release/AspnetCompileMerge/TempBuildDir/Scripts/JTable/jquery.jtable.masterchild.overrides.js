var base = { _removeRowsFromTable: $.hik.jtable.prototype._removeRowsFromTable };

$.extend(true, $.hik.jtable.prototype, {

    _lastOpenedTable: {},
    
    /* Creates and opens a new child table for given row.
      *************************************************************************/
    openChildTable: function ($row, tableOptions, opened, tableRef) {
        var self = (tableRef == undefined) ? this : tableRef;
        var key = $row.attr('data-record-key');

        //Check if another childtable is already open. Open the new childtable when the closing animation of the other is finished.
        var nextRow = $row.next();        
        if (nextRow.hasClass("jtable-child-row") && nextRow.is(":visible")) {
            if (self._lastOpenedTable[key] != null && self._lastOpenedTable[key] != tableOptions) {
                this.closeChildTable($row, self.openChildTable, $row, tableOptions, opened, self);
            }
            else {
                this.closeChildTable($row);
            }
            return;
        }
        self._lastOpenedTable[key] = tableOptions;
                
        //Show close button as default
        tableOptions.showCloseButton = (tableOptions.showCloseButton != false);
        tableOptions.parentRow = $row;

        //Close child table when close button is clicked (default behavior)        
        if (tableOptions.showCloseButton && !tableOptions.closeRequested) {            
            tableOptions.closeRequested = function (row) { self.closeChildTable(row); };
        }

        // Check if the table layout is dependent on a property of the parent
        var deferreds = [];
        $.each(tableOptions.fields, function (fieldName, field) {
            if (field.dependencyUrl != undefined) {
                deferreds.push(self._checkParentDependency(field.dependencyUrl, field));
            }
        });
        if (deferreds.length == 0) self._continueOpeningChildTable($row, tableOptions, opened);
        else $.when.apply($, deferreds).done(function () { self._continueOpeningChildTable(self, $row, tableOptions, opened); });
    },

    getParentRow: function ()
    {
        return this.options.parentRow;
    },

    _checkParentDependency: function (url, field) {
        var deferred = $.Deferred();

        this._ajax({
            url: url,
            success: function (data) {
                if (data.Result != 'OK') {
                    field.type = 'hidden';
                    field.list = 'false';
                }
                deferred.resolve();
            },
            error: function () {
                console.log("Communication error");
            },
        });
        return deferred;
    },

    _continueOpeningChildTable: function ($row, tableOptions, opened) {
        var self = this;
       
       
        //If accordion style, close open child table (if it does exists)
        if (self.options.openChildAsAccordion) {
            $row.siblings('.jtable-data-row').each(function () {
                self.closeChildTable($(this));
            });
        }

        //Close child table for this row and open new one for child table
        self.closeChildTable($row, function () {
            var $childRowColumn = self.getChildRow($row).children('td').empty();
            var $childTableContainer = $('<div />')
                .addClass('jtable-child-table-container')
                .appendTo($childRowColumn);
            $childRowColumn.data('childTable', $childTableContainer);

            tableOptions.isChildTable = true;

            //Initialize table
            $childTableContainer.jtable(tableOptions);
            self.openChildRow($row);
            $childTableContainer.hide().slideDown('slow', function () {
                if (opened) {
                    opened({
                        childTable: $childTableContainer
                    });
                }
            });

            //if ($.isFunction(opened)) {
            //    opened({
            //        childTable: $childTableContainer
            //    });
            //}
        });
    },

    /* Closes child table for given row.
        *************************************************************************/
    closeChildTable: function ($row, closed, arg1, arg2, arg3, arg4) {
        var self = this;

        var $childRowColumn = this.getChildRow($row).children('td');
        var $childTable = $childRowColumn.data('childTable');
        if (!$childTable) {
            if (closed) {
                closed(arg1, arg2, arg3, arg4);
            }                
            return;
        }

        $childRowColumn.data('childTable', null);
        $childTable.slideUp('fast', function () {
            $childTable.jtable('destroy');
            $childTable.remove();
            self.closeChildRow($row);
            if (closed) {
                closed(arg1, arg2, arg3, arg4);
            }
        });
    },

    /* Overrides _removeRowsFromTable method to remove child rows of deleted rows.
    *************************************************************************/
    _removeRowsFromTable: function ($rows, reason) {
        //var self = this;

        if (reason == 'deleted') {
            $rows.each(function () {
                var $row = $(this);
                var $childRow = $row.data('childRow');
                if ($childRow) {
                    $childRow.slideRow('up', 500, function () { $childRow.remove(); });
                }
            });
        }

        base._removeRowsFromTable.apply(this, [$rows, "doNothing"]);
    },
});