/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />

class ApplicationView {
    constructor() {
        $(() => {
            var applicationTable = $('#applicationTable');

            downloadObjects(
                '/Log/GetActions',
                '/Log/GetFields',
                '/Application/GetActions',
                '/Application/GetFields').done(function (
                logActions: kTable.Actions,
                logFields: Baxter.Fields.Log,
                applicationActions: kTable.Actions,
                applicationFields: Baxter.Fields.Application) {                               
                
                delete logFields["EntityName"];

                var applicationOptions = kTable.Utilities.createOptions({
                    title: Resources.Global.General_Application,
                    actions: applicationActions,
                    fields: kTable.Utilities.addEntityLogField(applicationFields, logActions, logFields, "Name", Baxter.Constants.Module.Application),
                    defaultSorting: "Name ASC"
                });

                applicationTable.kTable(applicationOptions)
                    .kTable("load");
            });
        });
    }
}