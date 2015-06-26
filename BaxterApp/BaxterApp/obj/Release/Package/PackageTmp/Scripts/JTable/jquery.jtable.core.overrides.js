$.hik.jtable.prototype.options.ajaxSettings = {
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
};

$.extend(true, $.hik.jtable.prototype, {
    /* Set options dynamically after creation.
     *************************************************************************/
    setFieldOption: function (key, value) {
        this.options.fields[key] = value;
    },

    /* Loads data using AJAX call, clears table and fills with new data.
     * Difference: We need to save the postData if it contains the filter parameters
     * used to display data for a childtable. The postdata is saved in another property, 
     * when lastSearch is still null. It is expexted that postData is an object containing
     * searchFields
     *************************************************************************/
    load: function (postData, completeCallback) {                                
        if (!this._lastSearch && postData && postData.searchFields) this._payLoad = postData.searchFields;
        if (this._payLoad == undefined) this._payLoad = [];

        this._lastPostData = postData;
        this._reloadTable(completeCallback);
    },

    getDataRows: function () {
        return this._$tableRows;
    },

    /* Creates the main container div.
       *************************************************************************/
    _createMainContainer: function () {
        this._$mainContainer = $('<div />')
            .addClass('panel panel-primary')
            .appendTo(this.element);          
    },
    
    /* Creates title of the table if a title supplied in options.
       *************************************************************************/
    _createTableTitle: function () {
        var self = this;

        if (!self.options.title) {
            return;
        }

        self._$titleDiv = $('<div />')
            .addClass('panel-heading')            
            .appendTo(self._$mainContainer);

        if (self.options.isChildTable) self._$titleDiv.append($('<h4></h4>').text(self.options.title))
        else self._$titleDiv.append($('<h3></h3>').text(self.options.title));                
    },

    setTableTitle: function (title) {        
        if (this.options.isChildTable) this._$titleDiv.find('h4').text(title);
        else this._$titleDiv.find('h3').text(title);
    },

    setActions: function (actions) {
        this.options.actions = actions;
    },

   /* Fills _fieldList, _columnList arrays and sets _keyField variable.
    * Difference: 
    * - We are showing hidden properties when the list prop is set to true.
    * - fieldOrder option is used to order fields if supplied.
    *************************************************************************/
    _createFieldAndColumnList: function () {
        var self = this;
        var fields = [];

        if (self.options.fieldOrder != undefined) {
            $.each(self.options.fieldOrder, function (index, name) {
                if (name in self.options.fields) fields.push(name);
            });
        }
        fields = fields.concat(Object.keys(self.options.fields)).filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });

        $.each(fields, function (index, name) {
            //Add field to the field list
            self._fieldList.push(name);

            //Check if this field is the key field
            if (self.options.fields[name].key == true) {
                self._keyField = name;
            }

            //Add field to column list if it is shown in the table
            if (self.options.fields[name].list != false) {
                self._columnList.push(name);
            }
        });
    },


    /* Creates the table.
        *************************************************************************/
    _createTable: function () {
        var self = this;

        var container = $('<div />').appendTo(this._$mainContainer);
        this._$table = $('<table></table>')
            .addClass('table table-bordered table-hover table-sortable')
            .appendTo(container);
        //Add the scollable class and recalculate the max height when the windows size changes        
        if (this.options.scrollable) {
            container.addClass('scrollable-table');            
            $(window).resize(function () {                
                self.updateHeight();
            });
        }                                           

        if (this.options.tableId) {
            this._$table.attr('id', this.options.tableId);
        }

        this._createTableHead();
        this._createTableBody();
    },
    /* Creates a header cell for given field.
     * Difference: Titles can be hidden
     *************************************************************************/
    _createHeaderCellForField: function (fieldName, field) {
        field.width = field.width || '10%'; //default column width: 10%.
                

        var $th = $('<th></th>')            
            .addClass(field.listClass)
            .css('width', field.width)
            .data('fieldName', fieldName)        

        if (!field.hideTitle && field.title) {            
            $th.html(field.title);
            $th.addClass("jtable-column-header")
        }
                    
        return $th;
    },

    /* Adds a list of records to the table.
     * Difference: Upgraded animations
     *************************************************************************/
    _addRecordsToTable: function (records) {
        var self = this;

        this._$tableBody.hide();
        $.each(records, function (index, record) {
            self._addRow(self._createRowFromRecord(record));
        });

        //Find and remove all remaining hidden rows
        this._$tableBody.find('tr.ready-to-be-removed').remove();
        this._$tableBody.fadeIn(800);
    },

    /* Adds a single row to the table.
     * Difference: Better animations
     *************************************************************************/
    _addRow: function ($row, options) {
        //Set defaults
        options = $.extend({
            index: this._$tableRows.length,
            isNewRow: false,
            animationsEnabled: false
        }, options);

        //Remove 'no data' row if this is first row
        if (this._$tableRows.length <= 0) {
            this._removeNoDataRow();
        }

        if (options.animationsEnabled) $row.hide();
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
                        
        if (options.animationsEnabled) {        
            $row.addClass('bg-success');
            $row.slideRow('down', 600, function () { $row.removeClass('bg-success'); });
        }
        
        this._onRowInserted($row, options.isNewRow, this);

        //Find a hidden row
        row = this._$tableBody.find('tr.ready-to-be-removed').first();
        //Remove a single row 
        if (row != undefined) row.remove();
    },

    /* Removes a row or rows (jQuery selection) from table.
    * Difference: Better animations
    *************************************************************************/
    _removeRowsFromTable: function ($rows, reason) {
        var self = this;
                
        //Check if any row specified
        if ($rows.length <= 0) {
            return;
        }

        //remove from DOM
        if (options.animationsEnabled) $rows.slideRow('up', 500, function () { $rows.addClass('jtable-row-removed').remove(); });
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

    /* Removes all rows hidden in the table and ready to be deleted. Finally adds 'no data' row.
     * Difference: removes hidden rows
     *************************************************************************/
    _removeAllRows: function (reason) {
        //If no rows does exists, do nothing
        if (this._$tableRows.length <= 0) {
            return;
        }

        //Select all rows (to pass it on raising _onRowsRemoved event)
        var $rows = this._$tableBody.find('tr.jtable-data-row');

        //Remove all rows from DOM and the _$tableRows array
        this._$tableBody.find('tr').addClass('ready-to-be-removed');
        this._$tableRows = [];

        this._onRowsRemoved($rows, reason);

        //Add 'no data' row since we removed all rows
        this._addNoDataRow();
    },

    /* Creates a number input field inside the table.
     *************************************************************************/
    _createNumberInputForTable: function (record, field, fieldName, value) {
        self = this;

        if (field.numberStep == undefined) field.numberStep = 1;
        var $input = $('<input class="' + field.inputClass + '" id="Edit-' + fieldName + '" type="number" step="' + field.numberStep + '" name="' + fieldName + '"></input>');
        if (value != undefined) {
            $input.val(value);
        }

        $input.keydown(function (event) {          
            if (event.keyCode == $.ui.keyCode.TAB) {                
                event.preventDefault();
                if (event.shiftKey) $input.parent().parent().prev(".jtable-data-row").find("input").focus();
                else $input.parent().parent().next(".jtable-data-row").find("input").focus();            
            }
        });

        $input.change(function () {
            record.Position = $(this).val();
            self._ajax({
                url: self.options.actions.updateAction,
                data: JSON.stringify(record),
                success: function (data) {
                    var focused = $(':focus');
                    function restoreFocus()
                    {
                        focused.focus();
                    }                         
                    
                    if (data.Result == 'ERROR') {
                        dangerDialog(data.Message, null, restoreFocus);                        
                    }
                    else if (data.Result == 'WARNING') {
                        warningDialog(data.Message, null, restoreFocus);
                    }
                },
                error: function () {
                    console.log(self.options.actions.updateAction);
                    console.log("Communication error");
                },
            });
        });

        return $input.css("width", "50px");
    },

    /* Gets text for a field of a record according to it's type.
     * Difference: Input fields for numbers can be show in the table and images can be shown.
        *************************************************************************/
    _getDisplayTextForRecordField: function (record, fieldName) {
        var self = this;
        var field = this.options.fields[fieldName];
        var fieldValue = record[fieldName];

        if (field.inTableEdit && field.type == 'number') {
            return this._createNumberInputForTable(record, field, fieldName, fieldValue);
        }

        //if this is a custom field, call display function
        if (field.display) {
            return field.display({ record: record }, self);
        }

        if (field.type == 'date') {
            return this._getDisplayTextForDateRecordField(field, fieldValue);
        } else if (field.type == 'checkbox') {
            return this._getCheckBoxTextForFieldByValue(fieldName, fieldValue);
        } else if (field.imageActionUrl) {
            var height = '18';
            return this._getImageDisplay(field, fieldValue, height);
        }
        else if (field.options) { //combobox or radio button list since there are options.
            var options = this._getOptionsForField(fieldName, {
                record: record,
                value: fieldValue,
                source: 'list',
                dependedValues: this._createDependedValuesUsingRecord(record, field.dependsOn)
            });
            return this._findOptionByValue(options, fieldValue).DisplayText;
        } else { //other types
            return fieldValue;
        }
    },

    /*Display image for field*/
    _getImageDisplay: function (field, value, height) {
        var source = field.imageActionUrl + '/' + value;        
        return $("<img class='gallery' src='" + source + "' height='" + height + "'/>").colorbox({ href: source, photo: true, scrolling: false }).resize();

    },

    /* Gets text for a date field.     
     *************************************************************************/
    _getDisplayTextForDateRecordField: function (field, fieldValue) {
        if (!fieldValue) return;

        var dateFormat = field.dateFormat || this.options.defaultDateFormat;
        var date = new Date(fieldValue);
        return date.toString(dateFormat);
    },

    /* Gets options for a field according to user preferences.
     * Difference: if statement in row 287
     *************************************************************************/
    _getOptionsForField: function (fieldName, funcParams) {
        var field = this.options.fields[fieldName];
        var optionsSource = field.options;

        if ($.isFunction(optionsSource)) {
            //prepare parameter to the function
            funcParams = $.extend(true, {
                _cacheCleared: false,
                dependedValues: {},
                clearCache: function () {
                    this._cacheCleared = true;
                }
            }, funcParams);

            //call function and get actual options source
            optionsSource = optionsSource(funcParams);
        }

        var options;

        //Build options according to it's source type
        if (typeof optionsSource == 'string') { //It is an Url to download options
            var cacheKey = 'options_' + fieldName + '_' + optionsSource; //create a unique cache key

            if (funcParams._cacheCleared || !this._cache[cacheKey]) {
                //if user calls clearCache() or options are not found in the cache, download options
                this._cache[cacheKey] = this._buildOptionsFromArray(this._downloadOptions(fieldName, optionsSource));
                this._sortFieldOptions(this._cache[cacheKey], field.optionsSorting);
            } else {
                //found on cache..
                //if this method (_getOptionsForField) is called to get option for a specific value (on funcParams.source == 'list')
                //and this value is not in cached options, we need to re-download options to get the unfound (probably new) option.
                if ((typeof funcParams.value != 'number' && funcParams.value != undefined) || (typeof funcParams.value == 'number' && funcParams.value > 0)) {
                    var optionForValue = this._findOptionByValue(this._cache[cacheKey], funcParams.value);

                    if (optionForValue.DisplayText == undefined) { //this value is not in cached options...
                        this._cache[cacheKey] = this._buildOptionsFromArray(this._downloadOptions(fieldName, optionsSource));
                        this._sortFieldOptions(this._cache[cacheKey], field.optionsSorting);
                    }
                }
            }

            options = this._cache[cacheKey];
        } else if (jQuery.isArray(optionsSource)) { //It is an array of options
            options = this._buildOptionsFromArray(optionsSource);
            this._sortFieldOptions(options, field.optionsSorting);
        } else { //It is an object that it's properties are options
            options = this._buildOptionsArrayFromObject(optionsSource);
            this._sortFieldOptions(options, field.optionsSorting);
        }

        return options;
    },

    /* Creates the toolbar.
        *************************************************************************/
    _createToolBar: function () {
        var self = this;
        this._$toolbarDiv = $('<div></div>')
            .addClass("jtable-toolbar btn-group pull-right")
            .appendTo(this._$titleDiv);
                      
        for (var i = 0; i < this._defaultToolbarItems.length; i++) {            
            this._addToolBarItem(this._defaultToolbarItems[i], true);
        }
        this._defaultToolbarItems.length = 0;
                
        for (var i = 0; i < this.options.toolbar.items.length; i++) {
            this._addToolBarItem(this.options.toolbar.items[i]);
        }

        this._addToolBarItem({
            icon: 'glyphicon glyphicon-refresh',            
            click: function () {
                self._reloadTable();
            }
        }, true);

        //Add close button after the create button to the toolbar if childtable
        if (self.options.showCloseButton) {
            self._addToolBarItem({
                title: self.options.messages.close,
                text: '',
                icon: 'glyphicon glyphicon-remove',
                cssClass: 'btn btn-default',
                click: function () {
                    self.options.closeRequested(self.options.parentRow);
                }
            }, true);
        }
    },

    /* Adds a new item to the toolbar.
     * Difference: Added the titlediv as argument for the toolbar item click function
     *************************************************************************/
    _addToolBarItem: function (item, addFront) {
        var self = this;

        //Check if item is valid
        if ((item == undefined) || (item.text == undefined && item.icon == undefined)) {
            this._logWarn('Can not add tool bar item since it is not valid!');
            this._logWarn(item);
            return null;
        }

        var $toolBarItem = $('<button type="button"></button>');

        //insert space before the text when a glyphicon icon is present.
        if (item.icon && item.text) item.text = ' ' + item.text;

        //text property
        if (item.text) $toolBarItem.text(item.text);
          
        var toolbar = this._$toolbarDiv || this._$titleDiv.find('.jtable-toolbar');        
        if (addFront) $toolBarItem.appendTo(toolbar);
        else $toolBarItem.prependTo(toolbar);
                                      
        //cssClass property
        if (item.cssClass) $toolBarItem.addClass(item.cssClass);        
        else $toolBarItem.addClass('btn btn-default');

        //tooltip property
        if (item.tooltip) $toolBarItem.attr('title', item.tooltip);
                
        //icon property
        if (item.icon) {
            var $icon = $('<span></span>')
                .addClass(item.icon)
                .prependTo($toolBarItem);            
        }
                        
        //click event
        if (item.click) {
            $toolBarItem.click(function () {                
                item.click(self);
            });
        }
                
        return $toolBarItem;
    },
        
    /* Shows error message dialog with given message.
       *************************************************************************/
    _showError: function (message) {
        var self = this;
        self._hideBusy();

        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_DANGER,
            message: message,
            title: $("<h3></h3>").text(self.options.messages.error),            
            buttons: [          
            {
               label: self.options.messages.close,
               cssClass: "btn btn-default",
               action: function (dialog) {
                    dialog.close();
               }
            }],
        });        
    },

    updateHeight: function () {        
        if (this.options.scrollable) this._$table.parent().css('max-height', $('.navbar-fixed-bottom').offset().top - this._$table.offset().top - 80);
    },

    // Overload events to add table to data object
    _onLoadingRecords: function () {
        this._trigger("loadingRecords", null, { table: this });
    },

    _onRecordsLoaded: function (data) {
        if (!this.options.isChildTable) loadingScreen.close();
        this.element.addClass("show");
        
        this._trigger("recordsLoaded", null, { table: this, records: data.Records, serverResponse: data });
        this.updateHeight();        
    },

    _onRowInserted: function ($row, isNewRow) {        
        this._trigger("rowInserted", null, { table: this, row: $row, record: $row.data('record'), isNewRow: isNewRow });
    },

    _onRowsRemoved: function ($rows, reason) {
        this._trigger("rowsRemoved", null, { table: this, rows: $rows, reason: reason });
    },

    _onCloseRequested: function () {
        this._trigger("closeRequested", null, { table: this });
    }
});
