namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Customers : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Customers",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        CustomerName = c.String(maxLength: 250),
                        Country = c.String(maxLength: 50),
                        City = c.String(maxLength: 50),
                        LicensesCode = c.String(maxLength: 50),
                        LicensesValidUntil = c.String(maxLength: 50),
                        GivenBy = c.String(maxLength: 50),
                        GivenDate = c.String(maxLength: 50),
                        AskedBy = c.String(maxLength: 50),
                        RequestedBy = c.String(maxLength: 50),
                    })
                .PrimaryKey(t => t.ID);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.Customers");
        }
    }
}
