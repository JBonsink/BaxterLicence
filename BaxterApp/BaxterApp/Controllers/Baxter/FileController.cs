using System;
using System.Collections.Generic;
using System.Linq;
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

namespace Baxter.Controllers.Baxter
{
    public class FileController : GenericController<FileModel>
    {
        [HttpPost, AuthorizeFunction(FunctionName.Settings, Permission.Create)]
        public JsonNetResult UploadFile(HttpPostedFileBase fileData, string entity)
        {
            try
            {
                if (fileData.ContentLength > 0)
                {
                    var file = JsonConvert.DeserializeObject<FileModel>(entity);
                    file.Name = System.IO.Path.GetFileName(fileData.FileName);

                    if (!db.Files.Any(f => f.Name.Equals(file.Name)))
                    {                       
                        var buffer = new byte[fileData.ContentLength];
                        fileData.InputStream.Read(buffer, 0, fileData.ContentLength);
                        Utilities.FileUtility.WriteToFile(file.Name, buffer);

                        db.Files.Add(file);
                        db.SaveChanges();

                        return JsonNet.JsonOKRecord(file);
                    }
                    else
                    {
                        return JsonNet.JsonError(String.Format(Resources.Global.Error_FileAlreadyExists, file.Name));
                    }                 
                }
                else
                {
                    return JsonNet.JsonError(Resources.Global.Error_UploadFailed);
                }
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        public override JsonNetResult Delete(List<int> IDs)
        {
            try
            {
                foreach (var ID in IDs)
                {
                    var file = repo.GetByID(ID);
                    Utilities.FileUtility.Delete(file.Name);
                }
                return base.Delete(IDs);
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }                    
        }

        [HttpPost, FileDownload]
        public FilePathResult DownloadFile(string fileName, string fileType)
        {
            var path = HttpRuntime.AppDomainAppPath + "Uploads//" + fileName;
            return File(path, fileType, fileName);
        }              
	}
}