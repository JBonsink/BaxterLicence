using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Newtonsoft.Json.Web;


namespace Baxter.Models
{
    [TypeLite.TsClass]
    public class Response
    {
        public Response() { }
        public Response(object data)
        {
            Success = true;
            Data = data;
        }
        public Response(bool succes, string message)
        {
            Success = succes;
            Message = message;
        }

        public bool Success { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }

        public JsonNetResult Serialize()
        {
            return new JsonNetResult(this);
        }
    }
}