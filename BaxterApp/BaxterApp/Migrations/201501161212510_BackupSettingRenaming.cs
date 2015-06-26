namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class BackupSettingRenaming : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.BackupSettings", "NetworkShare", c => c.String());
            DropColumn("dbo.BackupSettings", "NetworkHost");
        }
        
        public override void Down()
        {
            AddColumn("dbo.BackupSettings", "NetworkHost", c => c.String());
            DropColumn("dbo.BackupSettings", "NetworkShare");
        }
    }
}
