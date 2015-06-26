using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Baxter.Utilities
{
    public static class StringFormatters
    {
        public static string FailedToRegister(string entity)
        {
            return string.Format(Resources.Global.General_FailedToRegisterEntity, entity);
        }

        public static string AlreadyExists(string entity)
        {
            return string.Format(Resources.Global.General_EntityAlreadyExists, entity);
        }

        public static string Unkown(string entity)
        {
            return string.Format(Resources.Global.General_UnkownEntity, entity);
        }

        public static string NotAvailable(string entity)
        {
            return string.Format(Resources.Global.General_ThereArentAnyAvailableYet, entity);
        }

        public static string Select(string entity)
        {
            return string.Format(Resources.Global.General_SelectEntity, entity);
        }

        public static string All(string entities)
        {
            return string.Format(Resources.Global.General_AllEntities, entities);
        }

        public static string Available(string entities)
        {
            return string.Format(Resources.Global.General_AvailableEntities, entities);
        }

        public static string FileNotAnImage(string wrongFileType)
        {
            return string.Format(Resources.Global.General_FileNotAnImage, wrongFileType);
        }

        public static string UnsupportedImageFormat(string format)
        {
            return string.Format(Resources.Global.General_UnsupportedImageFormat, format);
        }

        public static string AddNew(string entity)
        {
            return string.Format(Resources.Global.JTable_AddNew, entity);
        }

        public static string Edit(string entity)
        {
            return string.Format(Resources.Global.JTable_Edit, entity);
        }
        
        public static string HistoryOf(string entity)
        {
            return string.Format(Resources.Global.Log_HistoryOf, entity);
        }
    }
}