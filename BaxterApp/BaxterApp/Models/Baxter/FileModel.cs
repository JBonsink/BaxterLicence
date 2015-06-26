using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

using Newtonsoft.Json;

using Baxter.Attributes;
using Baxter.Constants;

namespace Baxter.Models
{
    [Table("Files"), PermissionGroup(FunctionName.Settings)]
    public class FileModel
    {
        public int ID { get; set; }

        [JtableHide, LocalizedDescription("General_Name")]
        public string Name { get; set; }
        
        [LocalizedDescription("Opiate_Location")]
        public string Location { get; set; }
        [LocalizedDescription("Drug_ExpirationDate"), JtableDateFormat("dd-MM-yyyy")]
        public DateTime? ExperiationDate { get; set; }

        [JtableHide]
        public Module ModuleID { get; set; }
        [JtableHide]
        public int EntityID { get; set; }
    }
}