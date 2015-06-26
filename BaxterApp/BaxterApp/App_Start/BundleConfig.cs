using System.Web;
using System.Web.Optimization;

namespace Baxter
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js",
                        "~/Scripts/jquery-ui-{version}.js",
                        "~/Scripts/jquery.cookie.js",
                        "~/Scripts/date.js",
                        "~/Scripts/jquery.fileDownload.js",
                        "~/Scripts/typeahead.bundle.js",
                        "~/Scripts/colorbox/jquery.colorbox.js",
                        "~/Scripts/utilities/Table.js",
                        "~/Scripts/chart.js",
                        "~/Scripts/sidebar.js",
                        "~/Scripts/jquery.uploadifive.js",
                        "~/Scripts/rivets.bundled.min.js",
                        "~/Scripts/utilities/moment.js",
                        "~/Scripts/binders.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap")
                .Include("~/Scripts/bootstrap.js",
                         "~/Scripts/bootstrap-dialog.js",
                         "~/Scripts/bootstrap-datepicker/bootstrap-datepicker.js",
                         "~/Scripts/bootstrap-datepicker/locales/bootstrap-datepicker.nl.js",
                         "~/Scripts/bootstrap-tabs-x.js"
                )
                .IncludeDirectory("~/Scripts/bootstrap-datepicker", "*.js"));

            bundles.Add(new ScriptBundle("~/bundles/ktable")
                .Include("~/Scripts/validation-engine/js/jquery.validationEngine.js",
                         "~/Scripts/kTable.js"));

            bundles.Add(new ScriptBundle("~/bundles/utilities")
               .Include("~/Scripts/utilities/ajax.js",
                        "~/Scripts/utilities/animations.js",
                        "~/Scripts/Utilities/barcode.js",
                        "~/Scripts/utilities/extensions.js",
                        "~/Scripts/utilities/kTable.js",
                        "~/Scripts/utilities/modals.js",
                        "~/Scripts/utilities/inputs.js",
                        "~/Scripts/utilities/utilities.js",
                        "~/Scripts/constants.js",
                        "~/Scripts/enums.js"

                        ));

            bundles.Add(new StyleBundle("~/bundles/jtableStyles").Include(
                         "~/Content/jtable.bootstrap.css",
                         "~/Scripts/validation-engine/css/validationEngine.jquery.css"));

            bundles.Add(new StyleBundle("~/bundles/css")
                .Include("~/Content/bootstrap-datepicker.css",
                         "~/Content/bootstrap-tabs-x.css",
                         "~/Content/bootstrap-checkbox.css",
                         "~/Content/typeahead.js-bootstrap.css",
                         "~/Scripts/colorbox/colorbox.css",
                         "~/Content/font-awesome.min.css",
                         "~/Content/sidebar.css",
                         "~/Content/flags16.css",
                         "~/Content/flags32.css",
                         "~/Content/uploadifive.css",
                         "~/Content/site.css"
                         ));

            //BundleTable.EnableOptimizations = true;
        }
    }
}