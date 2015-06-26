(function ($) {

    var unloadingPage;

    $(window).on('beforeunload', function () {
        unloadingPage = true;
    });
    $(window).on('unload', function () {
        unloadingPage = false;
    });

    $.widget("hik.kTable", {

        /************************************************************************
        * DEFAULT OPTIONS / EVENTS                                              *
        *************************************************************************/
        options: {

            //Options
            actions: {},
            fields: {},
            animationsEnabled: true,
            defaultDateFormat: 'dd-MM-yyyy',
            showCloseButton: false,
            loadingAnimationDelay: 500,
            saveUserPreferences: true,
            unAuthorizedRequestRedirectUrl: null,
            confirmDeletion: true,

            hideCreateButton: false,
            hideDeleteButton: false,
            hideEditButton: false,

            selecting: false,
            multiselect: false,
            selectingCheckboxes: false,
            selectOnRowClick: true,

            paging: true,
            pageList: 'normal', //possible values: 'minimal', 'normal'
            pageSize: 10,
            pageSizeOptions: [10, 25, 50, 100, 250, 500],
            pageSizeSelectable: true,
            gotoPageArea: 'combobox', //possible values: 'textbox', 'combobox', 'none'

            sorting: true,
            multiSorting: false,
            defaultSorting: '',

            columnResizable: true,
            columnSelectable: true,

            openChildAsAccordion: true,

            tableCssClasses: 'table table-bordered table-hover table-sortable',

            ajaxSettings: {
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8"
            },

            toolbar: {
                items: []
            },

            //Events
            closeRequested: function (event, data) { },
            formCreated: function (event, data) { },
            formSubmitting: function (event, data) { },
            formClosed: function (event, data) { },
            loadingRecords: function (event, data) { },
            recordsLoaded: function (event, data) { },
            rowInserted: function (event, data) { },
            rowsRemoved: function (event, data) { },
            recordAdded: function (event, data) { },
            recordUpdated: function (event, data) { },
            rowUpdated: function (event, data) { },
            recordDeleted: function (event, data) { },
            selectionChanged: function (event, data) { },

            //Localization
            messages: {
                serverCommunicationError: 'An error occured while communicating to the server.',
                loadingMessage: 'Loading records...',
                noDataAvailable: 'No data available!',
                areYouSure: 'Are you sure?',
                save: 'Save',
                saving: 'Saving',
                cancel: 'Cancel',
                error: 'Error',
                close: 'Close',
                cannotLoadOptionsFor: function (val) { return 'Can not load options for field ' + val; },
                addNewRecord: 'Add new record',
                editRecord: 'Edit Record',
                confirmDeletion: 'This record will be deleted. Are you sure?',
                deleteText: 'Delete',
                deleting: 'Deleting',
                canNotDeletedRecords: function (val0, val1) { return 'Can not delete ' + val0 + ' of ' + val1 + ' records!'; },
                deleteProggress: function (val0, val1) { return 'Deleting ' + val0 + ' of ' + val1 + ' records, processing...'; },
                pagingInfo: function (val0, val1, val2) { return 'Showing ' + val0 + '-' + val1 + '} of ' + val2 + ''; },
                pageSizeChangeLabel: 'Row count',
                gotoPageLabel: 'Go to page'
            }
        },

        /************************************************************************
        * PRIVATE FIELDS                                                        *
        *************************************************************************/
        _$mainContainer: null, //Reference to the main container of all elements that are created by this plug-in (jQuery object)

        _$titleDiv: null, //Reference to the title div (jQuery object)
        _$toolbarDiv: null, //Reference to the toolbar div (jQuery object)

        _$table: null, //Reference to the main <table> (jQuery object)
        _$tableBody: null, //Reference to <body> in the table (jQuery object)
        _$tableRows: null, //Array of all <tr> in the table (except "no data" row) (jQuery object array)

        _$busyDiv: null, //Reference to the div that is used to block UI while busy (jQuery object)
        _$busyMessageDiv: null, //Reference to the div that is used to show some message when UI is blocked (jQuery object)

        _columnList: null, //Name of all data columns in the table (select column and command columns are not included) (string array)
        _fieldList: null, //Name of all fields of a record (defined in fields option) (string array)
        _keyField: null, //Name of the key field of a record (that is defined as 'key: true' in the fields option) (string)

        _firstDataColumnOffset: 0, //Start index of first record field in table columns (some columns can be placed before first data column, such as select checkbox column) (integer)
        _lastPostData: null, //Last posted data on load method (object)

        _cache: null, //General purpose cache dictionary (object)

        _addRecordDialog: null, //Reference to the adding new record dialog div (jQuery object)

        _editRecordDialog: null,
        _$editingRow: null, //Reference to currently editing row (jQuery object)

        _$deletingRow: null, //Reference to currently deleting row (jQuery object)
        _$deleteMultiRecordDialog: null,
        _$deleteRecordDialog: null,

        _selectedRecordIdsBeforeLoad: null, //This array is used to store selected row Id's to restore them after a page refresh (string array).
        _$selectAllCheckbox: null, //Reference to the 'select/deselect all' checkbox (jQuery object)
        _shiftKeyDown: false, //True, if shift key is currently down.

        _$bottomPanel: null, //Reference to the panel at the bottom of the table (jQuery object)
        _$pagingListArea: null, //Reference to the page list area in to bottom panel (jQuery object)
        _$pageSizeChangeArea: null, //Reference to the page size change area in to bottom panel (jQuery object)
        _$pageInfoSpan: null, //Reference to the paging info area in to bottom panel (jQuery object)
        _$gotoPageArea: null, //Reference to 'Go to page' input area in to bottom panel (jQuery object)
        _$gotoPageInput: null, //Reference to 'Go to page' input in to bottom panel (jQuery object)
        _totalRecordCount: 0, //Total count of records on all pages
        _currentPageNo: 1, //Current page number

        _lastSorting: null, //Last sorting of the table

        _$columnSelectionDiv: null,
        _$columnResizeBar: null,
        _cookieKeyPrefix: null,
        _currentResizeArgs: null,

        _lastOpenedTable: {},

        _$nextSearchInputId: 0,
        _$searchBar: null,
        _lastSearch: null,
        _payLoad: null,

        /************************************************************************
        * CONSTRUCTOR AND INITIALIZATION METHODS                                *
        *************************************************************************/

        /* Contructor.
        *************************************************************************/
        _create: function () {

            if (this.options.selecting && this.options.selectingCheckboxes) {
                ++this._firstDataColumnOffset;
                this._bindKeyboardEvents();
            }

            this._initializeCore();
            this._createAddRecordDialog();
            this._createEditDialog();
            this._createDeleteDialog();
            this._createMultiDeleteDialog();

            this._cookieKeyPrefix = this._generateCookieKeyPrefix();

            this._initializeToolbar();
            this._initializePaging();
            this._initializeDynamicColumns();
            this._initializeSearchBar();
        },

        /* Registers to keyboard events those are needed for selection
        *************************************************************************/
        _bindKeyboardEvents: function () {
            var self = this;
            //Register to events to set _shiftKeyDown value
            $(document)
                .keydown(function (event) {
                    switch (event.which) {
                        case 16:
                            self._shiftKeyDown = true;
                            break;
                    }
                })
                .keyup(function (event) {
                    switch (event.which) {
                        case 16:
                            self._shiftKeyDown = false;
                            break;
                    }
                });
        },

        /************************************************************************
        * PUBLIC METHODS                                                        *
        *************************************************************************/

        getThisPointer: function () {
            return { table: this };
        },

        /* Loads data using AJAX call, clears table and fills with new data.
        *************************************************************************/
        load: function (postData, completeCallback) {
            this._payLoad = [];

            //Clear search history
            if (this._lastSearch) this._lastSearch.length = 0;

            //Save the initial search fields
            if (postData && postData.searchFields) this._payLoad = postData.searchFields;

            this._currentPageNo = 1;

            this._lastPostData = postData;
            this._reloadTable(completeCallback);
        },

        /* Refreshes (re-loads) table data with last postData.
        *************************************************************************/
        reload: function (completeCallback) {
            this._reloadTable(completeCallback);
        },

        setOption: function (key, value) {
            if (key == 'pageSize') {
                this._changePageSize(parseInt(value));
            }

            this.options[key] = value;
        },

        /* Set options dynamically after creation.
        *************************************************************************/
        setFieldOptions: function (key, value) {
            this.options.fields[key] = value;
        },

        /* Set options dynamically after creation.
       *************************************************************************/
        setFieldOption: function (field, key, value) {
            this.options.fields[field][key] = value;
        },

        /* Set actions dynamically after creation.
        *************************************************************************/
        setActions: function (actions) {
            this.options.actions = actions;
        },

        /* Set the tablet title after table creation
        *************************************************************************/
        setTableTitle: function (title) {
            this._$titleDiv.find('.table-title').text(title);
        },

        /* Gets a jQuery row object according to given record key
        *************************************************************************/
        getRowByKey: function (key) {
            for (var i = 0; i < this._$tableRows.length; i++) {
                if (key == this._getKeyValueOfRecord(this._$tableRows[i].data('record'))) {
                    return this._$tableRows[i];
                }
            }

            return null;
        },

        getRowByProp: function (prop, val) {
            for (var i = 0; i < this._$tableRows.length; i++) {
                if ((this._$tableRows[i].data('record'))[prop] == val) {
                    return this._$tableRows[i];
                }
            }

            return null;
        },


        /* Gets the jQuery row objects 
        *************************************************************************/
        getDataRows: function () {
            return this._$tableRows;
        },

        /* Gets jQuery selection for currently selected rows.
        *************************************************************************/
        selectedRows: function () {
            return this._getSelectedRows();
        },

        /* Gets jQuery selection for currently selected rows.
        *************************************************************************/
        getSelectedRows: function () {
            return this._getSelectedRows();
        },

        /* Makes row/rows 'selected'.
        *************************************************************************/
        selectRows: function ($rows) {
            this._selectRows($rows);
            this._onSelectionChanged(); //TODO: trigger only if selected rows changes?
        },

        updateHeight: function () {
            if (this.options.scrollable) this._$table.parent().css('max-height', Math.max($(window).height() - this._$table.offset().top - 80, 100));
        },

        /* Completely removes the table from it's container.
        *************************************************************************/
        destroy: function () {
            this.element.empty();
            $.Widget.prototype.destroy.call(this);
        },

        /* Shows add new record dialog form.
        *************************************************************************/
        showCreateForm: function () {
            this._showAddRecordForm();
        },

        /* Adds a new record to the table (optionally to the server also)
        *************************************************************************/
        addRecord: function (options) {
            var self = this;
            options = $.extend({
                clientOnly: false,
                animationsEnabled: self.options.animationsEnabled,
                success: function () { },
                error: function () { }
            }, options);

            if (!options.record) {
                self._logWarn('options parameter in addRecord method must contain a record property.');
                return;
            }

            if (options.clientOnly) {
                self._addRow(
                    self._createRowFromRecord(options.record), {
                        isNewRow: true,
                        animationsEnabled: options.animationsEnabled
                    });

                options.success();
                return;
            }

            var completeAddRecord = function (data) {
                if (data.Result != 'OK') {
                    self._showError(data.Message);
                    options.error(data);
                    return;
                }

                if (!data.Record) {
                    self._logError('Server must return the created Record object.');
                    options.error(data);
                    return;
                }

                self._onRecordAdded(data);
                self._addRow(
                    self._createRowFromRecord(data.Record), {
                        isNewRow: true,
                        animationsEnabled: options.animationsEnabled
                    });

                options.success(data);
            };

            //createAction may be a function, check if it is
            if (!options.url && $.isFunction(self.options.actions.createAction)) {

                //Execute the function
                var funcResult = self.options.actions.createAction($.param(options.record));

                //Check if result is a jQuery Deferred object
                if (self._isDeferredObject(funcResult)) {
                    //Wait promise
                    funcResult.done(function (data) {
                        completeAddRecord(data);
                    }).fail(function () {
                        self._showError(self.options.messages.serverCommunicationError);
                        options.error();
                    });
                } else { //assume it returned the creation result
                    completeAddRecord(funcResult);
                }

            } else { //Assume it's a URL string

                //Make an Ajax call to create record
                self._submitFormUsingAjax(
                    options.url || self.options.actions.createAction,
                    $.param(options.record),
                    function (data) {
                        completeAddRecord(data);
                    },
                    function () {
                        self._showError(self.options.messages.serverCommunicationError);
                        options.error();
                    });

            }
        },

        /* Updates a record on the table (optionally on the server also)
        *************************************************************************/
        updateRecord: function (options) {
            var self = this;
            options = $.extend({
                clientOnly: false,
                animationsEnabled: self.options.animationsEnabled,
                success: function () { },
                error: function () { }
            }, options);

            if (!options.record) {
                self._logWarn('options parameter in updateRecord method must contain a record property.');
                return;
            }

            var key = self._getKeyValueOfRecord(options.record);
            if (key == undefined || key == null) {
                self._logWarn('options parameter in updateRecord method must contain a record that contains the key field property.');
                return;
            }

            var $updatingRow = self.getRowByKey(key);
            if ($updatingRow == null) {
                self._logWarn('Can not found any row by key "' + key + '" on the table. Updating row must be visible on the table.');
                return;
            }

            if (options.clientOnly) {
                $.extend($updatingRow.data('record'), options.record);
                self._updateRowTexts($updatingRow);
                self._onRecordUpdated($updatingRow, null);
                if (options.animationsEnabled) {
                    self._showUpdateAnimationForRow($updatingRow);
                }

                options.success();
                return;
            }

            var completeEdit = function (data) {
                if (data.Result != 'OK') {
                    self._showError(data.Message);
                    options.error(data);
                    return;
                }

                $.extend($updatingRow.data('record'), options.record);
                self._updateRecordValuesFromServerResponse($updatingRow.data('record'), data);

                self._updateRowTexts($updatingRow);
                self._onRecordUpdated($updatingRow, data);
                if (options.animationsEnabled) {
                    self._showUpdateAnimationForRow($updatingRow);
                }

                options.success(data);
            };

            //updateAction may be a function, check if it is
            if (!options.url && $.isFunction(self.options.actions.updateAction)) {

                //Execute the function
                var funcResult = self.options.actions.updateAction($.param(options.record));

                //Check if result is a jQuery Deferred object
                if (self._isDeferredObject(funcResult)) {
                    //Wait promise
                    funcResult.done(function (data) {
                        completeEdit(data);
                    }).fail(function () {
                        self._showError(self.options.messages.serverCommunicationError);
                        options.error();
                    });
                } else { //assume it returned the creation result
                    completeEdit(funcResult);
                }

            } else { //Assume it's a URL string

                //Make an Ajax call to create record
                self._submitFormUsingAjax(
                    options.url || self.options.actions.updateAction,
                    options.record,
                    function (data) {
                        completeEdit(data);
                    },
                    function () {
                        self._showError(self.options.messages.serverCommunicationError);
                        options.error();
                    });
            }
        },

        /* Deletes a record from the table (optionally from the server also).
       *************************************************************************/
        deleteRecord: function (options) {
            var self = this;
            options = $.extend({
                clientOnly: false,
                animationsEnabled: self.options.animationsEnabled,
                url: self.options.actions.deleteAction,
                success: function () { },
                error: function () { }
            }, options);

            if (!options.record) {
                self._logWarn('options parameter in updateRecord method must contain a record property.');
                return;
            }

            var key = self._getKeyValueOfRecord(options.record);
            if (key == undefined || key == null) {
                self._logWarn('options parameter in updateRecord method must contain a record that contains the key field property.');
                return;
            }

            var $deletingRow = self.getRowByKey(key);
            if ($deletingRow == null) {
                self._logWarn('Can not found any row by key: ' + key);
                return;
            }

            if (options.clientOnly) {
                self._removeRowsFromTableWithAnimation($deletingRow, options.animationsEnabled);
                options.success();
                return;
            }

            //updateAction may be a function, check if it is
            if (!options.url && $.isFunction(self.options.actions.deleteAction)) {

                //Execute the function
                var funcResult = self.options.actions.deleteAction($.param(options.record));

                //Check if result is a jQuery Deferred object
                if (self._isDeferredObject(funcResult)) {
                    //Wait promise
                    funcResult.done(function (data) {
                        self._removeRowsFromTableWithAnimation($deletingRow, options.animationsEnabled);
                        options.success(data);
                    }).fail(function () {
                        self._showError(self.options.messages.serverCommunicationError);
                        options.error();
                    });
                } else { //assume it returned the creation result
                    self._removeRowsFromTableWithAnimation($deletingRow, options.animationsEnabled);
                }

            } else { //Assume it's a URL string

                self._deleteRecordFromServer(
                    $deletingRow,
                    function (data) { //success
                        self._removeRowsFromTableWithAnimation($deletingRow, options.animationsEnabled);
                        options.success(data);
                    },
                    function (message) { //error
                        self._showError(message);
                        options.error(message);
                    },
                    options.url || self.options.actions.deleteAction
                );
            }
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

            if ($.isFunction(self.options.allowDeletion) && !self.options.allowDeletion(getRecordsFromRows($rows))) return;

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
            self._showBusy(self.options.messages.deleteProggress($rows.length));

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

            //If accordion style, close open child table (if it does exists)
            if (self.options.openChildAsAccordion) {
                $row.siblings('.jtable-data-row').each(function () {
                    self.closeChildTable($(this));
                });
            }

            var $childRowColumn = self.getChildRow($row).children('td').empty();
            var $childTableContainer = $('<div />').addClass('jtable-child-table-container')
                                                   .appendTo($childRowColumn);
            $childRowColumn.data('childTable', $childTableContainer);

            tableOptions.closeRequested = function (row) { self.closeChildTable(row); };
            tableOptions.showCloseButton = tableOptions.isChildTable = true;
            tableOptions.parentRow = $row;

            //Initialize table
            $childTableContainer.kTable(tableOptions);
            self.openChildRow($row);
            $childTableContainer.hide().slideDown('slow');

            if ($.isFunction(opened)) {
                var thispointer = $childTableContainer.kTable('getThisPointer').table;
                opened(thispointer);
            }
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
                $childTable.kTable('destroy');
                $childTable.remove();
                self.closeChildRow($row);
                if (closed) {
                    closed(arg1, arg2, arg3, arg4);
                }
            });
        },

        /* Returns a boolean value indicates that if a child row is open for given row.
        *************************************************************************/
        isChildRowOpen: function ($row) {
            return (this.getChildRow($row).is(':visible'));
        },

        /* Gets child row for given row, opens it if it's closed (Creates if needed).
        *************************************************************************/
        getChildRow: function ($row) {
            return $row.data('childRow') || this._createChildRow($row);
        },

        getParentRow: function () {
            return this.options.parentRow;
        },

        /* Creates and opens child row for given row.
        *************************************************************************/
        openChildRow: function ($row) {
            var $childRow = this.getChildRow($row);
            if (!$childRow.is(':visible')) {
                $childRow.show();
            }

            return $childRow;
        },

        /* Closes child row if it's open.
        *************************************************************************/
        closeChildRow: function ($row) {
            var $childRow = this.getChildRow($row);
            if ($childRow.is(':visible')) {
                $childRow.hide();
            }
        },

        /* Changes visibility of a column.
        *************************************************************************/
        changeColumnVisibility: function (columnName, visibility) {
            this._changeColumnVisibilityInternal(columnName, visibility);
            this._normalizeColumnWidths();
            if (this.options.saveUserPreferences) {
                this._saveColumnSettings();
            }
        },

        /************************************************************************
        * PRIVATE METHODS                                                       *
        *************************************************************************/

        /************************************************************************
       * CORE FUNCTIONALITY                                                   *
       ************************************************************************/

        _initializeCore: function () {
            //Initialization
            this._normalizeFieldsOptions();
            this._initializeFields();
            this._createFieldAndColumnList();

            //Creating DOM elements
            this._createMainContainer();
            this._createTableTitle();
            this._createToolBar();
            this._createTable();
            this._createBusyPanel();
            this._addNoDataRow();
        },

        /* Normalizes some options for all fields (sets default values).
        *************************************************************************/
        _normalizeFieldsOptions: function () {
            var self = this;
            $.each(self.options.fields, function (fieldName, props) {
                self._normalizeFieldOptions(fieldName, props);
            });
        },

        /* Normalizes some options for a field (sets default values).
        *************************************************************************/
        _normalizeFieldOptions: function (fieldName, props) {
            if (props.listClass == undefined) {
                props.listClass = '';
            }
            if (props.inputClass == undefined) {
                props.inputClass = '';
            }

            //Convert dependsOn to array if it's a comma seperated lists
            if (props.dependsOn && $.type(props.dependsOn) === 'string') {
                var dependsOnArray = props.dependsOn.split(',');
                props.dependsOn = [];
                for (var i = 0; i < dependsOnArray.length; i++) {
                    props.dependsOn.push($.trim(dependsOnArray[i]));
                }
            }

            props.sorting = (props.sorting != false);

            //columnResizable
            if (this.options.columnResizable) {
                props.columnResizable = (props.columnResizable != false);
            }

            //visibility
            if (!props.visibility) {
                props.visibility = 'visible';
            }
        },

        /* Intializes some private variables.
        *************************************************************************/
        _initializeFields: function () {
            this._lastPostData = {};
            this._$tableRows = [];
            this._columnList = [];
            this._fieldList = [];
            this._cache = [];
            this._lastSorting = [];

            if (this.options.sorting) this._buildDefaultSortingArray();
        },

        /* Fills _fieldList, _columnList arrays and sets _keyField variable.
        *************************************************************************/
        _createFieldAndColumnList: function () {
            var self = this;
            var fields = [];

            // Change the field order, if defined in options.fieldOrder
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

        /* Creates the main container div.
        *************************************************************************/
        _createMainContainer: function () {
            this._$mainContainer = $('<div>')
                .addClass('panel panel-primary')
                .appendTo(this.element);
        },

        /* Creates title of the table if a title supplied in options.
        *************************************************************************/
        _createTableTitle: function () {
            if (!this.options.title) this.options.title = "";

            this._$titleDiv = $('<div>')
                .addClass('panel-heading')
                .appendTo(this._$mainContainer);

            (this.options.isChildTable ? $('<h4>') : $('<h3>'))
                .appendTo(this._$titleDiv)
                .addClass('table-title')
                .text(this.options.title);
        },

        /* Creates the table.
        *************************************************************************/
        _createTable: function () {
            var self = this;
            var container = $('<div>').appendTo(this._$mainContainer);

            this._$table = $('<table>')
                .addClass(this.options.tableCssClasses)
                .appendTo(container);

            //Add the scollable class and recalculate the max height when the windows size changes        
            if (this.options.scrollable) {
                container.addClass('scrollable-table');
                $(window).resize(function () {
                    self.updateHeight();
                });
            }

            this._createTableHead();
            this._createTableBody();
        },

        /* Creates header (all column headers) of the table.
        *************************************************************************/
        _createTableHead: function () {
            var $thead = $('<thead>').appendTo(this._$table);
            this._addRowToTableHead($thead);
        },

        /* Adds tr element to given thead element
        *************************************************************************/
        _addRowToTableHead: function ($thead) {
            var $tr = $('<tr>').appendTo($thead);
            this._addColumnsToHeaderRow($tr);
        },

        /* Adds column header cells to given tr element.
        *************************************************************************/
        _addColumnsToHeaderRow: function ($tr) {
            if (this.options.selecting && this.options.selectingCheckboxes) {
                if (this.options.multiselect) {
                    $tr.append(this._createSelectAllHeader());
                } else {
                    $tr.append(this._createEmptyCommandHeader());
                }
            }

            for (var i = 0; i < this._columnList.length; i++) {
                var fieldName = this._columnList[i];
                var $headerCell = this._createHeaderCellForField(fieldName, this.options.fields[fieldName]);
                $headerCell.appendTo($tr);
            }

            if (this.options.actions.updateAction != undefined && !this.options.hideEditButton) {
                $tr.append(this._createEmptyCommandHeader());
            }

            if (this.options.actions.deleteAction != undefined && !this.options.hideDeleteButton) {
                $tr.append(this._createEmptyCommandHeader());
            }
        },

        /* Creates a header cell for given field.
        *  Returns th jQuery object.
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

            if (this.options.sorting && field.sorting) {
                this._makeColumnSortable($th, fieldName);
            }

            //Make data columns resizable except the last one
            if (this.options.columnResizable && field.columnResizable && (fieldName != this._columnList[this._columnList.length - 1])) {
                this._makeColumnResizable($th);
            }

            //Hide column if needed
            if (field.visibility == 'hidden') {
                $th.hide();
            }

            return $th;
        },

        /* Creates an empty header cell that can be used as command column headers.
        *************************************************************************/
        _createEmptyCommandHeader: function () {
            return $('<th>').addClass('jtable-command-column-header')
                            .css('width', '1%');
        },

        /* Creates tbody tag and adds to the table.
        *************************************************************************/
        _createTableBody: function () {
            this._$tableBody = $('<tbody></tbody>').appendTo(this._$table);
        },

        /* Creates a div to block UI while jTable is busy.
        *************************************************************************/
        _createBusyPanel: function () {
            this._$busyMessageDiv = $('<div />').addClass('jtable-busy-message').prependTo(this._$mainContainer);
            this._$busyDiv = $('<div />').addClass('jtable-busy-panel-background').prependTo(this._$mainContainer);
            this._$busyMessageDiv
                .append($('<div class="busy-message"></div>'))
                .append($('<div class="progress progress-striped active"><div class="progress-bar progress-bar-default" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 200px"><span class="sr-only">45% Complete</span></div></div>'));
            this._hideBusy();
        },

        /* LOADING RECORDS  *****************************************************/

        /* Performs an AJAX call to reload data of the table.
        *************************************************************************/
        _reloadTable: function (completeCallback) {
            var self = this;

            var completeReload = function (data) {
                //Show the error message if server returns error
                if (data.Result != 'OK') {
                    self._showError(data.Message);
                    return;
                }

                //Re-generate table rows
                self._removeAllRows('reloading');
                self._addRecordsToTable(data.Records);

                self._onRecordsLoaded(data);

                //Call complete callback
                if (completeCallback) {
                    completeCallback();
                }
                self._hideBusy();
            };

            self._showBusy(self.options.messages.loadingMessage, self.options.loadingAnimationDelay); //Disable table since it's busy
            self._onLoadingRecords();

            //listAction may be a function, check if it is
            if ($.isFunction(self.options.actions.listAction)) {

                //Execute the function
                var funcResult = self.options.actions.listAction(self._lastPostData, self._createJtParamsForLoading());

                //Check if result is a jQuery Deferred object
                if (self._isDeferredObject(funcResult)) {
                    funcResult.done(function (data) {
                        completeReload(data);
                    }).fail(function () {
                        self._showError(self.options.messages.serverCommunicationError);
                    }).always(function () {
                        self._hideBusy();
                    });
                } else { //assume it's the data we're loading
                    completeReload(funcResult);
                }

            } else if (this.options.actions.listAction) { //assume listAction as URL string.

                //Generate URL (with query string parameters) to load records
                var loadUrl = self._createRecordLoadUrl();

                //Load data from server using AJAX
                self._ajax({
                    method: 'POST',
                    url: loadUrl,
                    data: JSON.stringify(self._lastPostData),
                    success: function (data) {
                        completeReload(data);
                    },
                    error: function () {
                        self._hideBusy();
                        self._showError(self.options.messages.serverCommunicationError);
                    }
                });

            }
        },

        /* Creates URL to load records.
        *************************************************************************/
        _createRecordLoadUrl: function () {
            var url = this._addSortingInfoToUrl(this.options.actions.listAction);
            return this._addPagingInfoToUrl(url, this._currentPageNo);
        },

        _createJtParamsForLoading: function () {
            var jtParams = {};

            if (this.options.paging) {
                jtParams.jtStartIndex = (this._currentPageNo - 1) * this.options.pageSize;
                jtParams.jtPageSize = this.options.pageSize;
            }

            if (this.options.sorting && this._lastSorting.length) {
                var sorting = [];
                $.each(this._lastSorting, function (idx, value) {
                    sorting.push(value.fieldName + ' ' + value.sortOrder);
                });

                jtParams.jtSorting = sorting.join(",");
            }

            return jtParams;
        },

        /* TABLE MANIPULATION METHODS *******************************************/

        /* Creates a row from given record
        *************************************************************************/
        _createRowFromRecord: function (record) {
            var $tr = $('<tr></tr>')
                .addClass('jtable-data-row')
                .attr('data-record-key', this._getKeyValueOfRecord(record))
                .data('record', record);

            this._addCellsToRowUsingRecord($tr);
            return $tr;
        },

        /* Adds all cells to given row.
        *************************************************************************/
        _addCellsToRowUsingRecord: function ($row) {
            var record = $row.data('record'), self = this;

            if (this.options.selecting) {
                this._addSelectionBoxCell($row);
            }

            for (var i = 0; i < this._columnList.length; i++) {
                this._createCellForRecordField(record, this._columnList[i]).appendTo($row);
            }

            if (this.options.actions.updateAction != undefined) {
                var icon = $('<i class="glyphicon glyphicon-pencil"></i>').click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self._showEditForm($row);
                });

                $('<td></td>').addClass('jtable-command-column')
                              .append(icon)
                              .appendTo($row);
            }

            if (this.options.actions.deleteAction != undefined) {
                var icon = $('<i class="glyphicon glyphicon-trash"></i>')
                    .click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self._deleteButtonClickedForRow($row);
                    });

                $('<td></td>')
                    .addClass('jtable-command-column')
                    .append(icon)
                    .appendTo($row);
            }

            this._registerSelectOnRowClick($row);
        },

        /* Create a cell for given field.
        *************************************************************************/
        _createCellForRecordField: function (record, fieldName) {
            var column = $('<td>').addClass(this.options.fields[fieldName].listClass)
                            .append((this._getDisplayTextForRecordField(record, fieldName)));

            if (this.options.fields[fieldName].visibility == 'hidden') column.hide();
            return column;
        },

        /* Adds a list of records to the table.
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
        *************************************************************************/
        _addRow: function ($row, options) {
            if (options && options.isNewRow) {
                this._totalRecordCount++;

                // Remove last row when the current table is already full
                if (this.options.paging) {
                    if (this._$tableRows.length == this.options.pageSize) {
                        row = this._$tableBody.find('tr.jtable-data-row').last();

                        //remove from DOM
                        if (options.animationsEnabled) row.slideRow('up', 800, function () { row.remove(); });
                        else row.remove();

                        //remove from _$tableRows array                     
                        var index = this._findRowIndex(row);
                        if (index >= 0) {
                            this._$tableRows.splice(index, 1);
                        }

                        this._onRowsRemoved(row, "removed");
                    }

                    //Update paging info
                    this._createPagingInfo();
                    this._refreshGotoPageInput();
                    this._$pagingListArea.empty();
                    this._createFirstAndPreviousPageButtons();
                    if (this.options.pageList == 'normal') {
                        this._createPageNumberButtons(this._calculatePageNumbers(this._calculatePageCount()));
                    }
                    this._createLastAndNextPageButtons(this._calculatePageCount());
                    this._bindClickEventsToPageNumberButtons();
                }

                //Add new row at the top of the table
                arguments[1].index = 0;
            }

            this._addRowToTable($row, options);
        },

        _addRowToTable: function ($row, options) {
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

            //Find and remove a hidden row
            row = this._$tableBody.find('tr.ready-to-be-removed').first();
            if (row != undefined) row.remove();
        },

        _removeRows: function ($rows, reason) {
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

                this._removeRowsFromTable.apply(this, arguments);

                this.options.paging = temp;
                if (this.options.paging) this._createPagingInfo();
            }
        },

        /* Removes a row or rows (jQuery selection) from table.
        *************************************************************************/
        _removeRowsFromTable: function ($rows, reason) {
            var self = this;

            if (reason == 'deleted') {
                $rows.each(function () {
                    var $childRow = $(this).data('childRow');
                    if ($childRow) {
                        $childRow.slideRow('up', 500, function () { $childRow.remove(); });
                    }
                });
            }

            //Check if any row specified
            if ($rows.length <= 0) return;

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

            //Add 'no data' row if all rows were removed from table
            if (self._$tableRows.length == 0) self._addNoDataRow();
        },

        /* Finds index of a row in table.
        *************************************************************************/
        _findRowIndex: function ($row) {
            return this._findIndexInArray($row, this._$tableRows, function ($row1, $row2) {
                return $row1.data('record') == $row2.data('record');
            });
        },

        /* Removes all rows in the table and adds 'no data' row.
        *************************************************************************/
        _removeAllRows: function (reason) {
            if (this._$tableRows.length <= 0) return;

            //Select all rows (to pass it on raising _onRowsRemoved event)
            var $rows = this._$tableBody.find('tr.jtable-data-row');

            //Remove all rows from DOM and the _$tableRows array
            this._$tableBody.find('tr').addClass('ready-to-be-removed');
            this._$tableRows.length = 0;

            this._onRowsRemoved($rows, reason);

            //Add 'no data' row since we removed all rows
            this._addNoDataRow();
        },

        /* Adds "no data available" row to the table.
        *************************************************************************/
        _addNoDataRow: function () {
            if (this._$tableBody.find('>tr.jtable-no-data-row').length > 0) {
                return;
            }

            var $tr = $('<tr></tr>')
                .addClass('jtable-no-data-row warning')
                .appendTo(this._$tableBody);

            var totalColumnCount = this._$table.find('thead th').length;
            $('<td></td>')
                .attr('colspan', totalColumnCount)
                .html(this.options.messages.noDataAvailable)
                .appendTo($tr);
        },

        /* Removes "no data available" row from the table.
        *************************************************************************/
        _removeNoDataRow: function () {
            this._$tableBody.find('.jtable-no-data-row').remove();
        },

        /* RENDERING FIELD VALUES ***********************************************/

        /* Gets text for a field of a record according to it's type.
        *************************************************************************/
        _getDisplayTextForRecordField: function (record, fieldName) {
            var self = this;
            var field = this.options.fields[fieldName];
            var fieldValue = record[fieldName];

            //if this is a custom field, call display function
            if (field.display) {
                return field.display({ record: record, table: self });
            }

            if (field.inTableEdit && field.type == kTable.InputType.Number) {
                return this._createNumberInputForTable(record, field, fieldName, fieldValue);
            } else if (field.type == kTable.InputType.Date) {
                return this._getDisplayTextForDateRecordField(field, fieldValue);
            } else if (field.type == kTable.InputType.Checkbox) {
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

        /* Creates a number input field inside the table.
        *************************************************************************/
        _createNumberInputForTable: function (record, field, fieldName, value) {
            self = this;

            field.numberStep = field.numberStep || 1;

            var $input = $('<input class="' + field.inputClass + '" id="Edit-' + fieldName + '" type="number" step="' + field.numberStep + '" name="' + fieldName + '"></input>');
            if (value != undefined) $input.val(value);

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
                        function restoreFocus() {
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

        /*Display image for field*/
        _getImageDisplay: function (field, value, height) {
            var source = field.imageActionUrl + '/' + value;
            return $("<img class='gallery' src='" + source + "' height='" + height + "'/>").colorbox({ href: source, photo: true, scrolling: false }).resize();

        },

        /* Creates and returns an object that's properties are depended values of a record.
        *************************************************************************/
        _createDependedValuesUsingRecord: function (record, dependsOn) {
            if (!dependsOn) return {};

            var dependedValues = {};
            for (var i = 0; i < dependsOn.length; i++) {
                dependedValues[dependsOn[i]] = record[dependsOn[i]];
            }

            return dependedValues;
        },

        /* Finds an option object by given value.
        *************************************************************************/
        _findOptionByValue: function (options, value) {
            for (var i = 0; i < options.length; i++) {
                if (options[i].Value == value) {
                    return options[i];
                }
            }

            return {}; //no option found
        },

        /* Gets text for a date field.
        *************************************************************************/
        _getDisplayTextForDateRecordField: function (field, fieldValue) {
            if (!fieldValue) return;

            var datePicker = $('<div>').datepicker({
                format: field.dateFormat || this.options.defaultDateFormat
            });
            return datePicker.datepicker('setDate', new Date(fieldValue)).datepicker('getFormattedDate');
        },

        /* Gets options for a field according to user preferences.
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

        /* Download options for a field from server.
        *************************************************************************/
        _downloadOptions: function (fieldName, url) {
            var self = this;
            var options = [];

            self._ajax({
                url: url,
                async: false,
                success: function (data) {
                    if (data.Result != 'OK') {
                        self._showError(data.Message);
                        return;
                    }

                    options = data.Options;
                },
                error: function () {
                    var errMessage = self.options.messages.cannotLoadOptionsFor(fieldName);
                    self._showError(errMessage);
                }
            });

            return options;
        },

        /* Sorts given options according to sorting parameter.
        *  sorting can be: 'value', 'value-desc', 'text' or 'text-desc'.
        *************************************************************************/
        _sortFieldOptions: function (options, sorting) {

            if ((!options) || (!options.length) || (!sorting)) {
                return;
            }

            //Determine using value of text
            var dataSelector;
            if (sorting.indexOf('value') == 0) {
                dataSelector = function (option) {
                    return option.Value;
                };
            } else { //assume as text
                dataSelector = function (option) {
                    return option.DisplayText;
                };
            }

            var compareFunc;
            if ($.type(dataSelector(options[0])) == 'string') {
                compareFunc = function (option1, option2) {
                    return dataSelector(option1).localeCompare(dataSelector(option2));
                };
            } else { //asuume as numeric
                compareFunc = function (option1, option2) {
                    return dataSelector(option1) - dataSelector(option2);
                };
            }

            if (sorting.indexOf('desc') > 0) {
                options.sort(function (a, b) {
                    return compareFunc(b, a);
                });
            } else { //assume as asc
                options.sort(function (a, b) {
                    return compareFunc(a, b);
                });
            }
        },

        /* Creates an array of options from given object.
        *************************************************************************/
        _buildOptionsArrayFromObject: function (options) {
            var list = [];

            $.each(options, function (propName, propValue) {
                list.push({
                    Value: propName,
                    DisplayText: propValue
                });
            });

            return list;
        },

        /* Creates array of options from giving options array.
        *************************************************************************/
        _buildOptionsFromArray: function (optionsArray) {
            var list = [];

            for (var i = 0; i < optionsArray.length; i++) {
                if ($.isPlainObject(optionsArray[i])) {
                    list.push(optionsArray[i]);
                } else { //assumed as primitive type (int, string...)
                    list.push({
                        Value: optionsArray[i],
                        DisplayText: optionsArray[i]
                    });
                }
            }

            return list;
        },

        /* TOOL BAR *************************************************************/

        /* Creates the toolbar.
        *************************************************************************/
        _createToolBar: function () {
            this._$toolbarDiv = $('<div>').addClass("jtable-toolbar btn-group pull-right")
                                          .appendTo(this._$titleDiv);
        },

        _initializeToolbar: function () {
            for (var i = 0; i < this.options.toolbar.items.length; i++) {
                this._addToolBarItem(this.options.toolbar.items[i]);
            }
            this._addSearchToolbarItem();
            this._addDeleteToolbarItem();
            this._addCreateRecordToolbarItem();
            this._addRefreshToolbarItem();
            this._addCloseToolbarItem();
        },

        _addRefreshToolbarItem: function () {
            if (!this.options.actions.listAction) return;

            var self = this;
            this._addToolBarItem({
                icon: 'glyphicon glyphicon-refresh',
                click: function () {
                    self._reloadTable();
                }
            });
        },

        _addCloseToolbarItem: function () {
            if (!this.options.isChildTable || !this.options.showCloseButton) return;

            var self = this;
            this._addToolBarItem({
                title: self.options.messages.close,
                text: '',
                icon: 'glyphicon glyphicon-remove',
                cssClass: 'btn btn-default',
                click: function () {
                    self.options.closeRequested(self.options.parentRow);
                }
            });
        },

        _addCreateRecordToolbarItem: function () {
            var self = this;
            if (!this.options.actions.createAction || this.options.hideCreateButton) return;

            this._addToolBarItem({
                icon: "glyphicon glyphicon-plus",
                cssClass: 'btn btn-default',
                text: this.options.messages.addNewRecord,
                click: function () {
                    self._showAddRecordForm();
                }
            });
        },

        _addDeleteToolbarItem: function () {
            var self = this;
            if (!this.options.actions.deleteAction || !this.options.selecting || this.options.hideDeleteButton) return;

            this._addToolBarItem({
                icon: "glyphicon glyphicon-trash",
                text: this.options.messages.deleteText,
                click: function () {
                    if (!Utilities.IsEmptyArray(self.selectedRows(), Resources.Global.Error_NoRowsSelected))
                        self._$deleteMultiRecordDialog.open();
                }
            });
        },

        _addSearchToolbarItem: function () {
            if (!this.options.searchFields) return;
            var self = this;

            this._addToolBarItem({
                icon: 'glyphicon glyphicon-search',
                text: Resources.Global.General_Search,
                click: function () {
                    self._$searchBar.animate({ height: 'toggle' }, {
                        progress: function () {
                        }, complete: function () { self._$searchBar.find(':input:enabled:visible:first').focus() }
                    });
                }
            });
        },

        /* Adds a new item to the toolbar.
        *************************************************************************/
        _addToolBarItem: function (item) {
            var self = this;

            //Check if item is valid
            if ((item == undefined) || (item.text == undefined && item.icon == undefined)) {
                this._logWarn('Can not add tool bar item since it is not valid!');
                this._logWarn(item);
                return null;
            }

            var $toolBarItem = $('<button>').appendTo(this._$toolbarDiv);

            //insert space before the text when a glyphicon icon is present.
            if (item.icon && item.text) item.text = ' ' + item.text;

            //text property
            if (item.text) $toolBarItem.text(item.text);

            //cssClass property
            if (item.cssClass) $toolBarItem.addClass(item.cssClass);
            else $toolBarItem.addClass('btn btn-default');

            //tooltip property
            if (item.tooltip) $toolBarItem.attr('title', item.tooltip);

            //icon property
            if (item.icon) {
                $('<i>').addClass(item.icon)
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

        /* ERROR DIALOG *********************************************************/

        /* Shows error message dialog with given message.
        *************************************************************************/
        _showError: function (message) {
            this._hideBusy();

            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_DANGER,
                message: message,
                title: $("<h3></h3>").text(this.options.messages.error),
                buttons: [
                {
                    label: this.options.messages.close,
                    cssClass: "btn btn-default",
                    action: function (dialog) {
                        dialog.close();
                    }
                }],
            });
        },

        /* BUSY PANEL ***********************************************************/

        /* Shows busy indicator and blocks table UI.
        * TODO: Make this cofigurable and changable
        *************************************************************************/
        _setBusyTimer: null,
        showBusy: function (message, delay) { this._showBusy(message, delay); },

        _showBusy: function (message, delay) {
            var self = this;  //

            //Show a transparent overlay to prevent clicking to the table
            self._$busyDiv
                .width(self._$mainContainer.width())
                .height(self._$mainContainer.height())
                .addClass('jtable-busy-panel-background-invisible')
                .show();

            var makeVisible = function () {
                self._$busyDiv.removeClass('jtable-busy-panel-background-invisible');
                self._$busyMessageDiv.show().find('.busy-message').html(message);
            };

            if (delay) {
                if (self._setBusyTimer) {
                    return;
                }

                self._setBusyTimer = setTimeout(makeVisible, delay);
            } else {
                makeVisible();
            }
        },

        /* Hides busy indicator and unblocks table UI.
        *************************************************************************/
        _hideBusy: function () {
            clearTimeout(this._setBusyTimer);
            this._setBusyTimer = null;
            this._$busyDiv.hide();
            this._$busyMessageDiv.hide().find('.busy-message').html('');
        },

        /* Returns true if jTable is busy.
        *************************************************************************/
        _isBusy: function () {
            return this._$busyMessageDiv.is(':visible');
        },


        /* COMMON METHODS *******************************************************/

        _unAuthorizedRequestHandler: function () {
            if (this.options.unAuthorizedRequestRedirectUrl) {
                location.href = this.options.unAuthorizedRequestRedirectUrl;
            } else {
                location.reload(true);
            }
        },

        /* This method is used to perform AJAX calls in jTable instead of direct
        * usage of jQuery.ajax method.
        *************************************************************************/
        _ajax: function (options) {
            var self = this;

            //Handlers for HTTP status codes
            var opts = {
                statusCode: {
                    401: function () { //Unauthorized
                        self._unAuthorizedRequestHandler();
                    }
                }
            };

            opts = $.extend(opts, this.options.ajaxSettings, options);

            //Override success
            opts.success = function (data) {
                //Checking for Authorization error
                if (data && data.UnAuthorizedRequest == true) {
                    self._unAuthorizedRequestHandler();
                }

                if (options.success) {
                    options.success(data);
                }
            };

            //Override error
            opts.error = function (jqXHR, textStatus, errorThrown) {
                if (unloadingPage) {
                    jqXHR.abort();
                    return;
                }

                if (options.error) {
                    options.error(arguments);
                }
            };

            //Override complete
            opts.complete = function () {
                if (options.complete) {
                    options.complete();
                }
            };

            $.ajax(opts);
        },

        /* Gets value of key field of a record.
        *************************************************************************/
        _getKeyValueOfRecord: function (record) {
            return record[this._keyField];
        },

        /************************************************************************
        * COOKIE                                                                *
        *************************************************************************/

        /* Sets a cookie with given key.
        *************************************************************************/
        _setCookie: function (key, value) {
            key = this._cookieKeyPrefix + key;

            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 30);
            document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + "; expires=" + expireDate.toUTCString();
        },

        /* Gets a cookie with given key.
        *************************************************************************/
        _getCookie: function (key) {
            key = this._cookieKeyPrefix + key;

            var equalities = document.cookie.split('; ');
            for (var i = 0; i < equalities.length; i++) {
                if (!equalities[i]) {
                    continue;
                }

                var splitted = equalities[i].split('=');
                if (splitted.length != 2) {
                    continue;
                }

                if (decodeURIComponent(splitted[0]) === key) {
                    return decodeURIComponent(splitted[1] || '');
                }
            }

            return null;
        },

        /* Generates a hash key to be prefix for all cookies for this jtable instance.
        *************************************************************************/
        _generateCookieKeyPrefix: function () {

            var simpleHash = function (value) {
                var hash = 0;
                if (value.length == 0) {
                    return hash;
                }

                for (var i = 0; i < value.length; i++) {
                    var ch = value.charCodeAt(i);
                    hash = ((hash << 5) - hash) + ch;
                    hash = hash & hash;
                }

                return hash;
            };

            var strToHash = this._columnList.join('$') + '#c' + this._$table.find('thead th').length;
            return 'jtable#' + simpleHash(strToHash);
        },

        /************************************************************************
        * EVENT RAISING METHODS                                                 *
        *************************************************************************/

        // Overload events to add table to data object
        _onLoadingRecords: function () {
            if (this.options.selecting) this._storeSelectionList();

            this._trigger("loadingRecords", null, { table: this });
        },

        _onRecordsLoaded: function (data) {
            if (this.options.selecting) this._restoreSelectionList();

            if (this.options.paging) {
                this._totalRecordCount = data.TotalRecordCount;
                this._createPagingList();
                this._createPagingInfo();
                this._refreshGotoPageInput();
            }

            this.element.addClass("show");

            this._trigger("recordsLoaded", null, { table: this, records: data.Records, serverResponse: data });
            this.updateHeight();
        },

        _onRowInserted: function ($row, isNewRow) {
            this._trigger("rowInserted", null, { table: this, row: $row, record: $row.data('record'), isNewRow: isNewRow });
        },

        _onRowsRemoved: function ($rows, reason) {
            if (this.options.selecting && (reason != 'reloading') && ($rows.filter('.jtable-row-selected').length > 0)) this._onSelectionChanged();

            this._trigger("rowsRemoved", null, { table: this, rows: $rows, reason: reason });
        },

        _onCloseRequested: function () {
            this._trigger("closeRequested", null, { table: this });
        },

        _onRecordAdded: function (data) {
            this._trigger("recordAdded", null, { record: data.Record, serverResponse: data, table: this });
        },

        _onRowUpdated: function ($row) {
            this._trigger("rowUpdated", null, { table: this, row: $row, record: $row.data('record') });
        },

        _onRecordUpdated: function ($row, data) {
            this._trigger("recordUpdated", null, { table: this, record: $row.data('record'), row: $row, serverResponse: data });
        },

        _onSelectionChanged: function () {
            this._trigger("selectionChanged", null, { table: this });
        },

        /************************************************************************
        * Some UTULITY methods used by jTable                                   *
        *************************************************************************/

        /* Gets property value of an object recursively.
        *************************************************************************/
        _getPropertyOfObject: function (obj, propName) {
            if (propName.indexOf('.') < 0) {
                return obj[propName];
            } else {
                var preDot = propName.substring(0, propName.indexOf('.'));
                var postDot = propName.substring(propName.indexOf('.') + 1);
                return this._getPropertyOfObject(obj[preDot], postDot);
            }
        },

        /* Sets property value of an object recursively.
        *************************************************************************/
        _setPropertyOfObject: function (obj, propName, value) {
            if (propName.indexOf('.') < 0) {
                obj[propName] = value;
            } else {
                var preDot = propName.substring(0, propName.indexOf('.'));
                var postDot = propName.substring(propName.indexOf('.') + 1);
                this._setPropertyOfObject(obj[preDot], postDot, value);
            }
        },

        /* Inserts a value to an array if it does not exists in the array.
        *************************************************************************/
        _insertToArrayIfDoesNotExists: function (array, value) {
            if ($.inArray(value, array) < 0) {
                array.push(value);
            }
        },

        /* Finds index of an element in an array according to given comparision function
        *************************************************************************/
        _findIndexInArray: function (value, array, compareFunc) {

            //If not defined, use default comparision
            if (!compareFunc) {
                compareFunc = function (a, b) {
                    return a == b;
                };
            }

            for (var i = 0; i < array.length; i++) {
                if (compareFunc(value, array[i])) {
                    return i;
                }
            }

            return -1;
        },

        /* Normalizes a number between given bounds or sets to a defaultValue
        *  if it is undefined
        *************************************************************************/
        _normalizeNumber: function (number, min, max, defaultValue) {
            if (number == undefined || number == null || isNaN(number)) {
                return defaultValue;
            }

            if (number < min) {
                return min;
            }

            if (number > max) {
                return max;
            }

            return number;
        },

        /* Formats a string just like string.format in c#.
        *  Example:
        *  _formatString('Hello {0}','Halil') = 'Hello Halil'
        *************************************************************************/
        _formatString: function () {
            if (arguments.length == 0) {
                return null;
            }

            var str = arguments[0];
            for (var i = 1; i < arguments.length; i++) {
                var placeHolder = '{' + (i - 1) + '}';
                str = str.replace(placeHolder, arguments[i]);
            }

            return str;
        },

        /* Checks if given object is a jQuery Deferred object.
         */
        _isDeferredObject: function (obj) {
            return obj.then && obj.done && obj.fail;
        },

        //Logging methods ////////////////////////////////////////////////////////

        _logDebug: function (text) {
            if (!window.console) {
                return;
            }

            console.log('jTable DEBUG: ' + text);
        },

        _logInfo: function (text) {
            if (!window.console) {
                return;
            }

            console.log('jTable INFO: ' + text);
        },

        _logWarn: function (text) {
            if (!window.console) {
                return;
            }

            console.log('jTable WARNING: ' + text);
        },

        _logError: function (text) {
            if (!window.console) {
                return;
            }

            console.log('jTable ERROR: ' + text);
        },

        /************************************************************************
        * FORMS                                                                 *
        *************************************************************************/

        /* Submits a form asynchronously using AJAX.
        *  This method is needed, since form submitting logic can be overrided
        *  by extensions.
        *************************************************************************/
        _submitFormUsingAjax: function (url, formData, success, error) {
            this._ajax({
                url: url,
                data: JSON.stringify(formData),
                success: success,
                error: error
            });
        },

        /* Creates an input element according to field type.
        *************************************************************************/
        _createInputForRecordField: function (funcParams) {
            var fieldName = funcParams.fieldName,
                value = funcParams.record != null ? funcParams.record[fieldName] : funcParams.value,
                record = funcParams.record,
                formType = funcParams.formType,
                form = funcParams.form;
            var field = this.options.fields[fieldName];
            var self = this;

            //If value if not supplied, use defaultValue of the field
            if (value == undefined || value == null) value = field.defaultValue;


            //Use custom function if supplied
            if ($.isFunction(field.input)) {
                return input = $(field.input({
                    table: self,
                    value: value,
                    record: record,
                    formType: formType,
                    form: form,
                    field: field,
                    fieldName: fieldName
                }));
            }

            var input;
            //Create input according to field type
            if (field.type == 'date') {
                input = this._createDateInputForField(field, fieldName, value);
            } else if (field.type == 'textarea') {
                input = this._createTextAreaForField(field, fieldName, value);
            } else if (field.type == 'password') {
                input = this._createPasswordInputForField(field, fieldName, value);
            } else if (field.type == 'checkbox') {
                input = this._createCheckboxForField(field, fieldName, value);
            } else if (field.type == 'number') {
                input = this._createNumberInputForField(field, fieldName, value);
            } else if (field.type == 'directory') {
                input = this._createDirectoryInputForField(field, fieldName, value);
            } else if (field.type == 'dropdown') {
                input = this._createDropDownListForField(field, fieldName, value, record, formType, form);
            } else if (field.type == 'text') {
                input = this._createTextInputForField(field, fieldName, value);
            } else if (field.type == 'file') {
                input = this._createInputForFile(field, fieldName, value);
            } else if (field.options) {
                if (field.type == 'radiobutton') {
                    input = this._createRadioButtonListForField(field, fieldName, value, record, formType);
                } else {
                    input = this._createDropDownListForField(field, fieldName, value, record, formType, form);
                }
            } else {
                input = this._createTextInputForField(field, fieldName, value);
            }
            //if field disabled is set, the input cannot be changed by the user
            if (field.defaultValue && field.disabled) {
                input.find('input').attr('disabled', 'disabled');
            }
            return input;
        },

        //Creates a hidden input element with given name and value.
        _createInputForHidden: function (fieldName, value) {
            if (value == undefined) value = "";

            return $('<input type="hidden" name="' + fieldName + '" id="' + fieldName + '"></input>').val(value);
        },

        /* Creates a number input for a field.
        *************************************************************************/
        _createNumberInputForField: function (field, fieldName, value) {
            if (!field.numberStepSize) field.numberStepSize = 1;

            var formGroup = $('<div class="form-group col-md-6"></div>').append($('<label for="' + fieldName + '">' + field.title + '</label>'));
            var inputGroup = $('<div/>').appendTo(formGroup);
            var $input = $('<input placeholder="' + field.title + '" class="form-control ' + field.inputClass + '" id="' + fieldName + '" type="number" name="' + fieldName + '" step="' + field.numberStepSize + '"></input>').appendTo(inputGroup);
            var unit = null;

            if (Object.prototype.toString.call(value) == '[object String]') {
                unit = value.replace(/\d+/g, ''); // Remove all numbers from string                
                value = value.replace(/\D/g, ''); // Remove all non numeric characters from string
            }

            if ($.isArray(field.units)) {
                inputGroup.addClass('input-group')
                var addOn = $('<span class="input-group-addon" />').appendTo(inputGroup);
                var select = $('<select class="unit-selector" inputname="' + fieldName + '"/>').appendTo(addOn);

                $.each(field.units, function (i, val) {
                    var option = $('<option' + (val == unit ? ' selected="selected"' : '') + '/>').val(val).text(val);
                    select.append(option);
                    console.log(option);
                });
            }

            if (value != undefined) $input.val(value);

            return formGroup;
        },

        /* Creates a date input for a field.
        *************************************************************************/
        _createDateInputForField: function (field, fieldName, value) {
            var formGroup = $("<div class='form-group col-md-6'></div>");
            var inputGroup = $("<div class='input-group date'></div>").appendTo(formGroup);

            $('<label>' + field.title + '</label>').attr("for", fieldName).prependTo(formGroup);
            $('<input class="form-control ' + field.inputClass + '" type="text" placeholder="' + field.title + '"  name="' + fieldName + '"/>').attr("id", fieldName).appendTo(inputGroup);
            $('<span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span>').appendTo(inputGroup);

            inputGroup.datepicker({
                format: field.dateFormat || this.options.defaultDateFormat,
                startView: 1,
                todayBtn: "linked",
                language: "nl",
                calendarWeeks: true,
                autoclose: true,
                todayHighlight: true
            });

            if (value) {
                var date = new Date(value);
                inputGroup.datepicker("setDate", date);
            }
            return formGroup;
        },

        /* Creates a textarea element for a field.
        *************************************************************************/
        _createTextAreaForField: function (field, fieldName, value) {
            var formGroup = $('<div class="form-group col-md-6">').append($('<label for="' + fieldName + '">' + field.title + '</label>'));
            var $textArea = $('<textarea class="form-control ' + field.inputClass + '" id="' + fieldName + '" name="' + fieldName + '"></textarea>').appendTo(formGroup);

            if (value != undefined) $textArea.val(value);

            return formGroup;
        },

        /* Creates a standart textbox for a field.
        *************************************************************************/
        _createTextInputForField: function (field, fieldName, value) {
            var formGroup = $('<div class="form-group col-md-6">').append($('<label for="' + fieldName + '">' + field.title + '</label>'));
            var $input = $('<input placeholder="' + field.title + '" class="form-control ' + field.inputClass + '" id="' + fieldName + '" type="text" name="' + fieldName + '"></input>').appendTo(formGroup);

            if (value != undefined) $input.val(value);

            return formGroup;
        },

        /* Creates a password input for a field.
        *************************************************************************/
        _createPasswordInputForField: function (field, fieldName, value) {
            var formGroup = $("<div class='form-group col-md-6'></div>").append($('<label>' + field.title + '</label>').attr("for", fieldName));
            var $input = $('<input placeholder="' + field.title + '" class="form-control ' + field.inputClass + '" id="' + fieldName + '" type="password" name="' + fieldName + '"></input>').appendTo(formGroup);

            if (value != undefined) $input.val(value);

            return formGroup;
        },

        /* Creates a checkboxfor a field.
        *************************************************************************/
        _createCheckboxForField: function (field, fieldName, value) {
            var container = $("<div class='col-md-6' />");
            var checkbox = $("<div class='checkbox' />").appendTo(container);

            var label = $('<label for="' + fieldName + '">' + field.title + '</label>')
                .appendTo(checkbox);

            //The input should be placed before the text inside the label
            var input = $('<input class="' + field.inputClass + '" id="' + fieldName + '" type="checkbox" name="' + fieldName + '" />').prependTo(checkbox)
                .change(function () {
                    var input = $(this);
                    input.val(input.is(":checked"));
                });

            //If value is undefined, get unchecked state's value
            if (value == undefined || value.toString() == "") value = this._getCheckBoxPropertiesForFieldByState(fieldName, false).Value;

            if (value != undefined) input.val(value);

            //Check the checkbox if it's value is checked-value
            if (this._getIsCheckBoxSelectedForFieldByValue(fieldName, value)) input.attr('checked', 'checked');

            return container;
        },

        /* Creates a drop down list (combobox) input element for a field.
        *************************************************************************/
        _createDropDownListForField: function (field, fieldName, value, record, source, form) {
            var formGroup = $("<div class='form-group col-md-6'></div>");
            $('<label>' + field.title + '</label>').attr("for", fieldName).appendTo(formGroup);

            //Create select element
            var $select = $('<select class="form-control ' + field.inputClass + '" id="' + fieldName + '" name="' + fieldName + '"></select>').appendTo(formGroup)

            //add options
            var options = this._getOptionsForField(fieldName, {
                record: record,
                source: source,
                form: form,
                dependedValues: this._createDependedValuesUsingForm(form, field.dependsOn)
            });

            this._fillDropDownListWithOptions($select, options, value);

            return formGroup;
        },

        /* Fills a dropdown list with given options.
        *************************************************************************/
        _fillDropDownListWithOptions: function ($select, options, value) {
            $select.empty();
            for (var i = 0; i < options.length; i++) {
                var displayText = options[i].DisplayText || "";
                $('<option' + (options[i].Value == value ? ' selected="selected"' : '') + '>' + displayText + '</option>')
                    .val(options[i].Value)
                    .appendTo($select);
            }
        },

        /* Creates depended values object from given form.
        *************************************************************************/
        _createDependedValuesUsingForm: function ($form, dependsOn) {
            if (!dependsOn) {
                return {};
            }

            var dependedValues = {};

            for (var i = 0; i < dependsOn.length; i++) {
                var dependedField = dependsOn[i];

                var $dependsOn = $form.find('select[name=' + dependedField + ']');
                if ($dependsOn.length <= 0) {
                    continue;
                }

                dependedValues[dependedField] = $dependsOn.val();
            }


            return dependedValues;
        },

        /* Creates a radio button list for a field.
        *************************************************************************/
        _createRadioButtonListForField: function (field, fieldName, value, record, source) {
            var container = $('<div class="form-group col-md-6"></div>').text(field.title);

            var options = this._getOptionsForField(fieldName, {
                record: record,
                source: source
            });

            $.each(options, function (i, option) {
                var radioContainer = $("<div class='radio'></div>").appendTo(container);
                var label = $("<label></label>").text(option.DisplayText).appendTo(radioContainer);

                var $radioButton = $('<input type="radio" id="' + fieldName + '-' + i + '" class="' + field.inputClass + '" name="' + fieldName + '"' + ((option.Value == (value + '')) ? ' checked="true"' : '') + ' />')
                    .val(option.Value)
                    .prependTo(label);
            });

            return container;
        },

        /* Creates a standard file input field.
         * Difference: Label as container.
         *************************************************************************/
        _createInputForFile: function (field, fieldName, value) {
            var formGroup = $("<div class='form-group col-md-6'></div>").append($('<label for="' + fieldName + '">' + field.title + '</label>'));
            $('<input class="form-control file ' + field.inputClass + '" id="' + fieldName + '" name="' + fieldName + '"></input>').val(value).appendTo(formGroup);

            return formGroup;
        },

        /* Show several hidden fields when a checkbox is selected.
         * Note: only supports one showOn checkbbox.
         */
        _makeShowOnInputs: function (form) {
            var self = this;
            var containers = {};

            //Construct dictionary
            for (var i = 0; i < self._fieldList.length; i++) {
                var fieldName = self._fieldList[i];
                var field = self.options.fields[fieldName];

                if (field.showOn) {
                    var container = form.find('label[for="' + fieldName + '"]').parent().hide();

                    if (containers[field.showOn] == undefined) containers[field.showOn] = [];
                    containers[field.showOn].push(container);
                }
            }

            //Register on change function for each checkbox
            for (var key in containers) {
                var checkbox = form.find('#' + key);
                checkbox.change(function () {
                    for (var i = 0; i < containers[key].length; i++) {
                        containers[key][i].slideToggle("slow");
                    }
                });
            }
        },

        /* Gets display text for a checkbox field.
        *************************************************************************/
        _getCheckBoxTextForFieldByValue: function (fieldName, value) {
            if (this.options.fields[fieldName].values) return this.options.fields[fieldName].values[value];
            else return (value == 'true' || value == true) ? Resources.Global.General_Yes : Resources.Global.General_No;
        },

        /* Returns true if given field's value must be checked state.
        *************************************************************************/
        _getIsCheckBoxSelectedForFieldByValue: function (fieldName, value) {
            return (this._createCheckBoxStateArrayForFieldWithCaching(fieldName)[1].Value.toString() == value.toString());
        },

        /* Gets an object for a checkbox field that has Value and DisplayText
        *  properties.
        *************************************************************************/
        _getCheckBoxPropertiesForFieldByState: function (fieldName, checked) {
            return this._createCheckBoxStateArrayForFieldWithCaching(fieldName)[(checked ? 1 : 0)];
        },

        /* Calls _createCheckBoxStateArrayForField with caching.
        *************************************************************************/
        _createCheckBoxStateArrayForFieldWithCaching: function (fieldName) {
            var cacheKey = 'checkbox_' + fieldName;
            if (!this._cache[cacheKey]) {

                this._cache[cacheKey] = this._createCheckBoxStateArrayForField(fieldName);
            }

            return this._cache[cacheKey];
        },

        /* Creates a two element array of objects for states of a checkbox field.
        *  First element for unchecked state, second for checked state.
        *  Each object has two properties: Value and DisplayText
        *************************************************************************/
        _createCheckBoxStateArrayForField: function (fieldName) {
            var stateArray = [];
            var values = this.options.fields[fieldName].values;

            var trueDisplay = (values) ? values['true'] : Resources.Global.General_Yes;
            var falseDisplay = (values) ? values['false'] : Resources.Global.General_No;

            stateArray.push({ 'Value': 'false', 'DisplayText': falseDisplay });
            stateArray.push({ 'Value': 'true', 'DisplayText': trueDisplay });
            return stateArray;
        },

        /* Searches a form for dependend dropdowns and makes them cascaded.
        */
        _makeCascadeDropDowns: function ($form, record, source) {
            var self = this;

            $form.find('select') //for each combobox
                .each(function () {
                    var $thisDropdown = $(this);

                    //get field name
                    var fieldName = $thisDropdown.attr('name');
                    if (!fieldName) {
                        return;
                    }

                    var field = self.options.fields[fieldName];

                    //check if this combobox depends on others
                    if (!field.dependsOn) {
                        return;
                    }

                    //for each dependency
                    $.each(field.dependsOn, function (index, dependsOnField) {
                        //find the depended combobox
                        var $dependsOnDropdown = $form.find('select[name=' + dependsOnField + ']');
                        //when depended combobox changes
                        $dependsOnDropdown.change(function () {

                            //Refresh options
                            var funcParams = {
                                record: record,
                                source: source,
                                form: $form,
                                dependedValues: {}
                            };
                            funcParams.dependedValues = self._createDependedValuesUsingForm($form, field.dependsOn);
                            var options = self._getOptionsForField(fieldName, funcParams);

                            //Fill combobox with new options
                            self._fillDropDownListWithOptions($thisDropdown, options, undefined);

                            //Thigger change event to refresh multi cascade dropdowns.
                            $thisDropdown.change();
                        });
                    });
                });
        },

        /* Updates values of a record from given form
        *************************************************************************/
        _updateRecordValuesFromForm: function (record, $form) {
            for (var i = 0; i < this._fieldList.length; i++) {
                var fieldName = this._fieldList[i];
                var field = this.options.fields[fieldName];

                //Do not update non-editable fields
                if (field.edit == false) continue;

                //Get field name and the input element of this field in the form
                var $inputElement = $form.find('[name="' + fieldName + '"]');
                if ($inputElement.length <= 0) continue;

                //Update field in record according to it's type
                if (field.type == 'date') {
                    record[fieldName] = $inputElement.datepicker('getDate');
                } else if (field.options && field.type == 'radiobutton') {
                    var $checkedElement = $inputElement.filter(':checked');
                    if ($checkedElement.length) {
                        record[fieldName] = $checkedElement.val();
                    } else {
                        record[fieldName] = undefined;
                    }
                } else {
                    record[fieldName] = $inputElement.val();
                }
            }
        },

        _serializeForm: function (form) {
            function serializeAllArray(form) {
                var data = form.serializeArray();

                $(':disabled[name]', form).each(function () {
                    data.push({ name: this.name, value: $(this).val() });
                });
                return data;
            }

            var self = this;
            var o = {};
            var a = serializeAllArray(form);

            $.each(a, function () {
                var field = self.options.fields[this.name];
                var val = this.value || '';

                if (field && field.type == kTable.InputType.Date && val) {
                    val = form.find('[name="' + this.name + '"]').datepicker('getDate');
                }
                else if (field.type == kTable.InputType.Number && $.isArray(field.units)) {
                    val += $('.unit-selector[inputname="' + this.name + '"]').val();
                }

                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(val);
                } else {
                    o[this.name] = val;
                }
            });
            return o;
        },

        _setEnabledOfDialogButton: function ($button, enabled, buttonText) {
            if (!$button) {
                return;
            }

            if (enabled) {
                $button
                    .removeAttr('disabled')
                    .removeClass('ui-state-focus')
                    .removeClass('ui-state-disabled');
            } else {
                $button
                    .attr('disabled', 'disabled')
                    .addClass('ui-state-focus')
                    .addClass('ui-state-disabled');
            }

            if (buttonText) {
                $button
                    .find('span')
                    .text(buttonText);
            }
        },

        /************************************************************************
        * CREATE RECORD                                                         *
        *************************************************************************/

        _createAddRecordDialog: function () {
            var self = this;
            this._addRecordDialog = new BootstrapDialog({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: $("<h3></h3>").text(this.options.messages.addNewRecord),
                message: $("<div></div>"),
                closable: false,
                autodestroy: false,
                buttons: [
                {
                    label: this.options.messages.cancel,
                    cssClass: "btn btn-default",
                    closable: false,
                    action: function (dialog) {
                        BootstrapDialog.show({
                            type: BootstrapDialog.TYPE_WARNING,
                            title: $("<h3></h3>").text(Resources.Global.General_Warning),
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
                                cssClass: "btn btn-primary",
                                action: function (confirmDialog) {
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
                    label: this.options.messages.save,
                    cssClass: "btn btn-primary",
                    action: function (dialog) {
                        dialog.enableButtons(false);
                        dialog.getButton('saveButton').spin();
                        self._saveCreateForm();
                    }
                }],
                onhidden: function (dialog) {
                    var form = dialog.getModalBody().find('form').first();
                    self._trigger("formClosed", null, { form: form, formType: 'create' });
                }
            });
        },

        /* Shows add new record dialog form.
       *************************************************************************/
        _showAddRecordForm: function () {
            if (this._addRecordDialog.getModalBody()) this._addRecordDialog.getModalBody().empty();

            if (this.options.multiForms) this._createInputFormCount();

            // Create initial form.
            this._createForm(this, false);
            this._addRecordDialog.open();
        },

        /* Create a spinbox to dynamically alter the amount of shown forms 
        */
        _createInputFormCount: function () {
            var self = this;
            var row = $("<div class='row'></div>");
            var formGroup = $('<div class="form-group col-md-6"></div>').appendTo(row).append($('<label for="formCount">' + this.options.messages.formCount + '</label>'));
            var $input = $('<input placeholder="' + this.options.messages.formCount + '" class="form-control" id="formCount" type="number" name="formCount" value="1" step="1"></input>').appendTo(formGroup);

            //Update the amount of shown forms when changing the value of the spinnerbox
            $input.bind('keyup mouseup', function () {
                var target = $input.val();
                var formCount = 0;

                var forms = self._addRecordDialog.getModalBody().find('form').not(':hidden');

                if (forms != undefined) formCount = forms.length;

                //Hide forms
                if (formCount > target) {
                    $input.attr('disabled', true);

                    var deleteCount = formCount - target;
                    forms = forms.toArray().reverse();
                    for (var i = 0; i < deleteCount; i++)
                        $(forms[i]).slideUp("slow", function () {
                            $input.attr('disabled', false);
                        });
                }
                    //Add or unhide forms
                else {
                    var addCount = target - formCount;
                    var hiddenForms = self._addRecordDialog.getModalBody().find('form:hidden');

                    var hiddenCount = hiddenForms.length > addCount ? addCount : hiddenForms.length;
                    for (var i = 0; i < hiddenCount; i++)
                        $(hiddenForms[i]).slideDown("slow");

                    addCount -= hiddenCount;
                    if (addCount > 0)
                        for (var i = formCount - addCount; i < formCount; i++)
                            self._createForm(self, true, i);
                }
            });

            if (this._addRecordDialog.getModalBody()) this._addRecordDialog.getModalBody().append(row);
            else this._addRecordDialog.options.message.append(row);
        },

        /* Create the form to add new records
        * Difference: Supports more field types
        */
        _createForm: function (self, animate, i) {
            var id = "jtable-create-form";

            if (i != undefined) id = id + i;
            var $addRecordForm = $('<form id="' + id + '" role="form"></form>')
                .keydown(function (e) {
                    if (e.which == 13) {
                        e.preventDefault();

                        if (self._addRecordDialog.getButton('saveButton').hasClass('disabled')) return;
                        self._addRecordDialog.enableButtons(false);
                        self._addRecordDialog.getButton('saveButton').spin();
                        self._saveCreateForm();
                        return false;
                    }
                });

            this._makeInputs($addRecordForm, {
                formType: 'create',
                form: $addRecordForm
            });
            this._makeCascadeDropDowns($addRecordForm, undefined, 'create');
            this._makeShowOnInputs($addRecordForm);

            $addRecordForm.submit(function () {
                self._saveCreateForm();
                return false;
            });

            if (this._addRecordDialog.getModalBody()) this._addRecordDialog.getModalBody().append($addRecordForm);
            else this._addRecordDialog.options.message.append($addRecordForm);

            if (animate) $addRecordForm.hide().slideDown('slow');

            this._initializeSpecials($addRecordForm, this._addRecordDialog, this._processNewRecord);
            this._trigger("formCreated", null, { form: $addRecordForm, formType: 'create' });
        },

        _makeInputs: function (form, options) {
            var counter = 0;
            var row = $('<div class="row"></div>').appendTo(form);

            for (var i = 0; i < this._fieldList.length; i++) {
                var fieldName = this._fieldList[i];
                var field = this.options.fields[fieldName];

                if (options.formType == 'create' && ((field.key == true && field.create == false) || field.create == false))
                    continue;

                options.value = (options.formType == 'edit') ? this._getValueForRecordField(options.record, fieldName) : field.defaultValue;

                if (field.type == 'hidden' || (options.formType == 'edit' && (field.edit == false || field.key == true))) {
                    form.append(this._createInputForHidden(fieldName, options.value));
                    continue;
                }

                this._createInputForRecordField($.extend(options, { fieldName: fieldName })).appendTo(row);

                if (++counter % 2 == 0) row = $('<div class="row"></div>').appendTo(form);
            }
        },

        _initializeSpecials: function (form, dialog, processRecordCb) {
            var self = this;
            for (var i = 0; i < self._fieldList.length; i++) {
                var fieldName = self._fieldList[i];
                var field = self.options.fields[fieldName];

                if (field.type == "typeAhead" || field.typeAhead) {
                    self._initializeTypeAhead(field, fieldName, form);
                } else if (field.type == "file") {
                    self._initializeUploadiFive(field, fieldName, form, dialog, processRecordCb);
                }
            }
            $.each(form.find(".tt-hint"), function (i, input) {
                $(input).removeClass(); $(input).addClass("tt-hint");
            });
        },

        _initializeTypeAhead: function (field, fieldName, form) {
            var options = field.typeAhead,
                input = form.find('#' + fieldName),
                keyProp = options.valueField || "Value";

            initializeTypeAhead(input, options, function ($e, datum, datasetName) {
                form.find('#' + options.hiddenValueField).val(datum[keyProp]);
            });
        },

        _initializeUploadiFive: function (field, fieldName, form, dialog, processRecordCb) {
            var self = this;
            var input = form.find('#' + fieldName);
            input.uploadifive({
                buttonClass: 'btn btn-primary',
                buttonText: Resources.Global.Uploadify_SelectFile,
                auto: false,
                uploadScript: field.uploadOptions.actionUrl,
                fileType: field.uploadOptions.fileType,
                uploadLimit: field.uploadOptions.uploadLimit || 0,
                queueSizeLimit: field.uploadOptions.uploadLimit || 1,
                onUpload: function (file) {
                    input.data('uploadifive').settings.formData = { "entity": JSON.stringify(self._serializeForm(form)) };
                },
                onError: function (response, filesToUpload) {
                    if (response != 'UPLOAD_LIMIT_EXCEEDED') self._showError(response);
                    dialog.enableButtons(true);
                    dialog.getButton('saveButton').stopSpin();
                },
                onUploadComplete: function (file, response) {
                    var obj = jQuery.parseJSON(response);

                    processRecordCb(obj);
                },
            });
        },

        /* Submit the forms. 
        * Difference: support for multiple forms inside the dialog
        */
        _saveCreateForm: function () {
            var self = this;
            var $addRecordForms = self._addRecordDialog.getModalBody().find('form').not(":hidden");

            //Validate every form in the dialog
            var fails = 0;
            $addRecordForms.each(function (index) {
                if (self._trigger("formSubmitting", null, { form: $(this), formType: 'create' }) == false) fails++;
            });
            if (fails > 0) {
                self._addRecordDialog.enableButtons(true);
                self._addRecordDialog.getButton('saveButton').stopSpin();
                return;
            }

            self._saveAddRecordForms($addRecordForms);
        },

        /* Saves new added record to the server and updates table.
        *************************************************************************/
        _saveAddRecordForms: function ($addRecordForms, $saveButton) {
            var self = this;

            //createAction may be a function, check if it is
            if ($.isFunction(self.options.actions.createAction)) {
                //Execute the function
                var payload = [];
                $addRecordForms.each(function (index) {
                    payload.push(self._serializeForm($(this)));
                    $(this).data('submitting', true);
                });

                var funcResult = self.options.actions.createAction(self.options.multiForms ? payload : payload[0]);

                //Check if result is a jQuery Deferred object
                if (self._isDeferredObject(funcResult)) {
                    //Wait promise
                    funcResult.done(function (data) {
                        self._processNewRecord(data);
                    }).fail(function () {
                        self._showError(self.options.messages.serverCommunicationError);
                        self._addRecordDialog.enableButtons(true);
                        self._addRecordDialog.getButton('saveButton').stopSpin();
                    });
                } else { //assume it returned the creation result
                    self._processNewRecord(funcResult);
                }

            } else { //Assume it's a URL string                                     
                var payload = [];
                $addRecordForms.each(function (index) {
                    payload.push(self._serializeForm($(this)));
                    $(this).data('submitting', true);
                });

                //Submit form via uploadify. N.B. currently works for only one instance op UploadiFive.
                var fileInputs = false;
                $addRecordForms.each(function (index) {
                    if ($(this).find(".uploadifive-queue-item").length > 0) {
                        $(this).find("input.file").each(function (index, item) {
                            $(item).uploadifive("upload");
                            fileInputs = true;
                        });
                    }
                });
                if (fileInputs) return;

                //Make an Ajax call to create record
                self._submitFormUsingAjax(
                self.options.actions.createAction,
                self.options.multiForms ? payload : payload[0],
                function (data) {
                    self._processNewRecord(data);
                },
                function () {
                    self._showError(self.options.messages.serverCommunicationError);
                    self._addRecordDialog.enableButtons(true);
                    self._addRecordDialog.getButton('saveButton').stopSpin();
                });
            }
        },

        _processNewRecord: function (data) {
            var self = this;

            if (data.Result == 'ERROR') {
                self._showError(data.Message);
            } else {
                if (data.Result == 'WARNING') warningDialog(data.Message);

                if (!data.Record && !data.Records) {
                    self._logError('Server must return the created Record object.');
                } else {
                    if (data.Records != undefined) {
                        data.Records.forEach(function (record) {
                            // Keep in line with orignal JTable design
                            self._trigger("recordAdded", null, { record: record, serverResponse: data });

                            self._addRow(self._createRowFromRecord(record), {
                                isNewRow: true,
                                animationsEnabled: true
                            });
                        });
                    }
                    else {
                        self._onRecordAdded(data)

                        self._addRow(
                            self._createRowFromRecord(data.Record), {
                                isNewRow: true,
                                animationsEnabled: true
                            });
                    }
                    self._addRecordDialog.close();
                }
            }

            self._addRecordDialog.enableButtons(true);
            self._addRecordDialog.getButton('saveButton').stopSpin();
        },

        /************************************************************************
        * EDIT RECORD extension for jTable                                      *
        *************************************************************************/

        /* Creates and prepares edit dialog div
        *************************************************************************/
        _createEditDialog: function () {
            var self = this;

            this._editRecordDialog = new BootstrapDialog({
                type: BootstrapDialog.TYPE_PRIMARY,
                title: $("<h3></h3>").text(this.options.messages.editRecord),
                closable: false,
                autodestroy: false,
                buttons: [
                {
                    label: this.options.messages.cancel,
                    cssClass: "btn btn-default",
                    action: function (dialog) {
                        BootstrapDialog.show({
                            type: BootstrapDialog.TYPE_WARNING,
                            closable: false,
                            title: $("<h3></h3>").text(Resources.Global.General_Warning),
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
                                cssClass: "btn btn-primary",
                                action: function (confirmDialog) {
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
                    label: self.options.messages.save,
                    cssClass: "btn btn-primary",
                    action: function (dialog) {
                        dialog.enableButtons(false);
                        dialog.getButton('saveButton').spin();
                        self._saveEditForm();
                    }
                }],
                onhidden: function (dialog) {
                    var form = dialog.getModalBody().find('form').first();
                    self._trigger("formClosed", null, { form: form, formType: 'create', table: self });
                }
            });
        },

        /* Shows edit form for a row.
        *************************************************************************/
        _showEditForm: function ($tableRow) {
            var self = this;
            var record = $tableRow.data('record');

            //Check if editing the record is allowed
            if (self.options.allowEdit == false) return;
            else if ($.isFunction(self.options.allowEdit) && !self.options.allowEdit(record)) return;

            if (self._editRecordDialog.getModalBody()) self._editRecordDialog.getModalBody().empty();

            //Create edit form	    
            var $editForm = $('<form role="form"></form>')
                .keydown(function (e) {
                    //Enter
                    if (e.which == 13) {
                        e.preventDefault();

                        if (self._editRecordDialog.getButton('saveButton').hasClass('disabled')) return;
                        self._editRecordDialog.enableButtons(false);
                        self._editRecordDialog.getButton('saveButton').spin();
                        self._saveEditForm();
                        return false;
                    }
                });
            var row = $('<div class="row"></div>').appendTo($editForm);

            this._makeInputs($editForm, {
                value: null,
                formType: 'edit',
                form: $editForm,
                record: record,
            });
            this._makeCascadeDropDowns($editForm, record, 'edit');
            this._makeShowOnInputs($editForm);

            $editForm.submit(function () {
                self._saveEditForm();
                return false;
            });

            this._$editingRow = $tableRow;

            if (this._editRecordDialog.getModalBody()) this._editRecordDialog.getModalBody().append($editForm);
            else this._editRecordDialog.options.message = $editForm;

            this._initializeSpecials($editForm, this._editRecordDialog, this._processRecord.bind(this));
            this._trigger("formCreated", null, { form: $editForm, formType: 'edit', record: record, row: $tableRow });
            this._editRecordDialog.open();
        },

        /* Saves editing form to the server and updates the record on the table.
        *************************************************************************/
        _saveEditForm: function () {
            var self = this;
            var $editForm = self._editRecordDialog.getModalBody().find('form');

            if (self._trigger("formSubmitting", null, { form: $editForm, formType: 'edit', row: self._$editingRow }) == false) {
                self._editRecordDialog.enableButtons(true);
                self._editRecordDialog.getButton('saveButton').stopSpin();
                return;
            }

            //updateAction may be a function, check if it is
            if ($.isFunction(self.options.actions.updateAction)) {

                //Execute the function
                var funcResult = self.options.actions.updateAction($editForm.serialize());

                //Check if result is a jQuery Deferred object
                if (self._isDeferredObject(funcResult)) {
                    //Wait promise
                    funcResult.done(function (data) {
                        self._processRecord(data);
                    }).fail(function () {
                        self._showError(self.options.messages.serverCommunicationError);
                        self._editRecordDialog.enableButtons(true);
                        self._editRecordDialog.getButton('saveButton').stopSpin();
                    });
                } else { //assume it returned the creation result
                    self._processRecord(funcResult);
                }

            } else { //Assume it's a URL string 
                if ($editForm.find(".uploadifive-queue-item").length > 0) {
                    if ($editForm.find("input.file").length > 0) {
                        $editForm.find("input.file").each(function (index, item) {
                            $(item).uploadifive("upload");
                        });
                        return;
                    }
                }

                var record = self._serializeForm($editForm);
                //Make an Ajax call to update record
                self._submitFormUsingAjax(
                    self.options.actions.updateAction,
                    record,
                    function (data) {
                        if (data.Record == undefined) data.Record = record;
                        self._processRecord(data);
                    },
                    function () {
                        self._showError(self.options.messages.serverCommunicationError);
                        self._editRecordDialog.enableButtons(true);
                        self._editRecordDialog.getButton('saveButton').stopSpin();
                    });
            }
        },

        _processRecord: function (data) {
            var self = this;
            var $editForm = self._editRecordDialog.getModalBody().find('form');

            if (data.Result == 'ERROR') {
                self._showError(data.Message);
            } else {
                if (data.Result == 'WARNING') warningDialog(data.Message);
                var record = self._$editingRow.data('record');

                if (data.Record == undefined) self._updateRecordValuesFromForm(record, $editForm);
                else self._updateRecordValuesFromServerResponse(record, data);
                self._updateRowTexts(self._$editingRow);

                self._$editingRow.attr('data-record-key', self._getKeyValueOfRecord(record));

                self._onRecordUpdated(self._$editingRow, data);

                if (self.options.animationsEnabled) {
                    self._showUpdateAnimationForRow(self._$editingRow);
                }

                self._editRecordDialog.close();
            }
            self._editRecordDialog.enableButtons(true);
            self._editRecordDialog.getButton('saveButton').stopSpin();
        },

        /* This method ensures updating of current record with server response,
        * if server sends a Record object as response to updateAction.
        *************************************************************************/
        _updateRecordValuesFromServerResponse: function (record, serverResponse) {
            if (!serverResponse || !serverResponse.Record) {
                return;
            }

            $.extend(true, record, serverResponse.Record);
        },

        /* Gets text for a field of a record according to it's type.
        *************************************************************************/
        _getValueForRecordField: function (record, fieldName) {
            var field = this.options.fields[fieldName];
            var fieldValue = record[fieldName];
            if (field.type == 'date') {
                return this._getDisplayTextForDateRecordField(field, fieldValue);
            } else {
                return fieldValue;
            }
        },

        /* Updates cells of a table row's text values from row's record values.
        *************************************************************************/
        _updateRowTexts: function ($tableRow) {
            var record = $tableRow.data('record');
            var $columns = $tableRow.find('td');
            for (var i = 0; i < this._columnList.length; i++) {
                var displayItem = this._getDisplayTextForRecordField(record, this._columnList[i]);
                if ((displayItem != "") && (displayItem == 0)) displayItem = "0";
                $columns.eq(this._firstDataColumnOffset + i).html(displayItem || '');
            }

            this._onRowUpdated($tableRow);
        },

        /* Shows 'updated' animation for a table row.
        *************************************************************************/
        _showUpdateAnimationForRow: function ($tableRow) {
            var className = 'bg-success';

            $tableRow.addClass(className);

            setTimeout(function () {
                $tableRow.removeClass(className);
            }, 2000)
        },

        _createMultiDeleteDialog: function () {
            var self = this;

            //Check if deleteAction is supplied
            if (!self.options.actions.deleteAction || !self.options.selecting || self.options.hideDeleteButton) {
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
        _createDeleteDialog: function () {
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
        },

        /* This method is called when user clicks delete button on a row.
        * Difference: setting deleteConfirmMessage as the message property of the deleteRecordDialog
        *************************************************************************/
        _deleteButtonClickedForRow: function ($row) {
            var self = this;
            var record = $row.data('record');

            if ($.isFunction(self.options.allowDeletion) && !self.options.allowDeletion([record])) return;

            var deleteConfirmMessage = self.options.messages.confirmDeletion;

            //If options.confirmDeletion is function then call it
            if ($.isFunction(self.options.confirmDeletionBody)) {
                deleteConfirmMessage = self.options.confirmDeletionBody({ row: $row, record: $row.data('record'), table: this });
            }

            if (self.options.confirmDeletion == true) {
                if (self._$deleteRecordDialog.getModalBody()) self._$deleteRecordDialog.getModalBody().html(deleteConfirmMessage);
                else self._$deleteRecordDialog.options.message = deleteConfirmMessage;
                self._showDeleteDialog($row);
            } else {
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

        _removeRowsFromTableWithAnimation: function ($rows, animationsEnabled) {
            var self = this;

            if (animationsEnabled == undefined) {
                animationsEnabled = self.options.animationsEnabled;
            }

            if (animationsEnabled) {
                var className = 'jtable-row-deleting';

                //Stop current animation (if does exists) and begin 'deleting' animation.
                $rows.stop(true, true).addClass(className, 'slow', '').promise().done(function () {
                    self._removeRows($rows, 'deleted');
                });
            } else {
                self._removeRows($rows, 'deleted');
            }
        },

        /* Creates a header column to select/deselect all rows.
        *************************************************************************/
        _createSelectAllHeader: function () {
            var self = this;

            var $columnHeader = $('<th class=""></th>')
                .addClass('jtable-command-column-header jtable-column-header-selecting');

            var $headerContainer = $('<div />')
                .addClass('checkbox checkbox-primary')
                .appendTo($columnHeader);
            $('<label>').appendTo($headerContainer);

            self._$selectAllCheckbox = $('<input type="checkbox" />')
                .prependTo($headerContainer)
                .click(function () {
                    if (self._$tableRows.length <= 0) {
                        self._$selectAllCheckbox.attr('checked', false);
                        return;
                    }

                    var allRows = self._$tableBody.find('>tr.jtable-data-row');
                    if (self._$selectAllCheckbox.is(':checked')) {
                        self._selectRows(allRows);
                    } else {
                        self._deselectRows(allRows);
                    }

                    self._onSelectionChanged();
                });

            return $columnHeader;
        },

        /* Stores Id's of currently selected records to _selectedRecordIdsBeforeLoad.
        *************************************************************************/
        _storeSelectionList: function () {
            var self = this;

            if (!self.options.selecting) {
                return;
            }

            self._selectedRecordIdsBeforeLoad = [];
            self._getSelectedRows().each(function () {
                self._selectedRecordIdsBeforeLoad.push(self._getKeyValueOfRecord($(this).data('record')));
            });
        },

        /* Selects rows whose Id is in _selectedRecordIdsBeforeLoad;
        *************************************************************************/
        _restoreSelectionList: function () {
            var self = this;

            if (!self.options.selecting) {
                return;
            }

            var selectedRowCount = 0;
            for (var i = 0; i < self._$tableRows.length; ++i) {
                var recordId = self._getKeyValueOfRecord(self._$tableRows[i].data('record'));
                if ($.inArray(recordId, self._selectedRecordIdsBeforeLoad) > -1) {
                    self._selectRows(self._$tableRows[i]);
                    ++selectedRowCount;
                }
            }

            if (self._selectedRecordIdsBeforeLoad.length > 0 && self._selectedRecordIdsBeforeLoad.length != selectedRowCount) {
                self._onSelectionChanged();
            }

            self._selectedRecordIdsBeforeLoad = [];
            self._refreshSelectAllCheckboxState();
        },

        /* Gets all selected rows.
        *************************************************************************/
        _getSelectedRows: function () {
            return this._$tableBody.find('>tr.jtable-row-selected');
        },

        /* Adds selectable feature to a row.
        *************************************************************************/
        _addSelectionBoxCell: function ($row) {
            var self = this;

            //'select/deselect' checkbox column
            if (self.options.selectingCheckboxes) {
                var $cell = $('<td></td>').addClass('jtable-selecting-column');
                var $container = $('<div/>').addClass('checkbox checkbox-primary').appendTo($cell);

                var $selectCheckbox = $('<input type="checkbox" />').appendTo($container);
                $selectCheckbox.click(function () {
                    self._invertRowSelection($row);
                });

                $('<label>').appendTo($container);
                $row.append($cell);
            }
        },

        _registerSelectOnRowClick: function (row) {
            var self = this;

            if (this.options.selectOnRowClick) {
                var columns = row.find('td:not(.jtable-command-column, .jtable-selecting-column, :has(img), :has(input), :has(i))');
                columns.click(function () {
                    self._invertRowSelection(row);
                });
            }
        },

        /* Inverts selection state of a single row.
        *************************************************************************/
        _invertRowSelection: function ($row) {
            if ($row.hasClass('jtable-row-selected')) {
                this._deselectRows($row);
            } else {
                //Shift key?
                if (this._shiftKeyDown) {
                    var rowIndex = this._findRowIndex($row);
                    //try to select row and above rows until first selected row
                    var beforeIndex = this._findFirstSelectedRowIndexBeforeIndex(rowIndex) + 1;
                    if (beforeIndex > 0 && beforeIndex < rowIndex) {
                        this._selectRows(this._$tableBody.find('tr').slice(beforeIndex, rowIndex + 1));
                    } else {
                        //try to select row and below rows until first selected row
                        var afterIndex = this._findFirstSelectedRowIndexAfterIndex(rowIndex) - 1;
                        if (afterIndex > rowIndex) {
                            this._selectRows(this._$tableBody.find('tr').slice(rowIndex, afterIndex + 1));
                        } else {
                            //just select this row
                            this._selectRows($row);
                        }
                    }
                } else {
                    this._selectRows($row);
                }
            }

            this._onSelectionChanged();
        },

        /* Search for a selected row (that is before given row index) to up and returns it's index 
        *************************************************************************/
        _findFirstSelectedRowIndexBeforeIndex: function (rowIndex) {
            for (var i = rowIndex - 1; i >= 0; --i) {
                if (this._$tableRows[i].hasClass('jtable-row-selected')) {
                    return i;
                }
            }

            return -1;
        },

        /* Search for a selected row (that is after given row index) to down and returns it's index 
        *************************************************************************/
        _findFirstSelectedRowIndexAfterIndex: function (rowIndex) {
            for (var i = rowIndex + 1; i < this._$tableRows.length; ++i) {
                if (this._$tableRows[i].hasClass('jtable-row-selected')) {
                    return i;
                }
            }

            return -1;
        },

        /* Makes row/rows 'selected'.
        *************************************************************************/
        _selectRows: function ($rows) {
            if (!this.options.multiselect) {
                this._deselectRows(this._getSelectedRows());
            }

            $rows.addClass('jtable-row-selected info');

            if (this.options.selectingCheckboxes) {
                $rows.find('>td.jtable-selecting-column > div >input').prop('checked', true);
            }

            this._refreshSelectAllCheckboxState();
        },

        /* Makes row/rows 'non selected'.
        *************************************************************************/
        _deselectRows: function ($rows) {
            $rows.removeClass('jtable-row-selected info');
            if (this.options.selectingCheckboxes) {
                $rows.find('>td.jtable-selecting-column >div>input').prop('checked', false);
            }

            this._refreshSelectAllCheckboxState();
        },

        /* Updates state of the 'select/deselect' all checkbox according to count of selected rows.
        *************************************************************************/
        _refreshSelectAllCheckboxState: function () {
            if (!this.options.selectingCheckboxes || !this.options.multiselect) {
                return;
            }

            var totalRowCount = this._$tableRows.length;
            var selectedRowCount = this._getSelectedRows().length;

            if (selectedRowCount == 0) {
                this._$selectAllCheckbox.prop('indeterminate', false);
                this._$selectAllCheckbox.attr('checked', false);
            } else if (selectedRowCount == totalRowCount) {
                this._$selectAllCheckbox.prop('indeterminate', false);
                this._$selectAllCheckbox.attr('checked', true);
            } else {
                this._$selectAllCheckbox.attr('checked', false);
                this._$selectAllCheckbox.prop('indeterminate', true);
            }
        },

        //PAGING

        _initializePaging: function () {
            if (!this.options.paging) return;

            this._loadPagingSettings();
            this._createBottomPanel();
            this._createPageListArea();
            this._createGotoPageInput();
            this._createPageSizeSelection();
            this._createPageInfo();
        },

        /* Loads user preferences for paging.
   *************************************************************************/
        _loadPagingSettings: function () {
            if (!this.options.saveUserPreferences) {
                return;
            }

            var pageSize = this._getCookie('page-size');
            if (pageSize) {
                this.options.pageSize = this._normalizeNumber(pageSize, 1, 1000000, this.options.pageSize);
            }
        },

        /* Creates bottom panel and adds to the page.
        *************************************************************************/
        _createBottomPanel: function () {
            this._$bottomPanel = $('<div />')
                .addClass('form-inline jtable-navigation')
                .appendTo(this._$mainContainer);
        },

        /* Creates page list area.
        *************************************************************************/
        _createPageListArea: function () {
            this._$pagingListArea = $('<ul></ul>').addClass('pagination');

            $('<div></div>')
                .addClass('form-group')
                .append(this._$pagingListArea)
                .appendTo(this._$bottomPanel);
        },

        /* Creates page list change area.
        *************************************************************************/
        _createPageSizeSelection: function () {
            var self = this;

            if (!self.options.pageSizeSelectable) {
                return;
            }

            //Add current page size to page sizes list if not contains it
            if (self._findIndexInArray(self.options.pageSize, self.options.pageSizeOptions) < 0) {
                self.options.pageSizeOptions.push(parseInt(self.options.pageSize));
                self.options.pageSizeOptions.sort(function (a, b) { return a - b; });
            }

            //Add a span to contain page size change items
            self._$pageSizeChangeArea = $('<div></div>')
                .css('display', 'inline-block')
                .addClass('form-group')
                .appendTo(self._$bottomPanel);

            //Page size label
            self._$pageSizeChangeArea.append('<label for="pageSize">' + self.options.messages.pageSizeChangeLabel + ': </label>');

            //Page size change combobox
            var $pageSizeChangeCombobox = $('<select name="pageSize"></select>')
                .addClass('form-control')
                .appendTo(self._$pageSizeChangeArea);

            //Add page sizes to the combobox
            for (var i = 0; i < self.options.pageSizeOptions.length; i++) {
                $pageSizeChangeCombobox.append('<option value="' + self.options.pageSizeOptions[i] + '">' + self.options.pageSizeOptions[i] + '</option>');
            }

            //Select current page size
            $pageSizeChangeCombobox.val(self.options.pageSize);

            //Change page size on combobox change
            $pageSizeChangeCombobox.change(function () {
                self._changePageSize(parseInt($(this).val()));
            });
        },

        /* Creates go to page area.
        *************************************************************************/
        _createGotoPageInput: function () {
            var self = this;

            if (!self.options.gotoPageArea || self.options.gotoPageArea == 'none') {
                return;
            }

            //Add a span to contain goto page items
            this._$gotoPageArea = $('<div></div>')
                .addClass('form-group')
                .css('display', 'inline-block')
                .appendTo(self._$bottomPanel);

            var label = $('<label for="gotoPage"></label>')
                .text(self.options.messages.gotoPageLabel + ':')
                .appendTo(this._$gotoPageArea)

            //Goto page input
            if (self.options.gotoPageArea == 'combobox') {
                self._$gotoPageInput = $('<select name="gotoPage"></select>')
                    .addClass("form-control")
                    .appendTo(this._$gotoPageArea)
                    .data('pageCount', 1)
                    .change(function () {
                        self._changePage(parseInt($(this).val()));
                    });
                self._$gotoPageInput.append('<option value="1">1</option>');

            } else { //textbox

                self._$gotoPageInput = $('<input type="text" maxlength="10" value="' + self._currentPageNo + '" />')
                    .addClass("fomr-control")
                    .appendTo(this._$gotoPageArea)
                    .keypress(function (event) {
                        if (event.which == 13) { //enter
                            event.preventDefault();
                            self._changePage(parseInt(self._$gotoPageInput.val()));
                        } else if (event.which == 43) { // +
                            event.preventDefault();
                            self._changePage(parseInt(self._$gotoPageInput.val()) + 1);
                        } else if (event.which == 45) { // -
                            event.preventDefault();
                            self._changePage(parseInt(self._$gotoPageInput.val()) - 1);
                        } else {
                            //Allow only digits
                            var isValid = (
                                (47 < event.keyCode && event.keyCode < 58 && event.shiftKey == false && event.altKey == false)
                                    || (event.keyCode == 8)
                                    || (event.keyCode == 9)
                            );

                            if (!isValid) {
                                event.preventDefault();
                            }
                        }
                    });

            }
        },

        /* Refreshes the 'go to page' input.
        *************************************************************************/
        _refreshGotoPageInput: function () {
            if (!this.options.gotoPageArea || this.options.gotoPageArea == 'none') {
                return;
            }

            if (this._totalRecordCount <= 0) {
                this._$pageSizeChangeArea.hide();
                this._$gotoPageArea.hide();
            } else {
                this._$pageSizeChangeArea.show();
                this._$gotoPageArea.show();
            }

            if (this.options.gotoPageArea == 'combobox') {
                var oldPageCount = this._$gotoPageInput.data('pageCount');
                var currentPageCount = this._calculatePageCount();
                if (oldPageCount != currentPageCount) {
                    this._$gotoPageInput.empty();

                    //Skip some pages is there are too many pages
                    var pageStep = 1;
                    if (currentPageCount > 10000) {
                        pageStep = 100;
                    } else if (currentPageCount > 5000) {
                        pageStep = 10;
                    } else if (currentPageCount > 2000) {
                        pageStep = 5;
                    } else if (currentPageCount > 1000) {
                        pageStep = 2;
                    }

                    for (var i = pageStep; i <= currentPageCount; i += pageStep) {
                        this._$gotoPageInput.append('<option value="' + i + '">' + i + '</option>');
                    }

                    this._$gotoPageInput.data('pageCount', currentPageCount);
                }
            }

            //same for 'textbox' and 'combobox'
            this._$gotoPageInput.val(this._currentPageNo);
        },

        /* Changes current page size with given value.
        *************************************************************************/
        _changePageSize: function (pageSize) {
            if (pageSize == this.options.pageSize) {
                return;
            }

            this.options.pageSize = pageSize;

            //Normalize current page
            var pageCount = this._calculatePageCount();
            if (this._currentPageNo > pageCount) {
                this._currentPageNo = pageCount;
            }
            if (this._currentPageNo <= 0) {
                this._currentPageNo = 1;
            }

            //if user sets one of the options on the combobox, then select it.
            var $pageSizeChangeCombobox = this._$bottomPanel.find('.select[name="pageSize"]');
            if ($pageSizeChangeCombobox.length > 0) {
                if (parseInt($pageSizeChangeCombobox.val()) != pageSize) {
                    var selectedOption = $pageSizeChangeCombobox.find('option[value=' + pageSize + ']');
                    if (selectedOption.length > 0) {
                        $pageSizeChangeCombobox.val(pageSize);
                    }
                }
            }

            this._savePagingSettings();
            this._reloadTable();
        },

        /* Saves user preferences for paging
        *************************************************************************/
        _savePagingSettings: function () {
            if (!this.options.saveUserPreferences) {
                return;
            }

            this._setCookie('page-size', this.options.pageSize);
        },

        /* Adds jtStartIndex and jtPageSize parameters to a URL as query string.
        *************************************************************************/
        _addPagingInfoToUrl: function (url, pageNumber) {
            if (!this.options.paging) {
                return url;
            }

            var jtStartIndex = (pageNumber - 1) * this.options.pageSize;
            var jtPageSize = this.options.pageSize;

            return (url + (url.indexOf('?') < 0 ? '?' : '&') + 'jtStartIndex=' + jtStartIndex + '&jtPageSize=' + jtPageSize);
        },

        /* Creates and shows the page list.
        *************************************************************************/
        _createPagingList: function () {
            if (this.options.pageSize <= 0) {
                return;
            }

            this._$pagingListArea.empty();
            if (this._totalRecordCount <= 0) {
                return;
            }

            var pageCount = this._calculatePageCount();

            this._createFirstAndPreviousPageButtons();
            if (this.options.pageList == 'normal') {
                this._createPageNumberButtons(this._calculatePageNumbers(pageCount));
            }
            this._createLastAndNextPageButtons(pageCount);
            this._bindClickEventsToPageNumberButtons();
        },

        /* Creates and shows previous and first page links.
        *************************************************************************/
        _createFirstAndPreviousPageButtons: function () {
            var $first = $('<li></li>')
                .append($('<a href="#"></a>')
                    .html('&#171;'))
                .data('pageNumber', 1)
                .appendTo(this._$pagingListArea);

            var $previous = $('<li></li>')
                .append($('<a href="#"></a>')
                    .html('&#8249;'))
                .data('pageNumber', this._currentPageNo - 1)
                .appendTo(this._$pagingListArea);

            if (this._currentPageNo <= 1) {
                $first.addClass('disabled');
                $previous.addClass('disabled');
            }
        },

        /* Creates and shows next and last page links.
        *************************************************************************/
        _createLastAndNextPageButtons: function (pageCount) {
            var $next = $('<li></li>')
                .append($('<a href="#"></a>')
                    .html('&#8250;'))
                .data('pageNumber', this._currentPageNo + 1)
                .appendTo(this._$pagingListArea);

            var $last = $('<li></li>')
                .append($('<a href="#"></a>')
                    .html('&#187;'))
                .data('pageNumber', pageCount)
                .appendTo(this._$pagingListArea);

            if (this._currentPageNo >= pageCount) {
                $next.addClass('disabled');
                $last.addClass('disabled');
            }
        },

        /* Creates and shows page number links for given number array.
        *************************************************************************/
        _createPageNumberButtons: function (pageNumbers) {
            var previousNumber = 0;
            for (var i = 0; i < pageNumbers.length; i++) {
                //Create "..." between page numbers if needed
                if ((pageNumbers[i] - previousNumber) > 1) {
                    $('<li></li>')
                        .append($('<a href="#"></a>')
                            .html('...'))
                        .appendTo(this._$pagingListArea);
                }

                this._createPageNumberButton(pageNumbers[i]);
                previousNumber = pageNumbers[i];
            }
        },

        /* Creates a page number link and adds to paging area.
        *************************************************************************/
        _createPageNumberButton: function (pageNumber) {
            var $pageNumber = $('<li></li>')
                .append($('<a href="#"></a>')
                    .html(pageNumber))
                .data('pageNumber', pageNumber)
                .appendTo(this._$pagingListArea);

            if (this._currentPageNo == pageNumber) {
                $pageNumber.addClass('active');
            }
        },

        /* Calculates total page count according to page size and total record count.
        *************************************************************************/
        _calculatePageCount: function () {
            var pageCount = Math.floor(this._totalRecordCount / this.options.pageSize);
            if (this._totalRecordCount % this.options.pageSize != 0) {
                ++pageCount;
            }

            return pageCount;
        },

        /* Calculates page numbers and returns an array of these numbers.
        *************************************************************************/
        _calculatePageNumbers: function (pageCount) {
            if (pageCount <= 4) {
                //Show all pages
                var pageNumbers = [];
                for (var i = 1; i <= pageCount; ++i) {
                    pageNumbers.push(i);
                }

                return pageNumbers;
            } else {
                //show first three, last three, current, previous and next page numbers
                var shownPageNumbers = [1, 2, pageCount - 1, pageCount];
                var previousPageNo = this._normalizeNumber(this._currentPageNo - 1, 1, pageCount, 1);
                var nextPageNo = this._normalizeNumber(this._currentPageNo + 1, 1, pageCount, 1);

                this._insertToArrayIfDoesNotExists(shownPageNumbers, previousPageNo);
                this._insertToArrayIfDoesNotExists(shownPageNumbers, this._currentPageNo);
                this._insertToArrayIfDoesNotExists(shownPageNumbers, nextPageNo);

                shownPageNumbers.sort(function (a, b) { return a - b; });
                return shownPageNumbers;
            }
        },

        _createPageInfo: function () {
            this._$pageInfoSpan = $('<span></span>')
              .addClass('jtable-page-info')
              .appendTo(this._$bottomPanel);
        },

        /* Creates and shows paging informations.
        *************************************************************************/
        _createPagingInfo: function () {
            if (this._totalRecordCount <= 0) {
                this._$pageInfoSpan.empty();
                return;
            }

            var startNo = (this._currentPageNo - 1) * this.options.pageSize + 1;
            var endNo = this._currentPageNo * this.options.pageSize;
            endNo = this._normalizeNumber(endNo, startNo, this._totalRecordCount, 0);

            if (endNo >= startNo) {
                var pagingInfoMessage = this.options.messages.pagingInfo(startNo, endNo, this._totalRecordCount);
                this._$pageInfoSpan.html(pagingInfoMessage);
            }
        },

        /* Binds click events of all page links to change the page.
        *************************************************************************/
        _bindClickEventsToPageNumberButtons: function () {
            var self = this;
            self._$pagingListArea
                .children()
                .not('.disabled').not('.active')
                .click(function (e) {
                    e.preventDefault();
                    self._changePage($(this).data('pageNumber'));
                });
        },

        /* Changes current page to given value.
        *************************************************************************/
        _changePage: function (pageNo) {
            pageNo = this._normalizeNumber(pageNo, 1, this._calculatePageCount(), 1);
            if (pageNo == this._currentPageNo) {
                this._refreshGotoPageInput();
                return;
            }

            this._currentPageNo = pageNo;
            this._reloadTable();
        },

        /************************************************************************
        * SORTING                                                               *
        *************************************************************************/

        /* Builds the sorting array according to defaultSorting string
        *************************************************************************/
        _buildDefaultSortingArray: function () {
            var self = this;

            $.each(self.options.defaultSorting.split(","), function (orderIndex, orderValue) {
                $.each(self.options.fields, function (fieldName, fieldProps) {
                    if (fieldProps.sorting) {
                        var orderOffset = orderValue.lastIndexOf(" ");
                        var columnName = orderValue.substr(0, (orderOffset > -1) ? orderOffset : orderValue.length);
                        if (columnName == fieldName) {
                            if (orderValue.toUpperCase().indexOf(' DESC', orderOffset) > -1) {
                                self._lastSorting.push({
                                    fieldName: fieldName,
                                    sortOrder: 'DESC'
                                });
                            } else {
                                self._lastSorting.push({
                                    fieldName: fieldName,
                                    sortOrder: 'ASC'
                                });
                            }
                        }
                    }
                });
            });
        },

        /* Makes a column sortable.
        *************************************************************************/
        _makeColumnSortable: function ($columnHeader, fieldName) {
            var self = this;

            //The span is used to display the arrows to indicate sorting orders
            $columnHeader
                .append('<span></span>')
                .click(function (e) {
                    e.preventDefault();

                    if (!self.options.multiSorting || !e.ctrlKey) {
                        self._lastSorting = []; //clear previous sorting
                    }

                    self._sortTableByColumn($columnHeader);
                });

            //Set default sorting
            $.each(this._lastSorting, function (sortIndex, sortField) {
                if (sortField.fieldName == fieldName) {
                    if (sortField.sortOrder == 'DESC') {
                        $columnHeader.find("span").addClass('sign arrow');
                    } else {
                        $columnHeader.find("span").addClass('sign arrow up');
                    }
                }
            });
        },

        /* Sorts table according to a column header.
        *************************************************************************/
        _sortTableByColumn: function ($columnHeader) {
            //Remove sorting styles from all columns except this one
            if (this._lastSorting.length == 0) {
                $columnHeader.siblings().find('span').removeClass('sign arrow up');
            }

            //If current sorting list includes this column, remove it from the list
            for (var i = 0; i < this._lastSorting.length; i++) {
                if (this._lastSorting[i].fieldName == $columnHeader.data('fieldName')) {
                    this._lastSorting.splice(i--, 1);
                }
            }

            //Sort ASC or DESC according to current sorting state
            if ($columnHeader.find("span").hasClass('sign arrow up')) {
                $columnHeader.find("span").removeClass('sign arrow up').addClass('sign arrow');
                this._lastSorting.push({
                    'fieldName': $columnHeader.data('fieldName'),
                    sortOrder: 'DESC'
                });
            } else {
                $columnHeader.find("span").removeClass('sign arrow').addClass('sign arrow up');
                this._lastSorting.push({
                    'fieldName': $columnHeader.data('fieldName'),
                    sortOrder: 'ASC'
                });
            }

            //Load current page again
            this._reloadTable();
        },

        /* Adds jtSorting parameter to a URL as query string.
        *************************************************************************/
        _addSortingInfoToUrl: function (url) {
            if (!this.options.sorting || this._lastSorting.length == 0) {
                return url;
            }

            var sorting = [];
            $.each(this._lastSorting, function (idx, value) {
                sorting.push(value.fieldName + ' ' + value.sortOrder);
            });

            return (url + (url.indexOf('?') < 0 ? '?' : '&') + 'jtSorting=' + sorting.join(","));
        },

        /************************************************************************
        * DYNAMIC COLUMNS extension for jTable                                  *
        * (Show/hide/resize columns)                                            *
        *************************************************************************/

        _initializeDynamicColumns: function () {
            this._createColumnResizeBar();
            this._createColumnSelection();

            if (this.options.saveUserPreferences) {
                this._loadColumnSettings();
            }

            this._normalizeColumnWidths();
        },

        /* Changes visibility of a column.
        *************************************************************************/
        _changeColumnVisibilityInternal: function (columnName, visibility) {
            //Check if there is a column with given name
            var columnIndex = this._columnList.indexOf(columnName);
            if (columnIndex < 0) {
                this._logWarn('Column "' + columnName + '" does not exist in fields!');
                return;
            }

            //Check if visibility value is valid
            if (['visible', 'hidden', 'fixed'].indexOf(visibility) < 0) {
                this._logWarn('Visibility value is not valid: "' + visibility + '"! Options are: visible, hidden, fixed.');
                return;
            }

            //Get the field
            var field = this.options.fields[columnName];
            if (field.visibility == visibility) {
                return; //No action if new value is same as old one.
            }

            //Hide or show the column if needed
            var columnIndexInTable = this._firstDataColumnOffset + columnIndex + 1;
            if (field.visibility != 'hidden' && visibility == 'hidden') {
                this._$table
                    .find('>thead >tr >th:nth-child(' + columnIndexInTable + '),>tbody >tr >td:nth-child(' + columnIndexInTable + ')')
                    .hide();
            } else if (field.visibility == 'hidden' && visibility != 'hidden') {
                this._$table
                    .find('>thead >tr >th:nth-child(' + columnIndexInTable + '),>tbody >tr >td:nth-child(' + columnIndexInTable + ')')
                    .show()
                    .css('display', 'table-cell');
            }

            field.visibility = visibility;
        },

        /* Prepares dialog to change settings.
        *************************************************************************/
        _createColumnSelection: function () {
            var self = this;

            //Create a div for dialog and add to container element
            this._$columnSelectionDiv = $('<div />')
                .addClass('jtable-column-selection-container')
                .appendTo(self._$mainContainer)
                .click(function (event) {
                    event.stopPropagation();
                });

            $('body').click(function () {
                self._$columnSelectionDiv.hide();
            });

            this._$table.children('thead').bind('contextmenu', function (e) {
                if (!self.options.columnSelectable) {
                    return;
                }

                e.preventDefault();

                self._fillColumnSelection();

                //Calculate position of column selection list and show it

                var containerOffset = self._$mainContainer.offset();
                var selectionDivTop = e.pageY - containerOffset.top;
                var selectionDivLeft = e.pageX - containerOffset.left;

                var selectionDivMinWidth = 100; //in pixels
                var containerWidth = self._$mainContainer.width();

                //If user clicks right area of header of the table, show list at a little left
                if ((containerWidth > selectionDivMinWidth) && (selectionDivLeft > (containerWidth - selectionDivMinWidth))) {
                    selectionDivLeft = containerWidth - selectionDivMinWidth;
                }

                self._$columnSelectionDiv.css({
                    left: selectionDivLeft,
                    top: selectionDivTop,
                    'min-width': selectionDivMinWidth + 'px'
                }).show();
            });
        },

        /* Prepares content of settings dialog.
        *************************************************************************/
        _fillColumnSelection: function () {
            var self = this;

            var $columnsUl = $('<ul/>').addClass('list-group checked-list-box');
            for (var i = 0; i < this._columnList.length; i++) {
                var columnName = this._columnList[i];
                var field = this.options.fields[columnName];

                if (field.visibility == 'fixed') {
                    return;
                }

                //Crete li element
                var $widget = $('<li class="noselect"/>')
                    .addClass('list-group-item')
                    .data('name', columnName)
                    .data('checked', field.visibility != 'hidden')
                    .text(' ' + field.title || columnName)
                    .appendTo($columnsUl);

                // Settings
                var color = ($widget.data('color') ? $widget.data('color') : "primary"),
                    style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
                    settings = {
                        on: {
                            icon: 'fa fa-check-square primary'
                        },
                        off: {
                            icon: 'fa fa-square-o'
                        }
                    };

                // Event Handlers
                $widget.on('click', function () {
                    var $widget = $(this);
                    $widget.data('checked', !$widget.data('checked'));

                    updateWidget($widget);
                    self.changeColumnVisibility($widget.data('name'), $widget.data('checked') ? 'visible' : 'hidden');
                });

                function updateWidget($widget) {
                    var isChecked = $widget.data('checked');

                    // Set the button's state
                    $widget.data('state', (isChecked) ? "on" : "off");

                    // Set the button's icon
                    $widget.find('.state-icon')
                        .removeClass()
                        .addClass('state-icon ' + settings[$widget.data('state')].icon);

                    // Update the button's color
                    if (isChecked) {
                        $widget.addClass(style + color + ' active');
                    } else {
                        $widget.removeClass(style + color + ' active');
                    }
                }

                // Initialization
                function init() {
                    updateWidget($widget);

                    // Inject the icon if applicable
                    if ($widget.find('.state-icon').length == 0) {
                        $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
                    }
                }
                init();
            }

            this._$columnSelectionDiv.html($columnsUl);
        },

        /* creates a vertical bar that is shown while resizing columns.
        *************************************************************************/
        _createColumnResizeBar: function () {
            this._$columnResizeBar = $('<div />')
                .addClass('jtable-column-resize-bar')
                .appendTo(this._$mainContainer)
                .hide();

            this._$mainContainer.css('position', 'relative');
        },

        /* Makes a column sortable.
        *************************************************************************/
        _makeColumnResizable: function ($columnHeader) {
            var self = this;

            //Create a handler to handle mouse click event
            $('<div />')
                .addClass('jtable-column-resize-handler')
                .appendTo($columnHeader) //Append the handler to the column
                .mousedown(function (downevent) { //handle mousedown event for the handler
                    downevent.preventDefault();
                    downevent.stopPropagation();

                    var mainContainerOffset = self._$columnResizeBar.parent().offset();
                    var deviation = 14;

                    //Get a reference to the next column
                    var $nextColumnHeader = $columnHeader.nextAll('th.jtable-column-header:visible');
                    if (!$nextColumnHeader.length) {
                        return;
                    }

                    //Store some information to be used on resizing
                    var minimumColumnWidth = 10; //A column's width can not be smaller than 10 pixel.
                    self._currentResizeArgs = {
                        currentColumnStartWidth: $columnHeader.outerWidth(),
                        minWidth: minimumColumnWidth,
                        maxWidth: $columnHeader.outerWidth() + $nextColumnHeader.outerWidth() - minimumColumnWidth,
                        mouseStartX: downevent.pageX,
                        minResizeX: function () { return this.mouseStartX - (this.currentColumnStartWidth - this.minWidth); },
                        maxResizeX: function () { return this.mouseStartX + (this.maxWidth - this.currentColumnStartWidth); }
                    };

                    //Handle mouse move event to move resizing bar
                    var resizeonmousemove = function (moveevent) {
                        if (!self._currentResizeArgs) {
                            return;
                        }

                        var resizeBarX = self._normalizeNumber(moveevent.pageX, self._currentResizeArgs.minResizeX(), self._currentResizeArgs.maxResizeX());
                        self._$columnResizeBar.css('left', (resizeBarX - mainContainerOffset.left) + 'px');
                    };

                    //Handle mouse up event to finish resizing of the column
                    var resizeonmouseup = function (upevent) {
                        if (!self._currentResizeArgs) {
                            return;
                        }

                        $(document).unbind('mousemove', resizeonmousemove);
                        $(document).unbind('mouseup', resizeonmouseup);

                        self._$columnResizeBar.hide();

                        //Calculate new widths in pixels
                        var mouseChangeX = upevent.pageX - self._currentResizeArgs.mouseStartX;
                        if (mouseChangeX == 0) return;

                        var currentColumnFinalWidth = self._normalizeNumber(self._currentResizeArgs.currentColumnStartWidth + mouseChangeX, self._currentResizeArgs.minWidth, self._currentResizeArgs.maxWidth);
                        var nextColumnFinalWidth = $nextColumnHeader.outerWidth() + (self._currentResizeArgs.currentColumnStartWidth - currentColumnFinalWidth);

                        //Calculate relative width to the table width
                        var tableWidth = $columnHeader.parent().width();
                        $columnHeader.data('width-in-percent', (currentColumnFinalWidth / tableWidth) * 100);
                        $nextColumnHeader.data('width-in-percent', (nextColumnFinalWidth / tableWidth) * 100);

                        //Set new widths to columns (resize!)
                        $columnHeader.css('width', $columnHeader.data('width-in-percent') + '%');
                        $nextColumnHeader.css('width', $nextColumnHeader.data('width-in-percent') + '%');

                        //Normalize all column widths
                        self._normalizeColumnWidths();

                        //Finish resizing
                        self._currentResizeArgs = null;

                        //Save current preferences
                        if (self.options.saveUserPreferences) {
                            self._saveColumnSettings();
                        }
                    };

                    //Show vertical resize bar
                    self._$columnResizeBar
                        .show()
                        .css({
                            top: ($columnHeader.offset().top - mainContainerOffset.top) + 'px',
                            left: (downevent.pageX - mainContainerOffset.left) + 'px',
                            height: (self._$table.outerHeight()) + 'px'
                        });

                    //Bind events
                    $(document).bind('mousemove', resizeonmousemove);
                    $(document).bind('mouseup', resizeonmouseup);
                });
        },

        /* Normalizes column widths as percent for current view.
        *************************************************************************/
        _normalizeColumnWidths: function () {

            //Set command column width
            var commandColumnHeaders = this._$table
                .find('>thead th.jtable-command-column-header')
                .data('width-in-percent', 1)
                .css('width', '1%');

            //Find data columns
            var headerCells = this._$table.find('>thead th.jtable-column-header');

            //Calculate total width of data columns
            var totalWidthInPixel = 0;
            headerCells.each(function () {
                var $cell = $(this);
                if ($cell.is(':visible')) {
                    totalWidthInPixel += $cell.outerWidth();
                }
            });

            //Calculate width of each column
            var columnWidhts = {};
            var availableWidthInPercent = 100.0 - commandColumnHeaders.length;
            headerCells.each(function () {
                var $cell = $(this);
                if ($cell.is(':visible')) {
                    var fieldName = $cell.data('fieldName');
                    var widthInPercent = $cell.outerWidth() * availableWidthInPercent / totalWidthInPixel;
                    columnWidhts[fieldName] = widthInPercent;
                }
            });

            //Set width of each column
            headerCells.each(function () {
                var $cell = $(this);
                if ($cell.is(':visible')) {
                    var fieldName = $cell.data('fieldName');
                    $cell.data('width-in-percent', columnWidhts[fieldName]).css('width', columnWidhts[fieldName] + '%');
                }
            });
        },

        /* Saves field setting to cookie.
        *  Saved setting will be a string like that:
        * fieldName1=visible;23|fieldName2=hidden;17|...
        *************************************************************************/
        _saveColumnSettings: function () {
            var self = this;
            var fieldSettings = '';
            this._$table.find('>thead >tr >th.jtable-column-header').each(function () {
                var $cell = $(this);
                var fieldName = $cell.data('fieldName');
                var columnWidth = $cell.data('width-in-percent');
                var fieldVisibility = self.options.fields[fieldName].visibility;
                var fieldSetting = fieldName + "=" + fieldVisibility + ';' + columnWidth;
                fieldSettings = fieldSettings + fieldSetting + '|';
            });

            this._setCookie('column-settings', fieldSettings.substr(0, fieldSettings.length - 1));
        },

        /* Loads field settings from cookie that is saved by _saveFieldSettings method.
        *************************************************************************/
        _loadColumnSettings: function () {
            var self = this;
            var columnSettingsCookie = this._getCookie('column-settings');
            if (!columnSettingsCookie) {
                return;
            }

            var columnSettings = {};
            $.each(columnSettingsCookie.split('|'), function (inx, fieldSetting) {
                var splitted = fieldSetting.split('=');
                var fieldName = splitted[0];
                var settings = splitted[1].split(';');
                columnSettings[fieldName] = {
                    columnVisibility: settings[0],
                    columnWidth: settings[1]
                };
            });

            var headerCells = this._$table.find('>thead >tr >th.jtable-column-header');
            headerCells.each(function () {
                var $cell = $(this);
                var fieldName = $cell.data('fieldName');
                var field = self.options.fields[fieldName];
                if (columnSettings[fieldName]) {
                    if (field.visibility != 'fixed') {
                        self._changeColumnVisibilityInternal(fieldName, columnSettings[fieldName].columnVisibility);
                    }

                    $cell.data('width-in-percent', columnSettings[fieldName].columnWidth).css('width', columnSettings[fieldName].columnWidth + '%');
                }
            });
        },

        /************************************************************************
        * MASTER/CHILD tables extension for jTable                              *
        *************************************************************************/

        /* Creates a child row for a row, hides and returns it.
        *************************************************************************/
        _createChildRow: function ($row) {
            var totalColumnCount = this._$table.find('thead th').length;
            var $childRow = $('<tr></tr>')
                .addClass('jtable-child-row')
                .append('<td colspan="' + totalColumnCount + '"></td>');
            $row.after($childRow);
            $row.data('childRow', $childRow);
            $childRow.hide();
            return $childRow;
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

        showEditForm: function ($tableRow) {
            this._showEditForm($tableRow);
        },

        _loadOptions: function (optionSource, defaultValue) {
            var cacheKey = 'options_' + optionSource; //create a unique cache key
            if (!this._cache[cacheKey]) {
                // if options are not found in the cache, download options
                this._cache[cacheKey] = this._buildOptionsFromArray(this._downloadOptions('SearchDialog', optionSource));
                this._sortFieldOptions(this._cache[cacheKey], 'text');
                this._cache[cacheKey].unshift({
                    Value: '0',
                    DisplayText: defaultValue
                });
            }
            return this._cache[cacheKey];
        },

        _createInput: function (field, inputType, id) {
            var container = $("<div class='form-group col-md-3'></div>");
            var label = $('<label class="sr-only">' + field.label + '</label>').attr("for", id).appendTo(container);
            var input = $('<input class="form-control" type="' + inputType + '" placeholder="' + field.label + '"/>').attr("id", id).appendTo(container);
            if (field.defaultValue) input.val(field.defaultValue);
            return container;
        },

        _createTextInput: function (field, id) {
            return this._createInput(field, "text", id);
        },

        _createDateInput: function (field, id) {
            var self = this;
            var formGroup = $("<div class='form-group col-md-3'></div>");
            var inputGroup = $("<div class='input-group date'></div>").appendTo(formGroup);
            var label = $('<label class="sr-only">' + field.label + '</label>').attr("for", id).appendTo(inputGroup);
            var input = $('<input class="form-control" type="text" placeholder="' + field.label + '"/>').attr("id", id).appendTo(inputGroup);
            var addon = $('<span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span>').appendTo(inputGroup);

            input.datepicker({
                format: this.options.defaultDateFormat,
                startView: 1,
                todayBtn: "linked",
                language: "nl",
                calendarWeeks: true,
                autoclose: true,
                todayHighlight: true,
            }).on('changeDate', function (e) { self._submitCustomSearch(); });
            return formGroup;
        },


        _createDateRangeInput: function (field, id1, id2) {
            var self = this;
            var formGroup = $("<div class='form-group col-md-3'></div>");
            var inputGroup = $("<div class='input-daterange input-group'></div>").appendTo(formGroup);

            $('<label class="sr-only">' + field.label + '</label>').attr("for", id1).appendTo(inputGroup);
            $('<input class="form-control" type="text" placeholder="' + field.label + '"/>').attr("id", id1).appendTo(inputGroup).datepicker({
                format: this.options.defaultDateFormat,
                startView: 1,
                todayBtn: "linked",
                language: "nl",
                calendarWeeks: true,
                autoclose: true,
                todayHighlight: true,
            }).on("changeDate", function () { self._submitCustomSearch(); });

            $('<span class="input-group-addon">' + Resources.Global.General_Till + '</span>').appendTo(inputGroup);

            $('<label class="sr-only">' + field.label + '</label>').attr("for", id2).appendTo(inputGroup);
            $('<input class="form-control" type="text" placeholder="' + field.label + '"/>').attr("id", id2).appendTo(inputGroup).datepicker({
                format: dateFormat,
                startView: 1,
                todayBtn: "linked",
                language: "nl",
                calendarWeeks: true,
                autoclose: true,
                todayHighlight: true,
            }).on("changeDate", function () { self._submitCustomSearch(); });

            return formGroup;
        },

        _createCheckbox: function (field, id) {
            var self = this;
            var container = $("<div class='checkbox col-md-3'></div>");

            var label = $("<label></label>").text(' ' + field.label).appendTo(container);
            var input = $('<input type="checkbox" value="">').prependTo(container);

            if (field.defaultValue) input.prop('checked', true);
            else input.prop('checked', false);

            input.change(function () {
                self._submitCustomSearch();
            });
            return container;
        },

        _createDropDown: function (field, id) {
            var self = this, options;
            var formGroup = $("<div class='form-group col-md-3'></div>");

            $('<label class="sr-only">' + field.label + '</label>').attr("for", id).appendTo(formGroup);
            var select = $('<select class="form-control"></select>').attr("id", id).appendTo(formGroup);

            if (field.dropdown.remote) options = self._loadOptions(field.dropdown.remote, field.label);
            else options = field.dropdown.options;

            self._fillDropDownListWithOptions(select, options, "");

            select.change(function () {
                self._submitCustomSearch();
            });
            return formGroup;
        },

        _createTypeAhead: function (field, id) {
            var self = this;
            var label = this._createTextInput(field, id);
            var input = label.find("input");

            initializeTypeAhead(input, field.typeAhead, function ($e, datum, datasetName) {
                input.attr("data-value", datum[keyProp]);
                self._submitCustomSearch();
            });

            return label;
        },

        _createClearButton: function () {
            var self = this;
            var form = this._$searchBar.find(".row");
            var container = $('<div class=""></div>');
            var clearText = $('<button type="button" class="btn btn-primary"></button>').text(Resources.Global.General_ClearFields).appendTo(container);
            clearText.click(function (event) {
                form.find("input:text").val("").attr("data-value", null);
                form.find("select").val(0);
                form.find("input:checkbox").prop("checked", false);
                self._submitCustomSearch();
                event.preventDefault();
            });
            return container;
        },

        _initializeSearchBar: function () {
            if (!this.options.searchFields) return;

            var self = this;
            //Insert the searchbar after the jtable title div
            self._$searchBar = $('<div class="search-bar"/>').hide();
            self._$searchBar.insertAfter(self._$titleDiv);

            self._$searchBar.keydown(function (event) {
                if (event.keyCode == $.ui.keyCode.ENTER || event.keyCode == $.ui.keyCode.TAB) {
                    self._submitCustomSearch();
                }
            });

            var $Form = $('<form class="form-inline"><div class="row"></div></form>');
            $Form.appendTo(self._$searchBar);
            $Form.submit(function () { self._submitCustomSearch(); return false; });

            self._createSearchFields();

            //Remove unnecessary classes
            $.each($Form.find(".tt-hint"), function (i, input) {
                $(input).removeClass(); $(input).addClass("tt-hint");
            });
        },

        _createSearchFields: function () {
            var self = this;
            var searchFields = self.options.searchFields;
            var form = self._$searchBar.find(".row");

            //Create text inputs
            if (searchFields != undefined) {
                for (var i in searchFields) {
                    var id = $.hik.kTable.prototype._$nextSearchInputId++;
                    var field = searchFields[i];

                    if (field.type == kTable.SearchType.Text) {
                        self._createTextInput(field, id).appendTo(form);
                    }
                    else if (field.type == kTable.SearchType.Dropdown) {
                        self._createDropDown(field, id).appendTo(form);
                    }
                    else if (field.type == kTable.SearchType.TypeAhead) {
                        self._createTypeAhead(field, id).appendTo(form);
                    }
                    else if (field.type == kTable.SearchType.CheckBox) {
                        self._createCheckbox(field, id).appendTo(form);
                    }
                    else if (field.type == kTable.SearchType.Date) {
                        self._createDateInput(field, id).appendTo(form);
                    }
                    else if (field.type == kTable.SearchType.DateRange) {
                        if (i >= searchFields.length - 1 || searchFields[++i].type != kTable.SearchType.DateRange) continue;
                        self._createDateRangeInput(field, id, $.hik.kTable.prototype._$nextSearchInputId++).appendTo(form);
                    }
                }
                self._createClearButton().appendTo(form);
            }
        },

        _submitCustomSearch: function () {
            var self = this;
            var searchObjects = [];
            var form = self._$searchBar.find("form");

            form.find("input, select").not(".tt-hint, .hasDatepicker").each(function (i, field) {
                var fieldOptions = self.options.searchFields[i];
                var $field = $(field);
                var op = fieldOptions.operator;

                var val = ($field.is("input[type=checkbox]")) ? $field.is(":checked") : $field.attr("data-value") || $field.val();

                //If a rightHandSide value is given, use that instead of the actual value of the input field                
                if ($.isFunction(fieldOptions.rightHandSide)) val = fieldOptions.rightHandSide(val);
                else if (fieldOptions.rightHandSide) val = fieldOptions.rightHandSide;
                val = val.toString();

                //If the input field is empty or when the value of a dropdown is zero, return                    
                if (val == "" || $field.is("select") && val == "0") return;

                if (fieldOptions.type == kTable.SearchType.Date || fieldOptions.type == kTable.SearchType.DateRange) {
                    val = $field.datepicker('getDate');
                }

                searchObjects.push({ Column: fieldOptions.column, Value: val, Operator: op });
            });

            //Return if the last search equals the current search. Or when submitting the form for the first time when none of the inputs are used
            if (JSON.stringify(searchObjects) == JSON.stringify(self._lastSearch) || searchObjects.length == 0 && self._lastSearch == null) return;
            self._lastSearch = searchObjects;

            var payload = $.merge([], self._payLoad);

            //Remove overridden searchparameters in the payload array. An searchparameters is overriden
            //when a search object with the same column name is present in both arrays.
            for (var k = 0; k < searchObjects.length; ++k) {
                var removeId = -1;
                for (var i = 0; i < self._payLoad.length; ++i) {
                    if (self._payLoad[i].Column == searchObjects[k].Column)
                        removeId = i;
                }
                if (removeId > -1) payload.splice(removeId, 1);
            }

            self._lastPostData = $.extend(self._lastPostData, { searchFields: $.merge(payload, searchObjects) });
            self.reload();
        },

    });

}(jQuery));
