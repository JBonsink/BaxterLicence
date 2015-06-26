using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using TypeLite;

using Baxter.Attributes;

namespace Baxter.Constants
{
    public static class AppSettings
    {
        public static string Name = "BaxterBase";
        public static string Version = "APP_VERSION";
        public static string Copyright = "© 2015 Baxter Utrecht";
        public static string Icon = "ICON_URL";        
        public static Url DefaultPage = new Url("Home", "Index");
        public static string DefaultStyle = "default";
    }

    public class Url
    {
        public Url(string c, string a) 
        {
            controller = c;
            action = a;
        } 
        
        public string Controller { get { return controller; } }
        public string Action { get { return action; } }

        private string controller;
        private string action;
    }

    [TsEnum]
    public enum AppLogType
    {
        [LocalizedDescription("General_Info")]
        Information = 0,
        [LocalizedDescription("General_Warning")]
        Warning = 1,
        [LocalizedDescription("General_Error")]
        Error = 2,
        [LocalizedDescription("General_Success")]
        Success = 3
    }

    [TsEnum]
    public enum AppLogMessage
    {
        [LocalizedDescription("Backup_Success")]
        BackupSuccess,
        [LocalizedDescription("Backup_Failed")]
        BackupFailed,
        [LocalizedDescription("Backup_Deleted")]
        BackupDeleted,
        [LocalizedDescription("Backup_FailedDisk")]
        BackupFailedDisk,
        [LocalizedDescription("Backup_FailedNetwork")]
        BackupFailedNetwork,
        [LocalizedDescription("Backup_RestoreFailed")]
        RestoreFailed
    }      
}