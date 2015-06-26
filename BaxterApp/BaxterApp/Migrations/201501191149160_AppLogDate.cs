namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AppLogDate : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AppLogs", "Date", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.AppLogs", "Date");
        }
    }
}
