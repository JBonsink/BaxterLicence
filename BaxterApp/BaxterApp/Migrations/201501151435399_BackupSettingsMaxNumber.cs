namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class BackupSettingsMaxNumber : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.BackupSettings", "MaxNumber", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.BackupSettings", "MaxNumber");
        }
    }
}
