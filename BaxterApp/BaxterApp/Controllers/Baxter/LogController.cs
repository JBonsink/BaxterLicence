using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;

using Newtonsoft.Json.Web;

using Baxter.Attributes;
using Baxter.Constants;
using Baxter.Models.JTable;
using Baxter.Models;
using Baxter.Utilities;
using Baxter.Repositories;

namespace Baxter.Controllers
{
    public class LogController : GenericController<Log>
    {
        public LogController()
        {
            RemoveAction(Action.Create);
            RemoveAction(Action.Edit);
            RemoveAction(Action.Delete);
        }

        protected override void PostListProc(List<Log> records)
        {
            LogUtilities.ParseLogs(records);
        }
                                              
        [HttpPost, AuthorizeFunction(FunctionName.Log, Permission.View)]
        public JsonNetResult GetActivityOptions()
        {
            try
            {
                return JsonNet.JsonOKOptions(JtableUtil.GetOptions<Activity>());
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        [HttpPost]
        public JsonNetResult GetModuleOptions()
        {
            try
            {                   
                return JsonNet.JsonOKOptions(JtableUtil.GetOptions<Module>());
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }                   
    }
}