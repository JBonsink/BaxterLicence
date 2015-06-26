using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;

namespace Baxter.Extensions
{
    public static class PropertyInfoHelper
    {
        public static T GetAttribute<T>(this PropertyInfo pi)
        {
            T attr = default(T);
            var attributes = pi.GetCustomAttributes(typeof(T), false);
            if (attributes.Length > 0) attr = (T)attributes[0];
            return attr;             
        }

        public static bool HasAttribute<T>(this PropertyInfo pi)
        {
            return pi.GetCustomAttributes(typeof(T), false).Length > 0;
        }
                     
        public static bool IsType<T>(this PropertyInfo pi)
        {
            return pi.PropertyType == typeof(T);
        }
    }
}