using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Baxter.Extensions
{
    public static class TypeHelpers
    {
        public static bool HasAttribute<T>(this Type t)
        {
            return t.GetCustomAttributes(typeof(T), false).Length > 0;
        }

        public static T GetAttribute<T>(this Type t) where T: Attribute
        {
            var attributes = t.GetCustomAttributes(typeof(T), false);
            return (attributes.Length > 0) ? (T)attributes[0] : null;
        }
    }
}