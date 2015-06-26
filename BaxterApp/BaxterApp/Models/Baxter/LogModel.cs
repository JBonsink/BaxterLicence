using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.ComponentModel;

using Newtonsoft.Json;
using TypeLite;

using Baxter.Constants;
using Baxter.Attributes;
using Baxter.Models.JTable;

namespace Baxter.Models
{
    [Table("Log"), TsClass]
    public class Log
    {
        public int ID { get; set; }  
        [JtableHide]
        public int UserID { get; set; }
        [LocalizedDescription("Log_EntityName"), JtableHide]
        public int EntityID { get; set; }
        [LocalizedDescription("Log_Activity")]
        public Activity Activity { get; set; }
        [LocalizedDescription("Log_Module")]        
        public Module Module { get; set; }
        [NotMapped, LocalizedDescription("Log_Description"), JtableVisibility(JTableVisibility.Hidden), JtableNoSorting]
        public string Description { get; set; }
        [LocalizedDescription("User_UserName"), StringLength(64)]
        public string Username { get; set; }
        [NotMapped, LocalizedDescription("Log_EntityName"), JtableNoSorting]
        public string EntityName { get; set; }
        [LocalizedDescription("Log_Timestamp"), JtableDateFormat("dd-MM-yyyy HH:mm")]
        public DateTime Timestamp { get; set; }
                         
        [JtableSkip, TsIgnore]
        public string Data { get; set; }
        
        public Log()
        {
        }

        public Log(int entityID, Module module, Activity activity, int userID, string username, string data)
        {
            Timestamp = DateTime.Now;
            EntityID = entityID;
            Module = module;
            Activity = activity;
            UserID = userID;
            Username = username;
            Data = data;
        }
    }
}