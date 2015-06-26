namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class BackupSettingsRequiredFields : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.BackupSettings", "Time", c => c.String(nullable: false));
            AlterColumn("dbo.BackupSettings", "BackupPath", c => c.String(nullable: false));
        }
        
        public override void Down()
        {
            AlterColumn("dbo.BackupSettings", "BackupPath", c => c.String());
            AlterColumn("dbo.BackupSettings", "Time", c => c.String());
        }
    }
}
