/// <signature>
/// <summary>Return a div container containing a label and input. The type of the input is not set.
/// <param name="labelText" type="String">Text of the label.</param>
/// <param name="inputAttributes" type="Object">Javascript object with the attributes of the input as key value pairs.</param>
/// <param name="defaultValue" type="">Default value of the input field.</param>
/// </signature>
function createInput(labelText, inputAttributes, defaultValue)
{
    var container = $("<div class='form-group col-md-12'></div>")
        .append($('<label>' + labelText + '</label>').attr("for", inputAttributes.id || inputAttributes.ID || inputAttributes.name));    
    var input = $('<input/>', inputAttributes)
        .addClass('form-control')
        .appendTo(container);

    if (defaultValue != undefined) input.val(defaultValue);
    if (inputAttributes.type == 'hidden') container.css('height', 0);
    return container;
}

/// <signature>
/// <summary>Return a div container containing a label and number input. 
/// <param name="labelText" type="String">Text of the label.</param>
/// <param name="inputAttributes" type="Object">Javascript object with the attributes of the input as key value pairs.</param>
/// <param name="defaultValue" type="">Default value of the input field.</param>
/// </signature>
function createCheckbox(labelText, inputAttributes, defaultValue)
{
    var container = this.createInput(labelText, $.extend({ type: 'checkbox' }, inputAttributes), defaultValue);
    var input = container.find('input').removeClass('form-control');
    container.find('label').prepend(input);

    if (defaultValue == true) input.prop('checked', true);
    else input.prop('checked', false);

    return container;
}

/// <signature>
/// <summary>Return a div container containing a label and number input. 
/// <param name="labelText" type="String">Text of the label.</param>
/// <param name="inputAttributes" type="Object">Javascript object with the attributes of the input as key value pairs.</param>
/// <param name="defaultValue" type="">Default value of the input field.</param>
/// </signature>
function createSpinbox(labelText, inputAttributes, defaultValue) {
    return this.createInput(labelText, $.extend({ type: 'number' }, inputAttributes), defaultValue);
}

/// <signature>
/// <summary>Return a div container containing a label and text input. 
/// <param name="labelText" type="String">Text of the label.</param>
/// <param name="inputAttributes" type="Object">Javascript object with the attributes of the input as key value pairs.</param>
/// <param name="defaultValue" type="">Default value of the input field.</param>
/// </signature>
function createTextInput(labelText, inputAttributes, defaultValue) {
    return this.createInput(labelText, $.extend({ type: 'text' }, inputAttributes), defaultValue);
}

/// <signature>
/// <summary>Return a div container containing a label and date input. 
/// <param name="labelText" type="String">Text of the label.</param>
/// <param name="inputAttributes" type="Object">Javascript object with the attributes of the input as key value pairs.</param>
/// <param name="dateFormat" type="">The date format, combination of d, dd, D, DD, m, mm, M, MM, yy, yyyy. Use the capticals for abbreviated  and full names.</param>
/// </signature>
function createDateInput(label, inputAttributes, dateFormat) {
    var container = this.createInput(labelText, $.extend({ type: 'text' }, inputAttributes), defaultValue);
    container
        .find('input')
        .datepicker({
            format: dateFormat,
            startView: 1,
            todayBtn: "linked",
            language: "nl",
            calendarWeeks: true,
            autoclose: true,
            todayHighlight: true,
        });
    return container;
}
            
/// <signature>
/// <summary>Return a div container containing a label and date input. 
/// <param name="labelText" type="String">Text of the label.</param>
/// <param name="inputAttributesLeft" type="Object">Javascript object with the attributes of the left input as key value pairs.</param>
/// <param name="inputAttributesRight" type="Object">Javascript object with the attributes of the right input as key value pairs.</param>
/// <param name="dateFormat" type="">The date format, combination of d, dd, D, DD, m, mm, M, MM, yy, yyyy. Use the capticals for abbreviated  and full names.</param>
/// </signature>
function createDateRangeInput(labelText, inputAttributesLeft, inputAttributesRight, dateFormat) {
    var formGroup = $("<div class='form-group col-md-12'></div>")
        .append($('<label />').text(labelText));
    var inputGroup = $("<div class='input-daterange input-group'></div>").appendTo(formGroup);

    $('<label class="sr-only" />')
        .attr("for", inputAttributesLeft.id || inputAttributesLeft.ID || inputAttributesLeft.name)
        .appendTo(inputGroup);
    $('<input class="form-control" />', $.extend({type: 'text'}, inputAttributesLeft))
        .appendTo(inputGroup)
        .datepicker({
            format: dateFormat,
            startView: 1,
            todayBtn: "linked",
            language: "nl",
            calendarWeeks: true,
            autoclose: true,
            todayHighlight: true,                
        });
            
    $('<span class="input-group-addon">' + Resources.Global.General_Till + '</span>').appendTo(inputGroup);

    $('<label class="sr-only" />')
        .attr("for", inputAttributesRight.id || inputAttributesRight.ID || inputAttributesRight.name)
        .appendTo(inputGroup);
    $('<input class="form-control" />', $.extend({ type: 'text' }, inputAttributesRight))
        .appendTo(inputGroup)
        .datepicker({
            format: dateFormat,
            startView: 1,
            todayBtn: "linked",
            language: "nl",
            calendarWeeks: true,
            autoclose: true,
            todayHighlight: true,                
        }); 
    
    return formGroup;
}

/// <signature>
/// <summary>Initialize the Twitter TypeAhead plugin on a text input. 
/// <param name="input" type="jQuery object" />
/// <param name="options" type="Object">You can set the displayfield, limit, valueField, prefectch and remote url.</param>
/// <param name="hintSelectedCb" type="function">Function called when the displayed hint is selected.</param>
/// <param name="dateFormat" type="">The date format, combination of d, dd, D, DD, m, mm, M, MM, yy, yyyy. Use the capticals for abbreviated  and full names.</param>
/// </signature>
function initializeTypeAhead(input, options, hintSelectedCb) {
    var bloodHoundOptions, suggestions,
        displayProp = options.displayField || "DisplayText";
        keyProp = options.valueField || "Value";
    limit = options.limit || 12;

    bloodHoundOptions = {
        datumTokenizer: function (d) { return Bloodhound.tokenizers.whitespace(d[displayProp]); },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 12,
        prefetch: options.prefetch,
        remote: "",
        dupDetector: function (remoteMatch, localMatch) {
            return remoteMatch[keyProp] === localMatch[keyProp];
        }
    };

    if (options.remote) {
        var url = options.remote;
        if (url.indexOf("?") > -1) url += "&_queryString=%QUERY";
        else url += "?_queryString=%QUERY";
        bloodHoundOptions.remote = { url: url, ajax: { method: "GET" } };
    }

    suggestions = new Bloodhound(bloodHoundOptions);    
    suggestions.initialize();        
    input.typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    }, {
        displayKey: displayProp,
        valueKey: keyProp,                
        highlight: true,
        source: suggestions.ttAdapter(),
    })
    .on('typeahead:selected', hintSelectedCb)
    .on('typeahead:autocompleted', hintSelectedCb);        
}

function createDropDownContainer(label, options, selectID) {
    var formGroup = $("<div class='form-group col-md-12'></div>");

    $('<label>' + label + '</label>').attr("for", selectID).appendTo(formGroup);
    var select = $('<select class="form-control"></select>').attr("id", selectID).appendTo(formGroup);
    fillDropDownListWithOptions(select, options, "");

    return formGroup;
};

function fillDropDownListWithOptions($select, options, value) {
    $select.empty();
    for (var i = 0; i < options.length; i++) {
        $('<option' + (options[i].Value == value ? ' selected="selected"' : '') + '>' + options[i].DisplayText + '</option>')
            .val(options[i].Value)
            .appendTo($select);
    }
};

function disableButton(button)
{
    button.attr('disabled', true);
}

function enableButton(button)
{
    button.removeAttr('disabled');
}