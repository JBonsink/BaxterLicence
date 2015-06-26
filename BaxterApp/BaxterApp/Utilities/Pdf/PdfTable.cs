using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using PdfSharp;
using PdfSharp.Pdf;
using PdfSharp.Drawing;
using PdfSharp.Pdf.Printing;
using System.Text;
           
namespace Baxter.Utilities.Pdf
{
    public class Cell
    {
        public Cell()
        {
            this.height = XUnit.Zero;
        }

        public Cell(string text, XUnit width, XFont font, Alignment alignment)
        {
            this.Text = text;
            this.width = width;
            this.font = font;
            this.alignment = alignment;
            this.height = XUnit.Zero;
        }

        public string Text
        {
            get { return text; }
            set { text = (value == null) ? String.Empty : value; }
        }

        public XUnit width, height;

        public XFont font;
        public Alignment alignment;

        private string text = String.Empty;

    }

    public class Row
    {
        public List<Cell> Cells
        {
            get { return cells; }
        }

        private List<Cell> cells = new List<Cell>();
    }

    public class Table
    {
        public Table(XPoint position, XUnit width)
        {
            this.position = position;
            this.width = width;

            margin = XUnit.FromPoint(3);
            pen = new XPen(XColors.Black, XUnit.FromPoint(0.5));
            rows = new List<Row>();
        }

        public List<Row> Rows
        {
            get { return rows; }
        }

        public void Draw(XGraphics gfx)
        {
            XPoint pos = new XPoint();
            pos.Y = position.Y;

            for(int i = 0; i < Rows.Count; ++i)
            {
                var row = Rows[i];
                var height = GetRowHeight(row, gfx) + 2 * margin;
                pos.X = position.X;

                for(int k = 0; k < row.Cells.Count - 1; ++k)
                {
                    var cell = row.Cells[k];
                    var rect = new XRect(new XPoint(pos.X + margin, pos.Y), new XSize(cell.width - 2*margin, height));
                    
                    Renderer.DrawMultilineString(gfx, GetCellText(cell, gfx), cell.font, rect, cell.alignment);
                    pos.X += cell.width;
                    gfx.DrawLine(pen, pos.X, pos.Y, pos.X, pos.Y + height);
                }

                if(row.Cells.Count > 0)
                {
                    var cell = row.Cells[row.Cells.Count - 1];
                    var rect = new XRect(new XPoint(pos.X + margin, pos.Y), new XSize(cell.width - margin, height));
                    Renderer.DrawString(gfx, GetCellText(cell, gfx), cell.font, rect, cell.alignment);
                }

                pos.Y += height;
                if (i + 1 < Rows.Count) gfx.DrawLine(pen, position.X, pos.Y, position.X + width, pos.Y);
            }

            gfx.DrawLine(pen, position.X, position.Y, position.X + width, position.Y);
            gfx.DrawLine(pen, position.X + width, position.Y, position.X + width, pos.Y);
            gfx.DrawLine(pen, position.X, pos.Y, position.X + width, pos.Y);
            gfx.DrawLine(pen, position.X, position.Y, position.X, pos.Y);
        }

        private string GetCellText(Cell cell, XGraphics gfx)
        {
            var text = string.Empty;
            var size = gfx.MeasureString(cell.Text, cell.font, XStringFormats.Center);
            var parts = cell.Text.Split(new char[]{' '}, StringSplitOptions.RemoveEmptyEntries);

            while (parts.Length > 0)
            {
                int i;
                for (i = parts.Length; i > 0 && size.Width > cell.width; --i)
                {
                    size = gfx.MeasureString(String.Join(" ", parts.Take(i)), cell.font, XStringFormats.Center);
                }

                text += String.Join(" ", parts.Take(i)) + '\n';
                parts = parts.Skip(i).ToArray();
            }

            return (text != string.Empty && text.Last() == '\n') ? text.Substring(0, text.Length - 1) : text;
        }

        private XUnit GetCellHeight(Cell cell, XGraphics gfx)
        {
            if (cell.height != XUnit.Zero) return cell.height;
            else return gfx.MeasureString(GetCellText(cell, gfx), cell.font, XStringFormats.Center).Height;
        }

        private XUnit GetRowHeight(Row row, XGraphics gfx)
        {
            var height = XUnit.Zero;

            foreach(var cell in row.Cells)
            {
                var cellHeight = GetCellHeight(cell, gfx);
                if (cellHeight > height) height = cellHeight;
            }

            return height;
        }

        private XUnit margin;
        private XPen pen;
        private XPoint position;
        private XUnit width;
        private List<Row> rows;
    }
}
