using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Baxter.Constants;

namespace Baxter.Models.JTable
{
    public class SearchObject
    {
        public string Value { get; set; }
        public string Column { get; set; }
        public SearchOperator Operator { get; set; }
    }

    public class JTableOption
    {
        public string DisplayText { get; set; }
        public int? Value { get; set; }
    }

    public class JTableOptionString
    {
        public string DisplayText { get; set; }
        public string Value { get; set; }
    }

    public class JTableResult
    {
        public string Result { get; set; }
    }

    public class JTableResultMessage : JTableResult
    {
        public string Message { get; set; }
    }

    public class JTableResultOptions : JTableResult
    {
        public object Options { get; set; }
    }

    public class JTableResultRecord : JTableResult
    {
        public object Record { get; set; }
    }

    public class JTableResultRecords : JTableResult
    {
        public object Records { get; set; }
        public int TotalRecordCount { get; set; }
    }
}