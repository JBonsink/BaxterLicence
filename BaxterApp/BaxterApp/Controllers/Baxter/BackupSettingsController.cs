using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Newtonsoft.Json.Web;

using Baxter.Models;
using Baxter.Attributes;
using Baxter.Constants;
using Baxter.Utilities;

namespace Baxter.Controllers
{
    public class BackupSettingsController : GenericController<BackupSettings>
    {
        public BackupSettingsController() : base()
        {
            RemoveAction(Action.Create);            
            RemoveAction(Action.Delete);            
        }

        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.View)]
        public JsonNetResult Get()
        {
            var settings = db.BackupSettings.FirstOrDefault();
            return JsonNet.JsonObject(settings);
        }

        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.Edit)]
        public override JsonNetResult Edit(BackupSettings settings)
        {
            if (!String.IsNullOrEmpty(settings.BackupPath))
            {
                settings.BackupPath.Replace('/', '\\');
                if (settings.BackupPath.Last() != '\\') settings.BackupPath += '\\';
            }
            if (!String.IsNullOrEmpty(settings.NetworkShare))
            {
                settings.NetworkShare.Replace('/', '\\');
            }
            
            return base.Edit(settings);
        }               
 
        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.View)]
        public JsonNetResult TestNetworkSettings(BackupSettings settings)
        {
            if (DirectoryUtility.IsPathAvailable(settings.NetworkShare, settings.NetworkUsername, settings.NetworkPassword))
            {
                return JsonNet.JsonOK();
            }
            else
            {
                return JsonNet.JsonError(Resources.Global.Backup_TestFailed);
            }
        }
    }
}