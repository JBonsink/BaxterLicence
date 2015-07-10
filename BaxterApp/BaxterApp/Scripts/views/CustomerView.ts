/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />

class CustomerView {
    constructor() {
        $(() => {
            downloadObjects(
                '/Log/GetActions',
                '/Log/GetFields',
                '/Customer/GetActions',
                '/Customer/GetFields').done(function (
                logActions: kTable.Actions,
                logFields: Baxter.Fields.Log,
                customerActions: kTable.Actions,
                customerFields: Baxter.Fields.Customer) {

                delete logFields["EntityName"];
                customerFields.CustomerName
                var applicationOptions = kTable.Utilities.createOptions({
                    title: Resources.Global.General_Customers,
                    actions: customerActions,
                    fields: kTable.Utilities.addEntityLogField(customerFields, logActions, logFields, "CustomerName", Baxter.Constants.Module.Application),
                    defaultSorting: "CustomerName ASC"
                });

                $('#customer').kTable(applicationOptions)
                    .kTable("load");
            });
        });
    }
}