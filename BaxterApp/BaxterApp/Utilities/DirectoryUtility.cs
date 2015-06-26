using System;
using System.IO;

namespace Baxter.Utilities
{
    public static class DirectoryUtility
    {
        public static bool CreateDirectory(string path)
        {
            SetPermissions(path);
            Directory.CreateDirectory(path);
            return Directory.Exists(path);
        }
                
        public static bool CreateNetworkDirectory(string path, string networkShare, string user, string password)
        {			
            IsPathAvailable(networkShare, user, password);
			SetPermissions(path);         
			return CreateDirectory(path);
        }

        public static bool IsPathAvailable(string path, string user, string password)
        {            
            if (path.StartsWith(@"\\"))
            {                
                MapNetworkDevice(path, user, password);
            }                       
                        
            return Directory.Exists(path);            
        }

        private static void MapNetworkDevice(string path, string user, string password)
        {
            RunCMD(String.Format("/C net use {0} {1} /USER:{2}", path, password, user));
        }

        private static void SetPermissions(string path)
        {
            RunCMD(String.Format("/C icacls {0} /grant \"IIS APPPOOL\\DefaultAppPool\":F", path));
            RunCMD(String.Format("/C icacls {0} /grant \"NT SERVICE\\MSSQL$SQLEXPRESS\":F", path));
        }

        private static void RunCMD(string arguments)
        {
            System.Diagnostics.Process process = new System.Diagnostics.Process();
            System.Diagnostics.ProcessStartInfo startInfo = new System.Diagnostics.ProcessStartInfo();
            startInfo.WindowStyle = System.Diagnostics.ProcessWindowStyle.Hidden;
            startInfo.FileName = "cmd.exe";
            startInfo.Arguments = arguments;
            process.StartInfo = startInfo;
            process.Start();
            process.WaitForExit();
        }
    }
}