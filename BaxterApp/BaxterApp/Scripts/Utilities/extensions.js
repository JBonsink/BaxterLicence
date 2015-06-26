(function ($) {
    String.format = function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }

        return s;
    }

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str) {
            return this.slice(0, str.length) == str;
        };
    }

    $.fn.hasScrollBar = function () {
        return this.get(0).scrollHeight > this.innerHeight();
    }

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
})(jQuery);