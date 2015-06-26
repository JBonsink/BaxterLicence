/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />

class LogView {
    constructor() {
        $(() => {
            var logTable = $('#logTable');

            downloadObjects(
                '/Log/GetActions',
                '/Log/GetFields').done(function (
                    logActions: kTable.Actions,
                    logFields: Baxter.Fields.Log) {

                var logOptions = kTable.Utilities.createOptions({
                    title: Resources.Global.General_Logs,
                    actions: logActions,
                    fields: logFields,
                    defaultSorting: "Timestamp DESC",
                    searchFields: [
                        {
                            column: "Module",
                            label: Resources.Global.Log_Module,
                            type: kTable.SearchType.Dropdown,
                            operator: kTable.Operator.Equals,
                            defaultValue: Resources.Global.General_AllEntities(Resources.Global.General_Modules),
                            dropdown:
                            {
                                remote: '/Log/GetModuleOptions',
                            },
                        },
                        ,
                        {
                            column: "Activity",
                            label: Resources.Global.Log_Activity,
                            type: kTable.SearchType.Dropdown,
                            operator: kTable.Operator.Equals,
                            defaultValue: Resources.Global.General_AllEntities(Resources.Global.General_Modules),
                            dropdown:
                            {
                                remote: '/Log/GetActivityOptions',
                            },
                        },
                        {
                            column: "UserID",
                            label: Resources.Global.User_UserName,
                            type: kTable.SearchType.TypeAhead,
                            operator: kTable.Operator.Equals,
                            typeAhead: {
                                remote: '/User/GetUserSuggestions',
                                prefetch: '/User/GetUserSuggestions'
                            }
                        }
                    ]
                });

                logTable.kTable(logOptions)
                        .kTable("load");
            });
        });
    }
}