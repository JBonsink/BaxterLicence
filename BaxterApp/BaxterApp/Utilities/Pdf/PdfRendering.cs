using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using PdfSharp;
using PdfSharp.Pdf;
using PdfSharp.Drawing;
using PdfSharp.Pdf.Printing;

namespace Baxter.Utilities.Pdf
{
    public enum Alignment
    {
        Left,
        Center,
        Right
    }

    public static class PFDSharpUtils
    {
        public static XGraphics NewPage(PdfDocument document, XUnit width, XUnit height)
        {
            var page = document.AddPage();
            page.Width = width;
            page.Height = height;
            return XGraphics.FromPdfPage(page);
        }

        public static XGraphics NewPage(PdfDocument document, PageSize size)
        {
            var page = document.AddPage();
            page.Size = size;
            return XGraphics.FromPdfPage(page);
        }
    }

    public static class Renderer
    {
        public static void DrawString(XGraphics gfx, string text, XFont font, XRect rect, Alignment alignment)
        {
            var size = gfx.MeasureString(text, font, XStringFormats.Center);

            switch (alignment)
            {
                case Alignment.Right:
                    rect = new XRect(new XPoint(rect.X + rect.Width - size.Width, rect.Y), new XSize(size.Width, rect.Height));
                    break;

                case Alignment.Center:
                    break;

                default:
                    rect = new XRect(new XPoint(rect.X, rect.Y), new XSize(size.Width, rect.Height));
                    break;
            }

            gfx.DrawString(text, font, XBrushes.Black, rect, XStringFormats.Center);
        }

        public static void DrawMultilineString(XGraphics gfx, string text, XFont font, XRect rect, Alignment alignment)
        {
            var size = gfx.MeasureString(text, font, XStringFormats.Center);
            rect = new XRect(rect.X, rect.Y + (rect.Height - size.Height) / 2, rect.Width, 0);

            var parts = text.Split('\n');
            var height = gfx.MeasureString(parts[0], font, XStringFormats.Center).Height;
            rect.Height = height;
            for (int i = 0; i < parts.Length; ++i)
            {
                DrawString(gfx, parts[i], font, rect, alignment);
                rect = new XRect(rect.X, rect.Y + height, rect.Width, rect.Height);
            }
        }

        /*
         * Draws the text and returns a new rect with reduced height that fits under the text and within the rect.
         */
        public static XRect DrawString(XGraphics gfx, string text, XFont font, XRect rect, XStringFormat format, double maxWidth = 0)
        {
            if (text == null) text = string.Empty;
            if (maxWidth == 0) maxWidth = rect.Width;

            var lines = text.Split(new char[] { ' ' }, 2);
            XSize size = gfx.MeasureString(text, font, format);

            if (size.Width > maxWidth && lines.Count() > 1 && format != XStringFormats.Center)
            {
                foreach (var line in lines) rect = DrawString(gfx, line, font, rect, format);
                return rect;
            }

            gfx.DrawString(text, font, XBrushes.Black, rect, format);

            return new XRect(rect.Left, rect.Top + size.Height, rect.Width, rect.Height - size.Height);
        }

        /*
         * Draws the text in the top right corner and returns a new rect with reduced hight that fills the rest of the rect. 
         */
        public static XRect DrawStringTopRight(XGraphics gfx, string text, XFont font, XRect rect)
        {
            if (text == null) text = string.Empty;
            XSize size = gfx.MeasureString(text, font, XStringFormats.TopLeft);
            XRect topRight = new XRect(rect.Right - size.Width, rect.Top, size.Width, size.Height);
            gfx.DrawString(text, font, XBrushes.Black, topRight, XStringFormats.TopLeft);
            return new XRect(rect.Left, rect.Top + size.Height, rect.Width, rect.Height);
        }

        /*
         * Draws the text in the bottom left corner at an offset from the bottom.
         */
        public static void DrawStringBottomLeft(XGraphics gfx, string text, XFont font, XRect rect, double offset)
        {
            if (text == null) text = string.Empty;
            XSize size = gfx.MeasureString(text, font, XStringFormats.TopLeft);
            XRect bottomLeft = new XRect(rect.Left, rect.Bottom - size.Height - offset, size.Width, size.Height);
            gfx.DrawString(text, font, XBrushes.Black, bottomLeft, XStringFormats.TopLeft);
        }

        /*
         * Draws the text in the bottom right corner at an offset from the bottom.
         */
        public static void DrawStringBottomRight(XGraphics gfx, string text, XFont font, XRect rect, double offset)
        {
            if (text == null) text = string.Empty;
            XSize size = gfx.MeasureString(text, font, XStringFormats.TopLeft);
            XRect bottomRight = new XRect(rect.Right - size.Width, rect.Bottom - size.Height - offset, size.Width, size.Height);
            gfx.DrawString(text, font, XBrushes.Black, bottomRight, XStringFormats.TopLeft);
        }

        public static void DrawImageFromFile(XGraphics gfx, string jpegSamplePath, XUnit x, XUnit y, XUnit width, XUnit height)
        {
            XImage image = XImage.FromFile(jpegSamplePath);
            gfx.DrawImage(image, x, y, width, height);
        }

        public static void DrawImage(XGraphics gfx, XImage image, XUnit x, XUnit y, XUnit width, XUnit height)
        {
            gfx.DrawImage(image, x, y, width, height);
        }
    }
}
