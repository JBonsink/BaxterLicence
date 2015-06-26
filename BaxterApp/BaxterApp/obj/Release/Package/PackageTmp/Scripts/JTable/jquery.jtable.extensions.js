(function ($) {

    var base = { _create: $.hik.jtable.prototype._create };

    //extension members
    $.extend(true, $.hik.jtable.prototype, {

        _create: function ()
        {
            this._addSearchToolbarItem();
            base._create.apply(this, arguments);
            this._initializeDetailsDialog();
            this._initializeSearchBar();                      
        },

        _$nextSearchInputId: 0,
        _$searchBar: null,

        _addSearchToolbarItem: function ()
        {               
            if (!this.options.searchFields) return;
            var self = this;
            var item = {
                icon: 'glyphicon glyphicon-search',
                text: Resources.Global.General_Search,
                click: function () {                    
                    self._$searchBar.animate({ height: 'toggle' }, {
                        progress: function () {                                                                
                        }, complete: function () { self._$searchBar.find(':input:enabled:visible:first').focus() }
                    });
                }
            };
            this._defaultToolbarItems.push(item);
        },

        _initializeDetailsDialog: function () {
            var self = this;
            self._detailsDialog = new BootstrapDialog({
                title: $("<h3></h3>").text(this.options.messages.details),
                autodestroy: false,
                message: $("<div></div>"),
                buttons: [{
                    label: this.options.messages.close,
                    action: function (dialog) {
                        dialog.close();
                    }
                }]                
            });                        
        },

        showDetailsDialog: function (val) {
            var self = this;

            var $row = null;
            if (typeof (val) == 'number') {
                $row = this.getRowByKey(val);
                if ($row == null)
                    throw "Invalid key.";
            } else
                $row = val;

            if (!$row.hasClass('jtable-data-row'))
                throw "This is not a valid jtable data row";

            var record = $row.data('record');
            if (this.options.updateEntityOnRowClick != undefined) {
                var url = this.options.updateEntityOnRowClick + "?ID=" + record["ID"];
                var deferreds = [];
                deferreds.push(self._getUpdates(url, [self, record]));
                $.when.apply($, deferreds).done(self.openDetailsDialog);
                return;
            }

            self.openDetailsDialog([self, record]);
        },

        showEditForm: function ($tableRow) {
            this._showEditForm($tableRow);
        },

        _getUpdates: function (url, args) {
            var r = $.Deferred();

            this._ajax({
                url: url,
                success: function (data) {
                    self = args[0];
                    record = args[1];
                    if (data.Record != undefined) {
                        for (var i = 0; i < self._fieldList.length; i++) {
                            var fieldName = self._fieldList[i];
                            if (data.Record[fieldName] != undefined)
                                record[fieldName] = data.Record[fieldName];
                        }
                    }
                    r.resolve(args);
                },
                error: function () {
                    console.log("Communication error");
                },
            });
            return r;
        },

        openDetailsDialog: function (args) {
            var self = args[0];
            var record = args[1];
            
            var container = null;            
            if (self._detailsDialog.getModalBody()) container = self._detailsDialog.getModalBody();
            else container = self._detailsDialog.options.message;

            container.empty();

            var row = $("<div class='row'></div>").appendTo(container);
            var counter = 0;
            for (var fieldName in self.options.fields) {
                var field = self.options.fields[fieldName];
                var fieldValue = record[fieldName];

                if ((field.list == false && field.type == 'hidden') || field.list == false || fieldName == undefined || fieldValue == null) continue;                

                if (counter % 3 == 0) row = $("<div class='row'></div>").appendTo(container);

                if (field.imageActionUrl) {             
                    var image = self._getImageDisplay(field, fieldValue, '64');
                    fieldValue = image.colorbox({ href: image.attr("src"), photo: true, scrolling: false }).resize();
                }
                else {
                    fieldValue = self._getDisplayTextForRecordField(record, fieldName);
                }
                
                row.append($("<div class='col-md-4'><h4>" + field.title + "<br/></h4></div>").append(fieldValue));
                ++counter;                   
            }
                  
            self._detailsDialog.open();
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

        _createInput: function (field, inputType, id)
        {
            var container = $("<div class='form-group col-md-3'></div>");
            var label = $('<label class="sr-only">' + field.label + '</label>').attr("for", id).appendTo(container);
            var input = $('<input class="form-control" type="' + inputType + '" placeholder="'+field.label+'"/>').attr("id", id).appendTo(container);
            if (field.defaultValue) input.val(field.defaultValue);
            return container;
        },

        _createTextInput: function (field, id) {
            return this._createInput(field, "text", id);
        },

        _createDateInput: function (field, id) {
            var dateFormat = field.dateFormat || this.options.defaultDateFormat;
            var formGroup = $("<div class='form-group col-md-3'></div>");
            var inputGroup = $("<div class='input-group date'></div>").appendTo(formGroup);
            var label = $('<label class="sr-only">' + field.label + '</label>').attr("for", id).appendTo(inputGroup);
            var input = $('<input class="form-control" type="text" placeholder="' + field.label + '"/>').attr("id", id).appendTo(inputGroup);
            var addon = $('<span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span>').appendTo(inputGroup);
                              
            input.datepicker({
                format: dateFormat,
                startView: 1,
                todayBtn: "linked",
                language: "nl",
                calendarWeeks: true,
                autoclose: true,
                todayHighlight: true,
            }).on('changeDate', function(e){ self._submitCustomSearch(); });
            return formGroup;
        },


        _createDateRangeInput: function (field, id1, id2) {
            var self = this;
            var dateFormat = field.dateFormat || this.options.defaultDateFormat;
            var formGroup = $("<div class='form-group col-md-3'></div>");
            var inputGroup = $("<div class='input-daterange input-group'></div>").appendTo(formGroup);

            $('<label class="sr-only">' + field.label + '</label>').attr("for", id1).appendTo(inputGroup);            
            $('<input class="form-control" type="text" placeholder="' + field.label + '"/>').attr("id", id1).appendTo(inputGroup).datepicker({
                format: dateFormat,
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

        _createCheckbox: function (field, id)
        {
            var container = $("<div class='checkbox col-md-3'></div>");

            var label = $("<label></label>").text(' ' + field.label).appendTo(container);
            var input = $('<input type="checkbox" value="">').prependTo(label);
            
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

        _createClearButton: function ()
        {
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

        _createSearchFields: function ()
        {
            var self = this;
            var searchFields = self.options.searchFields;
            var form = self._$searchBar.find(".row");

            //Create text inputs
            if (searchFields != undefined) {                
                for (var i in searchFields)
                {
                    var id = $.hik.jtable.prototype._$nextSearchInputId++;
                    var field = searchFields[i];

                    if (field.type == SearchTypes.Text) {
                        self._createTextInput(field, id).appendTo(form);
                    }
                    else if (field.type == SearchTypes.Dropdown) {
                        self._createDropDown(field, id).appendTo(form);                                                
                    }
                    else if (field.type == SearchTypes.TypeAhead) {
                        self._createTypeAhead(field, id).appendTo(form);
                    }
                    else if (field.type == SearchTypes.CheckBox) {
                        self._createCheckbox(field, id).appendTo(form);
                    }
                    else if (field.type == SearchTypes.Date) {
                        self._createDateInput(field, id).appendTo(form);
                    }
                    else if (field.type == SearchTypes.DateRange) {
                        if (i >= searchFields.length - 1 || searchFields[++i].type != SearchTypes.DateRange) continue;
                        self._createDateRangeInput(field, id, $.hik.jtable.prototype._$nextSearchInputId++).appendTo(form);
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

                if (fieldOptions.type == SearchTypes.Date || fieldOptions.type == SearchTypes.DateRange) {
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
            
            self.load({ searchFields: $.merge(payload, searchObjects) });
        },
    });

})(jQuery);

