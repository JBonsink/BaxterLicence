using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;
using System.Web.Mvc;

using Newtonsoft.Json.Web;

using Baxter.Models;
using Baxter.Models.JTable;
using Baxter.Attributes;
using Baxter.Constants;
using Baxter.Utilities;

namespace Baxter.Controllers.Baxter
{
    public class DriveController : GenericController<Drive>
    {
        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.View)]
        public JsonNetResult GetLocalDrives()
        {            
            var list = DriveInfo.GetDrives().ToList();
            var drives = new List<Drive>(list.Count + 1);

            foreach (DriveInfo d in list)
            {
                if (d.IsReady == true)
                {
                    drives.Add(new Drive()
                    {
                        Name = d.Name,
                        VolumeLabel = d.VolumeLabel,
                        FreeSpace = General.BytesToGigaBytes((ulong)d.AvailableFreeSpace),
                        TotalSpace = General.BytesToGigaBytes((ulong)d.TotalSize)
                    });
                }
            }
            
            return JsonNet.JsonOKRecords(drives, drives.Count());            
        }

        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.View)]
        public JsonNetResult GetDriveInfo(string path)
        {
            bool success;
            ulong freeBytes, totalBytes, totalFreeBytes;

            success = GetDiskFreeSpaceEx(path, out freeBytes,
                out totalBytes, out totalFreeBytes);

            if (success) return JsonNet.JsonOKRecord(new Drive()
            {
                FreeSpace = General.BytesToGigaBytes(freeBytes),
                TotalSpace = General.BytesToGigaBytes(totalBytes),
                Name = path,
                VolumeLabel = path
            });
            else return JsonNet.JsonError("Could not get drive info");
        }

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool GetDiskFreeSpaceEx(string lpDirectoryName, out ulong lpFreeBytesAvailable,
            out ulong lpTotalNumberOfBytes, out ulong lpTotalNumberOfFreeBytes);
    }
}