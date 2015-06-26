/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/ktable/ktable.d.ts" />
/// <reference path="../languages/Global.d.ts" />
/// <reference path="../typings/chart/chart.d.ts" />

interface HTMLElement {
    getContext(mode: string);
}

class DriveView {
    constructor() {
        $(() => {
            var roleTable = $('#drives');
             
            downloadObjects('Drive/GetLocalDrives').done(function (response: any) {
                var drives = response.Records;

                $.each(drives, function (i, drive) {
                    drive.Status = Resources.Global.Disk_FreeGB(drive.FreeSpace, drive.TotalSpace);                   
                });
                rivets.bind($('#drives'), response)

                $.each(drives, function (i, drive) {
                    var doughnutData = [
                        {
                            value: drive.FreeSpace,
                            color: "#EEEEEE",
                            highlight: "#F1F1F1",
                            label: Resources.Global.Drive_FreeSpace
                        },
                        {
                            value: drive.TotalSpace - drive.FreeSpace,
                            color: "#26A0DA",
                            highlight: "#77D3FF",
                            label: Resources.Global.Drive_UsedSpace
                        }
                    ];

                    var ctx = $('#' + i)[0].getContext("2d");
                    var doughnut1 = new Chart(ctx).Doughnut(doughnutData, { responsive: true, scaleLabel: "<%=value%>GB" });
                });
            });        
        });
    }
}