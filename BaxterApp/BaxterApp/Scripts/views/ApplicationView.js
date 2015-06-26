/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />
var ApplicationView = (function () {
    function ApplicationView() {
        $(function () {
            var applicationTable = $('#applicationTable');
            downloadObjects('/Log/GetActions', '/Log/GetFields', '/Application/GetActions', '/Application/GetFields').done(function (logActions, logFields, applicationActions, applicationFields) {
                delete logFields["EntityName"];
                var applicationOptions = kTable.Utilities.createOptions({
                    title: Resources.Global.General_Application,
                    actions: applicationActions,
                    fields: kTable.Utilities.addEntityLogField(applicationFields, logActions, logFields, "Name", 9 /* Application */),
                    defaultSorting: "Name ASC"
                });
                applicationTable.kTable(applicationOptions).kTable("load");
            });
        });
    }
    return ApplicationView;
})();
//# sourceMappingURL=ApplicationView.js.map