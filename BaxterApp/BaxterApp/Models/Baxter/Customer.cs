using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

using Baxter.Attributes;
using Baxter.Constants;

namespace Baxter.Models
{
    [TypeLite.TsClass, Table("Customers"), PermissionGroup(FunctionName.Application)]
    public class Customer
    {
        public int ID { get; set; }

        [StringLength(250), LocalizedDescription("General_Customer")]
        public string CustomerName { get; set; }
        [StringLength(50), LocalizedDescription("Customer_Country")]
        public string Country { get; set; }
        [StringLength(50)]
        public string City { get; set; }
        [StringLength(50)]
        public string LicensesCode { get; set; }
        [StringLength(50)]
        public string LicensesValidUntil { get; set; }
        [StringLength(50)]
        public string GivenBy { get; set; }
        [StringLength(50)]
        public string GivenDate { get; set; }
        [StringLength(50)]
        public string RequestedBy { get; set; }
    }
}