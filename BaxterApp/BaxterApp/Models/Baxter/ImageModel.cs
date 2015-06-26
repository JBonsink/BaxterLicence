using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

using Newtonsoft.Json;

using Baxter.Attributes;

namespace Baxter.Models
{
    [Table("Images")]
    public class Image
    {
        public int ID { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        [StringLength(128), LocalizedDescription("Image_Format")]
        public string ContentType { get; set; }
        [StringLength(250), LocalizedDescription("Image_Filename")]
        public string Filename { get; set; }
        public byte[] Data { get; set; }
    }
}