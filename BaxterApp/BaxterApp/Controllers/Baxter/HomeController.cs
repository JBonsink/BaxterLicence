using System;
using System.Web;
using System.Web.Mvc;

namespace Baxter.Controllers
{
    public class HomeController : BaseController
    {                
        [Authorize, HttpGet]
        public ActionResult Index()
        {               
            return View();
        }
    }
}
