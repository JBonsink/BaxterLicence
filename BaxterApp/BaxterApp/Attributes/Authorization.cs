using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

using Baxter.Contexts;
using Baxter.Constants;
using Baxter.Utilities;

namespace Baxter.Attributes
{
    public class AuthorizeFunctionAttribute : AuthorizeAttribute
    {
        private readonly Permission permission;
        private readonly FunctionName function;

        public AuthorizeFunctionAttribute(FunctionName function, Permission permission)
        {
            this.function = function;
            this.permission = permission;
        }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            var isAuthorized = base.AuthorizeCore(httpContext);
            if (!isAuthorized)
                return false;

            return HasPermission(function, permission);
        }

        private bool HasPermission(FunctionName function, Permission permission)
        {
            return GetLevel(function.ToString()) >= (int)permission;
        }

        private int GetLevel(string functionName)
        {
            if (FormsAuthentication.CookiesSupported == true)
            {
                var cookie = System.Web.HttpContext.Current.Request.Cookies[FormsAuthentication.FormsCookieName];
                if (cookie != null)
                {
                    try
                    {
                        using (var db = new BaxterContext())
                        {
                            var userID = int.Parse(FormsAuthentication.Decrypt(cookie.Value).UserData);
                            var role = db.Users.AsNoTracking().Where(u => u.ID == userID).Select(u => u.Role).FirstOrDefault();

                            if (role != null)
                            {
                                var property = typeof(Baxter.Models.Role).GetProperty(functionName + "Access");
                                if (property == null) return 0;

                                return (int)property.GetValue(role, null);
                            }
                            return 0;
                        }
                    }
                    catch (Exception)
                    {
                        return 0;
                    }
                }
            }
            return 0;
        }
    }
}