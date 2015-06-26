using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Baxter.Models;

namespace Baxter.Utilities
{
    public static class ImageUtility
    {
        public static byte[] GetBytesArrayFromFile(HttpPostedFileBase file)
        {
            var data = new byte[file.ContentLength];
            file.InputStream.Read(data, 0, file.ContentLength);
            return data;
        }

        public static Image GetImageFromFile(HttpPostedFileBase file)
        {
            /* Server side mime checking does not work with the current flash based Uploadify version.
            if (file.ContentType.Contains("image/"))
            {
                if (!(file.ContentType == "image/jpeg" || file.ContentType == "image/bmp"))
                    return JsonNet.JsonError(StringFormatters.UnsupportedImageFormat(file.ContentType));
            }
            else
            {
                return JsonNet.JsonError(StringFormatters.FileNotAnImage(file.ContentType));
            }
            */

            Image image = new Image();

            image.Data = new byte[file.ContentLength];
            image.ContentType = file.ContentType;
            image.Filename = file.FileName;
            file.InputStream.Read(image.Data, 0, file.ContentLength);
            using (var img = System.Drawing.Image.FromStream(file.InputStream))
            {
                image.Width = img.Width;
                image.Height = img.Height;
            }
            return image;
        }
    }
}