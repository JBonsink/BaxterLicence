using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Baxter.Attributes
{
    /*
     * Allows for sorting NotMapped properties based on virtual properties.
     * E.g. in the Drug model, PrimaryName is not mapped, but the table should
     * be sorted based on the values in PrimaryDrugName.Name .
     */
    class JtableSortVirtualAttribute : Attribute
    {
        private string source;

        /*
         * @param source The full name of the property accessed through virtuals.
         * For example in the Drug model the PrimaryName property would have a source of "PrimaryDrugName.Name"
         */
        public JtableSortVirtualAttribute(string source) : base()
        {
            this.source = source;
        }

        public string Source
        {
            get { return source; }
        }
    }

    class JtableFileUploadAttribute : Attribute
    {
        public JtableFileUploadAttribute() : base() { }
    }

    class ImageAttribute : Attribute
    {
        public ImageAttribute() : base() { }
    }

    class JtablePlaceHolderAttribute : Attribute
    {
        private string resource;

        public JtablePlaceHolderAttribute(string resource)
            : base()
        {
            this.resource = resource;
        }

        public string Text
        {
            get { return Utils.GetResource(resource); }
        }
    }

    class JtableVisibilityAttribute : Attribute
    {
        private string visibility;

        public JtableVisibilityAttribute(string vis)
        {
            visibility = vis;
        }

        public string Visibility
        {
            get { return visibility; }
        }
    }

    class JtableDateFormatAttribute : Attribute
    {
        private string format;

        public JtableDateFormatAttribute(string f)
        {
            format = f;
        }

        public string Format
        {
            get { return format; }
        }
    }

    class JtableEqualsAttribute : Attribute 
    {
        private string field;

        public JtableEqualsAttribute(string f)
        {
            field = f;
        }

        public string Field
        {
            get { return field;  }
        }
    }
  
    class JtableNoSortingAttribute : Attribute { }
    class JtableSkipAttribute : Attribute { }
    class JtableHideAttribute : Attribute { }
    class JtablePasswordAttribute : Attribute { }
    class JtableIP4AdressAttribute : Attribute { }
    class JtableEmailAttribute : Attribute { }
    class JtableNotListedAttribute : Attribute { }
    class JtableRequiredAttribute : Attribute { }    
}