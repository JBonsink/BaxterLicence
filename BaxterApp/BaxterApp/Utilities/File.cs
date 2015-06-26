using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Web;
using System.IO;
using System.IO.Compression;

using PdfPrintingNet;

namespace Baxter.Utilities
{
    public static class FileUtility
    {
        public static void Delete(string fileName, string location = "Uploads")
        {
            var path = HttpRuntime.AppDomainAppPath + location + "/" + fileName;
            System.IO.File.Delete(path);
        }

        public static void WriteToFile(string fileName, byte[] buffer, string location = "Uploads")
        {
            var path = HttpRuntime.AppDomainAppPath + location + "/" + fileName;
            var file = new System.IO.FileStream(path, System.IO.FileMode.Create);

            file.Write(buffer, 0, buffer.Length);
            file.Close();
        }

        public static byte[] Zip(List<Tuple<string, byte[]>> files)
        {
            using (var compressedFileStream = new MemoryStream())
            {
                //Create an archive and store the stream in memory.
                using (var zipArchive = new ZipArchive(compressedFileStream, ZipArchiveMode.Update, false))
                {
                    foreach (var file in files)
                    {
                        //Create a zip entry for each attachment
                        var zipEntry = zipArchive.CreateEntry(file.Item1);

                        //Get the stream of the attachment
                        using (var originalFileStream = new MemoryStream(file.Item2))
                        {
                            using (var zipEntryStream = zipEntry.Open())
                            {
                                //Copy the attachment stream to the zip entry stream
                                originalFileStream.CopyTo(zipEntryStream);
                            }
                        }
                    }
                }
                return compressedFileStream.ToArray();
            }
        }

        public static void Print(string printerName, PaperSize paperSize, byte[] data, bool landscape = false)
        {
            var printLib = new PdfPrint("Yoolis ICT Services", "5d565355345b555627535a5f335c52");

            printLib.IsLandscape = landscape;
            printLib.PaperSize = paperSize;
            printLib.Scale = PdfPrint.ScaleTypes.None;
            printLib.PrinterName = printerName;

            printLib.Print(data);
        }
    }
}