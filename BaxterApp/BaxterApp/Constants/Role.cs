using System;

using TypeLite;

using Baxter.Attributes;

namespace Baxter.Constants
{
    public enum FunctionName
    {
        Log,
        Role,
        User,        
        Settings,
        Maintenance
    }           

    [TsEnum]
    public enum Permission
    {
        [LocalizedDescription("General_None")]
        None,
        [LocalizedDescription("General_View")]
        View,
        [LocalizedDescription("General_Edit")]
        Edit,
        [LocalizedDescription("General_Create")]
        Create,
        [LocalizedDescription("General_Delete")]
        Delete
    }
}