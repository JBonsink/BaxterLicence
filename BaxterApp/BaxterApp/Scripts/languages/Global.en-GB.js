var Resources = {
	Global: {
    Account_Global_ConfirmPassword: 'Confirm password',
    Account_Global_PasswordMismatch: 'Mismatching passwords',
    Account_Login_LoginButton: 'Log in',
    Account_Login_LoginFailed: 'Unkown username/password combination.',
    Account_Login_PasswordRequired: 'Please fill in your password.',
    Account_Login_RememberMe: 'Remember me?',
    Account_Login_Subtitle: 'For authorized users only.',
    Account_Login_Title: 'Login',
    Account_Login_UserNameRequired: 'Please fill in your username.',
    Account_Manage_Button_ChangePassword: 'Change password',
    Account_Manage_CurrentPassword: 'Current password',
    Account_Manage_CurrentPasswordRequired: 'Please fill in your current password.',
    Account_Manage_LoggedInAs: "You're logged in as",
    Account_Manage_NewPassword: 'New password',
    Account_Manage_NewPasswordRequired: 'Please fill in a new password.',
    Account_Manage_Subtitle_Password: 'Change your password.',
    Account_Manage_Title: 'Manage your account',
    Log_Activity: 'Activity',
    General_Log: 'Activity log',
    General_Logs: 'Activity logs',
    General_AllEntities: function(val0) {
        return 'All ' + val0 + '';
    },
    General_EntityAlreadyExists: function(val0) {
        return 'This ' + val0 + ' already exists.';
    },
    General_FailedToRegisterEntity: function(val0) {
        return 'Failed to register ' + val0 + '.';
    },
    General_Hello: 'Hello',
    General_Home: 'Home',
    General_LogOff: 'Log off',
    General_MissingData: 'Missing data',
    General_No: 'No',
    General_None: 'None',
    General_ReceivedInvalidData: 'There is something wrong with the received data.',
    General_Role: 'Role',
    General_Roles: 'Roles',
    General_SelectEntity: function(val0) {
        return 'Select ' + val0 + '.';
    },
    General_ThereArentAnyAvailableYet: function(val0) {
        return "There aren't any " + val0 + " available yet.";
    },
    General_UnkownEntity: function(val0) {
        return 'There is no record of this ' + val0 + '.';
    },
    General_User: 'User',
    General_Users: 'Users',
    General_Yes: 'Yes',
    Home_Index_Subtitle: 'Welcome!',
    Home_Index_Title: 'Home',
    JTable_AddNewRecord: 'Add new record',
    General_AreYouSure: 'Are you sure?',
    General_Cancel: 'Cancel',
    JTable_CanNotDeleteRecords: function(val0, val1) {
        return 'Can not delete ' + val0 + ' of ' + val1 + ' records!';
    },
    JTable_CanNotLoadOptionsFor: function(val0) {
        return 'Can not load options for field ' + val0 + '';
    },
    General_Close: 'Close',
    JTable_Delete: 'Delete',
    JTable_DeleteConfirmation: 'This record will be deleted.',
    JTable_DeleteProggress: function(val0) {
        return 'Deleting ' + val0 + ' records, processing...';
    },
    JTable_Deleting: 'Delete',
    JTable_Details: 'Details',
    JTable_EditRecord: 'Edit Record',
    General_Error: 'Error',
    JTable_Filter: 'Filter',
    JTable_GoToPageLabel: 'Go to page',
    JTable_LoadingMessage: 'Loading....',
    JTable_LoadRecords: 'Load records',
    JTable_NoDataAvailable: 'No data available!',
    JTable_PageSizeChangeLabel: 'Row count',
    JTable_PagingInfo: function(val0, val1, val2) {
        return 'Showing ' + val0 + '-' + val1 + ' of ' + val2 + '';
    },
    General_Save: 'Save',
    General_Saving: 'Saving',
    General_Search: 'Search',
    JTable_ServerCommunicationError: 'An error occured while communicating to the server.',
    Log_AddedANewEntity: function(val0, val1) {
        return 'Added a new ' + val0 + ': <br/>' + val1 + '';
    },
    Log_Created: 'Created',
    Log_DeleteAnExistingEntity: function(val0, val1) {
        return 'Deleted a(n) ' + val0 + ': <br/>' + val1 + '';
    },
    Log_Deleted: 'Deleted',
    Log_Description: 'Description',
    Log_Edited: 'Edited',
    Log_EditedAnExisting: function(val0, val1) {
        return 'Edited an existing ' + val0 + ', these changes have been made: <br/>' + val1 + '';
    },
    Log_EntityHistory: 'Entity history',
    Log_EntityName: 'Entity name',
    Log_HistoryOf: function(val0) {
        return 'History of ' + val0 + '';
    },
    Log_Module: 'Module',
    Log_PropertyValue: function(val0, val1) {
        return '' + val0 + ': ' + val1 + '<br/>';
    },
    Log_PropertyChangedFromTo: function(val0, val1, val2) {
        return "Property '" + val0 + "' changed from '" + val1 + "' to '" + val2 + "'<br/>";
    },
    Log_TableTitle: 'Activity log',
    Log_Timestamp: 'Timestamp',
    General_View: 'View',
    General_Edit: 'Edit',
    General_Create: 'Create',
    General_Delete: 'Delete',
    Role_ModuleAccessLevel: function(val0) {
        return '' + val0 + ' access level';
    },
    Role_Name: 'Role name',
    User_ActivitiesOf: function(val0) {
        return 'Activities of ' + val0 + '';
    },
    User_Email: 'Email',
    User_EmployeeID: 'Employee ID',
    User_FullName: 'Fullname',
    User_NewPassword: 'New password',
    User_Password: 'Password',
    User_UserName: 'Username',
    General_Activities: 'activities',
    General_Modules: 'modules',
    Role_AddFunction: 'Add a function',
    Role_AddFunctionTo: function(val0) {
        return 'Add function to ' + val0 + '';
    },
    Role_Function: 'Function',
    General_AvailableEntities: function(val0) {
        return 'Available ' + val0 + '';
    },
    Log_PropertyChanged: function(val0) {
        return 'Property ' + val0 + ' has been modified.';
    },
    General_Settings: 'Settings',
    General_Language: 'Language',
    General_Languages: 'Languages',
    General_FileNotAnImage: 'The file is not an image.',
    General_Image: 'Image',
    General_UnsupportedImageFormat: function(val0) {
        return "Images of type '" + val0 + "' are not supported.";
    },
    General_Upload: 'Upload',
    Image_Filename: 'Filename',
    Image_Format: 'Image Format',
    Image_Delete: 'Delete image',
    Image_ViewLarger: 'View larger image',
    General_DeleteSelected: 'Delete selected',
    JTable_AddNew: function(val0) {
        return 'Add new ' + val0 + '';
    },
    JTable_DeleteConfirmationMulti: 'These records will be deleted.',
    JTable_Edit: function(val0) {
        return 'Edit ' + val0 + '';
    },
    JTable_FormCount: 'Form count',
    General_Remaining: 'Remaining',
    General_Name: 'Name',
    General_Status: 'Status',
    General_ConfirmAddition: function(val0) {
        return 'Are you sure you want to add the following ' + val0 + '?';
    },
    General_ErrorPleaseTryAgain: 'An error has occured, please try again.',
    General_Remarks: 'Remarks',
    General_AddTo: function(val0) {
        return 'Add to ' + val0 + '';
    },
    General_Instructions: 'Instructions',
    General_Height: 'Height',
    General_Type: 'Type',
    General_Width: 'Width',
    General_Download: 'Download',
    General_PreparingDownload: 'Preparing your document, please wait...',
    General_EntityNotExist: function(val0, val1) {
        return '' + val0 + ' ' + val1 + ' does not exist.';
    },
    General_ConfirmCancel: 'Do you want to cancel?',
    General_DeleteItem: 'Deleting item',
    General_ClearFields: 'Reset',
    General_Amount: 'Amount',
    General_Add: 'Add',
    General_From: 'From',
    General_Till: 'Till',
    General_Ok: 'Ok',
    Image_Select: 'Select image',
    General_FailedMultiDelete: 'Failed to delete one or more of the selected items.',
    General_AccessDenied: 'Access denied!',
    General_Warning: 'Warning',
    General_PropertyIsNotUnique: function(val0) {
        return 'The property ' + val0 + ' is not unique.';
    },
    General_File: 'File',
    Error_NoRowsSelected: 'No rows selected',
    General_AddX: function(val0) {
        return 'Add ' + val0 + '';
    },
    General_InvalidDate: 'Invalid date supplied.',
    General_Find: function(val0) {
        return 'Find ' + val0 + '';
    },
    User_MyAccount: 'My account',
    General_Success: 'Success',
    General_SelectedXAdded: function(val0) {
        return 'The selected ' + val0 + ' have been succesfully added.';
    },
    General_SelectedXPartiallyAdded: function(val0) {
        return 'The selected ' + val0 + ' have been partially added.';
    },
    General_Step1: 'Step 1',
    General_Step2: 'Step 2',
    General_Archived: 'Archived',
    General_SelectedX: function(val0) {
        return 'Selected ' + val0 + '';
    },
    General_Files: 'Files',
    Error_FileAlreadyExists: function(val0) {
        return 'The file ' + val0 + ' already exists.';
    },
    Error_UploadFailed: 'Upload failed.',
    General_NoDataAvailableYet: "There's no data available yet.",
    General_Processing: 'Processing...',
    General_Change: 'Change',
    General_Date: 'Date',
    General_Description: 'Description',
    Log_NoValue: 'No value',
    General_ForgottenPassword: 'Forgot your password? Please contact the administrators.',
    General_WelcomeTo: function(val0) {
        return 'Welcome to ' + val0 + '';
    },
    Day_Friday: 'Friday',
    Day_Monday: 'Monday',
    Day_Saturday: 'Saturday',
    Day_Sunday: 'Sunday',
    Day_Thursday: 'Thursday',
    Day_Tuesday: 'Tuesday',
    Day_Wednesday: 'Wednesday',
    Drive_FreeSpace: 'Free space',
    Drive_Label: 'Label',
    Drive_TotalSpace: 'Total space',
    Drive_UsedSpace: 'Used space',
    General_Drive: 'Drive',
    General_Time: 'Time',
    General_Backups: 'Backups',
    Backup_NetworkPassword: 'Networklocation password',
    Backup_NetworkUsername: 'Networklocation user name',
    Backup_ServerPassword: 'Server password',
    Backup_ServerUsername: 'Server user name',
    Backup_Path: 'Path',
    General_ChangesSuccessfullySaved: 'De veranderingen zijn succesvol opgeslagen.',
    Backup_Days: 'Backups days',
    Backup_MinFreeSpace: 'Minimum free space',
    Backup_TTL: 'Time to live',
    Disk_CurrentUsage: 'Current disk usage',
    Disk_InsufficientSpace: function(val0) {
        return 'There is less (' + val0 + ' GB) than the minimum disk space requirements available. New backups will not be created.';
    },
    Disk_SufficientSpace: function(val0) {
        return 'There is ' + val0 + ' GB disk space available.';
    },
    General_Weeks: 'Weeks',
    Settings_General: 'General settings',
    Settings_Network: 'Network settings',
    Backup_NetworkShare: 'Network share',
    Backup_TestFailed: 'The provided network settings are incorrect.',
    Backup_TestSettings: 'Test settings',
    Backup_TestSuccess: 'Settings are correct!',
    Backup_Failed: 'Failed to create a full backup of the database. Something went wrong.',
    Backup_FailedDisk: 'There is not enough free disk space available. Could not create backup.',
    Backup_FailedNetwork: 'Failed to connect with the network share. Could not create backup.',
    Backup_Success: 'Successfully created a full backup of the database.',
    General_AdditionalInfo: 'Additional info',
    General_AppLogs: 'App logs',
    General_Backup: 'Backup',
    General_Message: 'Message',
    Warning_ErrorsDetected: 'Errors have been detected!',
    Disk_FreeGB: function(val0, val1) {
        return '' + val0 + ' GB free of ' + val1 + ' GB';
    },
    Backup_Now: 'Backup now',
    Error_UserWithDeletedRole: 'There are still users left with the role you wish to delete. A role can only be deleted when it is no longer used by any users.',
    General_Maintenance: 'Maintenance',
    General_Types: 'Types',
    General_AppLog: 'App log',
    General_Errors: 'Errors',
    General_Info: 'Information',
    General_Warnings: 'Warnings',
    Backup_LastFailed: 'Last backup failed',
    General_NoProblems: 'No problems detected',
    Backup_InProgress: 'Backup in progress...',
    Backup_Restore: 'Restore database',
    Backup_RestoreFailed: 'Failed to restore the database.',
    Backup_RestoreInProgress: 'Backup restore is in progress..',
    Backup_RestoreSuccess: 'Successfully restored the database.',
    Backup_RestoreWarning: 'Are you sure you wish to restore to the selected backup?',
    Language_Dutch: 'Dutch',
    Language_English: 'English',
    General_Application: 'Application',
	}
};
