using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using TypeLite;

using Baxter.Attributes;

namespace Baxter.Models
{
    [PermissionGroup(Constants.FunctionName.Maintenance), TsClass]
    public class Drive
    {
        [LocalizedDescription("General_Name")]
        public string Name { get; set; }
        [LocalizedDescription("Drive_VolumeLabel")]
        public string VolumeLabel { get; set; }

        [LocalizedDescription("Drive_FreeSpace")]
        public float FreeSpace { get; set; }
        [LocalizedDescription("Drive_TotalSpace")]
        public float TotalSpace { get; set; }
    }
}