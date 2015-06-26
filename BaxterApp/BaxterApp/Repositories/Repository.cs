using System.Linq.Expressions;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;

namespace Baxter.Repositories
{
    public interface IRepository<T> where T : class
    {
        void Add(T t);
        void Add(List<T> entities);
        bool Delete(int id);
        bool Delete(List<int> IDs);
        void Edit(T t, string[] modifiedProperties = null);
        void Save();

        int Count();
        DbSet<T> All();
        T GetByID(int id);
        IQueryable<T> AsQueryable();
        IQueryable<T> Where(Expression<System.Func<T, bool>> predicate);
        IQueryable<T> OrderBy(Expression<System.Func<T, string>> predicate);
        IQueryable<T> OrderBy(Expression<System.Func<T, int>> predicate);
        IQueryable<T> SortAndPaginate(int jtStartIndex, int jtPageSize, string jtSorting);
        IQueryable<T> OrderByDescending(Expression<System.Func<T, string>> predicate);
        IQueryable<T> OrderByDescending(Expression<System.Func<T, int>> predicate);
    }
}
