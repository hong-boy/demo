'use strict';
(function ($) {
    /**
     * 功能：
     * #1 可配置带箭头提示框
     * #2 提示框内容支持HTML格式（考虑XSS）
     * #3 提示框尺寸可固定
     * #4 提示框显示动画效果
     * #5 提示框自动判断文本内容是否溢出
     * #6 提示框自动适应可视窗口
     * #7 支持全局托管（触发事件委托于body）
     * #8 支持自定义触发事件（包括：click、hover、mouse*）
     */
    var DEFAULTS = {
        template: '<div class="tooltip-panel"><div class="panel-cont"></div><i class="panel-fill"></i><i class="panel-arrow-top"></i><i class="panel-arrow-bottom"></i></div>',
        trigger: 'hover',
        selector: '[title]', // 若selector为空，则$wrap == $target
        content: null,
        arrow: true,
        origin: 'left top', // 提示框定位方式，表示以提示框的哪一个位置作为定位参考点，类似于transform-origin
        alwaysDisposeDom: false, // 是否总是生成新的DOM节点
        showOnOverflow: false, // true-只当文本溢出容器时，才显示提示框
        appendToParent: false, // 提示框依托的容器，默认为body
        beforeShown: null,
        afterShown: null,
        afterHidden: null,
        size: false, // 提示框尺寸 'width,height'
    };

    var ns = 'tooltip';
    var uikits = $.fn.uikits;
    var _slice = Array.prototype.slice;

    var util = {
        isDelegatedMode: function (option) {
            return !!option.selector;
        },
        getTriggerInEvent: function (option) {
            return [option.trigger, ns].join('.');
        },
        getTriggerOutEvent: function (option) {
            var triggerOutEvent = 'click';
            if (option.trigger === 'hover' || option.trigger === 'mouseover') {
                triggerOutEvent = 'mouseout';
            }
            return [triggerOutEvent, ns].join('.');
        },
    };

    var ui = {
        render: function (option, $target, $wrap) {
            return '';
        },
        show: function (option, $target, $wrap) {

        },
        hide: function (option, $target, $wrap) {

        }
    };

    var methods = {
        init: function (option) {
            var $wrap = $(this),
                opt = $.extend(true, {}, DEFAULTS, option),
                triggerInEvent = util.getTriggerInEvent(opt),
                triggerOutEvent = util.getTriggerOutEvent(opt);
            if (util.isDelegatedMode(opt)) {
                // 显示
                $wrap.off(triggerInEvent, opt.selector)
                    .on(triggerInEvent, opt.selector, function (e) {
                        // TODO
                        ui.show(opt, $(this), $wrap);
                        return false;
                    });
                // 隐藏
                $wrap.off(triggerOutEvent, opt.selector)
                    .on(triggerOutEvent, opt.selector, function (e) {
                        // TODO
                        ui.hide(opt, $(this), $wrap);
                        return false;
                    });
            } else {
                // 显示
                $wrap.unbind(triggerInEvent)
                    .bind(triggerInEvent, function (e) {
                        // TODO
                        ui.show(opt, $(this), $wrap);
                        return false;
                    });
                // 隐藏
                $wrap.unbind(triggerOutEvent)
                    .bind(triggerOutEvent, function (e) {
                        // TODO
                        ui.hide(opt, $(this), $wrap);
                        return false;
                    });
            }
            return this;
        }
    };

    var tooltip = function (method, options) {
        if (typeof method === 'string' && methods[method]) {
            return methods[method].call(this, _slice.call(arguments, 1));
        } else if (typeof method === 'object') {
            return methods['init'].call(this, _slice.call(arguments, 0));
        } else {
            throw 'Illegal arguments: ' + _slice.call(arguments, 0);
        }
    };
    uikits.register('tooltip', tooltip);
})(jQuery);