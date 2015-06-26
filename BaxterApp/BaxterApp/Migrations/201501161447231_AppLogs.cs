namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AppLogs : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.ApplicationLogs",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        Type = c.Int(nullable: false),
                        Module = c.Int(nullable: false),
                        Message = c.String(),
                    })
                .PrimaryKey(t => t.ID);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.ApplicationLogs");
        }
    }
}
