using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Baxter.Attributes;
using Baxter.Constants;
using Baxter.Models;

namespace Baxter.Controllers.Baxter
{
    public class ImageController : GenericController<Image>
    {
        [HttpGet]
        public FileContentResult GetImage(int id)
        {
            Image img = repo.GetByID(id);
            return img != null ? File(img.Data, "image/jpeg") : null;
        }
	}
}