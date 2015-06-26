namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class BackupLocationRename : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Backups", "Path", c => c.String());
            DropColumn("dbo.Backups", "Location");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Backups", "Location", c => c.String());
            DropColumn("dbo.Backups", "Path");
        }
    }
}
