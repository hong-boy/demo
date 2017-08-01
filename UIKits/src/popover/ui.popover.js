'use strict';
(function ($, undefined) {
    /**
     * 弹出框
     * （当需要展示的内容是带格式的HTML代码时，可以选用此插件；tooltip适用于单纯的文本展示，popover适用于更丰富的场景）
     * 功能：
     * #1 支持HTML代码（不能包含script标签）
     * #2 支持设置header、footer（如：可用于制作一个精巧的确认框）
     * #3 支持自定义触发事件（主要包括：click、mouseenter、mouseover）
     * #4 弹出框可以自动调整显示位置，亦可固定在某个位置
     * #5 弹出框自动适应可视窗口
     * #6 弹出框可以通过全局托管的方式打开（如：table里面每一行都有一个删除之前进行确认的操作）
     */
    var DEFAULTS = {
        template: '<div class="uk-popover arrow"><header class="popover-header"></header><section class="content"></section><footer class="popover-footer"></footer></div>',
        content: function ($target) { // 要展示的内容，必须是一个function函数，该函数可以返回jQuery对象或者字符串，若返回结果是字符串则不能包含html标签
            return '';
        },
        customClass: null, // 自定义类名 若不为空，则将添加到div.uk-popover元素上
        header: null, // 弹出框标题，若为空则不会渲染header.popover-header元素
        buttons: null, // 自定义操作，若不为空，则将展示到footer.popover-footer元素内；形如:[{text:'按钮名称', clazz:'自定义类名', click:Function}]；若为空则不渲染footer元素
        flip: false, // 当弹出框超出可视窗口时是否反转显示
        trigger: 'mouseover', // 触发方式，支持：mouseover、mouseenter、click
        position: 'bottom', // 位置 bottom-底部（相对于目标节点）top-顶部 left-左侧 right-右侧
        selector: null, // 目标节点选择器; 若为空，则默认使用当前this节点作为目标节点
    };

    var util = {
        nextTick: function (fn) {
            if (typeof window.requestAnimationFrame === 'function') {
                requestAnimationFrame(fn);
            } else {
                setTimeout(fn, 1);
            }
        },
        /**
         * 判断是否是委托事件绑定
         * @param option
         * @returns {boolean}
         */
        isDelegatedMode: function (option) {
            return !!option.selector;
        },
        /**
         * 为事件包裹命名空间
         * @param eventName
         * @returns {string}
         */
        wrapEventNamespace: function (eventName) {
            return [eventName, '.uk'].join('');
        },
        /**
         * 根据传入的option.trigger事件，获取对立事件（用于关闭tooltip框）
         * @param option
         */
        getDetachedEventName: function (option) {
            var detachedEvent = null;
            option.trigger = option.trigger || 'mouseover';
            switch (option.trigger) {
                case 'mouseenter':
                {
                    detachedEvent = 'mouseleave';
                    break;
                }
                case 'click':
                {
                    detachedEvent = 'click';
                    break;
                }
                case 'mouseover':
                default:
                {
                    option.trigger = 'mouseover';
                    detachedEvent = 'mouseout';
                    break;
                }
            }
            return this.wrapEventNamespace(detachedEvent);
        },
        /**
         * 获取container容器（用于存放tooltip框）
         * @param option
         * @param $target 目标节点
         */
        getContainer: function (option, $target) {
            var $parent = $target.parent();
            if ($parent.css('position') === 'static') {
                $parent.css('position', 'relative');
            }
            return $parent;
        },
        /**
         * 获取待显示的内容
         * @param $target
         * @param option
         */
        getPopoverContent: function ($target, option) {
            var fn = option.content;
            if (!$.isFunction(fn)) {
                throw 'Illegal arguments: option.content should be a function'
            }
            var content = fn.call(null, $target);
            if (!(content instanceof jQuery || typeof content === 'string')) {
                throw 'option.content should return a string or jQuery object'
            }
            return content;
        },
        /**
         * 获取目标节点上的属性配置
         * 支持的属性：
         * popover-flip: option.flip
         * popover-arrow: option.arrow
         * popover-position: option.position
         * popover-header: option.header
         * @param $target
         * @param attr
         */
        getAttrOption: function ($target, attr) {
            var attrValue = $target.attr(attr);
            switch (attr) {
                case 'popover-flip':
                case 'popover-arrow':
                {
                    attrValue = (attrValue === undefined ? undefined : (attrValue === 'true'));
                    break;
                }
                case 'popover-header':
                case 'popover-position':
                {
                    break;
                }
                default:
                {
                    attrValue = undefined;
                }
            }
            return attrValue;
        },
        /**
         * 绑定委托事件
         * @param $dom 被委托节点
         * @param option
         */
        bindDelegatedEvent: function ($dom, option) {
            var detachedEventName = util.getDetachedEventName(option);
            var eventName = util.wrapEventNamespace(option.trigger);
            if (option.trigger !== 'click') {
                // 处理option.trigger!=click情形
                $dom.off(eventName, option.selector)
                    .on(eventName, option.selector, function (e) {
                        // 初始化tooltip框
                        var $target = $(this);
                        ui.depose($target);
                        ui.render(option, $target);
                        ui.show($target);
                    });

                $dom.off(detachedEventName, option.selector)
                    .on(detachedEventName, option.selector, function (e) {
                        ui.hide($(this));
                    });
                return;
            }

            // 处理option.trigger==click情形
            $dom.off(eventName, option.selector)
                .on(eventName, option.selector, function (e) {
                    // 初始化popover框
                    var $target = $(this);
                    var $popover = $target.data('tag4popover');
                    if ($popover && $popover.is(':visible')) {
                        // 正在显示
                        ui.hide($target);
                        return;
                    }
                    // 未显示或未初始化，则创建新的popover
                    ui.depose($target);
                    ui.render(option, $target);
                    ui.show($target);
                });
        },
        /**
         * 为目标节点绑定事件
         * @param $target 目标节点
         * @param option
         */
        bindNormalEvent: function ($target, option) {
            var detachedEventName = util.getDetachedEventName(option);
            var eventName = util.wrapEventNamespace(option.trigger);
            if (option.trigger !== 'click') {
                $target.unbind(eventName).bind(eventName, function (e) {
                    var $target = $(this);
                    ui.depose($target);
                    ui.render(option, $target);
                    ui.show($target);
                    return false;
                });

                $target.unbind(detachedEventName).bind(detachedEventName, function (e) {
                    ui.hide($(this));
                    return false;
                });
                return;
            }
            // 处理option.trigger==click情形
            $target.unbind(eventName).bind(eventName, function (e) {
                // 初始化popover框
                var $target = $(this);
                var $popover = $target.data('tag4popover');
                if ($popover && $popover.is(':visible')) {
                    // 正在显示
                    ui.hide($target);
                    return;
                }
                // 未显示或未初始化，则创建新的popover
                ui.depose($target);
                ui.render(option, $target);
                ui.show($target);
            });
        },
        /**
         * 判断可视窗口是否包含矩形
         * @param rect
         * @param viewport
         */
        judgeViewportContainsRect: function (rect, viewport) {
            return viewport.left <= rect.left &&
                viewport.top <= rect.top &&
                viewport.right >= rect.right &&
                viewport.bottom >= rect.bottom;
        },
        /**
         * 获取反转后的方向
         * @param{string} position
         */
        getFlippedPosition: function (position) {
            var flippedPos = null;
            switch (position) {
                case 'top':
                {
                    flippedPos = 'bottom';
                    break;
                }
                case 'bottom':
                {
                    flippedPos = 'top';
                    break;
                }
                case 'left':
                {
                    flippedPos = 'right';
                    break;
                }
                case 'right':
                {
                    flippedPos = 'left';
                    break;
                }
                default:
                {
                    flippedPos = 'bottom';
                    break;
                }
            }
            return flippedPos;
        },
        /**
         * 更新目标节点tooltip-position
         * @param $target
         * @param position
         */
        updateAttrTooltipPosition: function ($target, position) {
            var original = $target.attr('popover-position');
            $target.attr('tooltip-original-position', original);
            $target.attr('popover-position', position);
        },
    };

    var ui = {
        /**
         * 渲染popover框
         * @param option
         * @param $target 目标节点
         */
        render: function (option, $target) {
            var $container = util.getContainer(option, $target);
            var $popover = $(option.template).css('visibility', 'hidden');
            var $content = $('.content', $popover);
            var popoverContent = util.getPopoverContent($target, option);
            $content.append(popoverContent);

            ui.renderPopoverHeader($target, $popover, option);
            ui.renderPopoverFooter($target, $popover, option);

            $popover.appendTo($container);
            ui.calcPosition(option, $container, $target, $popover);

            $popover.hide().css('visibility', '');
            $target.data('tag4popover', $popover);
            $target.data('tag4container', $container);
            $target.data('tag4option', option);
        },
        show: function ($target) {
            var $popover = $target.data('tag4popover').fadeIn(function () {
                var $container = $target.data('tag4container');
                var option = $target.data('tag4option');
                util.nextTick(function () {
                    ui.calcPosition(option, $container, $target, $popover);
                    //ui.calcPosition4Flip($target, $tooltip, $container, option);
                });
            });
        },
        hide: function ($target) {
            var $popover = $target.data('tag4popover');
            $popover && $popover.fadeOut(function () {
                ui.depose($target);
            });
        },
        depose: function ($target) {
            var $popover = $target.data('tag4popover');
            if ($popover && $popover.length) {
                $popover.remove();
            }
            $target.removeData('tag4popover');
            $target.removeData('tag4container');
            $target.removeData('tag4option');
        },
        /**
         * 渲染header.popover-header元素
         * @param $target
         * @param $popover
         * @param option
         */
        renderPopoverHeader: function ($target, $popover, option) {
            var header = util.getAttrOption($target, 'popover-header');
            var $popoverHeader = $popover.find('> .popover-header');
            if (header === undefined) {
                header = typeof option.header === 'string' ? option.header : null;
            }
            if (header) {
                $popoverHeader.text(header);
            } else {
                $popoverHeader.remove();
            }
        },
        /**
         * 渲染footer.popover-footer元素
         * @param $target
         * @param $popover
         * @param option
         */
        renderPopoverFooter: function ($target, $popover, option) {
            var $popoverFooter = $popover.find('> .popover-footer');
            var buttons = option.buttons;
            if ($.isArray(buttons) && buttons.length) {
                $.each(buttons, function (i, btn) {
                    $('<button class="btn"></button>')
                        .addClass(btn.clazz)
                        .text(btn.text)
                        .click(btn.click)
                        .appendTo($popoverFooter);
                });
            } else {
                $popoverFooter.remove();
            }
        },
        /**
         * 设置tooltip框的宽和高，并作为初始值
         * @param $tooltip
         */
        renderTooltipSize: function ($tooltip) {
            $tooltip.css({
                height: $tooltip.outerHeight(),
                width: $tooltip.outerWidth(),
            });
        },
        /**
         * 计算定位
         * @param option
         * @param $container tooltip框依附的容器
         * @param $target 目标节点
         * @param $popover popover框
         */
        calcPosition: function (option, $container, $target, $popover) {
            var popoverWidth = $popover.outerWidth(),
                popoverHeight = $popover.outerHeight(),
                targetNodeWidth = $target.outerWidth(),
                targetNodeHeight = $target.outerHeight(),
                targetNodePos = $target.position(); // 获取相对于其父元素的偏移

            var position = {};
            var arrowClass = '';
            var offset = 10;

            switch (util.getAttrOption($target, 'popover-position')) {
                case 'bottom':
                {
                    position.left = targetNodePos.left - ((popoverWidth - targetNodeWidth) / 2);
                    position.top = targetNodePos.top + targetNodeHeight + offset;
                    arrowClass = 'arrow-up';
                    break;
                }
                case 'top':
                {
                    position.left = targetNodePos.left - ((popoverWidth - targetNodeWidth) / 2);
                    position.top = targetNodePos.top - popoverHeight - offset;
                    arrowClass = 'arrow-down';
                    break;
                }
                case 'left':
                {
                    position.left = targetNodePos.left - popoverWidth - offset;
                    position.top = targetNodePos.top - ((popoverHeight - targetNodeHeight) / 2);
                    arrowClass = 'arrow-right';
                    break;
                }
                case 'right':
                {
                    position.left = targetNodePos.left + targetNodeWidth + offset;
                    position.top = targetNodePos.top - ((popoverHeight - targetNodeHeight) / 2);
                    arrowClass = 'arrow-left';
                    break;
                }
            }

            $popover.removeClass('arrow-down arrow-up arrow-left arrow-right').addClass(arrowClass).animate(position, 'fast');
        },
        /**
         * 计算popover框反转显示的位置
         * （若反转之后仍然超出可视区域，则不再处理）
         * @param $target
         * @param $tooltip
         * @param $container
         * @param option
         */
        calcPosition4Flip: function ($target, $tooltip, $container, option) {
            var flip = util.getAttrOption($target, 'tooltip-flip');
            if (flip === undefined) {
                flip = option.flip; // 继承option.flip
            }
            if (!flip) {
                // 若不开启flip
                return;
            }
            var rect = $tooltip.get(0).getBoundingClientRect();
            var viewport = {
                left: 0,
                top: 0,
                right: $(window).width(),
                bottom: $(window).height()
            };
            // 判断元素是否在可视窗口内
            if (util.judgeViewportContainsRect(rect, viewport)) {
                // 不需要做反转
                return;
            }
            var position = util.getAttrOption($target, 'popover-position');
            position = position === undefined ? option.position : position;
            var flippedPosition = util.getFlippedPosition(position);
            util.updateAttrTooltipPosition($target, flippedPosition);
            ui.calcPosition(option, $container, $target, $tooltip);
        }
    };

    var methods = {
        init: function (option) {
            var $dom = this;
            option = $.extend(true, {}, DEFAULTS, option);

            if (util.isDelegatedMode(option)) {
                util.bindDelegatedEvent($dom, option);
            } else {
                util.bindNormalEvent($dom, option);
            }
        }
    };

    var plugin = function (method, options) {
        var _slice = Array.prototype.slice;
        if (typeof method === 'string' && methods[method]) {
            return methods[method].apply(this, _slice.call(arguments, 1));
        } else if (typeof method === 'object') {
            return methods['init'].apply(this, _slice.call(arguments, 0));
        } else {
            throw 'Illegal arguments: ' + _slice.call(arguments, 0);
        }
    };

    $.fn.uikits.register('popover', plugin);
})(jQuery);