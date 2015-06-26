using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Globalization;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;

using Newtonsoft.Json.Web;

using Baxter.Utilities;
using Baxter.Contexts;
using Baxter.Models;
using Baxter.Constants;
using Baxter.Attributes;
using Baxter.Extensions;

namespace Baxter.Controllers
{
    public abstract class BaseController : BaseController<BaxterContext> { }

    public abstract class BaseController<T> : Controller where T : DbContext, new()
    {
        protected T db = new T();
        protected User user;

        public BaseController()
        {
            user = GetLoggedUser();
        }

        public string GetUserStyle()
        {
            var url = String.Format("~/Content/themes/bootstrap.{0}.less", AppSettings.DefaultStyle);

            if (Request.Cookies["style"] != null)
            {
                var cookieValue = Request.Cookies["style"].Value;
                if (!string.IsNullOrEmpty(cookieValue))
                {
                    var map = (Dictionary<string, object>)fastJSON.JSON.Parse(cookieValue);

                    if (user != null && map.ContainsKey(user.Name))
                        url = String.Format("~/Content/themes/bootstrap.{0}.less", (string)map[user.Name]);
                }
            }
            return Url.Content(url);
        }

        public bool HasPermission(FunctionName function, Permission permission)
        {
            return GetLevel(function) >= (int)permission;
        }

        protected bool HasPermission(Type t, Permission permission)
        {
            try { return HasPermission(GetFunctionName(t), permission); }
            catch { }

            return GetLevel(t.Name) >= (int)permission;
        }

        /* This function is called before a controller starts handling a request.
         * The current language setting will first be read from the url, else from
         * a cookie or otherwise from the browser settings.
         */
        protected override void Initialize(RequestContext requestContext)
        {
            if (requestContext != null) base.Initialize(requestContext);

            try
            {
                var cookie = HttpContext.Request.Cookies["AcademicPlan.MvcLocalization.CurrentUICulture"];

                if (cookie != null)
                {
                    language = cookie.Value;
                }

                var culture = CultureInfo.CreateSpecificCulture(language);
                Thread.CurrentThread.CurrentUICulture = culture;
                Thread.CurrentThread.CurrentCulture = culture;
            }
            catch { }
        }

        protected JsonNetResult Success(object data)
        {
            return new Response(data).Serialize();
        }

        protected JsonNetResult Error(Exception ex)
        {
            return new Response(false, ex.Message + '\n' + ex.StackTrace).Serialize();
        }
        protected JsonNetResult ErrorWithString(Exception ex)
        {
            return new Response(false, ex.Message + '\n' + ex.StackTrace).Serialize();
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

        private User GetLoggedUser()
        {
            int userID = 0;
            if (FormsAuthentication.CookiesSupported == true)
            {
                var cookie = System.Web.HttpContext.Current.Request.Cookies[FormsAuthentication.FormsCookieName];
                if (cookie != null)
                {
                    try
                    {
                        userID = int.Parse(FormsAuthentication.Decrypt(cookie.Value).UserData);
                        return db.Set<User>().AsNoTracking().Include(u => u.Role).FirstOrDefault(u => u.ID == userID);
                    }
                    catch (Exception)
                    {
                        using (var context = new BaxterContext())
                        {
                            return context.Users.Include(u => u.Role).FirstOrDefault(u => u.ID == userID);
                        }
                    }
                }
            }
            return null;
        }

        private int GetLevel(string name)
        {
            if (user != null)
            {
                var property = typeof(Role).GetProperty(name + "Access");
                if (property == null) return 0;

                return (int)property.GetValue(user.Role, null);
            }
            return 0;
        }

        private int GetLevel(FunctionName function)
        {
            return GetLevel(function.ToString());
        }

        private FunctionName GetFunctionName(Type t)
        {
            PermissionGroupAttribute attr = t.GetAttribute<PermissionGroupAttribute>();
            return (attr != null) ? attr.Group : (FunctionName)Enum.Parse(typeof(FunctionName), t.Name);
        }

        private string language = Languages.Dutch;
    }
}