'use strict';
(function ($, undefined) {
    $.fn.uikits = {};
    $.fn.uikits = {
        register: function (pluginName, fn) {
            if ($.fn.hasOwnProperty(pluginName)) {
                throw 'Plugin Name ' + pluginName + ' is already existed!';
            }
            $.fn[pluginName] = fn;
        }
    };
})(jQuery, undefined);