/* This file contains custom DataAnnotations for localization purposes. */

using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Resources;

using Baxter.Models.JTable;
using Baxter.Constants;

namespace Baxter.Attributes
{
    /* This attribute is used by the standard ASP MVC procedures to create forms.
     * The localized DisplayName attribute makes it possible to use resource strings
     * to display the input field names/titles. 
     */
    class DisplayNameLocalizedAttribute : DisplayNameAttribute
    {
        private DisplayAttribute display;

        public DisplayNameLocalizedAttribute(string resourceName)
        {
            this.display = new DisplayAttribute()
            {
                ResourceType = typeof(Resources.Global),
                Name = resourceName                
            };
        }

        public override string DisplayName
        {
            get
            {
                return display.GetName();
            }
        }
    }

    /* This attribute is used by the standard ASP MVC procedures to validate forms.
     * The localized Required attribute makes it possible to use resource strings
     * to display the error message. 
     */
    class RequiredLocalizedAttribute : RequiredAttribute
    {
        public RequiredLocalizedAttribute(string resourceName)
        {
            this.ErrorMessageResourceType = typeof(Resources.Global);
            this.ErrorMessageResourceName = resourceName;
        }
    }

    /* This attribute is used by the standard ASP MVC procedures to validate forms.
     * The localized StringLength attribute makes it possible to use resource strings
     * to display the error message. 
     */
    class StringLengthLocalizedAttribute : StringLengthAttribute
    {
        public StringLengthLocalizedAttribute(int maximumLength, string resourceName)
            : base(maximumLength)
        {
            base.ErrorMessageResourceType = typeof(Resources.Global);
            base.ErrorMessageResourceName = resourceName;
        }
    }

    /* This attribute is used by the standard ASP MVC procedures to validate forms.
     * The localized Compare attribute makes it possible to use resource strings
     * to display the error message. 
     */
    class CompareLocalizedAttribute : CompareAttribute
    {
        public CompareLocalizedAttribute(string otherProperty, string resourceName)
            : base(otherProperty)
        {
            base.ErrorMessageResourceType = typeof(Resources.Global);
            base.ErrorMessageResourceName = resourceName;            
        }
    }

    /* This attribute is used to attach a description to an object property, or enum.
     * The localized Description attribute makes it possible to use resource strings
     * to display the description of an enum or object property. 
     */
    class LocalizedDescriptionAttribute : DescriptionAttribute
    {        
        public LocalizedDescriptionAttribute(string resourceName)  
            : base(resourceName)
        {            
        }

        public override string Description
        {
            get
            {                   
                return Utils.GetResource(base.Description) ?? base.Description;
            }
        }
    }      

    class LocalizedAccessLevelDescriptionAttribute : DescriptionAttribute
    {        
        public LocalizedAccessLevelDescriptionAttribute(string module)
            : base(module)
        {            
        }

        public override string Description
        {
            get
            {                   
                string module = Utils.GetResource(base.Description);
                string format = Utils.GetResource("Role_ModuleAccessLevel");
                string str = string.Format(format, module);
                return str ?? base.Description;
            }
        }
    }

    class HideLogValue : Attribute
    {
        public HideLogValue() : base() {}
    }

    class EntityLogName : Attribute
    {
        public EntityLogName() : base() {}
    }
    
    class PermissionGroupAttribute : Attribute
    {
        private readonly FunctionName group;

        public PermissionGroupAttribute(FunctionName name)
        {
            group = name;
        }

        public FunctionName Group
        {
            get { return group; }
        }
    }

    class UniqueStringAttribute : Attribute { }

    static class Utils
    {
        public static string GetResource(string name)
        {
            ResourceManager resMan = new ResourceManager("Baxter.Languages.Global", Assembly.GetAssembly(typeof(Utils)));
            return resMan.GetString(name);
        }
    }
}
