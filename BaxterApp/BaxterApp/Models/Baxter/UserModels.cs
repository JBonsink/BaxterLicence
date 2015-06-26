using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

using Newtonsoft.Json;
using TypeLite;

using Baxter.Attributes;

namespace Baxter.Models
{  
    [Table("Users"), TsClass]
    public class User
    {
        public int ID { get; set; }

        [Required, StringLength(250), LocalizedDescription("User_UserName"), EntityLogName, UniqueString]        
        public string Name { get; set; }                                                        
        [NotMapped, JtableRequired, StringLength(250, MinimumLength = 6), LocalizedDescription("Account_Manage_NewPassword"), JtablePassword]
        public string NewPassword { get; set; }
        [NotMapped, StringLength(250), LocalizedDescription("Account_Global_ConfirmPassword"), JtablePassword, JtableEquals("NewPassword")]
        public string ConfirmPassword { get; set; }
        [NotMapped, StringLength(250, MinimumLength = 6), LocalizedDescription("Account_Manage_NewPassword"), JtablePassword]
        public string EditPassword { get; set; }
        [NotMapped, StringLength(250), LocalizedDescription("Account_Global_ConfirmPassword"), JtablePassword, JtableEquals("EditPassword")]
        public string ConfirmEditPassword { get; set; }

        [StringLength(250), LocalizedDescription("User_FullName")]
        public string FullName { get; set; }
        [StringLength(250), LocalizedDescription("User_Email"), JtableEmail]
        public string Email { get; set; }        
        [StringLength(250), LocalizedDescription("General_Department"), JtableSkip]
        public string Department { get; set; }
        [StringLength(250), LocalizedDescription("User_EmployeeID"), JtableSkip]
        public string EmployeeID { get; set; }                                                                                                                   
        
        [StringLength(250), JtableSkip]
        public string Salt { get; set; }
        [JsonIgnore, Required, StringLength(250), LocalizedDescription("User_Password"), HideLogValue, JtableSkip]
        public string Password { get; set; }

        [LocalizedDescription("General_Role")]
        public int RoleID { get; set; }
        [JsonIgnore, TsIgnore]
        public virtual Role Role { get; set; }
    }      
       
    public class UserLoginModel
    {
        [RequiredLocalized("Account_Login_UserNameRequired"), DisplayNameLocalized("User_UserName")]
        public string Name { get; set; }
                
        [RequiredLocalized("Account_Login_PasswordRequired"), DisplayNameLocalized("User_Password")]
        public string Password { get; set; }
        
        [DisplayNameLocalized("Account_Login_RememberMe")]
        public bool RememberMe { get; set; }
    }
    
    public class UserUpdatePasswordModel
    {
        [DataType(DataType.Password), RequiredLocalized("Account_Manage_CurrentPasswordRequired"),
         DisplayNameLocalized("Account_Manage_CurrentPassword")]
        public string CurrentPassword { get; set; }

        [DataType(DataType.Password), RequiredLocalized("Account_Manage_NewPasswordRequired"),
         DisplayNameLocalized("Account_Manage_NewPassword"), StringLengthLocalizedAttribute(250, "Error_MaxStringLength")] 
        public string NewPassword { get; set; }

        [DataType(DataType.Password), RequiredLocalized("Account_Global_ConfirmPassword"),
         DisplayNameLocalized("Account_Manage_NewPassword"), CompareLocalized("NewPassword","Account_Global_PasswordMismatch"),
         StringLengthLocalizedAttribute(250, "Error_MaxStringLength")]
        public string ConfirmPassword { get; set; }
    }
}