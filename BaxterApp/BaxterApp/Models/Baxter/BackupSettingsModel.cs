using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

using TypeLite;

using Baxter.Attributes;
using Baxter.Constants;

namespace Baxter.Models
{    
    [Table("BackupSettings"), PermissionGroup(FunctionName.Maintenance), TsClass()]
    public class BackupSettings
    {
        public int ID { get; set; }

        [LocalizedDescription("Backup_Schedule")]
        public int BackupSchedule { get; set; }
        [LocalizedDescription("Backup_MinFreeSpace")]
        public int MinFreeSpaceGB { get; set; }
        [LocalizedDescription("Backup_TTL")]
        public int BackupTTLWeeks { get; set; }
        [Required, LocalizedDescription("General_Time")]
        public string Time { get; set; }
        [Required, LocalizedDescription("General_Location")]
        public string BackupPath { get; set; }
        
        [LocalizedDescription("Backup_NetworkShare")]
        public string NetworkShare { get; set; }
        [LocalizedDescription("Backup_NetworkUsername")]
        public string NetworkUsername { get; set; }
        [LocalizedDescription("Backup_NetworkPassword")]
        public string NetworkPassword { get; set; }
    }
}