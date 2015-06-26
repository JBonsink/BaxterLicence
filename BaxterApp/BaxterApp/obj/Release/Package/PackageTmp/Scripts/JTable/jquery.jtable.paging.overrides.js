var _removeRowsFromTable = $.hik.jtable.prototype._removeRowsFromTable;
var base_addRow = $.hik.jtable.prototype._addRow;
    
$.fn.slideRow = function (method, arg1, arg2, arg3) {
    if (typeof method != 'undefined') {
        if (sR.methods[method]) {
            return sR.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
};

$.extend(true, $.hik.jtable.prototype, {
    /* Overrides _addRow method to re-load table when a new row is created.
     *************************************************************************/
    _addRow: function ($row, options) {
        self = this;
                        
        if (options && options.isNewRow) {         
            // Remove last row when the current table is already full
            if (this.options.paging) {
                if (this._$tableRows.length == this.options.pageSize) {
                    row = this._$tableBody.find('tr.jtable-data-row').last();

                    //remove from DOM
                    if (options.animationsEnabled) row.slideRow('up', 800, function () { row.remove(); });
                    else row.remove();
                    
                    //remove from _$tableRows array                     
                    var index = self._findRowIndex(row);
                    if (index >= 0) {
                        self._$tableRows.splice(index, 1);
                    }
                    
                    self._onRowsRemoved(row, "removed");            
                    self._refreshRowStyles();                   
                }
            }

            // Increment the total record count when a new row is added to the table
            this._totalRecordCount++;

            //Update paging info
            self._createPagingInfo();
            self._refreshGotoPageInput();
            this._$pagingListArea.empty();
            this._createFirstAndPreviousPageButtons();
            if (this.options.pageList == 'normal') {
                this._createPageNumberButtons(this._calculatePageNumbers(this._calculatePageCount()));
            }
            this._createLastAndNextPageButtons(this._calculatePageCount());
            this._bindClickEventsToPageNumberButtons();

            //Add new row at the top of the table
            arguments[1].index = 0;
        }

        this._baseAddRow($row, options);
    },

    /* Adds a single row to the table.
       *************************************************************************/
    _baseAddRow: function ($row, options) {
        //Set defaults
        options = $.extend({
            index: this._$tableRows.length,
            isNewRow: false,
            animationsEnabled: true
        }, options);

        //Remove 'no data' row if this is first row
        if (this._$tableRows.length <= 0) {
            this._removeNoDataRow();
        }

        if (options.isNewRow && options.animationsEnabled) $row.hide();

        //Add new row to the table according to it's index
        options.index = this._normalizeNumber(options.index, 0, this._$tableRows.length, this._$tableRows.length);
        if (options.index == this._$tableRows.length) {
            //add as last row
            this._$tableBody.append($row);
            this._$tableRows.push($row);
        } else if (options.index == 0) {
            //add as first row
            this._$tableBody.prepend($row);
            this._$tableRows.unshift($row);
        } else {
            //insert to specified index
            this._$tableRows[options.index - 1].after($row);
            this._$tableRows.splice(options.index, 0, $row);
        }

        if (options.isNewRow && options.animationsEnabled) {
            $row.addClass('bg-success');
            $row.slideRow('down', 600, function () { $row.removeClass('bg-success');});
        }
                
        this._onRowInserted($row, options.isNewRow, this);

        //Find a hidden row
        row = this._$tableBody.find('tr.ready-to-be-removed').first();
        //Remove a single row 
        if (row != undefined) row.remove();
    },

    /* Overrides _removeRowsFromTable method to re-load table when a row is removed from table.
    *************************************************************************/
    _removeRowsFromTable: function ($rows, reason) {
        var rowCount = $rows.length;
        if (this.options.paging) {
            if (this._$tableRows.length - rowCount <= 0 && this._currentPageNo > 1) {
                --this._currentPageNo;
            }
            this._totalRecordCount -= rowCount;
        }
               
        // We will need to reload the table if a row is removed from a page that is not the last page in the table
        var reloadTable = (this._$tableRows.length - rowCount <= 0) || ((this._$tableRows.length - rowCount < this.options.pageSize) && (this._currentPageNo < this._calculatePageCount()));
       
        if (reloadTable) {
            this._reloadTable();
        } else {
            var temp = this.options.paging;
            this.options.paging = false;
            _removeRowsFromTable.apply(this, arguments);
            this.options.paging = temp;
            if (this.options.paging) this._createPagingInfo();
        }
    },

    /* Creates page list area.
        *************************************************************************/
    _createPageListArea: function () {
        this._$pagingListArea = $('<ul></ul>')
            .addClass('pagination');

        $('<div></div>')
            .addClass('form-group')
            .append(this._$pagingListArea)
            .appendTo(this._$bottomPanel);      
    },

    _createPageInfo: function() {
        this._$pageInfoSpan = $('<span></span>')
          .addClass('jtable-page-info')
          .appendTo(this._$bottomPanel);
    }
});