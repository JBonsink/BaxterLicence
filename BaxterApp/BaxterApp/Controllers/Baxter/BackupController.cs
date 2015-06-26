using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Newtonsoft.Json.Web;

using Baxter.Models;
using Baxter.Utilities;
using Baxter.Attributes;
using Baxter.Constants;

namespace Baxter.Controllers.Baxter
{
    public class BackupController : GenericController<Backup>
    {
        public BackupController() : base()
        {
            RemoveAction(Action.Create);
            RemoveAction(Action.Edit);            
        }

        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.Delete)]
        public override JsonNetResult Delete(List<int> IDs)
        {
            var backups = repo.Where(b => IDs.Contains(b.ID));

            foreach (var backup in backups)
            {
                if (System.IO.File.Exists(backup.Path)) System.IO.File.Delete(backup.Path); 
            }                

            return base.Delete(IDs);
        }

        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.Edit)]
        public JsonNetResult BackupNow()
        {                        
            if (BackupRoutine.SingleBackup()) return JsonNet.JsonOK();
            
            return JsonNet.JsonError(Resources.Global.Backup_Failed);
        }

        [HttpPost, AuthorizeFunction(FunctionName.Maintenance, Permission.Edit)]
        public JsonNetResult Restore(Backup backup)
        {
            if (BackupRoutine.Restore(backup)) return JsonNet.JsonOK();

            return JsonNet.JsonError(Resources.Global.Backup_RestoreFailed);
        }
    }
}