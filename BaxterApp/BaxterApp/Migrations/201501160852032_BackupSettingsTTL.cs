namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class BackupSettingsTTL : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.BackupSettings", "MinFreeSpaceGB", c => c.Int(nullable: false));
            AddColumn("dbo.BackupSettings", "BackupTTLWeeks", c => c.Int(nullable: false));
            DropColumn("dbo.BackupSettings", "MaxNumber");
        }
        
        public override void Down()
        {
            AddColumn("dbo.BackupSettings", "MaxNumber", c => c.Int(nullable: false));
            DropColumn("dbo.BackupSettings", "BackupTTLWeeks");
            DropColumn("dbo.BackupSettings", "MinFreeSpaceGB");
        }
    }
}
