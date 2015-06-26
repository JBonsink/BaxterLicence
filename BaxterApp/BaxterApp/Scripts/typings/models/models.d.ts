 
 
 
 
 
/// <reference path="../../enums.ts" />
     
 

declare module Baxter.Models {
	interface Application {
		ID: number;
		Name: string;
	}
	interface AppLog {
		ID: number;
		Type: Baxter.Constants.AppLogType;
		MessageID: Baxter.Constants.AppLogMessage;
		Module: Baxter.Constants.Module;
		ExtraInfo: string;
		Date: Date;
		Seen: boolean;
	}
	interface Backup {
		ID: number;
		Name: string;
		Path: string;
		Date: Date;
	}
	interface BackupSettings {
		ID: number;
		BackupSchedule: number;
		MinFreeSpaceGB: number;
		BackupTTLWeeks: number;
		Time: string;
		BackupPath: string;
		NetworkShare: string;
		NetworkUsername: string;
		NetworkPassword: string;
	}
	interface Drive {
		Name: string;
		VolumeLabel: string;
		FreeSpace: number;
		TotalSpace: number;
	}
	interface Log {
		ID: number;
		UserID: number;
		EntityID: number;
		Activity: Baxter.Constants.Activity;
		Module: Baxter.Constants.Module;
		Description: string;
		Username: string;
		EntityName: string;
		Timestamp: Date;
	}
	interface Response {
		Success: boolean;
		Message: string;
		Data: any;
	}
	interface Role {
		ID: number;
		Name: string;
		LogAccess: Baxter.Constants.Permission;
		RoleAccess: Baxter.Constants.Permission;
		UserAccess: Baxter.Constants.Permission;
		SettingsAccess: Baxter.Constants.Permission;
		MaintenanceAccess: Baxter.Constants.Permission;
		ApplicationAccess: Baxter.Constants.Permission;
		Users: Baxter.Models.User[];
	}
	interface User {
		ID: number;
		Name: string;
		NewPassword: string;
		ConfirmPassword: string;
		EditPassword: string;
		ConfirmEditPassword: string;
		FullName: string;
		Email: string;
		Department: string;
		EmployeeID: string;
		Salt: string;
		Password: string;
		RoleID: number;
	}
}

