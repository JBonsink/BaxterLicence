/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />
var CustomerView = (function () {
    function CustomerView() {
        $(function () {
            downloadObjects('/Log/GetActions', '/Log/GetFields', '/Customer/GetActions', '/Customer/GetFields').done(function (logActions, logFields, customerActions, customerFields) {
                delete logFields["EntityName"];
                customerFields.CustomerName;
                var applicationOptions = kTable.Utilities.createOptions({
                    title: Resources.Global.General_Customers,
                    actions: customerActions,
                    fields: kTable.Utilities.addEntityLogField(customerFields, logActions, logFields, "CustomerName", 9 /* Application */),
                    defaultSorting: "CustomerName ASC"
                });
                $('#customer').kTable(applicationOptions).kTable("load");
            });
        });
    }
    return CustomerView;
})();
//# sourceMappingURL=CustomerView.js.map