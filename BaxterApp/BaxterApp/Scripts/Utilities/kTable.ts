module kTable {
    export module Utilities {
        /**
         * Get the record from a kTable row.
         */
        export function getRecordFromRow(row: JQuery): Object {
            return $(row).data('record');
        }

        /**
         * Get the records of an array of kTable rows.
         */
        export function getRecordsFromRows(rows: Array<JQuery>): Array<Object> {
            var records = [];
            for (var i = 0; i < rows.length; ++i) records.push($(rows[i]).data('record'));
            return records;
        }

        /**
         * Get the value of a column in a kTable row.
         */
        export function getPropFromRow(row: JQuery, prop: string): any {
            return $(row).data('record')[prop];
        }

        /**
         * Get the values of a column in multiple kTable rows.
         */
        export function getPropsFromRows(rows: Array<JQuery>, prop: string): Array<any> {
            var props = [];
            for (var i = 0; i < rows.length; ++i) props.push($(rows[i]).data('record')[prop]);
            return props;
        }
    
        /**
         * Get the default kTable options. Includes:
         * 
         * - Form validation
         * - Custom delete confirmation dialog
         * - Localization
         *
         * @param title The title of the table
         * @param actions The CRUD action urls or functions
         * @param fields The kTable fields.
         */
        export function createOptions<T, F>(options: kTable.Options<T>): kTable.Options<T> {
            return $.extend({
                selecting: options.actions.deleteAction != undefined,
                selectOnRowClick: true,
                selectingCheckboxes: true,
                multiselect: true,
                scrollable: false,
                messages: resourceStrings,
                sorting: options.defaultSorting != null,

                formSubmitting: (event, data) => {
                    data.form.validationEngine('attach', { focusFirstField: false, promptPosition: "topRight:-100,10", binded: false, scroll: false });
                    return data.form.validationEngine('validate');
                },
                formClosed: function (event, data) {
                    data.form.validationEngine('hide');
                    data.form.validationEngine('detach');
                },

                deleteConfirmation: function (data) {
                    var container = $("<div/>")
                        .append($("<div class='alert alert-warning'>" + Resources.Global.General_DeleteItem + "?</div>"));

                    var row = $("<div class='row'></div>").appendTo(container);
                    var counter = 0;
                    for (var fieldName in data.table.options.fields) {
                        var field = data.table.options.fields[fieldName];
                        if (field.list && fieldName in data.record && data.record[fieldName] != null) {
                            if (counter % 3 == 0) row = $("<div class='row'></div>").appendTo(container);

                            var value = data.record[fieldName];
                            if (field.options) {
                                var options = data.table._getOptionsForField(fieldName, {
                                    record: data.record,
                                    value: value,
                                    source: 'list',
                                    dependedValues: data.table._createDependedValuesUsingRecord(data.record, field.dependsOn)
                                });
                                value = data.table._findOptionByValue(options, value).DisplayText;
                            }
                            else if (field.type == InputType.Date) {
                                value = data.table._getDisplayTextForDateRecordField(field, value);
                            }

                            row.append($("<div class='col-md-4'><h4>" + field.title + "<br/><small>" + value + "</small></h4></div>"));
                            ++counter;
                        }
                    }

                    return container.html();
                },
            }, options);
        }

        export function getDefaultChildFieldOptions<T>(title): kTable.Field<T> {
            var fieldOptions: kTable.Field<T> = {
                title: title,
                hideTitle: true,
                width: "1%",
                sorting: false,
                edit: false,
                create: false,
                columnResizable: false
            };
            return fieldOptions;
        }

        /*
         * Creates an icon field that calls the provided click function. The options.click function 
         * is called with the row, parent object and parent table as arguments. The parent object contains the parent record,
         * which can be accessed through parent.record.
         *
         * @param iconClass Font Awesome or Glyphicon classes.
         * @param title The title shown while hovering on the icon
         * @param click The function called when the user clicks on the icon.
         */
        export function createIconField<T>(iconClass: string, title: string, click: (row: JQuery, data: kTable.RecordData<T>) => void) {
            var fieldOptions = getDefaultChildFieldOptions<T>(title);
            fieldOptions.display = (data) => {
                var icon = $("<i />", {
                    class: iconClass,
                    title: title
                }).click(() => {
                    click(icon.closest("tr"), data);
                });

                return icon;
            };
        }
    
        /** 
         * Adds an entity log field to a fields object if the listAction is set in logFields. The
         * listAction is automatically set when the logged user has access to view logs.
         *
         * @param property The property in the parent table's record to be displayed in the
         * title of the log table. If the propery does not exist, the value of property is 
         * used instead.</param>
         */
        export function addEntityLogField(fields: Object, logActions: kTable.Actions, logFields: Baxter.Fields.Log, property: string, module: number): Object {
            if (logActions.listAction == undefined) return fields;

            var logOptions = createOptions({
                title: "",
                actions: logActions,
                fields: logFields,
                fieldOrder: ["Username", "Activity"],
                defaultSorting: "Timestamp DESC"
            });

            var field = createIconField('glyphicon glyphicon-time', Resources.Global.Log_EntityHistory, function (row, data) {
                var entity = (property in data.record) ? data.record[property] : property;

                var payload = {
                    searchFields: [
                        {
                            Column: "Module",
                            Value: module,
                            Operator: Operator.Equals,
                        },
                        {
                            Column: "EntityID",
                            Value: data.record['ID'],
                            Operator: Operator.Equals
                        }
                    ]
                };

                data.table.openChildTable(row, logOptions, function (childtable) {
                    childtable.setTableTitle(Resources.Global.Log_HistoryOf(entity));
                    childtable.load(payload);
                });
            });

            return $.extend({ EntityLog: field }, fields);
        }

        var resourceStrings: kTable.ResourceStrings = {
            serverCommunicationError: Resources.Global.JTable_ServerCommunicationError,
            loadingMessage: Resources.Global.JTable_LoadingMessage,
            noDataAvailable: Resources.Global.JTable_NoDataAvailable,
            addNewRecord: Resources.Global.JTable_AddNewRecord,
            editRecord: Resources.Global.JTable_EditRecord,
            areYouSure: Resources.Global.General_AreYouSure,
            deleteConfirmation: Resources.Global.JTable_DeleteConfirmation,
            save: Resources.Global.General_Save,
            saving: Resources.Global.General_Saving,
            cancel: Resources.Global.General_Cancel,
            deleteText: Resources.Global.JTable_Delete,
            deleting: Resources.Global.JTable_Deleting,
            error: Resources.Global.General_Error,
            close: Resources.Global.General_Close,
            cannotLoadOptionsFor: Resources.Global.JTable_CanNotLoadOptionsFor,
            pagingInfo: Resources.Global.JTable_PagingInfo,
            pageSizeChangeLabel: Resources.Global.JTable_PageSizeChangeLabel,
            gotoPageLabel: Resources.Global.JTable_GoToPageLabel,
            canNotDeletedRecords: Resources.Global.JTable_CanNotDeleteRecords,
            deleteProggress: Resources.Global.JTable_DeleteProggress,
            searchTitle: Resources.Global.General_Search,
            loadRecords: Resources.Global.JTable_LoadRecords,
            details: Resources.Global.JTable_Details,
            formCount: Resources.Global.JTable_FormCount,
            deleteMulti: Resources.Global.JTable_DeleteConfirmationMulti,
        }
    }
}









//function CreateIconField(iconUrl, title, click) {
//    /// <signature>
//    /// <summary>Creates an icon field that calls the provided click function. The click function 
//    /// is called with the row, parent object and parent table as arguments. The parent object contains the parent record,
//    /// which can be accessed through parent.record.</summary>
//    /// <param name="iconUrl" type="String" />
//    /// <param name="title" type="String/Function">If title is a function it receives the following arguments: parent, parentTable
//    ///     Must return a string with the title.
//    /// </param>
//    /// <param name="click" type="Function">Receives the following arguments: row, parent, parentTable</param>
//    /// </signature>
//    return $.extend(GetDefaultChildFieldOptions(title), {
//        display: function (parent, table) {
//            var img = $("<img />", {
//                src: iconUrl,
//                title: $.isFunction(title) ? title(parent, table) : title
//            }).click(function () {
//                click(img.closest("tr"), parent, table);
//            });

//            return img;
//        }
//    });
//}



///*




//function DeselectRows(table)
//{
//    table.find('tr.info').removeClass('info').removeClass('jtable-row-selected');
//    table.find('input[type="checkbox"]').attr('checked', false);
//}
