using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Reflection;

using Baxter.Models.JTable;
using Baxter.Extensions;
using Baxter.Attributes;
using Baxter.Constants;

public static class ListHelper
{
    public static List<T> SortAndPaginate<T>(this List<T> listIn, int jtStartIndex, int jtPageSize, string jtSorting)
    {
        if (String.IsNullOrEmpty(jtSorting)) jtSorting = "ID ASC";
                
        String[] sortParameters = jtSorting.Split(' ');

        string sortByKey = sortParameters[0];
        string sortOrder = sortParameters[1];

        //Derive Lambda Expression from string
        ParameterExpression p = Expression.Parameter(typeof(T));
        Func<T, object> sortBy = Expression.Lambda<Func<T, dynamic>>(Expression.TypeAs(Expression.Property(p, sortByKey), typeof(object)), p).Compile();

        var orderedList = sortOrder.Equals("ASC") ? listIn.OrderBy(sortBy) : listIn.OrderByDescending(sortBy);
        return orderedList.Skip(jtStartIndex).Take(jtPageSize).ToList();
    }
}

