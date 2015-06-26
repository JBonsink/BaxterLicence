namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class BackupSettingsUpdate : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.BackupSettings", "AppName", c => c.String());
            DropColumn("dbo.BackupSettings", "Database");
        }
        
        public override void Down()
        {
            AddColumn("dbo.BackupSettings", "Database", c => c.String());
            DropColumn("dbo.BackupSettings", "AppName");
        }
    }
}
