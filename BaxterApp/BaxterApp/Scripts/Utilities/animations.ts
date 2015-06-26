module Animations {
    export function spin(el) {        
        el = getIcon(el);        
        el.data('oldClass', el.attr('class'));
        el.removeClass(el.data('oldClass'));
        el.addClass('fa fa-circle-o-notch fa-spin');
    }

    export function stopSpin(el)
    {
        el = getIcon(el);
        el.removeClass('fa fa-circle-o-notch fa-spin');
        el.addClass(el.data('oldClass'));
        delete el.oldClass;
    }

    function getIcon(el) {
        if (el.children().length > 0) {
            el = el.find('i');
        }
        return el;
    }
}

//function scrollToPosition(posY)
//{
//    /// <signature>
//    /// <summary>
//    /// Scroll to the given position. To retrieve the position of an element use $(selector).offset().top
//    /// </summary>
//    /// <param name="posY" type="int" />
//    /// </signature>
//    $("html, body").bind("scroll DOMMouseScroll mousewheel", function () {
//        $('html, body').stop();
//    });

//    $('html, body').animate({ scrollTop: posY }, 'fast', function () {
//        $("html, body").stop().unbind("scroll DOMMouseScroll mousewheel");
//    });
//}

//function isScrolledIntoView(elem) {
//    var docViewTop = $(window).scrollTop();
//    var docViewBottom = docViewTop + $(window).height();

//    var elemTop = $(elem).offset().top;
//    var elemBottom = elemTop + $(elem).height();

//    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
//}

//(function ($) {
//    var sR = {
//        defaults: {
//            slideSpeed: 400,
//            easing: false,
//            callback: false
//        },
//        thisCallArgs: {
//            slideSpeed: 400,
//            easing: false,
//            callback: false
//        },
//        methods: {
//            up: function (arg1, arg2, arg3) {
//                if (typeof arg1 == 'object') {
//                    for (p in arg1) {
//                        sR.thisCallArgs.eval(p) = arg1[p];
//                    }
//                } else if (typeof arg1 != 'undefined' && (typeof arg1 == 'number' || arg1 == 'slow' || arg1 == 'fast')) {
//                    sR.thisCallArgs.slideSpeed = arg1;
//                } else {
//                    sR.thisCallArgs.slideSpeed = sR.defaults.slideSpeed;
//                }

//                if (typeof arg2 == 'string') {
//                    sR.thisCallArgs.easing = arg2;
//                } else if (typeof arg2 == 'function') {
//                    sR.thisCallArgs.callback = arg2;
//                } else if (typeof arg2 == 'undefined') {
//                    sR.thisCallArgs.easing = sR.defaults.easing;
//                }
//                if (typeof arg3 == 'function') {
//                    sR.thisCallArgs.callback = arg3;
//                } else if (typeof arg3 == 'undefined' && typeof arg2 != 'function') {
//                    sR.thisCallArgs.callback = sR.defaults.callback;
//                }
//                var $cells = $(this).find('td');
//                $cells.wrapInner('<div class="slideRowUp" />');
//                var currentPadding = $cells.css('padding');
//                $cellContentWrappers = $(this).find('.slideRowUp');
//                $cellContentWrappers.slideUp(sR.thisCallArgs.slideSpeed, sR.thisCallArgs.easing).parent().animate({
//                    paddingTop: '0px',
//                    paddingBottom: '0px'
//                }, {
//                    complete: function () {
//                        $(this).children('.slideRowUp').replaceWith($(this).children('.slideRowUp').contents());
//                        $(this).parent().css({ 'display': 'none' });
//                        $(this).css({ 'padding': currentPadding });
//                    }
//                });
//                var wait = setInterval(function () {
//                    if ($cellContentWrappers.is(':animated') === false) {
//                        clearInterval(wait);
//                        if (typeof sR.thisCallArgs.callback == 'function') {
//                            sR.thisCallArgs.callback.call(this);
//                        }
//                    }
//                }, 100);
//                return $(this);
//            },
//            down: function (arg1, arg2, arg3) {
//                if (typeof arg1 == 'object') {
//                    for (p in arg1) {
//                        sR.thisCallArgs.eval(p) = arg1[p];
//                    }
//                } else if (typeof arg1 != 'undefined' && (typeof arg1 == 'number' || arg1 == 'slow' || arg1 == 'fast')) {
//                    sR.thisCallArgs.slideSpeed = arg1;
//                } else {
//                    sR.thisCallArgs.slideSpeed = sR.defaults.slideSpeed;
//                }

//                if (typeof arg2 == 'string') {
//                    sR.thisCallArgs.easing = arg2;
//                } else if (typeof arg2 == 'function') {
//                    sR.thisCallArgs.callback = arg2;
//                } else if (typeof arg2 == 'undefined') {
//                    sR.thisCallArgs.easing = sR.defaults.easing;
//                }
//                if (typeof arg3 == 'function') {
//                    sR.thisCallArgs.callback = arg3;
//                } else if (typeof arg3 == 'undefined' && typeof arg2 != 'function') {
//                    sR.thisCallArgs.callback = sR.defaults.callback;
//                }
//                var $cells = $(this).find('td');
//                $cells.wrapInner('<div class="slideRowDown" style="display:none;" />');
//                $cellContentWrappers = $cells.find('.slideRowDown');
//                $(this).show();
//                $cellContentWrappers.slideDown(sR.thisCallArgs.slideSpeed, sR.thisCallArgs.easing, function () { $(this).replaceWith($(this).contents()); });

//                var wait = setInterval(function () {
//                    if ($cellContentWrappers.is(':animated') === false) {
//                        clearInterval(wait);
//                        if (typeof sR.thisCallArgs.callback == 'function') {
//                            sR.thisCallArgs.callback.call(this);
//                        }
//                    }
//                }, 100);
//                return $(this);
//            }
//        }
//    };

//    $.fn.slideRow = function (method, arg1, arg2, arg3) {
//        /// <signature>
//        /// <summary>
//        /// Slide a table row up or down
//        /// </summary>
//        /// <param name="method" type="string">
//        /// 'up' or 'down'
//        /// </param>
//        /// <param name="speed" type="string">
//        /// 'slow', 'fast' or speed in ms
//        /// </param>
//        /// </signature>
//        if (typeof method != 'undefined') {
//            if (sR.methods[method]) {
//                return sR.methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
//            }
//        }
//    };
//})(jQuery);
