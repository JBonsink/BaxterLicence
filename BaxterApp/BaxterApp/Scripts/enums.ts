 
 
 
 
 

     
 
module Baxter.Constants {
	export enum AppLogType {
		Information = 0,
		Warning = 1,
		Error = 2,
		Success = 3
	}
	export enum AppLogMessage {
		BackupSuccess = 0,
		BackupFailed = 1,
		BackupDeleted = 2,
		BackupFailedDisk = 3,
		BackupFailedNetwork = 4,
		RestoreFailed = 5
	}
	export enum DaysOfWeek {
		Monday = 1,
		Tuesday = 2,
		Wednesday = 4,
		Thursday = 8,
		Friday = 16,
		Saturday = 32,
		Sunday = 64
	}
	export enum SearchOperator {
		Equals = 0,
		NotEquals = 1,
		LessThan = 2,
		LessThanEquals = 3,
		GreaterThan = 4,
		GreaterThanEquals = 5,
		Contains = 6,
		StartsWith = 7,
		EndsWith = 8
	}
	export enum Activity {
		Edited = 1,
		Created = 2,
		Deleted = 3
	}
	export enum Module {
		Log = 1,
		Role = 2,
		User = 3,
		Image = 4,
		FileModel = 5,
		BackupSettings = 6,
		Backup = 7,
		AppLog = 8
	}
	export enum Permission {
		None = 0,
		View = 1,
		Edit = 2,
		Create = 3,
		Delete = 4
	}
}

