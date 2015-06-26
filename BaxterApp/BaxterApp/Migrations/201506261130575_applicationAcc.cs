namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class applicationAcc : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Roles", "ApplicationAccess", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Roles", "ApplicationAccess");
        }
    }
}
