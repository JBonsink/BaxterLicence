using System;

using Baxter.Attributes;

using TypeLite;

namespace Baxter.Constants
{
    [TsEnum]
    public enum Activity
    {
        [LocalizedDescription("Log_Edited")]
        Edited = 1,
        [LocalizedDescription("Log_Created")]
        Created,
        [LocalizedDescription("Log_Deleted")]
        Deleted
    }

    [TsEnum]
    public enum Module
    {
        [LocalizedDescription("General_Log")]
        Log = 1,
        [LocalizedDescription("General_Role")]
        Role = 2,
        [LocalizedDescription("General_User")]
        User = 3,
        [LocalizedDescription("General_Image")]
        Image = 4,
        [LocalizedDescription("General_File")]
        FileModel = 5,
        [LocalizedDescription("General_BackupSettings")]
        BackupSettings = 6,
        [LocalizedDescription("General_Backup")]
        Backup = 7,
        [LocalizedDescription("General_AppLog")]
        AppLog = 8,
        [LocalizedDescription("General_Application")]
        Application = 9
    }
}