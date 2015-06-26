using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using System.Data.Entity.Validation;
using System.Diagnostics;

using Microsoft.Win32;

using PdfSharp;
using PdfSharp.Pdf;
using PdfSharp.Drawing;
using PdfSharp.Pdf.Printing;

using PdfPrintingNet;
using System.Drawing.Printing;
using System.Runtime.InteropServices;

using Baxter.Constants;
using Baxter.Contexts;
using Baxter.Repositories;
using Baxter.Models;
using Baxter.Attributes;
using Baxter.Utilities;
using Newtonsoft.Json.Web;


namespace Baxter.Controllers.Baxter
{
    public class PrintController : BaseController
    {           
        public PrintController()
        {    
        }

        private FileContentResult PdfFile(PdfDocument document, string filename)
        {
            byte[] data;

            var stream = new System.IO.MemoryStream();
            {
                document.Save(stream, false);
                data = stream.ToArray();
                stream.Close();
            }

            return File(data, "application/pdf", filename);
        }
    }
}
