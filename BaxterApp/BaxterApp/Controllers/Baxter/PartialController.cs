using System.Web.Mvc;
using System.Reflection;

using Baxter.Constants;
using Baxter.Models;
using Baxter.Utilities;
using Baxter.Attributes;

namespace Baxter.Controllers
{
    public class PartialController : BaseController
    {
        [ChildActionOnly]
        public ActionResult MainMenu()
        {
            var properties = typeof(Role).GetProperties();

            foreach (PropertyInfo pi in properties)
            {
                if (pi.Name.EndsWith("Access"))
                {
                    string name = "View" + pi.Name.Substring(0, pi.Name.LastIndexOf("Access"));
                    bool value = (user == null) ? false : (int)pi.GetValue(user.Role) >= (int)Permission.View;
                    ViewData.Add(name, value);
                }
            }

            return View();
        }

        [ChildActionOnly]
        public ActionResult ValidationEngineLanguage()
        {
            ViewBag.Lang = General.GetCurrentLang();
            return View();
        }
    }
}
