using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Baxter.Controllers.Baxter
{
    public class TestVController : Controller
    {
        // GET: TestV
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult TestView()
        {
            return View();
        }
    }
}