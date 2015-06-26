var IsEmptyArray = function (array, message) {
    var emptyArray = array.length == 0;
    if (emptyArray) warningDialog(message);
    return emptyArray;
}

function getRecordFromRow(row) {
    return $(row).data('record');
}
function getPropFromRow(row, prop) {
    return $(row).data('record')[prop];
}

function getPropsFromRows(rows, prop) {
    var props = [];
    for (var i = 0; i < rows.length; ++i) props.push($(rows[i]).data('record')[prop]);
    return props;
}

function GetDefaultOptions(actions) {
    return {        
        paging: true,
        sorting: true,        
        actions: actions,
        selecting: actions.deleteAction != undefined,
        selectOnRowClick: false,
        selectingCheckboxes: true,
        multiselect: true,
        scrollable: false,
        messages: jtableLocalization,
    
        formSubmitting: function (event, data) {                        
            data.form.validationEngine('attach', { focusFirstField : false, promptPosition: "topRight:-100,10", binded: false, scroll: false });
            return data.form.validationEngine('validate');
        },
        formClosed: function (event, data) {
            data.form.validationEngine('hide');
            data.form.validationEngine('detach');
        },
        rowInserted: function (event, data) {            
            var columns = $(data.row).find('td:not(.jtable-command-column, .jtable-selecting-column, :has(img), :has(input), :has(i))');
            $(columns).click(function () {
                data.table.showDetailsDialog(data.row);
            });
        },
        deleteConfirmation: function (data) {
            var self = data.table;
            var container = $("<div></div>");
            $("<div class='alert alert-warning'>" + Resources.Global.General_DeleteItem + "?</div>").appendTo(container);

            var row = $("<div class='row'></div>").appendTo(container);
            var counter = 0;
            for (var fieldName in self.options.fields) {
                var field = self.options.fields[fieldName];
                if (field.list && fieldName in data.record && data.record[fieldName] != null) {
                    if (counter % 3 == 0) row = $("<div class='row'></div>").appendTo(container);

                    var value = data.record[fieldName];
                    if (field.options)
                    {
                        var options = self._getOptionsForField(fieldName, {
                            record: data.record,
                            value: value,
                            source: 'list',
                            dependedValues: self._createDependedValuesUsingRecord(data.record, field.dependsOn)
                        });
                        value = self._findOptionByValue(options, value).DisplayText;
                    }
                    else if (field.type == FieldTypes.Date){
                        value = self._getDisplayTextForDateRecordField(field, value);
                    }                    
                    
                    row.append($("<div class='col-md-4'><h4>" + field.title + "<br/><small>" + value + "</small></h4></div>"));
                    ++counter;
                }
            }                     

            data.deleteConfirmMessage = container.html();
        },
    };
}

function GetDefaultChildFieldOptions(title)
{
    return {
        title: title,
        hideTitle: true,
        width: "1%",
        sorting: false,
        edit: false,
        create: false,
        display: null,
        columnResizable: false,
    };    
}

function CreateIconField(iconUrl, title, click) {
    /// <signature>
    /// <summary>Creates an icon field that calls the provided click function. The click function 
    /// is called with the row, parent object and parent table as arguments. The parent object contains the parent record,
    /// which can be accessed through parent.record.</summary>
    /// <param name="iconUrl" type="String" />
    /// <param name="title" type="String/Function">If title is a function it receives the following arguments: parent, parentTable
    ///     Must return a string with the title.
    /// </param>
    /// <param name="click" type="Function">Receives the following arguments: row, parent, parentTable</param>
    /// </signature>
    return $.extend(GetDefaultChildFieldOptions(title), {
        display: function (parent, table) {
            var img = $("<img />", {
                src: iconUrl,
                title: $.isFunction(title) ? title(parent, table) : title
            }).click(function () {
                click(img.closest("tr"), parent, table);
            });

            return img;
        }
    });
}

function CreateGlyphiconField(iconClass, title, click) {
    /// <signature>
    /// <summary>Creates an icon field that calls the provided options.click function. The options.click function 
    /// is called with the row, parent object and parent table as arguments. The parent object contains the parent record,
    /// which can be accessed through parent.record.</summary>
    /// <param name="iconClass" type="String" />
    /// <param name="title" type="String/Function">If title is a function it receives the following arguments: parent, parentTable
    ///     Must return a string with the title.
    /// </param>
    /// <param name="click" type="Function">Receives the following arguments: row, parent, parentTable</param>
    /// </signature>
    return $.extend(GetDefaultChildFieldOptions(title), {
        display: function (parent, table) {
            var icon = $("<i />", {
                'class': iconClass,
                title: $.isFunction(title) ? title(parent, table) : title
            }).click(function () {
                click(icon.closest("tr"), parent, table);
            });

            return icon;
        }
    });
}

/*


@param property T
*/
function AddEntityLogField(fields, logActions, logFields, property, module)
{
    /// <signature>
    /// <summary>Adds an entity log field to a fields object if the listaction is set in logFields. Returns a new fields object.</summary>
    /// <param name="fields" type="object" />
    /// <param name="logActions" type="object" />
    /// <param name="logFields" type="object" />
    /// <param name="property" type="Function">The property in the table's record to be displayed in the title of the log table. If the propery does not exist, the value of property is used instead.</param>
    /// <param name="module" type="integer" />
    /// </signature>

    if (logActions.listAction == undefined) return fields;

    var logOptions = {
        actions: logActions,
        fields: logFields,
        fieldOrder: ["Username", "Activity"],        
        paging: true,
        sorting: true,
        defaultSorting: "Timestamp DESC",
        rowInserted: function (event, data) {
            var columns = $(data.row).find('td:not(.jtable-command-column, .jtable-selecting-column, :has(img))');
            $(columns).click(function () {
                self.showDetailsDialog(data.row);
            });
        },
    }

    var field = CreateGlyphiconField('glyphicon glyphicon-time', Resources.Global.Log_EntityHistory, function (tr, parent, table) {
        
        var entity = (property in parent.record) ? parent.record[property] : property;

        logOptions.title = String.format(Resources.Global.Log_HistoryOf, entity);
                        
        var payload = {
            searchFields: [
                {
                    Column: "Module",
                    Value: module,
                    Operator: Operators.Equals,
                },
                {
                    Column: "EntityID",
                    Value: parent.record.ID,
                    Operator: Operators.Equals
                }
            ]
        };
                                                                                                                                
        table.openChildTable(tr, logOptions, function (data) { data.childTable.jtable('load', payload); });
    });
               
    return $.extend({ EntityLog: field }, fields);
}

function DeselectRows(table)
{
    table.find('tr.info').removeClass('info').removeClass('jtable-row-selected');
    table.find('input[type="checkbox"]').attr('checked', false);
}

var FieldTypes = Object.freeze({
    Date: "date",
    TextArea: "textarea",
    Password: "password",
    Checkbox: "checkbox",
    Radiobutton: "radiobutton",
    Dropdown: "dropdown",
    Hidden: "hidden",
    File: "file"
});

var SearchTypes = Object.freeze({
    Text : 0,
    Dropdown: 1,
    TypeAhead: 2,
    CheckBox: 3,
    Date: 4,
    DateRange: 5
});

var Operators = Object.freeze({
    Equals : 0,
    NotEquals : 1,
    LessThan: 2,
    LessThanEquals: 3,
    GreaterThan: 4,
    GreaterThanEquals: 5,
    Contains: 6,
    StartsWith: 7,
    EndsWith: 8,
});