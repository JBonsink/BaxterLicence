using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Web;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

using Baxter.Models;
using Baxter.Contexts;
using Baxter.Constants;
using Baxter.Utilities;

namespace Baxter
{
    public static class BackupRoutine
    {
        public static void Start()
        {
            if (routineRunning) return;
            routineRunning = true;

            Task.Run(() =>
            {
                try
                {
                    Routine(GetDelay());
                }
                catch (Exception e)
                {
                    context.AppLogs.Add(new AppLogError()
                    {
                        MessageID = AppLogMessage.BackupFailed,
                        Module = Module.Backup,
                        ExtraInfo = e.Message.ToString()
                    });
                    context.SaveChanges();
                }
            });
        }

        public static bool SingleBackup()
        {
            lock (thisLock)
            {
                GetSettings();
                
                if (settings != null && CreateBackupDirectory() && DiskSpaceCheck())
                {
                    return CreateBackup();
                }
                return false;
            }
        }

        public static bool Restore(Backup backup)
        {
            lock (thisLock)
            {
                using (context = new BaxterContext())
                {
                    try
                    {
                        context.Database.ExecuteSqlCommand(TransactionalBehavior.DoNotEnsureTransaction,
                            string.Format("USE master; ALTER DATABASE {0} SET SINGLE_USER WITH ROLLBACK IMMEDIATE; RESTORE DATABASE {0} FROM DISK = '{1}' WITH REPLACE"
                            , AppSettings.Name, backup.Path));

                        context.Database.ExecuteSqlCommand(TransactionalBehavior.DoNotEnsureTransaction,
                            string.Format("ALTER DATABASE {0} SET MULTI_USER;", AppSettings.Name));

                        return true;
                    }
                    catch (Exception e)
                    {
                        context.AppLogs.Add(new AppLogError()
                        {
                            MessageID = AppLogMessage.RestoreFailed,
                            Module = Module.Backup,
                            ExtraInfo = e.Message.ToString()
                        });
                        context.SaveChanges();

                        return false;
                    }
                }
            }
        }

        private static void GetSettings()
        {
            using (context = new BaxterContext())
            {
                settings = context.BackupSettings.FirstOrDefault();
            }
        }

        private static void Routine(TimeSpan delay)
        {
            backupTimer = new System.Threading.Timer((object notUsed) =>
            {
                lock (thisLock)
                {
                    GetSettings();
                    if (settings != null)
                    {
                        BackupTTLCheck();

                        if (CreateBackupDirectory() && DiskSpaceCheck())
                        {
                            CreateBackup();

                            Routine(GetDelay());
                        }
                        else
                        {
                            Routine(TimeSpan.FromMinutes(15));
                        }
                    }                    
                }
            }, null, delay, new TimeSpan(-1));
        }

        private static bool CreateBackup()
        {
            string sql, backupName, fileName, fullPath;

            backupName = AppSettings.Name + "-Full Database Backup";
            fileName = AppSettings.Name + "_" + DateTime.Now.ToString("dd-MM-yyyy-HHmm") + ".bak";
            fullPath = settings.BackupPath + "\\" + fileName;

            sql = String.Format("BACKUP DATABASE {0} TO DISK = '{1}' WITH NOFORMAT, INIT,  NAME = '{2}', SKIP, NOREWIND, NOUNLOAD,  STATS = 10", AppSettings.Name, fullPath, backupName);

            try
            {
                context.Database.ExecuteSqlCommand(TransactionalBehavior.DoNotEnsureTransaction, sql);

                context.Backups.Add(new Backup()
                {
                    Date = DateTime.Now,
                    Path = fullPath,
                    Name = fileName
                });

                context.AppLogs.Add(new AppLogSuccess()
                {
                    MessageID = AppLogMessage.BackupSuccess,
                    Module = Module.Backup,
                });

                context.SaveChanges();

                return true;
            }
            catch (Exception e)
            {
                context.AppLogs.Add(new AppLogError()
                {
                    MessageID = AppLogMessage.BackupFailed,
                    Module = Module.Backup,
                    ExtraInfo = e.Message.ToString()
                });

                context.SaveChanges();

                return false;
            }
        }

        private static void BackupTTLCheck()
        {
            var today = DateTime.Now;
            var backups = context.Backups.Where(b => DbFunctions.DiffDays(today, b.Date) > settings.BackupTTLWeeks * 7).ToList();

            foreach (var backup in backups)
            {
                if (File.Exists(backup.Path)) File.Delete(backup.Path);

                context.Backups.Remove(backup);

                context.AppLogs.Add(new AppLogInfo()
                {
                    MessageID = AppLogMessage.BackupDeleted,
                    Module = Module.Backup
                });
            }
            context.SaveChanges();
        }

        private static bool DiskSpaceCheck()
        {
            bool success, sufficientSpace;
            ulong freeBytes, totalBytes, totalFreeBytes;

            success = GetDiskFreeSpaceEx(settings.BackupPath, out freeBytes,
                out totalBytes, out totalFreeBytes);

            sufficientSpace = Baxter.Utilities.General.BytesToGigaBytes(freeBytes) > settings.MinFreeSpaceGB;

            if (success && sufficientSpace) return true;

            context.AppLogs.Add(new AppLogError()
            {
                MessageID = AppLogMessage.BackupFailedDisk,
                Module = Module.Backup
            });

            return false;
        }

        private static TimeSpan GetDelay()
        {
            GetSettings();

            if (settings != null)
            {
                var today = DateTime.Now;

                int daysToWait = 0;
                var minutesToWait = (DateTime.Parse(settings.Time).AddDays(1) - today).TotalMinutes;

                int mask = (settings.BackupSchedule << 7) | settings.BackupSchedule;
                int dayOfWeek = (int)Enum.Parse(typeof(DaysOfWeek), DateTime.Now.DayOfWeek.ToString());

                for (int i = 0; i < 7 && (dayOfWeek & mask) == 0; ++i)
                {
                    mask = mask >> 1;
                    daysToWait++;
                }

                return TimeSpan.FromDays(daysToWait).Add(TimeSpan.FromMinutes(minutesToWait));
            }
            return TimeSpan.FromHours(1);
        }

        private static bool CreateBackupDirectory()
        {
            bool success;

            try
            {
                if (String.IsNullOrEmpty(settings.NetworkShare))
                {
                    success = DirectoryUtility.CreateDirectory(settings.BackupPath);
                }
                else
                {
                    success = DirectoryUtility.CreateNetworkDirectory(settings.BackupPath, settings.NetworkShare, settings.NetworkUsername, settings.NetworkPassword);

                    if (!success)
                    {
                        context.AppLogs.Add(new AppLogError()
                        {
                            MessageID = AppLogMessage.BackupFailedNetwork,
                            Module = Module.Backup
                        });
                    }
                }

                if (success) return true;
            }
            catch (Exception ex)
            {
                context.AppLogs.Add(new AppLogError()
                {
                    MessageID = AppLogMessage.BackupFailed,
                    Module = Module.Backup,
                    ExtraInfo = ex.Message
                });
            }
            context.SaveChanges();

            return false;
        }

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool GetDiskFreeSpaceEx(string lpDirectoryName, out ulong lpFreeBytesAvailable,
            out ulong lpTotalNumberOfBytes, out ulong lpTotalNumberOfFreeBytes);

        private static System.Threading.Timer backupTimer;
        private static BackupSettings settings;
        private static BaxterContext context;
        private static bool routineRunning;
        private static Object thisLock = new Object();
    }
}