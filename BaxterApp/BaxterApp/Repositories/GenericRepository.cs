using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.Data.Entity;

using Newtonsoft.Json;

using Baxter.Constants;
using Baxter.Models;
using Baxter.Utilities;
using Baxter.Extensions;

namespace Baxter.Repositories
{
    public class GenericRepository<T> : IRepository<T> where T : class
    {
        protected DbContext context;
        protected DbSet<T> set;
        protected DbSet<Log> log;
        protected User user;

        public GenericRepository(DbContext context, User user)
        {
            this.user = user;
            this.context = context;
            set = context.Set<T>();
            log = context.Set<Log>();
        }

        public IQueryable<T> AsQueryable()
        {
            return set.AsQueryable();
        }

        public virtual void Add(T t)
        {
            context.Configuration.AutoDetectChangesEnabled = false;

            // Need to save changes to aquire an entity that we can log
            set.Add(t);
            context.SaveChanges();

            var module = LogUtilities.GetModuleFromType(typeof(T));
            string data = LogUtilities.SerializeEntity(t, context);
            int entityID = (int)context.Entry(t).Property("ID").CurrentValue;

            log.Add(new Log(entityID, module, Activity.Created, user.ID, user.Name, data));
            context.SaveChanges();
        }

        public void Add(List<T> entities)
        {
            foreach (var entity in entities) set.Add(entity);
            context.SaveChanges();

            var module = LogUtilities.GetModuleFromType(typeof(T));

            foreach (var entity in entities)
            {
                string data = LogUtilities.SerializeEntity(entity, context);
                int entityID = (int)typeof(T).GetProperty("ID").GetValue(entity);
                //int entityID = (int)context.Entry(entity).Property("ID").CurrentValue;
                log.Add(new Log(entityID, module, Activity.Created, user.ID, user.Name, data));
            }

            context.SaveChanges();
        }

        public virtual bool Delete(int id)
        {
            T entity = GetByID(id);
            if (entity != null)
            {
                var module = LogUtilities.GetModuleFromType(typeof(T));
                string data = LogUtilities.SerializeEntity(entity, context);
                Log logEntry = new Log(id, module, Activity.Deleted, user.ID, user.Name, data);

                log.Add(logEntry);
                set.Remove(entity);

                return true;
            }
            return false;
        }

        public bool Delete(List<int> entityIDs)
        {
            var module = LogUtilities.GetModuleFromType(typeof(T));

            var param = Expression.Parameter(typeof(T));
            var property = IQueryableHelper.GetMemberExpr(param, "ID");
            var val = Expression.Constant(entityIDs, typeof(List<int>));

            var contains = typeof(List<int>).GetMethod("Contains", new[] { typeof(int) });
            //method.Invoke(entityIDs, new object[] {  })
            var expr = Expression.Call(val, contains, property);

            LambdaExpression predicate = Expression.Lambda(expr, param); ;

            var query = (IQueryable<T>)typeof(Queryable).GetMethods().Single(method => method.Name == "Where" &&
                method.IsGenericMethodDefinition &&
                method.GetParameters()[1].ParameterType.GetGenericArguments()[0].GenericTypeArguments[1] == typeof(bool))
                .MakeGenericMethod(typeof(T)).Invoke(null, new object[] { AsQueryable(), predicate });

            if (query.Count() != entityIDs.Count()) return false;

            var entities = query.ToList();
            foreach (var entity in entities)
            {
                var id = (int)typeof(T).GetProperty("ID").GetValue(entity);

                string data = LogUtilities.SerializeEntity(entity, context);
                Log logEntry = new Log(id, module, Activity.Deleted, user.ID, user.Name, data);

                log.Add(logEntry);
                set.Remove(entity);
            }
            return true;
        }

        public virtual void Edit(T t, String[] modifiedProperties = null)
        {
            List<LogProperty> oldProperties, newProperties;

            set.Attach(t);
            oldProperties = LogUtilities.GetLogProperties(typeof(T), context.Entry(t).GetDatabaseValues(), context);
            newProperties = LogUtilities.GetLogProperties(typeof(T), context.Entry(t).CurrentValues, context);

            string difference = LogUtilities.SerializeDifference(typeof(T), oldProperties, newProperties, context);
            if (difference != null)
            {
                Module module = LogUtilities.GetModuleFromType(typeof(T));
                int entityID = (int)context.Entry(t).Property("ID").CurrentValue;
                Log logEntry = new Log(entityID, module, Activity.Edited, user.ID, user.Name, difference);
                log.Add(logEntry);
            }

            if (modifiedProperties != null)
            {
                context.Configuration.AutoDetectChangesEnabled = false;

                var entry = context.Entry(t);

                foreach (var prop in modifiedProperties)
                    entry.Property(prop).IsModified = true;
            }
            else
            {
                context.Entry(t).State = EntityState.Modified;
            }
        }

        public virtual void Save()
        {
            context.SaveChanges();
        }

        public int Count()
        {
            return set.Count();
        }

        public DbSet<T> All()
        {
            return set;
        }

        public T GetByID(int id)
        {
            return set.Find(id);
        }

        public IQueryable<T> Where(Expression<Func<T, bool>> predicate)
        {
            return set.Where(predicate);
        }

        public IQueryable<T> OrderBy(Expression<Func<T, string>> predicate)
        {
            return set.OrderBy(predicate);
        }

        public IQueryable<T> OrderBy(Expression<Func<T, int>> predicate)
        {
            return set.OrderBy(predicate);
        }

        public IQueryable<T> OrderByDescending(Expression<Func<T, string>> predicate)
        {
            return set.OrderByDescending(predicate);
        }

        public IQueryable<T> OrderByDescending(Expression<Func<T, int>> predicate)
        {
            return set.OrderByDescending(predicate);
        }

        public IQueryable<T> SortAndPaginate(int jtStartIndex, int jtPageSize, string jtSorting)
        {
            List<T> list = new List<T>();

            if (String.IsNullOrEmpty(jtSorting)) jtSorting = "ID ASC";
            String[] sortParameters = jtSorting.Split(' ');

            string sortByKey = sortParameters[0];
            string sortOrder = sortParameters[1];

            //Derive Lambda Expression from string
            ParameterExpression p = Expression.Parameter(typeof(T));
            Func<T, object> sortBy = Expression.Lambda<Func<T, dynamic>>(Expression.TypeAs(Expression.Property(p, sortByKey), typeof(object)), p).Compile();

            var orderedQuery = sortOrder.Equals("ASC") ? set.OrderBy(sortBy) : set.OrderByDescending(sortBy);
            return orderedQuery.Skip(jtStartIndex).Take(jtPageSize).AsQueryable();
        }
    }
}
