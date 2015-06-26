using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

using Newtonsoft.Json;
using TypeLite;

using Baxter.Attributes;
using Baxter.Constants;
using Baxter.Models.JTable;

namespace Baxter.Models
{       
    [Table("Roles"), TsClass]
    public class Role
    {
        public int ID { get; set; }

        [Required, LocalizedDescription("General_Name"), StringLength(250), EntityLogName, UniqueString]
        public string Name { get; set; }

        [LocalizedDescription("General_Logs"), Range(0, 4), JtableVisibility(JTableVisibility.Hidden)]
        public Permission LogAccess { get; set; }

        [LocalizedDescription("General_Roles"), Range(0, 4), JtableVisibility(JTableVisibility.Hidden)]
        public Permission RoleAccess { get; set; }

        [LocalizedDescription("General_Users"), Range(0,4), JtableVisibility(JTableVisibility.Hidden)]
        public Permission UserAccess { get; set; }                

        [LocalizedDescription("General_Settings"), Range(0,4), JtableVisibility(JTableVisibility.Hidden)]
        public Permission SettingsAccess { get; set; }

        [LocalizedDescription("General_Maintenance"), Range(0, 4), JtableVisibility(JTableVisibility.Hidden)]
        public Permission MaintenanceAccess { get; set; }                

        public virtual ICollection<User> Users { get; set; }
    }          
}