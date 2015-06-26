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

using Baxter.Models;
using Baxter.Attributes;
using Baxter.Utilities;
using Baxter.Constants;

namespace Baxter.Controllers
{
    public class AccountController : BaseController
    {
        [HttpGet]
        public ActionResult Login(bool accessDenied = false)
        {
            if (accessDenied) ViewBag.ErrorMessage = Resources.Global.General_AccessDenied;
            return View();
        }

        [HttpPost, AllowAnonymous, ValidateAntiForgeryToken]
        public ActionResult Login(UserLoginModel user, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var userProfile = base.db.Users.FirstOrDefault(u => u.Name == user.Name);

                    if (userProfile != null)
                    {
                        string hash = General.HashString(user.Password + userProfile.Salt.ToString());

                        if (hash == userProfile.Password)
                        {
                            if (SetAuthCookie(userProfile, user.RememberMe))
                            {
                                return RedirectToLocal(returnUrl);
                            }
                        }
                    }
                    ModelState.AddModelError("", Resources.Global.Account_Login_LoginFailed);
                }
                catch (System.Data.SqlClient.SqlException e)
                {
                    return View("Error", new ErrorModel() { Message = e.Message, StackTrace = e.StackTrace });
                }
                catch (Exception e)
                {
                    return View("Error", new ErrorModel() { Message = e.Message, StackTrace = e.StackTrace });
                }
            }
            return View(user);
        }

        [HttpGet, Authorize]
        public ActionResult Manage(ManageMessageId? message)
        {
            ViewBag.StatusMessage = message == ManageMessageId.ChangePasswordSuccess ? Resources.Global.General_ChangesSuccessfullySaved : "";

            ViewBag.ReturnUrl = Url.Action("Manage");
            return View();
        }

        [HttpPost, ValidateAntiForgeryToken, Authorize]
        public ActionResult Manage(UserUpdatePasswordModel model)
        {
            if (ModelState.IsValid)
            {
                var userProfile = base.db.Users.FirstOrDefault(u => u.Name == User.Identity.Name);

                if (userProfile != null)
                {
                    var hash = General.HashString(model.CurrentPassword + userProfile.Salt.ToString());

                    if (hash == userProfile.Password)
                    {
                        hash = General.HashString(model.NewPassword + userProfile.Salt.ToString());
                        userProfile.Password = hash;

                        db.Entry(userProfile).State = EntityState.Modified;
                        db.SaveChanges();

                        return RedirectToAction("Manage", new { Message = ManageMessageId.ChangePasswordSuccess });
                    }
                }
                ModelState.AddModelError("", Resources.Global.Account_Login_LoginFailed);
            }
            return View(model);
        }

        [HttpPost, Authorize]
        public ActionResult LogOff()
        {
            try
            {
                FormsAuthentication.SignOut();
            }
            catch { }
            return RedirectToAction("Login", "Account");
        }


        #region Helpers

        private bool SetAuthCookie(User user, bool rememberMe)
        {
            var authTicket = new FormsAuthenticationTicket(
                1,
                user.Name,
                DateTime.Now,
                DateTime.Now.AddYears(1),
                rememberMe,
                user.ID.ToString()
                );

            if (authTicket != null)
            {
                var authCookie = new HttpCookie(FormsAuthentication.FormsCookieName, FormsAuthentication.Encrypt(authTicket));
                authCookie.Expires = DateTime.Now.AddYears(1);

                HttpContext.Response.Cookies.Add(authCookie);
                return true;
            }
            return false;
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return RedirectToAction(AppSettings.DefaultPage.Action, AppSettings.DefaultPage.Controller);
            }
        }

        public enum ManageMessageId
        {
            ChangePasswordSuccess,
            SetPasswordSuccess,
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}