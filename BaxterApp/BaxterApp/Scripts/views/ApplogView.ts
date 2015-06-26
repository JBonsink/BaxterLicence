/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />

class ApplogView {
    constructor() {
        $(() => {
            var logTable = $('#logTable');

            downloadObjects(
                '/AppLog/GetActions',
                '/AppLog/GetFields').done(function (logActions: kTable.Actions, logFields: Baxter.Fields.AppLog) {

                logFields.Module.options = '/Log/GetModuleOptions';

                logFields['Seen'] = {       
                    title: '',             
                    width: "1%",
                    display: function(data) {                        
                        if (data.record.Seen) {
                            return $('<i class="glyphicon glyphicon-eye-open"/>');
                        }
                        else {
                            return $('<i class="glyphicon glyphicon-eye-close"/>').click(function () {
                                var icon = $(this);
                                var row = icon.parents('tr');
                                data.record.Seen = true;

                                Animations.spin(icon);
                                data.table.updateRecord({ url: '/AppLog/Edit', record: data.record, error: () => { Animations.stopSpin(icon);} });
                            });
                        }
                    }
                };
                
                var options = kTable.Utilities.createOptions<Baxter.Models.AppLog, Baxter.Fields.AppLog>({
                    title: Resources.Global.General_AppLog,
                    actions: logActions,
                    fields: logFields,
                    defaultSorting: "Date DESC",
                    fieldOrder: ['Module'],
                    searchFields: [{
                        column: "Type",
                        label: Resources.Global.General_Type,
                        type: kTable.SearchType.Dropdown,
                        operator: kTable.Operator.Equals,
                        defaultValue: Resources.Global.General_AllEntities(Resources.Global.General_Types),
                        dropdown:
                        {
                            options: [
                                { Value: 0, DisplayText: Resources.Global.General_AllEntities(Resources.Global.General_Logs.toLowerCase()) },
                                { Value: Baxter.Constants.AppLogType.Warning, DisplayText: Resources.Global.General_Warnings },
                                { Value: Baxter.Constants.AppLogType.Error, DisplayText: Resources.Global.General_Errors }
                            ],
                        },
                    }],
                    rowInserted: function (e, data) {
                        var record = data.record;
                        
                        if (record.Type == Baxter.Constants.AppLogType.Information) {
                            data.row.addClass('info');
                        }
                        else if (record.Type == Baxter.Constants.AppLogType.Error) {
                            data.row.addClass('danger');
                        }
                        else if (record.Type == Baxter.Constants.AppLogType.Success) {
                            data.row.addClass('success');
                        } else if (record.Type == Baxter.Constants.AppLogType.Warning) {
                            data.row.addClass('warning');
                        }
                    }                    
                });
                
                logTable.kTable(options)
                        .kTable('load');                
            });
        });
    }
} 