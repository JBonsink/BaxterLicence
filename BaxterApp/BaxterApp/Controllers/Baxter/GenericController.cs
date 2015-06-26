using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.Data.Entity;

using Newtonsoft.Json.Web;

using Baxter.Attributes;
using Baxter.Extensions;
using Baxter.Constants;
using Baxter.Repositories;
using Baxter.Models.JTable;
using Baxter.Utilities;
using Baxter.Models;
using Baxter.Contexts;

namespace Baxter.Controllers
{
    public enum Action
    {
        List,
        Edit,
        Create,
        Delete
    }

    public class GenericController<T> : GenericController<T, BaxterContext> where T : class
    {
    }

    public class GenericController<T, C> : BaseController<C>
        where T : class
        where C : DbContext, new()
    {
        protected IRepository<T> repo;

        private Dictionary<Action, String> actionNames = new Dictionary<Action, String>();

        protected GenericController()
        {
            repo = new GenericRepository<T>(base.db, base.user);

            actionNames.Add(Action.List, "List");
            actionNames.Add(Action.Edit, "Edit");
            actionNames.Add(Action.Create, "Create");
            actionNames.Add(Action.Delete, "Delete");
        }

        protected virtual void PostListProc(List<T> records) { }

        [HttpGet]
        public virtual ActionResult Index()
        {
            return Authorize();
        }

        protected ActionResult Authorize()
        {
            string loginUrl = Url.Action("Login", "Account");

            if ((!HasPermission(typeof(T), Permission.View))) return Redirect(loginUrl + "?accessDenied=true");
            return View();
        }

        [HttpPost]
        public JsonNetResult GetActions()
        {
            var actions = new Dictionary<string, string>();

            if (HasPermission(typeof(T), Permission.View) && actionNames.ContainsKey(Action.List))
                actions.Add("listAction", Url.Action(actionNames[Action.List]));
            if (HasPermission(typeof(T), Permission.Create) && actionNames.ContainsKey(Action.Create))
                actions.Add("createAction", Url.Action(actionNames[Action.Create]));
            if (HasPermission(typeof(T), Permission.Edit) && actionNames.ContainsKey(Action.Edit))
                actions.Add("updateAction", Url.Action(actionNames[Action.Edit]));
            if (HasPermission(typeof(T), Permission.Delete) && actionNames.ContainsKey(Action.Delete))
                actions.Add("deleteAction", Url.Action(actionNames[Action.Delete]));

            return JsonNet.JsonObject(actions);
        }

        [HttpPost]
        public JsonNetResult GetFields()
        {
            if (!HasPermission(typeof(T), Permission.View)) return JsonNet.JsonError(Resources.Global.General_AccessDenied);
            return JtableUtil.GetFields(typeof(T));
        }

        [HttpPost]
        public virtual JsonNetResult List(int jtStartIndex, int jtPageSize, string jtSorting = null,
            List<SearchObject> searchFields = null)
        {
            if (!HasPermission(typeof(T), Permission.View)) return JsonNet.JsonError(Resources.Global.General_AccessDenied);
            try
            {
                var query = repo.All().AsNoTracking().Search(searchFields);
                var list = query.SortAndPaginate(jtStartIndex, jtPageSize, jtSorting).ToList();
                PostListProc(list);
                return JsonNet.JsonOKRecords(list, query.Count());
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        [HttpPost]
        public virtual JsonNetResult Create(T entity)
        {
            string prop = null;
            if (!HasPermission(typeof(T), Permission.Create)) return JsonNet.JsonError(Resources.Global.General_AccessDenied);
            if (!ModelState.IsValid) return JsonNet.JsonError(Resources.Global.General_ReceivedInvalidData);
            if (!IsUnique(entity, ref prop)) return JsonNet.JsonError(String.Format(Resources.Global.General_PropertyIsNotUnique, prop));

            try
            {
                repo.Add(entity);
                repo.Save();
                return JsonNet.JsonOKRecord<T>(entity);
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        [HttpPost]
        public virtual JsonNetResult Edit(T entity)
        {
            string prop = null;
            if (!HasPermission(typeof(T), Permission.Edit)) return JsonNet.JsonError(Resources.Global.General_AccessDenied);
            if (!ModelState.IsValid) return JsonNet.JsonError(Resources.Global.General_ReceivedInvalidData);
            if (!IsUnique(entity, ref prop, true)) return JsonNet.JsonError(String.Format(Resources.Global.General_PropertyIsNotUnique, prop));

            try
            {
                repo.Edit(entity);
                repo.Save();
                return JsonNet.JsonOKRecord<T>(entity);
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        [HttpPost]
        public virtual JsonNetResult Delete(List<int> IDs)
        {
            if (!HasPermission(typeof(T), Permission.Delete)) return JsonNet.JsonError(Resources.Global.General_AccessDenied);
            try
            {
                var succes = repo.Delete(IDs);
                repo.Save();

                if (succes) return JsonNet.JsonOK();
                else return JsonNet.JsonError(Resources.Global.General_FailedMultiDelete);
            }
            catch (Exception ex)
            {
                return JsonNet.JsonError(ex.Message + '\n' + ex.StackTrace);
            }
        }

        protected void SetAction(Action action, string actionName)
        {
            actionNames[action] = actionName;
        }

        protected void RemoveAction(Action action)
        {
            if (actionNames.ContainsKey(action)) actionNames.Remove(action);
        }

        protected bool IsUnique(T entity, ref string propName, bool edit = false)
        {
            var query = repo.AsQueryable().AsNoTracking();
            foreach (var pi in typeof(T).GetProperties())
            {
                if (pi.HasAttribute<UniqueStringAttribute>() && pi.IsType<String>())
                {
                    propName = (pi.HasAttribute<LocalizedDescriptionAttribute>()) ? pi.GetAttribute<LocalizedDescriptionAttribute>().Description : pi.Name;
                    var para = Expression.Parameter(typeof(T));
                    var prop = Expression.Property(para, pi.Name);
                    var val = Expression.Constant(pi.GetValue(entity), typeof(String));
                    var equals = typeof(string).GetMethod("Equals", new[] { typeof(string) });
                    var expr = Expression.Call(prop, equals, val);

                    if (edit)
                    {
                        var idProp = Expression.Property(para, "ID");
                        var idVal = Expression.Constant(typeof(T).GetProperty("ID").GetValue(entity), typeof(int));
                        var expr2 = Expression.NotEqual(idProp, idVal);
                        query = query.Where(Expression.Lambda<Func<T, bool>>(expr2, para).Compile()).AsQueryable();
                    }

                    var check = query.Where(Expression.Lambda<Func<T, bool>>(expr, para).Compile()).AsQueryable();
                    if (check.Count() > 0) return false;
                }
            }
            return true;
        }
    }
}