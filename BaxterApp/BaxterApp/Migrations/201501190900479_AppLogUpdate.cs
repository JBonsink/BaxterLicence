namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AppLogUpdate : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.ApplicationLogs", "MessageID", c => c.Int(nullable: false));
            AddColumn("dbo.ApplicationLogs", "ExtraInfo", c => c.String());
            DropColumn("dbo.ApplicationLogs", "Message");
        }
        
        public override void Down()
        {
            AddColumn("dbo.ApplicationLogs", "Message", c => c.String());
            DropColumn("dbo.ApplicationLogs", "ExtraInfo");
            DropColumn("dbo.ApplicationLogs", "MessageID");
        }
    }
}
