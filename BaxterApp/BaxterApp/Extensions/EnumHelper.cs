/* This file contains an EnumHelper. */

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Reflection;

public static class EnumHelper
{
    /* Extends enum values with a method that retrieves and returns its associated descriptions. */
    public static string GetDescription<Enum>(this Enum enumVal)
    {
        if (enumVal == null) return "";        
        var memInfo = typeof(Enum).GetMember(enumVal.ToString());
        var attributes = memInfo[0].GetCustomAttributes(typeof(DescriptionAttribute), false);
        return attributes.Length > 0 ? ((DescriptionAttribute)attributes[0]).Description : "";
    }

    public static int ToInt<Enum>(this Enum enumVal)
    {
        return Convert.ToInt32(enumVal);
    }
}

