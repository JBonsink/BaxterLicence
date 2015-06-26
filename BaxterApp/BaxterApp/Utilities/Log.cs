using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Reflection;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Data.Entity.Infrastructure;
using System.Data;
using System.Data.Entity;

using Newtonsoft.Json;

using Baxter.Constants;
using Baxter.Contexts;
using Baxter.Models;
using Baxter.Attributes;
using Baxter.Extensions;

namespace Baxter.Utilities
{
    public struct LogProperty
    {
        public string name, value, newValue;

        public LogProperty(string name, string value)
        {
            this.name = name;
            this.value = value;
            this.newValue = String.Empty;
        }

        public LogProperty(string name, string oldValue, string newValue)
        {
            this.name = name;
            this.value = oldValue;
            this.newValue = newValue;
        }
    }
      
    static public class LogUtilities
    {
        static public Constants.Module GetModuleFromType(Type type)
        {
            string name = type.Name.Replace(" ", String.Empty);
            var field = typeof(Constants.Module).GetField(name);
            Debug.Assert(field != null, "Module name not added to Module enum.");

            return (Constants.Module)Convert.ChangeType(field.GetValue(null), typeof(Constants.Module));
        }

        static private string GetLocalizedEnumDescriptionByValue(Type type, string value)
        {
            Debug.Assert(type.IsEnum);

            var fields = type.GetFields(BindingFlags.Static | BindingFlags.Public);
            foreach (var field in fields)
            {
                if (field.GetValue(null).ToString().Equals(value))
                {
                    var attributes = field.GetCustomAttributes(typeof(DescriptionAttribute), false);
                    return attributes.Count() > 0 ? ((DescriptionAttribute)attributes[0]).Description : value;
                }
            }

            return value;
        }

        static private string GetLocalizedEnumDescriptionByValue<T>(T t) where T : IComparable
        {
            Debug.Assert(typeof(T).IsEnum);

            var fields = typeof(T).GetFields(BindingFlags.Static | BindingFlags.Public);
            foreach (var field in fields)
            {
                if (((T)field.GetValue(null)).CompareTo(t) == 0)
                {
                    var attributes = field.GetCustomAttributes(typeof(DescriptionAttribute), false);
                    return attributes.Count() > 0 ? ((DescriptionAttribute)attributes[0]).Description : typeof(T).Name;
                }
            }

            return "";
        }

        static private string GetEntityName(Type modelType, List<LogProperty> logProperties)
        {
            foreach (var logProperty in logProperties)
            {
                var property = modelType.GetProperty(logProperty.name);
                if (property != null)
                {
                    var identity = property.GetCustomAttributes(typeof(EntityLogName), false);
                    if (identity.Count() > 0) return logProperty.value;
                }
            }

            return String.Empty;
        }

        static private string LocalizeDescription(string moduleName, Activity activity, string typeData, string logPropertiesData)
        {
            string description = String.Empty;
            Type type = Type.GetType(typeData);

            if (type != null)
            {
                var logProperties = JsonConvert.DeserializeObject<List<LogProperty>>(logPropertiesData);
                foreach (var logProperty in logProperties)
                {
                    if (activity != Activity.Edited && logProperty.value != null && logProperty.value.Equals("null")) continue;

                    var property = type.GetProperty(logProperty.name);
                    if (property != null)
                    {
                        var attributes = property.GetCustomAttributes(typeof(DescriptionAttribute), false);
                        string value = logProperty.value, newValue = logProperty.newValue;
                        string propertyName = attributes.Count() > 0 ? 
                            ((DescriptionAttribute)attributes[0]).Description : logProperty.name;
                        bool hideValue = property.GetCustomAttributes(typeof(HideLogValue), false).Count() > 0;

                        if(property.PropertyType.IsEnum)
                        {
                            value = GetLocalizedEnumDescriptionByValue(property.PropertyType, logProperty.value);
                            if(activity == Activity.Edited)
                                newValue = GetLocalizedEnumDescriptionByValue(property.PropertyType, logProperty.newValue);
                        }

                        if (activity == Activity.Edited)
                        {
                            value = (String.Equals(value, "null")) ? Resources.Global.Log_NoValue : value;
                            description += (hideValue) ? string.Format(Resources.Global.Log_PropertyChanged, propertyName) : 
                                string.Format(Resources.Global.Log_PropertyChangedFromTo, propertyName, value, newValue);
                        }
                        else if(!hideValue)
                        {
                            description += string.Format(Resources.Global.Log_PropertyValue, propertyName, value);
                        }
                    }
                }
            }

            if (activity == Activity.Edited)
                description = string.Format(Resources.Global.Log_EditedAnExisting, moduleName.ToLower(), description);
            else if(activity == Activity.Created)
                description = string.Format(Resources.Global.Log_AddedANewEntity, moduleName.ToLower(), description);
            else
                description = string.Format(Resources.Global.Log_DeleteAnExistingEntity, moduleName.ToLower(), description);

            return description;
        }
                
        static public void ParseLogs(List<Log> logs)
        {               
            foreach (Log log in logs)
            {
                string module = GetLocalizedEnumDescriptionByValue(log.Module);
                string activity = GetLocalizedEnumDescriptionByValue(log.Activity);
                string[] parts = log.Data.Split(new char[] { '\n' }, 3);
                log.EntityName = parts[1];
                log.Description = LocalizeDescription(module, log.Activity, parts[0], parts[2]);
            }
        }

        static public string SerializeEntity<T>(T entity, DbContext context) where T : class
        {
            var type = typeof(T);
            var properties = new List<LogProperty>();
            PropertyInfo[] pInfos = type.GetProperties();

            foreach (PropertyInfo pi in pInfos)
            {
                if (pi.GetGetMethod().IsVirtual || pi.HasAttribute<NotMappedAttribute>()) continue;

                var val = pi.GetValue(entity);
                string value = val == null ? "null" : val.ToString();

                properties.Add(new LogProperty(pi.Name, value));
            }

            FetchForeignKeyValues(type, context, properties);

            // Order of PropertyInfo[] might be random, which might cause troubles in detecting differences
            properties.Sort((a, b) => string.Compare(a.name, b.name));

            return type.FullName + '\n' + GetEntityName(type, properties) + '\n' + JsonConvert.SerializeObject(properties);
        }

        static public string SerializeDifference(Type type, List<LogProperty> oldProperties, List<LogProperty> newProperties, DbContext context)
        {
            string result = null;
            var changes = new List<LogProperty>();

            for (int i = 0; i < oldProperties.Count(); ++i)
            {
                if (oldProperties[i].Equals(newProperties[i])) continue;

                changes.Add(new LogProperty(oldProperties[i].name, oldProperties[i].value, newProperties[i].value));
            }

            if (changes.Count() > 0) result = type.FullName + '\n' + GetEntityName(type, newProperties) + '\n' + JsonConvert.SerializeObject(changes);

            return result;
        }

        static public List<LogProperty> GetLogProperties(Type modelType, DbPropertyValues values, DbContext context)
        {
            var list = new List<LogProperty>();
            PropertyInfo[] properties = modelType.GetProperties();

            foreach (PropertyInfo pi in properties)
            {
                if (pi.GetGetMethod().IsVirtual || pi.HasAttribute<NotMappedAttribute>()) continue;

                string value = values[pi.Name] == null ? "null" : values[pi.Name].ToString();                
                
                list.Add(new LogProperty(pi.Name, value));
            }

            FetchForeignKeyValues(modelType, context, list);

            // Order of PropertyInfo[] might be random, which might cause troubles in detecting differences
            list.Sort((a, b) => string.Compare(a.name, b.name));

            return list;
        }

        static private void FetchForeignKeyValues(Type modelType, DbContext context, List<LogProperty> logProperties)
        {
            string name = null;                          
        }                
    }
}
