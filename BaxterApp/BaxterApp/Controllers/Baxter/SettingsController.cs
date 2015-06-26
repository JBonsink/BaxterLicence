using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace Baxter.Controllers.Baxter
{
    public class SettingsController : Controller
    {
        public ActionResult Culture(string culture)
        {
            try
            {
                Thread.CurrentThread.CurrentUICulture = CultureInfo.CreateSpecificCulture(culture);

                var cookie = new HttpCookie("AcademicPlan.MvcLocalization.CurrentUICulture", Thread.CurrentThread.CurrentUICulture.Name);
                cookie.Expires = DateTime.Now.AddYears(1);
                HttpContext.Response.SetCookie(cookie);
            }
            catch { }

            return Redirect(Request.UrlReferrer.ToString());
        }
    }
}