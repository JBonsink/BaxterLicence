namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class BackupSettingsModelNotRequiredFields : DbMigration
    {
        public override void Up()
        {
            AlterColumn("dbo.BackupSettings", "NetworkUsername", c => c.String());
            AlterColumn("dbo.BackupSettings", "NetworkPassword", c => c.String());
        }
        
        public override void Down()
        {
            AlterColumn("dbo.BackupSettings", "NetworkPassword", c => c.String(nullable: false));
            AlterColumn("dbo.BackupSettings", "NetworkUsername", c => c.String(nullable: false));
        }
    }
}
