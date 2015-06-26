/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />

class UserView {
    constructor() {
        $(() => {
            var userTable = $('#userTable');            
                         
            downloadObjects(
                '/Log/GetActions',
                '/Log/GetFields',
                '/User/GetActions',
                '/User/GetFields').done(function (
                    logActions: kTable.Actions,
                    logFields: Baxter.Fields.Log,
                    userActions: kTable.Actions,
                    userFields: Baxter.Fields.User) {
                   
                {   // User activity logs
                    var fields: Baxter.Fields.Log = $.extend({}, logFields);
                    delete fields.Username;
                    
                    var userLogOptions = kTable.Utilities.createOptions({
                            title: "",
                            actions: logActions,
                            fields: fields,
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
                                        remote: '/Log/GetModuleOptions'
                                    },
                                },
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
                                }
                            ]
                        });

                    var userLogField = kTable.Utilities.createIconField<Baxter.Models.User>("glyphicon glyphicon-book", Resources.Global.General_Activities,
                        function (row, data) {
                            var payload = {
                                searchFields: [
                                    {
                                        Column: "UserID",
                                        Value: data.record.ID,
                                        Operator: kTable.Operator.Equals
                                    }
                                ]
                            };
                                                        
                            data.table.openChildTable<Baxter.Models.Log>(row, userLogOptions, function (childTable) {
                                childTable.setTableTitle(Resources.Global.User_ActivitiesOf(data.record.Name));
                                childTable.load(payload);
                            });
                        }
                        );                                              
                }
                
                {   // User table
                    delete logFields.EntityName;

                    userFields.ConfirmPassword.list = userFields.NewPassword.list = false;
                    userFields.RoleID.options = "/Role/GetRoleOptions";
                    userFields.RoleID.type = kTable.InputType.Dropdown;
                    userFields.NewPassword.edit = userFields.ConfirmPassword.edit = false;
                    userFields.EditPassword.create = userFields.ConfirmEditPassword.create = false;
                    userFields.EditPassword.list = userFields.ConfirmEditPassword.list = false;

                    var childTable = kTable.Utilities.addEntityLogField({ UseLog: userLogField }, logActions, logFields, "Name", 1);

                    var userOptions = kTable.Utilities.createOptions({                        
                        title: Resources.Global.General_Users,
                        actions: userActions,
                        fields: $.extend(childTable, userFields),
                        defaultSorting: "Name",
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
                            {
                                column: "Activity",
                                label: Resources.Global.Log_Activity,
                                type: kTable.SearchType.Dropdown,
                                operator: kTable.Operator.Equals,
                                defaultValue: Resources.Global.General_AllEntities(Resources.Global.General_Activities),
                                dropdown:
                                {
                                    remote: '/Log/GetActivityOptions',
                                },
                            }]
                    });

                    userTable.kTable<Baxter.Models.User>(userOptions)
                             .kTable('load');
                }               
            });
        });
    }
}