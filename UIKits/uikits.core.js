'use strict';
(function ($, undefined) {
    var ui = $.fn.uikits = {};
    ui.prototype = {
        register: function (pluginName, fn) {
            if ($.fn.hasOwnProperty(pluginName)) {
                throw 'Plugin Name ' + pluginName + ' is already existed!';
            }
            $.fn[pluginName] = fn;
        }
    };
})(jQuery, undefined);