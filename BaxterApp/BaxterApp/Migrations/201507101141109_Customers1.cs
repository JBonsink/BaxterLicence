namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Customers1 : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.Customers", "AskedBy");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Customers", "AskedBy", c => c.String(maxLength: 50));
        }
    }
}
