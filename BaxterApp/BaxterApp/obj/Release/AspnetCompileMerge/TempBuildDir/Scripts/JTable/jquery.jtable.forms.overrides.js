$.extend(true, $.hik.jtable.prototype, {

    /* Submits a form asynchronously using AJAX.
         * Difference: Stringify the formdata
         *************************************************************************/
    _submitFormUsingAjax: function (url, formData, success, error) {        
        this._ajax({
            url: url,
            data: JSON.stringify(formData),
            success: success,
            error: error
        });
    },

    /* Creates label for an input element.
    * Difference: Styling
    *************************************************************************/
    _createInputLabelForRecordField: function (fieldName) {
        //TODO: May create label tag instead of a div.
        return $('<div />')
            .addClass('jtable-input-label')
            .html('<p class="detailsProperty">' + this.options.fields[fieldName].title || this.options.fields[fieldName].inputTitle + '</p>');
    },

    /* Creates an input element according to field type.
     * Difference: support for extra field types
     *************************************************************************/
    _createInputForRecordField: function (funcParams) {
        var fieldName = funcParams.fieldName,
            value = funcParams.record != null ? funcParams.record[fieldName] : funcParams.value,
            record = funcParams.record,
            formType = funcParams.formType,
            form = funcParams.form;

        //Get the field
        var field = this.options.fields[fieldName];

        //If value if not supplied, use defaultValue of the field
        if (value == undefined || value == null) {
            value = field.defaultValue;
        }

        //Use custom function if supplied
        if (field.input) {
            var $input = $(field.input({
                value: value,
                record: record,
                formType: formType,
                form: form
            }));

            //Add id propibute if does not exists
            if (!$input.attr('id')) {
                $input.attr('id', 'Edit-' + fieldName);
            }

            //Wrap input element with div
            return $('<div />')
                .addClass('form-group col-md-6')
                .append($input);
        }

        //Create input according to field type
        if (field.type == 'date') {
            return this._createDateInputForField(field, fieldName, value);
        } else if (field.type == 'textarea') {
            return this._createTextAreaForField(field, fieldName, value);
        } else if (field.type == 'password') {
            return this._createPasswordInputForField(field, fieldName, value);
        } else if (field.type == 'checkbox') {
            return this._createCheckboxForField(field, fieldName, value);
        } else if (field.type == 'number') {
            return this._createNumberInputForField(field, fieldName, value);
        } else if (field.type == 'directory') {
            return this._createDirectoryInputForField(field, fieldName, value);
        } else if (field.type == 'dropdown') {
            return this._createDropDownListForField(field, fieldName, value, record, formType, form);
        } else if (field.type == 'text') {
            return this._createTextInputForField(field, fieldName, value);
        } else if (field.type == 'file') {
            return this._createInputForFile(field, fieldName, value);
        } else if (field.options) {
            if (field.type == 'radiobutton') {
                return this._createRadioButtonListForField(field, fieldName, value, record, formType);
            } else {
                return this._createDropDownListForField(field, fieldName, value, record, formType, form);
            }
        } else {
            return this._createTextInputForField(field, fieldName, value);
        }
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

            var $radioButton = $('<input type="radio" id="Edit-' + fieldName + '-' + i + '" class="' + field.inputClass + '" name="' + fieldName + '"' + ((option.Value == (value + '')) ? ' checked="true"' : '') + ' />')
                .val(option.Value)
                .prependTo(label);                        
        });

        return container;
    },

    /* Creates a date input for a field.
     * Difference: Using a label as a container. ChangeYear and ChangeMonth by default.
     * A hidden input field is used to send the date in the ISO 6801 format to the server
     *************************************************************************/
    _createDateInputForField: function (field, fieldName, value) {
        var dateFormat = field.dateFormat || this.options.defaultDateFormat;
        var formGroup = $("<div class='form-group col-md-6'></div>");
        var label = $('<label>' + field.title + '</label>').attr("for", fieldName).appendTo(formGroup);
        var inputGroup = $("<div class='input-group date'></div>").appendTo(formGroup);                        
        var input = $('<input class="form-control '+ field.inputClass +'" type="text" placeholder="' + field.title + '"  name="' + fieldName + '"/>').attr("id", fieldName).appendTo(inputGroup);
        var addon = $('<span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span>').appendTo(inputGroup);
                
        inputGroup.datepicker({
            format: "dd-mm-yyyy",
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
     * Difference: Label as container.
     *************************************************************************/
    _createTextAreaForField: function (field, fieldName, value) {
        var formGroup = $('<div class="form-group col-md-6">').append($('<label for="Edit-' + fieldName + '">' + field.title + '</label>'));
        var $textArea = $('<textarea class="form-control ' + field.inputClass + '" id="Edit-' + fieldName + '" name="' + fieldName + '"></textarea>').appendTo(formGroup);

        if (value != undefined) {
            $textArea.val(value);
        }

        return formGroup;            
    },

    /* Creates a standard textbox for a field.
     * Difference: Label as container and placeHolder when the field is required.
     *************************************************************************/
    _createTextInputForField: function (field, fieldName, value) {
        var formGroup = $('<div class="form-group col-md-6">').append($('<label for="Edit-' + fieldName + '">' + field.title + '</label>'));
        var $input = $('<input placeholder="' + field.title + '" class="form-control ' + field.inputClass + '" id="Edit-' + fieldName + '" type="text" name="' + fieldName + '"></input>').appendTo(formGroup);

        if (value != undefined) {
            $input.val(value);
        }        

        return formGroup;
    },

    /* Creates a number input for a field.
     *************************************************************************/
    _createNumberInputForField: function (field, fieldName, value) {
        if (!field.numberStepSize) field.numberStepSize = 1;

        var formGroup = $('<div class="form-group col-md-6"></div>').append($('<label for="Edit-' + fieldName + '">' + field.title + '</label>'));
        var $input = $('<input placeholder="' + field.title + '" class="form-control ' + field.inputClass + '" id="Edit-' + fieldName + '" type="number" name="' + fieldName + '" step="' + field.numberStepSize + '"></input>').appendTo(formGroup);
                
        if (value != undefined) {
            $input.val(value);
        }
        
        return formGroup;
    },

    /* Creates a standard file input field.
     * Difference: Label as container.
     *************************************************************************/
    _createInputForFile: function (field, fieldName, value) {
        var formGroup = $("<div class='form-group col-md-6'></div>");
        $('<label for="Edit-' + fieldName + '">' + field.title + '</label>').appendTo(formGroup);
        $('<input class="form-control file ' + field.inputClass + '" id="Edit-' + fieldName + '" name="' + fieldName + '"></input>').val(value).appendTo(formGroup);                               
        return formGroup;
    },

    /* Creates a password input for a field.
     * Difference: Label as container and placeHolder when the field is required.
     *************************************************************************/
    _createPasswordInputForField: function (field, fieldName, value) {
        var formGroup = $("<div class='form-group col-md-6'></div>");
        $('<label>' + field.title + '</label>').attr("for", fieldName).appendTo(formGroup);

        var $input = $('<input placeholder="' + field.title + '" class="form-control ' + field.inputClass + '" id="Edit-' + fieldName + '" type="password" name="' + fieldName + '"></input>').appendTo(formGroup);
        if (value != undefined) {
            $input.val(value);
        }
        return formGroup;
    },

    /* Creates a checkboxfor a field.
     * Difference: Label as container
     *************************************************************************/
    _createCheckboxForField: function (field, fieldName, value) {
        var self = this;

        var container = $("<div class='col-md-6' />");
        var checkbox = $("<div class='checkbox' />")
            .appendTo(container);

        var label = $('<label for="Edit-' + fieldName + '">' + field.title + '</label>')
            .appendTo(checkbox);
        //The input should be placed before the text inside the label
        var input = $('<input class="' + field.inputClass + '" id="Edit-' + fieldName + '" type="checkbox" name="' + fieldName + '" />')
            .prependTo(label);

        //If value is undefined, get unchecked state's value
        if (value == undefined || value.toString() == "") {
            value = self._getCheckBoxPropertiesForFieldByState(fieldName, false).Value;
        }
                                        
        if (value != undefined) {
            input.val(value);
        }
                
        //Check the checkbox if it's value is checked-value
        if (self._getIsCheckBoxSelectedForFieldByValue(fieldName, value)) {
            input.attr('checked', 'checked');
        }                     
        
        input.click(function () {
            var input = $(this);            
            input.val(input.is(":checked"));
        });

        return container;
    },

    /* Creates a drop down list (combobox) input element for a field.
     * Difference: Label as container
     *************************************************************************/
    _createDropDownListForField: function (field, fieldName, value, record, source, form) {
        var formGroup = $("<div class='form-group col-md-6'></div>");
        $('<label>' + field.title + '</label>').attr("for", fieldName).appendTo(formGroup);
                        
        //Create select element
        var $select = $('<select class="form-control ' + field.inputClass + '" id="Edit-' + fieldName + '" name="' + fieldName + '"></select>')
            .appendTo(formGroup)

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
                var container = form.find('label[for="Edit-' + fieldName + '"]').parent().hide();      

                if (containers[field.showOn] == undefined) containers[field.showOn] = [];
                containers[field.showOn].push(container);
            }
        }
        
        //Register on change function for each checkbox
        for (var key in containers)
        {
            var checkbox = form.find('#Edit-' + key);
            checkbox.change(function () {
                for (var i = 0; i < containers[key].length; i++) {
                    containers[key][i].slideToggle("slow");                    
                }
            });
        }        
    },

    /* Sets enabled/disabled state of a dialog button.
     * Difference: Add and remove ui-state-focus
     *************************************************************************/
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

    /* Gets display text for a checkbox field.
       *************************************************************************/
    _getCheckBoxTextForFieldByValue: function (fieldName, value) {                
        if (this.options.fields[fieldName].values) return this.options.fields[fieldName].values[value];
        else return (value == 'true' || value == true) ? Resources.Global.General_Yes : Resources.Global.General_No;
    },

    _createCheckBoxStateArrayForField: function (fieldName) {
        var stateArray = [];
        var values = this.options.fields[fieldName].values;
        var trueDisplay = (values) ? values['true'] : Resources.Global.General_Yes;
        var falseDisplay = (values) ? values['false'] : Resources.Global.General_No;
        stateArray.push({ 'Value': 'false', 'DisplayText': falseDisplay });
        stateArray.push({ 'Value': 'true', 'DisplayText': trueDisplay });          
        return stateArray;
    },

    /* Fills a dropdown list with given options.
     * Difference: Shows empty display when displayText is undefined
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

    /* Updates values of a record from given form
     * Difference: Fixed date formatting
     *************************************************************************/
    _updateRecordValuesFromForm: function (record, $form) {
        for (var i = 0; i < this._fieldList.length; i++) {
            var fieldName = this._fieldList[i];
            var field = this.options.fields[fieldName];

            //Do not update non-editable fields
            if (field.edit == false) {
                continue;
            }

            //Get field name and the input element of this field in the form
            var $inputElement = $form.find('[name="' + fieldName + '"]');
            if ($inputElement.length <= 0) {
                continue;
            }

            //Update field in record according to it's type
            if (field.type == 'date') {
                var dateVal = $inputElement.val();
                if (dateVal) {
                    var dateFormat = field.dateFormat || this.options.defaultDateFormat;
                    try {                        
                        record[fieldName] = Date.parseExact(dateVal, dateFormat).toISOString();
                    } catch (e) {
                        //TODO: Handle incorrect/different date formats
                        this._logWarn('Date format is incorrect for field ' + fieldName + ': ' + dateVal);
                        record[fieldName] = undefined;
                    }
                } else {
                    this._logDebug('Date is empty for ' + fieldName);
                    record[fieldName] = undefined; //TODO: undefined, null or empty string?
                }
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

    _serializeObject: function (form) {
        var self = this;
        var o = {};
        var a = form.serializeArray();
        $.each(a, function () {
            var field = self.options.fields[this.name];
            var val = this.value || '';

            if (field && field.type == FieldTypes.Date && val) {
                try
                {
                    val = Date.parseExact(val, field.dateFormat).toISOString();                    
                }
                catch (e) {}
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
    }
});