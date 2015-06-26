 
 
 
 
 
/// <reference path="ktable.d.ts" />
/// <reference path="../models/models.d.ts" />
 

declare module Baxter.Fields {
	interface Application {
		ID: kTable.Field<Baxter.Models.Application>;
		Name: kTable.Field<Baxter.Models.Application>;
	}
	interface AppLog {
		ID: kTable.Field<Baxter.Models.AppLog>;
		Type: kTable.Field<Baxter.Models.AppLog>;
		MessageID: kTable.Field<Baxter.Models.AppLog>;
		Module: kTable.Field<Baxter.Models.AppLog>;
		ExtraInfo: kTable.Field<Baxter.Models.AppLog>;
		Date: kTable.Field<Baxter.Models.AppLog>;
		Seen: kTable.Field<Baxter.Models.AppLog>;
	}
	interface Backup {
		ID: kTable.Field<Baxter.Models.Backup>;
		Name: kTable.Field<Baxter.Models.Backup>;
		Path: kTable.Field<Baxter.Models.Backup>;
		Date: kTable.Field<Baxter.Models.Backup>;
	}
	interface BackupSettings {
		ID: kTable.Field<Baxter.Models.BackupSettings>;
		BackupSchedule: kTable.Field<Baxter.Models.BackupSettings>;
		MinFreeSpaceGB: kTable.Field<Baxter.Models.BackupSettings>;
		BackupTTLWeeks: kTable.Field<Baxter.Models.BackupSettings>;
		Time: kTable.Field<Baxter.Models.BackupSettings>;
		BackupPath: kTable.Field<Baxter.Models.BackupSettings>;
		NetworkShare: kTable.Field<Baxter.Models.BackupSettings>;
		NetworkUsername: kTable.Field<Baxter.Models.BackupSettings>;
		NetworkPassword: kTable.Field<Baxter.Models.BackupSettings>;
	}
	interface Drive {
		Name: kTable.Field<Baxter.Models.Drive>;
		VolumeLabel: kTable.Field<Baxter.Models.Drive>;
		FreeSpace: kTable.Field<Baxter.Models.Drive>;
		TotalSpace: kTable.Field<Baxter.Models.Drive>;
	}
	interface Log {
		ID: kTable.Field<Baxter.Models.Log>;
		UserID: kTable.Field<Baxter.Models.Log>;
		EntityID: kTable.Field<Baxter.Models.Log>;
		Activity: kTable.Field<Baxter.Models.Log>;
		Module: kTable.Field<Baxter.Models.Log>;
		Description: kTable.Field<Baxter.Models.Log>;
		Username: kTable.Field<Baxter.Models.Log>;
		EntityName: kTable.Field<Baxter.Models.Log>;
		Timestamp: kTable.Field<Baxter.Models.Log>;
	}
	interface Response {
		Success: kTable.Field<Baxter.Models.Response>;
		Message: kTable.Field<Baxter.Models.Response>;
		Data: kTable.Field<Baxter.Models.Response>;
	}
	interface Role {
		ID: kTable.Field<Baxter.Models.Role>;
		Name: kTable.Field<Baxter.Models.Role>;
		LogAccess: kTable.Field<Baxter.Models.Role>;
		RoleAccess: kTable.Field<Baxter.Models.Role>;
		UserAccess: kTable.Field<Baxter.Models.Role>;
		SettingsAccess: kTable.Field<Baxter.Models.Role>;
		MaintenanceAccess: kTable.Field<Baxter.Models.Role>;
		ApplicationAccess: kTable.Field<Baxter.Models.Role>;
		Users: kTable.Field<Baxter.Models.Role>;
	}
	interface User {
		ID: kTable.Field<Baxter.Models.User>;
		Name: kTable.Field<Baxter.Models.User>;
		NewPassword: kTable.Field<Baxter.Models.User>;
		ConfirmPassword: kTable.Field<Baxter.Models.User>;
		EditPassword: kTable.Field<Baxter.Models.User>;
		ConfirmEditPassword: kTable.Field<Baxter.Models.User>;
		FullName: kTable.Field<Baxter.Models.User>;
		Email: kTable.Field<Baxter.Models.User>;
		Department: kTable.Field<Baxter.Models.User>;
		EmployeeID: kTable.Field<Baxter.Models.User>;
		Salt: kTable.Field<Baxter.Models.User>;
		Password: kTable.Field<Baxter.Models.User>;
		RoleID: kTable.Field<Baxter.Models.User>;
	}
}

