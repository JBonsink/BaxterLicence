/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />
/// <reference path="../utilities/utilities.ts" />
/// <reference path="../utilities/animations.ts" />

interface JQuery {
    validationEngine(action: string);
}

class BackupSettings {
    ID: number;
    BackupSchedule: number;
    MinFreeSpaceGB: number;
    BackupTTLWeeks: number;
    Time: string;
    BackupPath: string;
    NetworkShare: string;
    NetworkUsername: string;
    NetworkPassword: string;
        
    Monday: boolean;
    Tuesday: boolean;
    Wednesday: boolean;
    Thursday: boolean;
    Friday: boolean;
    Saturday: boolean;
    Sunday: boolean;

    constructor(settings: Baxter.Models.BackupSettings) {
        for (var prop in settings) this[prop] = settings[prop];                  

        for (var i in this.days) {
            var day = this.days[i];
            this[day] = (Baxter.Constants.DaysOfWeek[day] & this.BackupSchedule) > 0;        
        }
                
        this.save = this.save.bind(this);
        this.test = this.test.bind(this);
    }

    save(event: JQueryEventObject) {
        event.preventDefault();

        var button = $('#save-button');
        var payload = this.serialize();

        if (!$('#settings-form').validationEngine('validate')) return;

        Animations.spin(button);
        Utilities.disableElement(button);

        submitData('/BackupSettings/Edit', payload, function (response) {
            Animations.stopSpin(button);
            Utilities.enableElement(button);

            if (response.Result == 'OK') {
                Modal.Utils.openSuccesModal(Resources.Global.General_ChangesSuccessfullySaved);
            }
        });    
    }

    test(event: JQueryEventObject) {
        event.preventDefault();

        var button = $("#test-button");
        var payload = this.serialize();

        if (payload.NetworkShare != null) {
            Animations.spin(button);
            Utilities.disableElement(button);

            submitData('/BackupSettings/TestNetworkSettings', payload, function (response) {
                Animations.stopSpin(button);
                Utilities.enableElement(button);

                if (response.Result == 'OK') {
                    Modal.Utils.openSuccesModal(Resources.Global.Backup_TestSuccess);
                } else {
                    Modal.Utils.openErrorModal(response.Message);
                }
            });
        } else {
            Modal.Utils.openErrorModal(Resources.Global.General_MissingData);
        }
    }

    private updateSchedule() {
        this.BackupSchedule = 0;

        for (var i in this.days) {
            var day = this.days[i];

            if (this[day] == true) {
                this.BackupSchedule += Baxter.Constants.DaysOfWeek[day];
            }
        }
    }

    private serialize() : Baxter.Models.BackupSettings {        
        this.updateSchedule();

        return {
                ID: this.ID,
                BackupPath: this.BackupPath,
                BackupSchedule: this.BackupSchedule,
                BackupTTLWeeks: this.BackupTTLWeeks,
                MinFreeSpaceGB: this.MinFreeSpaceGB,
                NetworkPassword: this.NetworkPassword,
                NetworkShare: this.NetworkShare,
                NetworkUsername: this.NetworkShare,
                Time: this.Time
        }                                
    }

    private days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
}

class BackupView {
    constructor(showToolbar: boolean) {
        $(() => {
            downloadObjects(
                '/Backup/GetActions',
                '/Backup/GetFields',
                '/BackupSettings/Get').done((
                backupActions: kTable.Actions,
                backupFields: Baxter.Fields.Log,
                backupSettings: Baxter.Models.BackupSettings) => {

                this.initializeTable(backupActions, backupFields);           
                this.initializeGraphics(backupSettings);
                 
                var settings = new BackupSettings(backupSettings);
                rivets.bind($('#settings-form'), { settings: settings });         
            });
        });
    }
        
    private initializeTable(backupActions, backupFields) {
        var backupTable = $('#backup-table');

        var options = kTable.Utilities.createOptions({
            title: Resources.Global.General_Backups,
            actions: backupActions,
            fields: backupFields,
            defaultSorting: "ID DESC",
            toolbar: {
                items: [
                    {
                        icon: 'glyphicon glyphicon-repeat',
                        text: Resources.Global.Backup_Restore,
                        click: (table) => {
                            this.restoreDatabase(table);
                        }
                    },
                    {
                        icon: 'glyphicon glyphicon-export',
                        text: Resources.Global.Backup_Now,
                        click: (table) => {
                            this.backupDatabase(table);
                        }
                    },
                ]
            }
        });

        backupTable.kTable(options)
                   .kTable("load");
    }

    private initializeGraphics(backupSettings) {
        downloadObjectAsync('/Drive/GetDriveInfo', { path: backupSettings.BackupPath }).done(
            function (response: any) {
                var driveInfo = $('#drive-info');
                var freeSpaceInfo = $('#free-space-info');

                if (response.Result == 'OK') {
                    var drive = response.Record;

                    if (drive.FreeSpace > backupSettings.MinFreeSpaceGB) {
                        freeSpaceInfo.addClass('alert-success').text(Resources.Global.Disk_SufficientSpace(drive.FreeSpace));
                    }
                    else {
                        freeSpaceInfo.addClass('alert-danger').text(Resources.Global.Disk_InsufficientSpace(drive.FreeSpace));
                    }

                    var doughnutData = [
                        {
                            value: drive.FreeSpace,
                            color: "#EEEEEE",
                            highlight: "#F1F1F1",
                            label: Resources.Global.Drive_FreeSpace
                        },
                        {
                            value: (drive.TotalSpace - drive.FreeSpace),
                            color: "#26A0DA",
                            highlight: "#77D3FF",
                            label: Resources.Global.Drive_UsedSpace
                        }
                    ];

                    var ctx = $('#chart')[0].getContext("2d");
                    var doughnut1 = new Chart(ctx).Doughnut(doughnutData, { responsive: true, scaleLabel: "<%=value%>GB" });
                } else {
                    freeSpaceInfo.addClass('alert-warning').text(response.Message);
                }
            }
        );
    }

    private backupDatabase(table: kTable.kTable<Baxter.Models.Backup>) {
        var backuppingScreen = new Modal.LoadingScreen(Resources.Global.Backup_InProgress);
        backuppingScreen.open();

        submitData('/Backup/BackupNow', {}, function (response) {
            table.reload();
            backuppingScreen.close();

            if (response.Result == 'OK') {
                Modal.Utils.openSuccesModal(Resources.Global.Backup_Success);
            }
        });
    }

    private restoreDatabase(table: kTable.kTable<Baxter.Models.Backup>) {
        var rows = table.getSelectedRows();

        if (!Utilities.IsEmptyArray(rows, Resources.Global.Error_NoRowsSelected)) {
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_DANGER,
                title: Modal.Utils.createTitle(Resources.Global.General_Warning, 'fa-exclamation-triangle'),
                message: Resources.Global.Backup_RestoreWarning,
                buttons: [
                    {
                        label: Resources.Global.General_Yes,
                        cssClass: 'btn-danger',
                        action: function (dialog) {
                            var restoringScreen, backup;

                            restoringScreen = new Modal.LoadingScreen(Resources.Global.Backup_RestoreInProgress);
                            restoringScreen.open();

                            backup = kTable.Utilities.getRecordFromRow(rows[0]);
                            submitData('/Backup/Restore', backup, function (response: any) {
                                restoringScreen.close();

                                if (response.Result == 'OK') {
                                    Modal.Utils.openSuccesModal(Resources.Global.Backup_RestoreSuccess);
                                }
                            });

                            dialog.close();
                        }
                    },
                    {
                        label: Resources.Global.General_No,
                        action: function (dialog) {
                            dialog.close();
                        }
                    }
                ]
            });
        }
    }       
}