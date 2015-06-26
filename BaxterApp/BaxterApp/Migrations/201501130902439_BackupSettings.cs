namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class BackupSettings : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.BackupSettings",
                c => new
                    {
                        ID = c.Int(nullable: false, identity: true),
                        Monday = c.Boolean(nullable: false),
                        Tuesday = c.Boolean(nullable: false),
                        Wednesday = c.Boolean(nullable: false),
                        Thursday = c.Boolean(nullable: false),
                        Friday = c.Boolean(nullable: false),
                        Saturday = c.Boolean(nullable: false),
                        Sunday = c.Boolean(nullable: false),
                        Time = c.String(),
                        Location = c.String(),
                        Database = c.String(),
                    })
                .PrimaryKey(t => t.ID);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.BackupSettings");
        }
    }
}
