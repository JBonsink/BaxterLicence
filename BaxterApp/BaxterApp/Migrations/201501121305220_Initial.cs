namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Files",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        Name = c.String(),
                        Location = c.String(),
                        ExperiationDate = c.DateTime(),
                        ModuleID = c.Int(nullable: false),
                        EntityID = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.ID);
            
            CreateTable(
                "dbo.Images",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        Width = c.Int(nullable: false),
                        Height = c.Int(nullable: false),
                        ContentType = c.String(maxLength: 128),
                        Filename = c.String(maxLength: 250),
                        Data = c.Binary(),
                    })
                .PrimaryKey(t => t.ID);
            
            CreateTable(
                "dbo.Log",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        UserID = c.Int(nullable: false),
                        EntityID = c.Int(nullable: false),
                        Activity = c.Int(nullable: false),
                        Module = c.Int(nullable: false),
                        Username = c.String(maxLength: 64),
                        Timestamp = c.DateTime(nullable: false),
                        Data = c.String(),
                    })
                .PrimaryKey(t => t.ID);
            
            CreateTable(
                "dbo.Roles",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 250),
                        LogAccess = c.Int(nullable: false),
                        RoleAccess = c.Int(nullable: false),
                        UserAccess = c.Int(nullable: false),
                        SettingsAccess = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.ID);
            
            CreateTable(
                "dbo.Users",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        Name = c.String(nullable: false, maxLength: 250),
                        RoleID = c.Int(nullable: false),
                        FullName = c.String(maxLength: 250),
                        Email = c.String(maxLength: 250),
                        Department = c.String(maxLength: 250),
                        EmployeeID = c.String(maxLength: 250),
                        Salt = c.String(maxLength: 250),
                        Password = c.String(nullable: false, maxLength: 250),
                    })
                .PrimaryKey(t => t.ID)
                .ForeignKey("dbo.Roles", t => t.RoleID, cascadeDelete: true)
                .Index(t => t.RoleID);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Users", "RoleID", "dbo.Roles");
            DropIndex("dbo.Users", new[] { "RoleID" });
            DropTable("dbo.Users");
            DropTable("dbo.Roles");
            DropTable("dbo.Log");
            DropTable("dbo.Images");
            DropTable("dbo.Files");
        }
    }
}
