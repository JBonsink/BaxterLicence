using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using Baxter.Models;

namespace Baxter.Contexts
{   
    public partial class BaxterContext : DbContext
    {
        static BaxterContext()
        {            
        }

        public BaxterContext() : base("BaxterContext")
        {
        }

        public DbSet<Log> Log { get; set; }                       
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }        
        public DbSet<Image> Images { get; set; }       
        public DbSet<FileModel> Files { get; set; }
        public DbSet<BackupSettings> BackupSettings { get; set; }
        public DbSet<Backup> Backups { get; set; }
        public DbSet<AppLog> AppLogs { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {             
        }         
    }
}