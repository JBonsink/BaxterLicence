using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.ComponentModel;

using Newtonsoft.Json;
using TypeLite;

using Baxter.Constants;
using Baxter.Attributes;
using Baxter.Models.JTable;

namespace Baxter.Models
{
    [PermissionGroup(FunctionName.Maintenance), TsClass]
    public class AppLog
    {
        public AppLog() { Date = DateTime.Now; }
        public AppLog(AppLogType type) : this() { Type = type; }

        public int ID { get; set; }

        [JtableNotListed]
        public AppLogType Type { get; set; }
        [LocalizedDescription("General_Message")]
        public AppLogMessage MessageID { get; set; }

        [LocalizedDescription("Log_Module")]
        public Module Module { get; set; }

        [LocalizedDescription("General_AdditionalInfo")]
        public string ExtraInfo { get; set; }

        [LocalizedDescription("General_Date"), JtableDateFormat("dd-MM-yyyy HH:mm")]
        public DateTime Date { get; set; }

        [LocalizedDescription("Log_Seen")]
        public bool Seen { get; set; }                
    }      
  
    public class AppLogError : AppLog
    {
        public AppLogError() : base(AppLogType.Error) { }
    }

    public class AppLogWarning : AppLog
    {
        public AppLogWarning() : base(AppLogType.Warning) { }
    }

    public class AppLogSuccess : AppLog
    {
        public AppLogSuccess() : base(AppLogType.Success) { }
    }

    public class AppLogInfo : AppLog
    {
        public AppLogInfo() : base(AppLogType.Information) { }
    }
}