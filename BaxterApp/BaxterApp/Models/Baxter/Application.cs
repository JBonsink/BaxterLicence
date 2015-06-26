using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

using Baxter.Attributes;

namespace Baxter.Models
{
    [TypeLite.TsClass]
    public class Application
    {
        public int ID { get; set; }

        [StringLength(250), LocalizedDescription("General_Name")]
        public string Name { get; set; }
    }
}