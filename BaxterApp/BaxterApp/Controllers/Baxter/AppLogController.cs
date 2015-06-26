using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Newtonsoft.Json.Web;

using Baxter.Models;
using Baxter.Attributes;
using Baxter.Constants;
using Baxter.Utilities;

namespace Baxter.Controllers.Baxter
{
    public class AppLogController : GenericController<AppLog>
    {
        public AppLogController()
        {
            RemoveAction(Action.Create);
            RemoveAction(Action.Edit);
            RemoveAction(Action.Delete);
        }

        [HttpGet, AuthorizeFunction(FunctionName.Maintenance, Permission.View)]
        public override ActionResult Index()
        {
            return Authorize();
        }

        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.View)]
        public JsonNetResult GetAppLogMessageOptions()
        {
            try
            {
                return JsonNet.JsonOKOptions(JtableUtil.GetOptions<AppLogMessage>());
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.View)]
        public JsonNetResult GetAppLogTypeOptions()
        {
            try
            {
                return JsonNet.JsonOKOptions(JtableUtil.GetOptions<AppLogType>());
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        public JsonNetResult GetBackupStatus()
        {
            var log = db.AppLogs.AsNoTracking().Where(l => l.Module == Module.Backup).OrderByDescending(l => l.ID).FirstOrDefault();            
            return (log != null && log.Type != AppLogType.Success) ? JsonNet.JsonError(string.Empty) : JsonNet.JsonOK();
        }

        public JsonNetResult GetAppHealth()
        {
            if (db.AppLogs.Any(l => l.Seen == false && l.Type == AppLogType.Error || l.Type == AppLogType.Warning))
                return JsonNet.JsonError(string.Empty);

            return JsonNet.JsonOK();
        }
    }
}