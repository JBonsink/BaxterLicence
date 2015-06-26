var Baxter;
(function (Baxter) {
    var Constants;
    (function (Constants) {
        (function (SearchOperator) {
            SearchOperator[SearchOperator["Equals"] = 0] = "Equals";
            SearchOperator[SearchOperator["NotEquals"] = 1] = "NotEquals";
            SearchOperator[SearchOperator["LessThan"] = 2] = "LessThan";
            SearchOperator[SearchOperator["LessThanEquals"] = 3] = "LessThanEquals";
            SearchOperator[SearchOperator["GreaterThan"] = 4] = "GreaterThan";
            SearchOperator[SearchOperator["GreaterThanEquals"] = 5] = "GreaterThanEquals";
            SearchOperator[SearchOperator["Contains"] = 6] = "Contains";
            SearchOperator[SearchOperator["StartsWith"] = 7] = "StartsWith";
            SearchOperator[SearchOperator["EndsWith"] = 8] = "EndsWith";
        })(Constants.SearchOperator || (Constants.SearchOperator = {}));
        var SearchOperator = Constants.SearchOperator;
        (function (Activity) {
            Activity[Activity["Edited"] = 1] = "Edited";
            Activity[Activity["Created"] = 2] = "Created";
            Activity[Activity["Deleted"] = 3] = "Deleted";
        })(Constants.Activity || (Constants.Activity = {}));
        var Activity = Constants.Activity;
        (function (Module) {
            Module[Module["Log"] = 1] = "Log";
            Module[Module["Role"] = 2] = "Role";
            Module[Module["User"] = 3] = "User";
            Module[Module["Image"] = 4] = "Image";
            Module[Module["FileModel"] = 5] = "FileModel";
            Module[Module["BackupSettings"] = 6] = "BackupSettings";
            Module[Module["Backup"] = 7] = "Backup";
            Module[Module["AppLog"] = 8] = "AppLog";
        })(Constants.Module || (Constants.Module = {}));
        var Module = Constants.Module;
    })(Constants = Baxter.Constants || (Baxter.Constants = {}));
})(Baxter || (Baxter = {}));
//# sourceMappingURL=enums.js.map