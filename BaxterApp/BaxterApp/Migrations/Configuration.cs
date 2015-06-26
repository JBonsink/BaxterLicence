using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Data.Entity.Validation;
using System.Diagnostics;

using Baxter.Contexts;
using Baxter.Constants;
using Baxter.Controllers;
using Baxter.Models;
using Baxter.Utilities;

namespace Baxter.Migrations
{
    internal sealed class Configuration : DbMigrationsConfiguration<BaxterContext>
    {
        BaxterContext db = new BaxterContext();

        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(BaxterContext context)
        {
        //    AddRole("Administrator");
        //    AddUser("admin@baxter.nl", "admin", "admin", 1);

        //    db.BackupSettings.Add(new Baxter.Models.BackupSettings()
        //    {
        //        BackupPath = @"C:\Backups",
        //        BackupSchedule = 15,
        //        BackupTTLWeeks = 52,
        //        MinFreeSpaceGB = 8,
        //        Time = "00:00"
        //    });
        //    db.SaveChanges();
        //    db.Dispose();
        }

        private void AddUser(string email, string username, string password, int roleID)
        {
            User new_user = db.Users.Create();

            new_user.Email = email;
            new_user.Salt = Guid.NewGuid().ToString();
            new_user.Name = username;
            new_user.RoleID = roleID;

            string hash = General.HashString(password + new_user.Salt);
            new_user.Password = hash;
            db.Users.Add(new_user);

            db.SaveChanges();
        }

        private void AddRole(string rolename)
        {
            Role role = db.Roles.Create();

            role.Name = rolename;
            role.RoleAccess = role.UserAccess = role.LogAccess = role.SettingsAccess = Permission.Delete;

            db.Roles.Add(role);
            db.SaveChanges();
        }  
    }
}
