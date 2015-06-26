
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;

using Newtonsoft.Json.Web;
using Newtonsoft.Json;

using Baxter.Attributes;
using Baxter.Constants;
using Baxter.Models.JTable;
using Baxter.Models;
using Baxter.Repositories;
using Baxter.Utilities;

namespace Baxter.Controllers
{
    public class UserController : GenericController<User>
    {        
        public UserController()
        {            
        }

        [HttpPost, AuthorizeFunction(FunctionName.User, Permission.Create)]
        public override JsonNetResult Create(User user)
        {
            try
            {
                return CreateUser(user);
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        [HttpPost, AuthorizeFunction(FunctionName.User, Permission.Edit)]
        public override JsonNetResult Edit(User user)
        {
            try
            {
                return EditUser(user);
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        [HttpGet, AuthorizeFunction(FunctionName.User, Permission.View)]
        public JsonNetResult GetUserSuggestions(string _queryString)
        {
            var query = repo.AsQueryable();

            if (!string.IsNullOrEmpty(_queryString)) query = query.Where(u => u.Name.StartsWith(_queryString));

            var list = query
                .OrderBy(u => u.Name)
                .Select(u => new JTableOption
                {
                    DisplayText = u.Name,
                    Value = u.ID
                }).ToList();
            return JsonNet.JsonObject(list);
        }

        private JsonNetResult CreateUser(User user)
        {
            try
            {
                string prop = null;
                ModelState.Remove("Password");
                if (!ModelState.IsValid) return JsonNet.JsonError(Resources.Global.General_ReceivedInvalidData);
                if (!IsUnique(user, ref prop)) return JsonNet.JsonError(String.Format(Resources.Global.General_PropertyIsNotUnique, prop));

                user.Salt = Guid.NewGuid().ToString();
                string hash = Utilities.General.HashString(user.NewPassword + user.Salt);
                user.Password = hash;

                repo.Add(user);
                repo.Save();
                return JsonNet.JsonOKRecord(user);
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        private JsonNetResult EditUser(User user)
        {
            try
            {
                string prop = null;

                ModelState.Remove("Password");

                if (!ModelState.IsValid) return JsonNet.JsonError(Resources.Global.General_ReceivedInvalidData);
                if (!IsUnique(user, ref prop, true)) return JsonNet.JsonError(String.Format(Resources.Global.General_PropertyIsNotUnique, prop));

                var oldUser = base.db.Users.AsNoTracking().Where(u => u.ID == user.ID).First();
                user.Password = oldUser.Password;
                user.Salt = oldUser.Salt;

                if (!String.IsNullOrEmpty(user.EditPassword))
                {
                    string hash = Utilities.General.HashString(user.EditPassword + user.Salt);
                    user.Password = hash;
                }
                else user.EditPassword = null;

                // Prevent validation errors
                user.NewPassword = "123456";

                repo.Edit(user);
                repo.Save();

                return JsonNet.JsonOKRecord(user);
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }
    }
}