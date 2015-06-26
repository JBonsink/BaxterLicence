namespace Baxter.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ServerCredentials : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.BackupSettings", "ServerUsername", c => c.String(nullable: false));
            AddColumn("dbo.BackupSettings", "ServerPassword", c => c.String(nullable: false));
            AddColumn("dbo.BackupSettings", "NetworkUsername", c => c.String(nullable: false));
            AddColumn("dbo.BackupSettings", "NetworkPassword", c => c.String(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.BackupSettings", "NetworkPassword");
            DropColumn("dbo.BackupSettings", "NetworkUsername");
            DropColumn("dbo.BackupSettings", "ServerPassword");
            DropColumn("dbo.BackupSettings", "ServerUsername");
        }
    }
}
