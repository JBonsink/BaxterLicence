using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;
using System.Web.Mvc;
using System.Web;

using Newtonsoft.Json.Web;

using Baxter.Utilities;
using Baxter.Attributes;
using Baxter.Extensions;
using Baxter.Models.JTable;
using Baxter.Constants;

namespace Baxter.Utilities
{
    class UploadOptions
    {
        public UploadOptions()
        {
            uploadLimit = 1;
        }

        public string actionUrl { get; set; }
        public string fileType { get; set; }
        public int uploadLimit { get; set; }
    }

    class Field
    {
        public Field()
        {
            sorting = true;
            list = true;
            create = true;
            edit = true;
            hideTitle = false;           
        }
        
        public Field(PropertyInfo pi, string controllerName) : this()
        {
            options = GetOptionsUrl(pi, controllerName);
            type = String.IsNullOrEmpty(options) ? FieldType.GetType(pi) : JTableTypes.Dropdown;

            title = GetTitle(pi);
            inputClass = Validation.GetClass(pi);
            visibility = GetVisibility(pi);
            sorting = !pi.HasAttribute<JtableNoSortingAttribute>();
            dateFormat = GetDateFormat(pi);
            imageActionUrl = GetImageAction(pi);
            uploadOptions = Options.GetUploadOptions(pi);
            list = !type.Equals(JTableTypes.Hidden) && !pi.HasAttribute<JtableNotListedAttribute>();
            numberStepSize = (pi.IsType<float>() || pi.IsType<double>() || pi.IsType<float?>() || pi.IsType<double?>()) ? "0.01" : "";
        }

        public bool key { get; set; }
        public bool list { get; set; }
        public bool sorting { get; set; }
        public bool create { get; set; }
        public bool edit { get; set; }
        public bool inTableEdit { get; set; }
        public bool hideTitle { get; set; }

        public string title { get; set; }
        public string type { get; set; }
        public string numberStepSize { get; set; }
        public string visibility { get; set; }
        public string inputClass { get; set; }
        public string options { get; set; }
        public string dateFormat { get; set; }
        public string imageActionUrl { get; set; }
        public UploadOptions uploadOptions { get; set; }

        private string GetTitle(PropertyInfo pi)
        {
            var attributes = pi.GetCustomAttributes(typeof(DescriptionAttribute), false);
            return (attributes.Length > 0) ? ((DescriptionAttribute)attributes[0]).Description : "";
        }

        private string GetVisibility(PropertyInfo pi)
        {
            var attributes = pi.GetCustomAttributes(typeof(JtableVisibilityAttribute), false);
            return (attributes.Length > 0) ? ((JtableVisibilityAttribute)attributes[0]).Visibility : "";
        }

        private string GetOptionsUrl(PropertyInfo pi, string controllerName)
        {
            if (pi.PropertyType.IsEnum)
            {
                var url = new UrlHelper(HttpContext.Current.Request.RequestContext);
                string action = "Get" + pi.PropertyType.Name + "Options";

                return url.Action(action, controllerName);
            }

            return "";
        }

        private string GetDateFormat(PropertyInfo pi)
        {
            var attributes = pi.GetCustomAttributes(typeof(JtableDateFormatAttribute), false);
            return (attributes.Length > 0) ? ((JtableDateFormatAttribute)attributes[0]).Format : "";
        }

        private string GetImageAction(PropertyInfo pi)
        {
            var url = new UrlHelper(HttpContext.Current.Request.RequestContext);
            return (pi.HasAttribute<ImageAttribute>()) ? url.Action("GetImage", "Image") : "";
        }
    }

    public static class JtableUtil
    {
        public static JsonNetResult GetFields(Type modelType)
        {
            var fields = new Dictionary<String, Field>();
            
            foreach (var pi in modelType.GetProperties())
            {
                if (pi.GetMethod.IsVirtual || pi.HasAttribute<JtableSkipAttribute>()) continue;

                if (pi.Name.Equals("ID") || pi.HasAttribute<KeyAttribute>()) fields.Add(pi.Name, Key());
                else fields.Add(pi.Name, new Field(pi, modelType.Name));
            }

            return JsonNet.JsonObject(fields);
        }

        public static List<JTableOption> GetOptions<T>()
        {
            if (!typeof(T).IsEnum) return null;

            var options = new List<JTableOption>();
            foreach (T val in Enum.GetValues(typeof(T)))
            {
                options.Add(new JTableOption()
                {
                    DisplayText = val.GetDescription(),
                    Value = Convert.ToInt32(val)
                });
            }
            return options;
        }

        private static Field Key()
        {
            return new Field()
            {
                key = true,
                list = false,
                create = false,
            };
        }
    }     
   
    static class Validation
    {
        public static string GetClass(PropertyInfo pi)
        {
            string options = "";

            IsRequired(pi, ref options);
            StringLength(pi, ref options);
            IsInteger(pi, ref options);
            Range(pi, ref options);
            IsIP4Adress(pi, ref options);
            IsEmail(pi, ref options);
            Equals(pi, ref options);

            return string.Format("validate[{0}]", options);
        }

        private static void Equals(PropertyInfo pi, ref string options)
        {
            if (pi.HasAttribute<JtableEqualsAttribute>())
            {
                var field = pi.GetAttribute<JtableEqualsAttribute>().Field;
                options += String.Format("equals[{0}], ", field);
            }
        }

        private static void IsRequired(PropertyInfo pi, ref string options)
        {
            if (pi.HasAttribute<RequiredAttribute>() || pi.HasAttribute<JtableRequiredAttribute>() || pi.IsType<int>()) options += "required, ";
        }

        private static void IsInteger(PropertyInfo pi, ref string options)
        {
            if (pi.IsType<int>()) options += "custom[integer], ";
        }

        private static void IsIP4Adress(PropertyInfo pi, ref string options)
        {
            if (pi.HasAttribute<JtableIP4AdressAttribute>()) options += "custom[ipv4], ";
        }

        private static void IsEmail(PropertyInfo pi, ref string options)
        {
            if (pi.HasAttribute<JtableEmailAttribute>()) options += "customer[email], ";
        }

        private static void Range(PropertyInfo pi, ref string options)
        {
            if (!pi.HasAttribute<RangeAttribute>()) return;
            var attr = pi.GetAttribute<RangeAttribute>();
            options += string.Format("min[{0}], max[{1}], ", attr.Minimum, attr.Maximum);
        }

        private static void StringLength(PropertyInfo pi, ref string options)
        {
            if (!pi.HasAttribute<StringLengthAttribute>()) return;
            var attr = pi.GetAttribute<StringLengthAttribute>();
            options += string.Format("minSize[{0}], maxSize[{1}], ", attr.MinimumLength, attr.MaximumLength);
        }
    }

    static class FieldType
    {
        //TO DO: password & textarea
        public static string GetType(PropertyInfo pi)
        {
            if (pi.HasAttribute<JtableHideAttribute>()) return JTableTypes.Hidden;
            else if (pi.IsType<bool>()) return JTableTypes.Checkbox;
            else if (pi.IsType<DateTime>() || pi.IsType<DateTime?>()) return JTableTypes.Date;
            else if (pi.HasAttribute<JtableFileUploadAttribute>()) return JTableTypes.File;
            else if (pi.IsType<int>() || pi.IsType<Int16>() || pi.IsType<float>() || pi.IsType<double>() || pi.IsType<int?>() || pi.IsType<float?>() || pi.IsType<double?>()) return JTableTypes.Number;            
            else if (pi.HasAttribute<JtablePasswordAttribute>()) return JTableTypes.Password;
            return "";
        }
    }
    
    //Only supports UploadOptions for type image
    static class Options
    {
        public static UploadOptions GetUploadOptions(PropertyInfo pi)
        {
            return new UploadOptions()
            {
                actionUrl = GetActionUrl(pi),
                fileType = GetFileType(pi)
            };
        }

        private static string GetActionUrl(PropertyInfo pi)
        {
            var url = new UrlHelper(HttpContext.Current.Request.RequestContext);
            return url.Action("UploadImage");
        }

        private static string GetFileType(PropertyInfo pi)
        {
            return "image/*";
        }
    }    
}