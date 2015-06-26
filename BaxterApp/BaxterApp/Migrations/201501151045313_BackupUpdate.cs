namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class BackupUpdate : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.BackupSettings", "BackupSchedule", c => c.Int(nullable: false));
            AddColumn("dbo.BackupSettings", "BackupPath", c => c.String());
            AddColumn("dbo.BackupSettings", "NetworkHost", c => c.String());
            DropColumn("dbo.BackupSettings", "Monday");
            DropColumn("dbo.BackupSettings", "Tuesday");
            DropColumn("dbo.BackupSettings", "Wednesday");
            DropColumn("dbo.BackupSettings", "Thursday");
            DropColumn("dbo.BackupSettings", "Friday");
            DropColumn("dbo.BackupSettings", "Saturday");
            DropColumn("dbo.BackupSettings", "Sunday");
            DropColumn("dbo.BackupSettings", "Location");
            DropColumn("dbo.BackupSettings", "AppName");
            DropColumn("dbo.BackupSettings", "ServerUsername");
            DropColumn("dbo.BackupSettings", "ServerPassword");
        }
        
        public override void Down()
        {
            AddColumn("dbo.BackupSettings", "ServerPassword", c => c.String(nullable: false));
            AddColumn("dbo.BackupSettings", "ServerUsername", c => c.String(nullable: false));
            AddColumn("dbo.BackupSettings", "AppName", c => c.String());
            AddColumn("dbo.BackupSettings", "Location", c => c.String());
            AddColumn("dbo.BackupSettings", "Sunday", c => c.Boolean(nullable: false));
            AddColumn("dbo.BackupSettings", "Saturday", c => c.Boolean(nullable: false));
            AddColumn("dbo.BackupSettings", "Friday", c => c.Boolean(nullable: false));
            AddColumn("dbo.BackupSettings", "Thursday", c => c.Boolean(nullable: false));
            AddColumn("dbo.BackupSettings", "Wednesday", c => c.Boolean(nullable: false));
            AddColumn("dbo.BackupSettings", "Tuesday", c => c.Boolean(nullable: false));
            AddColumn("dbo.BackupSettings", "Monday", c => c.Boolean(nullable: false));
            DropColumn("dbo.BackupSettings", "NetworkHost");
            DropColumn("dbo.BackupSettings", "BackupPath");
            DropColumn("dbo.BackupSettings", "BackupSchedule");
        }
    }
}
