/* This file contains common utilities used by controllers. */

using System;
using System.Data.Entity;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;
using System.Web;

using Baxter.Attributes;
using Baxter.Constants;
using Baxter.Repositories;
using Baxter.Contexts;
using Baxter.Extensions;

namespace Baxter.Utilities
{
    public static class General
    {
        /*Hash a string using SAH512.*/
        public static string HashString(string toHash)
        {
            using (SHA512CryptoServiceProvider sha = new SHA512CryptoServiceProvider())
            {
                byte[] dataToHash = Encoding.UTF8.GetBytes(toHash);
                byte[] hashed = sha.ComputeHash(dataToHash);

                // Create a new Stringbuilder to collect the bytes 
                // and create a string.
                StringBuilder sBuilder = new StringBuilder();

                // Loop through each byte of the hashed data  
                // and format each one as a hexadecimal string. 
                for (int i = 0; i < hashed.Length; i++)
                {
                    sBuilder.Append(hashed[i].ToString("x2"));
                }

                return sBuilder.ToString();
            }
        }



        /* Get all enum values */
        public static IEnumerable<T> GetValues<T>()
        {
            return (T[])Enum.GetValues(typeof(T));
        }

        public static string GetCurrentLang()
        {
            var context = HttpContext.Current;
            var routeData = context.Request.RequestContext.RouteData;

            // load the culture info from url
            if (routeData.Values["lang"] != null && !string.IsNullOrWhiteSpace(routeData.Values["lang"].ToString()))
            {
                return routeData.Values["lang"].ToString().ToLower();
            }

            // load the culture info from the cookie
            var cookie = context.Request.Cookies["Baxter.MvcLocalization.CurrentUICulture"];
            var langHeader = string.Empty;
            if (cookie != null) return cookie.Value.ToLower();

            // load the culture info from browser
            return context.Request.UserLanguages[0].ToLower();
        }

        public static string UppercaseWords(string value)
        {
            if (string.IsNullOrEmpty(value)) return string.Empty;

            char[] array = value.ToCharArray();
            // Handle the first letter in the string.
            if (array.Length >= 1)
            {
                if (char.IsLower(array[0]))
                {
                    array[0] = char.ToUpper(array[0]);
                }
            }
            // Scan through the letters, checking for spaces.
            // ... Uppercase the lowercase letters following spaces.
            for (int i = 1; i < array.Length; i++)
            {
                if (array[i - 1] == ' ')
                {
                    if (char.IsLower(array[i]))
                    {
                        array[i] = char.ToUpper(array[i]);
                    }
                }
            }
            return new string(array);
        }

        public static String FuzzySearch(List<string> list, string word, float fuzzyness)
        {
            string result = null;
            double highestScore = fuzzyness;

            foreach (string s in list)
            {
                int levenshteinDistance = LevenshteinDistance(word, s);
                int length = Math.Max(s.Length, word.Length);
                double score = 1.0 - (double)levenshteinDistance / length;
                if (score > highestScore)
                {
                    result = s;
                    highestScore = score;
                }
            }
            return result;
        }

        private static int LevenshteinDistance(string src, string dest)
        {
            int[,] d = new int[src.Length + 1, dest.Length + 1];
            int i, j, cost;
            char[] str1 = src.ToCharArray();
            char[] str2 = dest.ToCharArray();

            for (i = 0; i <= str1.Length; i++)
            {
                d[i, 0] = i;
            }
            for (j = 0; j <= str2.Length; j++)
            {
                d[0, j] = j;
            }
            for (i = 1; i <= str1.Length; i++)
            {
                for (j = 1; j <= str2.Length; j++)
                {

                    if (str1[i - 1] == str2[j - 1])
                        cost = 0;
                    else
                        cost = 1;

                    d[i, j] =
                        Math.Min(
                            d[i - 1, j] + 1,              // Deletion
                            Math.Min(
                                d[i, j - 1] + 1,          // Insertion
                                d[i - 1, j - 1] + cost)); // Substitution

                    if ((i > 1) && (j > 1) && (str1[i - 1] ==
                        str2[j - 2]) && (str1[i - 2] == str2[j - 1]))
                    {
                        d[i, j] = Math.Min(d[i, j], d[i - 2, j - 2] + cost);
                    }
                }
            }

            return d[str1.Length, str2.Length];
        }

        public static float BytesToGigaBytes(ulong bytes)
        {
            return (bytes / 1073741824);
        }
    }
}