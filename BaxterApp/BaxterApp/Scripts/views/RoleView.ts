/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />

class RoleView {
    constructor() {
        $(() => {
            var roleTable = $('#roleTable');

            downloadObjects(
                '/Log/GetActions',
                '/Log/GetFields',
                '/Role/GetActions',
                '/Role/GetFields').done(function (
                    logActions: kTable.Actions,
                    logFields: Baxter.Fields.Log,
                    roleActions: kTable.Actions,
                    roleFields: Baxter.Fields.Role) {

                delete logFields["EntityName"];

                roleFields.Name.width = "99%";
                for (var i in roleFields) roleFields[i].type = kTable.InputType.Radiobutton;

                var roleOptions = kTable.Utilities.createOptions({
                    title: Resources.Global.General_Roles,
                    actions: roleActions,
                    fields: kTable.Utilities.addEntityLogField(roleFields, logActions, logFields, "Name", Baxter.Constants.Module.Role),
                    defaultSorting: "Name ASC"
                });
                
                roleTable.kTable(roleOptions)
                         .kTable("load");
            }); 
        });
    }
}