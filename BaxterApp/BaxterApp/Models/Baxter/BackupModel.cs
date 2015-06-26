using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

using Newtonsoft.Json;
using TypeLite;

using Baxter.Attributes;
using Baxter.Constants;

namespace Baxter.Models
{
    [Table("Backups"), PermissionGroup(FunctionName.Maintenance), TsClass]
    public class Backup
    {
        public int ID { get; set; }

        [LocalizedDescription("General_Name")]
        public string Name { get; set; }
        
        [JtableHide]
        public string Path { get; set; }
        [JtableDateFormat("dd-MM-yyyy"), LocalizedDescription("General_Date")]
        public DateTime Date { get; set; }                
    }
}