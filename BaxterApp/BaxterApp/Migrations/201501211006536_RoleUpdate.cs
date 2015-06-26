namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RoleUpdate : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Roles", "MaintenanceAccess", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Roles", "MaintenanceAccess");
        }
    }
}
