using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Reflection;

using Newtonsoft.Json;

using Baxter.Models.JTable;
using Baxter.Extensions;
using Baxter.Attributes;
using Baxter.Constants;

public static class IQueryableHelper
{
    public static IQueryable<T> SortAndPaginate<T>(this IQueryable<T> query, int jtStartIndex, int jtPageSize, string jtSorting)
    {
        return Paginate(Sort(query, jtSorting), jtStartIndex, jtPageSize);
    }        

    public static IQueryable<T> Paginate<T>(this IQueryable<T> query, int jtStartIndex, int jtPageSize)
    {
        return query.Skip(jtStartIndex).Take(jtPageSize).AsQueryable();
    }

    public static IQueryable<T> Sort<T>(this IQueryable<T> query, string jtSorting)
    {
        if (string.IsNullOrEmpty(jtSorting)) jtSorting = "ID ASC";

        string sortMethod = jtSorting.Contains(" ASC") ? "OrderBy" : "OrderByDescending";
        string sortProperty = jtSorting.Split(' ')[0];

        var param = Expression.Parameter(typeof(T), "x");
        Expression expr;
        
        if(!sortProperty.Contains('.'))
        {
            PropertyInfo pi = typeof(T).GetProperty(sortProperty);
            if (pi.HasAttribute<JtableSortVirtualAttribute>()) sortProperty = pi.GetAttribute<JtableSortVirtualAttribute>().Source;
        }
        
        expr = GetMemberExpr(param, sortProperty);

        var delegateType = typeof(Func<,>).MakeGenericType(typeof(T), expr.Type);
        var orderBy = Expression.Lambda(delegateType, expr, param);

        var result = typeof(Queryable).GetMethods().Single(method => method.Name == sortMethod &&
            method.IsGenericMethodDefinition &&
            method.GetGenericArguments().Length == 2 &&
            method.GetParameters().Length == 2)
            .MakeGenericMethod(typeof(T), expr.Type).Invoke(null, new object[] { query, orderBy });

        return (IOrderedQueryable<T>)result;
    }

    public static IQueryable<T> Search<T>(this IQueryable<T> query, List<SearchObject> searchObjs)
    {
        if (searchObjs == null) return query;

        foreach (var field in searchObjs.Where(f => f.Value != null))
        {
            if (!HasProperty<T>(field.Column)) continue;

            var op = field.Operator;

            var param = Expression.Parameter(typeof(T));
            var property = GetMemberExpr(param, field.Column);
            var value = GetConstantExpr(field.Value, property.Type);
            Expression expr;

            LambdaExpression predicate = null;
            
            if (property.Type == typeof(string)) 
            {
                var searchMethod = typeof(string).GetMethod(searchOperatorMethodMap[op], new[] { typeof(string) });

                expr = Expression.Call(property, searchMethod, value);
                predicate = Expression.Lambda(expr, param);
            }
            else //ints, enums, datetimes etc.
            {                   
                expr = Expression.Equal(property, value);

                if (op == SearchOperator.NotEquals) expr = Expression.NotEqual(property, value);
                else if (op == SearchOperator.LessThan) expr = Expression.LessThan(property, value);
                else if (op == SearchOperator.LessThanEquals) expr = Expression.LessThanOrEqual(property, value);
                else if (op == SearchOperator.GreaterThan) expr = Expression.GreaterThan(property, value);
                else if (op == SearchOperator.GreaterThanEquals) expr = Expression.GreaterThanOrEqual(property, value);

                predicate = Expression.Lambda(expr, param);
            }

            query = (IQueryable<T>)typeof(Queryable).GetMethods().Single(method => method.Name == "Where" &&
                method.IsGenericMethodDefinition &&
                method.GetParameters()[1].ParameterType.GetGenericArguments()[0].GenericTypeArguments[1] == typeof(bool))
                .MakeGenericMethod(typeof(T)).Invoke(null, new object[] { query, predicate });
        }

        return query;
    }

    public static bool HasProperty<T>(string propertyName)
    {
        if (propertyName.Contains("."))
        {
            var props = propertyName.Split('.');
            PropertyInfo pi = typeof(T).GetProperty(props[0]);

            for (int i = 1; pi != null && i < props.Length; ++i) pi = pi.PropertyType.GetProperty(props[i]);

            return pi != null;
        }

        return typeof(T).GetProperty(propertyName) != null;
    }

    public static Expression GetMemberExpr(Expression param, string memberName)
    {
        Expression expr = param;
        var props = memberName.Split('.');

        foreach(var prop in props) expr = Expression.Property(expr, prop);
        
        return expr;
    }

    public static ConstantExpression GetConstantExpr(string str, Type type)
    {
        object value = str;

        if (type == typeof(DateTime)) value = Convert.ToDateTime(str);
        else if (type == typeof(Guid)) value = Guid.Parse(str);
        else if (type != typeof(string)) value = JsonConvert.DeserializeObject(str, type);
        
        return Expression.Constant(value, type);
    }

    public static Dictionary<SearchOperator, string> searchOperatorMethodMap = new Dictionary<SearchOperator, string>()
    {
        { SearchOperator.Contains, "Contains"},
        { SearchOperator.Equals, "Equals"},
        { SearchOperator.StartsWith, "StartsWith"},
        { SearchOperator.EndsWith, "EndsWith"}
    };
}



