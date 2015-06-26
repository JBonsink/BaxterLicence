using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

using Newtonsoft.Json.Web;

using Baxter.Attributes;
using Baxter.Models.JTable;

namespace Baxter.Utilities
{
    public class JsonNet
    {           
        public static JsonNetResult JsonObject(object obj)
        {             
            return new JsonNetResult(obj);
        }

        public static JsonNetResult JsonWarning(string message)
        {
            var data = new JTableResultMessage
            {
                Result = "WARNING",
                Message = message
            };
            return new JsonNetResult(data);
        }

        public static JsonNetResult JsonError(string message)
        {               
            var data = new JTableResultMessage
            {
                Result = "ERROR",
                Message = message
            };
            return new JsonNetResult(data);
        }

        public static JsonNetResult JsonOK()
        {            
            var data = new JTableResult
            {
                Result = "OK"                
            };
            return new JsonNetResult(data);
        }

        public static JsonNetResult JsonOKRecord(object record)
        {
            var data = new JTableResultRecord
            {
                Result = "OK",
                Record = record
            };
            return new JsonNetResult(data);
        }

        public static JsonNetResult JsonOKRecord<T>(T record)
        {            
            var data = new JTableResultRecord
            {
                Result = "OK",
                Record = record
            };
            return new JsonNetResult(data);
        }

        public static JsonNetResult JsonOKRecords(object records, int recordCount = 0)
        {
            var data = new JTableResultRecords
            {
                Result = "OK",
                Records = records,
                TotalRecordCount = recordCount
            };
            return new JsonNetResult(data);
        }
                
        public static JsonNetResult JsonOKOptions(object options)
        {            
            var data = new JTableResultOptions
            {
                Result = "OK",
                Options = options                
            };
            return new JsonNetResult(data);
        }

        public static JsonNetResult JsonNoOptions(string errorMessage)
        {               
            var data = new JTableResultOptions
            {
                Result = "OK",
                Options = new List<JTableOption>()
                {
                    new JTableOption()
                    {
                        DisplayText = errorMessage,
                        Value = 0
                    }
                }
            };
            return new JsonNetResult(data);
        }              
    }
}