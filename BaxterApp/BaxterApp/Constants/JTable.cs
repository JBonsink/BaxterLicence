using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using TypeLite;

namespace Baxter.Constants
{
    public static class AutoComplete
    {
        public const int maxSuggestions = 12;
    }

    [TsEnum]
    public enum SearchOperator
    {
        Equals = 0,
        NotEquals,
        LessThan,
        LessThanEquals,
        GreaterThan,
        GreaterThanEquals,
        Contains,
        StartsWith,
        EndsWith
    }
    
    public static class JTableTypes
    {
        public static string Checkbox { get { return "checkbox"; } }
        public static string Date { get { return "date"; } }
        public static string Hidden { get { return "hidden"; } }
        public static string Number { get { return "number"; } }
        public static string Password { get { return "password"; } }
        public static string Radiobutton { get { return "radiobutton"; } }
        public static string Textarea { get { return "textarea"; } }
        public static string File { get { return "file"; } }
        public static string Image { get { return "image"; } }
        public static string Dropdown { get { return "dropdown"; } }
    }

    public static class JTableVisibility
    {
        public const string Fixed = "fixed";
        public const string Hidden = "hidden";
        public const string Visible = "visible";
    }
}