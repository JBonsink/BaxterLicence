(function ($) {
    $.fn.shiftSelectable = function () {
        var lastChecked, $boxes = this;

        $boxes.click(function (evt) {
            if (!lastChecked) {
                lastChecked = this;
                return;
            }

            if (evt.shiftKey) {
                var start = $boxes.index(this),
                    end = $boxes.index(lastChecked);
                $boxes.slice(Math.min(start, end), Math.max(start, end) + 1)
                    .attr('checked', lastChecked.checked)
                    .trigger('change');
            }

            lastChecked = this;
        });

        return this;
    };

    $.widget("pfl.simpletable", {

        options: {
            width: "auto",
            height: "auto",
            selectable: false,
            removable: false,
            removeCallback: null,
            headers: [],    // array of strings
            rows: [],       // array of {columns:[strings], data:object}
        },

        _table: {
            rows: {},
            nextIndex: 0
        },

        _create: function () {
            var table = $("<table></table>").addClass("table table-striped").appendTo(this.element);
            var thead = $("<thead></thead>").appendTo(table);
            var headRow = $("<tr></tr>").appendTo(thead);
            this._table.body = $("<tbody></tbody>").appendTo(table);

            this.element.width(this.options.width);
            this.element.height(this.options.height);
            //this.element.addClass("jtable-main-container");
            this.element.css("padding", "0");
            //this.element.css("border", "1px solid #00AFFF");
            //this.element.css("border-left", "thin solid #D4E4EB");
            //this.element.css("border-right", "thin solid #D4E4EB");
            //this._table.body.css("color", "#707070");

            if (this.options.selectable) {
                var th = $("<th></th>").addClass("jtable-command-column-header").addClass("jtable-column-header-selecting").appendTo(headRow);
                var thContainer = $("<div></div>").addClass().appendTo(th);
                this._table.checkAll = $('<input type="checkbox"></input>').appendTo(thContainer);
                this._table.checkAll.click(function () {
                    if ($(this).is(":checked")) {
                        table.find('input[type="checkbox"]').each(function () {
                            $(this).prop("checked", true).change();
                        });
                    } else {
                        table.find('input[type="checkbox"]').each(function () {
                            $(this).prop("checked", false).change();
                        });
                    }
                });
            }

            for (var i = 0; i < this.options.headers.length; ++i) {
                var th = $("<th></th>").addClass().appendTo(headRow);
                var thContainer = $("<div></div>").addClass().appendTo(th);
                $("<span></span>").css("margin-right", "10px").text(this.options.headers[i]).addClass().appendTo(thContainer);
            }

            if (this.options.removable) {
                $("<th></th>").addClass("jtable-command-column-header").appendTo(headRow);
            }

            for (var i = 0; i < this.options.rows.length; ++i) {
                this.addRow(this.options.rows[i].columns, this.options.rows[i].data);
            }
        },

        // row should be an array of strings
        addRow: function (columns, data) {
            var options = this.options;
            var table = this._table;
            var tbody = this.element.find('tbody');
            var tableRow = $("<tr></tr>").appendTo(tbody);
            var index = table.nextIndex;
            table.nextIndex = table.nextIndex + 1;

            table.rows[index] = {
                columns: columns,
                data: data,
                row: tableRow
            };

            if (this.options.selectable) {
                var td = $("<td></td>").addClass("jtable-selecting-column").appendTo(tableRow);
                var checkbox = $('<input type="checkbox"></input>').appendTo(td);
                checkbox.data("row-key", index);

                checkbox.change(function () {
                    var checkCount = tbody.find('tr input[type="checkbox"]:checked').length;

                    // Chance the check-all checkbox
                    if (checkCount == tbody.find('tr input[type="checkbox"]').length) {
                        table.checkAll.prop("indeterminate", false);
                        table.checkAll.prop("checked", true);
                    } else if (checkCount > 0) {
                        table.checkAll.prop("indeterminate", true);
                    } else {
                        table.checkAll.prop("indeterminate", false);
                        table.checkAll.prop("checked", false);
                    }

                    // Highlight row
                    if ($(this).is(":checked")) {
                        tableRow.addClass("jtable-row-selected");
                    } else {
                        tableRow.removeClass("jtable-row-selected");
                    }
                });
            }

            for (var i = 0; i < columns.length - 1; ++i) {
                $("<td></td>").appendTo(tableRow).html(columns[i]);
            }
            $("<td></td>").appendTo(tableRow).html(columns[columns.length - 1]);

            if (options.removable) {
                var td = $("<td></td").addClass("jtable-command-column").appendTo(tableRow);
                var button = $("<i></i>").addClass('glyphicon glyphicon-trash').appendTo(td);
                var rows = this._table.rows;

                button.click(function () {                    
                    var data = rows[index].data;
                    delete rows[index];

                    tableRow.addClass("jtable-row-deleting", 'slow', '').promise().done(function () {
                        tableRow.slideRow('up', 500, function () {
                            if ($.isFunction(options.removeCallback)) 
                                options.removeCallback(data);

                            tableRow.remove();
                        });
                    });
                });
            }

            tbody.find('input[type="checkbox"]').shiftSelectable();
        },

        getRows: function () {
            var rows = [];

            for (var key in this._table.rows) {
                rows.push(this._table.rows[key]);
            }

            return rows;
        },

        // Returns an array of {columns: [strings], data: object}
        getSelectedRows: function () {
            var result = [];
            var rows = this._table.rows;
            var tbody = this.element.find('tbody');

            tbody.find('tr input[type="checkbox"]').each(function (index, element) {
                if($(this).is(":checked")) {
                    result.push(rows[$(this).data("row-key")]);
                }
            });

            return result;
        },

        clear: function () {
            var tbody = this.element.find('tbody');

            if (tbody !== undefined) {
                tbody.find("tr").remove();
            }
            if (this._table.checkAll !== undefined) {
                this._table.checkAll.prop("checked", false);
                this._table.checkAll.prop("indeterminate", false);
            }
            this._table.rows = {}
        },

        removeRow: function (data) {
            var rows = this._table.rows;
            for (index in rows)
            {
                if (rows[index].data == data) 
                {
                    rows[index].row.remove();
                    delete rows[index];
                }
            }
        },   
    });
}(jQuery));