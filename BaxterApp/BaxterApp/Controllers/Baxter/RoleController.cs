using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Reflection;
using System.Resources;

using Newtonsoft.Json.Web;

using Baxter.Attributes;
using Baxter.Constants;
using Baxter.Models.JTable;
using Baxter.Models;
using Baxter.Repositories;
using Baxter.Utilities;

namespace Baxter.Controllers
{        
    public class RoleController : GenericController<Role>
    {
        [HttpPost, AuthorizeFunction(FunctionName.Role, Permission.View)]
        public JsonNetResult GetPermissionOptions()
        {
            try
            {    
                return JsonNet.JsonOKOptions(JtableUtil.GetOptions<Permission>());
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        [HttpPost, AuthorizeFunction(FunctionName.User, Permission.Delete)]
        public override JsonNetResult Delete(List<int> IDs)
        {
            if (db.Users.Any(u => IDs.Contains(u.RoleID))) return JsonNet.JsonError(Resources.Global.Error_UserWithDeletedRole);
            return base.Delete(IDs);
        }

        [HttpPost, AuthorizeFunction(FunctionName.User, Permission.View)]
        public JsonNetResult GetRoleOptions()
        {
            try
            {
                var roles = repo.OrderBy(r => r.Name)
                    .Select(r => new JTableOption
                    {
                        DisplayText = r.Name,
                        Value = r.ID 
                    });

                if (roles.Count() > 0) return JsonNet.JsonOKOptions(roles);

                return JsonNet.JsonNoOptions(StringFormatters.NotAvailable(Resources.Global.General_Roles.ToLower()));
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }                               
    }
}