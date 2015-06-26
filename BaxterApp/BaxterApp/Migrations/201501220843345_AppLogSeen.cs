namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AppLogSeen : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AppLogs", "Seen", c => c.Boolean(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.AppLogs", "Seen");
        }
    }
}
