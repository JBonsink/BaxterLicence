namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class DatabaseChange : DbMigration
    {
        public override void Up()
        {
            RenameTable(name: "dbo.ApplicationLogs", newName: "AppLogs");
            AddColumn("dbo.AppLogs", "Discriminator", c => c.String(nullable: false, maxLength: 128));
        }
        
        public override void Down()
        {
            DropColumn("dbo.AppLogs", "Discriminator");
            RenameTable(name: "dbo.AppLogs", newName: "ApplicationLogs");
        }
    }
}
