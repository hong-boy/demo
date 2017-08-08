'use strict';
(function ($, undefined) {
    /**
     * 功能：
     * #1 可配置带箭头提示框
     * #2 提示框内容只支持text格式
     * #3 提示框尺寸自适应
     * #4 提示框可以通过全局托管的方式打开
     * #5 提示框可以自动调整显示位置，亦可固定在某个位置
     * #6 提示框自动适应可视窗口
     * #7 提示框兼容title属性
     * #8 支持自定义触发事件（主要包括：click、mouseenter、mouseover）
     * #9 提示框可以自动关闭（即：鼠标移出目标元素时自动关闭），亦可手动关闭（通过代码关闭）
     * Bugs:
     * #1 当option.trigger==click时，若selector配置的是[title]，则会导致第一次点击目标节点时出现原生title样式
     */
    var DEFAULTS = {
        template: '<div class="uk-tooltip"><div class="content"></div></div>',
        selector: null, // 目标节点选择器; 若为空，则默认使用当前this节点作为目标节点
        arrow: false, // 是否显示箭头（箭头默认指向目标节点的中间位置）
        position: 'bottom', // 位置 bottom-底部（相对于目标节点）top-顶部 left-左侧 right-右侧
        flip: false, // 当tooltip框显示不全时，是否翻转显示
        trigger: 'mouseover', // 触发方式，支持：mouseover、mouseenter、click
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
         * 获取待显示的文本信息
         * @param $target
         */
        getPopoverContent: function ($target) {
            var tooltipTitle = $target.attr('tooltip-title') || '';
            if (!tooltipTitle.length) {
                tooltipTitle = $target.attr('title') || '';
                $target.attr('tooltip-title', tooltipTitle).attr('title', '');
            }
            return tooltipTitle;
        },
        /**
         * 获取目标节点上的属性配置
         * 支持的属性：
         * tooltip-flip: option.flip
         * tooltip-arrow: option.arrow
         * tooltip-position: option.position
         //* tooltip-left: 调整tooltip框偏移
         //* tooltip-top: 调整tooltip框偏移
         * @param $target
         * @param attr
         */
        getAttrOption: function ($target, attr) {
            var attrValue = $target.attr(attr);
            switch (attr) {
                case 'tooltip-flip':
                case 'tooltip-arrow':
                {
                    attrValue = (attrValue === undefined ? undefined : (attrValue === 'true'));
                    break;
                }
                case 'tooltip-position':
                {
                    break;
                }
                //case 'tooltip-left':
                //case 'tooltip-top':
                //{
                //    attrValue = parseInt(attrValue);
                //    break;
                //}
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
                    // 初始化tooltip框
                    var $target = $(this);
                    var $tooltip = $target.data('tag4tooltip');
                    if ($tooltip && $tooltip.is(':visible')) {
                        // 正在显示
                        ui.hide($target);
                        return;
                    }
                    // 未显示或未初始化，则创建新的tooltip
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
                // 初始化tooltip框
                var $target = $(this);
                var $tooltip = $target.data('tag4tooltip');
                if ($tooltip && $tooltip.is(':visible')) {
                    // 正在显示
                    ui.hide($target);
                    return;
                }
                // 未显示或未初始化，则创建新的tooltip
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
        updateAttrPopoverPosition: function ($target, position) {
            var original = $target.attr('tooltip-position');
            $target.attr('tooltip-original-position', original);
            $target.attr('tooltip-position', position);
        },
    };

    var ui = {
        /**
         * 渲染tooltip框
         * @param option
         * @param $target 目标节点
         */
        render: function (option, $target) {
            var $container = util.getContainer(option, $target);
            var $tooltip = $(option.template).css('visibility', 'hidden');
            var $content = $('.content', $tooltip);
            var tooltipTitle = util.getPopoverContent($target);
            $content.text(tooltipTitle);

            $tooltip.appendTo($container);
            ui.renderTooltipSize($tooltip);
            ui.calcPosition(option, $container, $target, $tooltip);
            ui.renderArrow($target, $tooltip, option);

            $tooltip.hide().css('visibility', '');
            $target.data('tag4tooltip', $tooltip);
            $target.data('tag4container', $container);
            $target.data('tag4option', option);
        },
        show: function ($target) {
            var $tooltip = $target.data('tag4tooltip').fadeIn(function () {
                var $container = $target.data('tag4container');
                var option = $target.data('tag4option');
                util.nextTick(function () {
                    ui.calcPosition(option, $container, $target, $tooltip);
                    ui.calcPosition4Flip($target, $tooltip, $container, option);
                });
            });
        },
        hide: function ($target) {
            var $tooltip = $target.data('tag4tooltip');
            $tooltip && $tooltip.fadeOut(function () {
                ui.depose($target);
            });
        },
        depose: function ($target) {
            var $tooltip = $target.data('tag4tooltip');
            if ($tooltip && $tooltip.length) {
                $tooltip.remove();
            }
            $target.removeData('tag4tooltip');
            $target.removeData('tag4container');
            $target.removeData('tag4option');
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
         * 渲染箭头
         * @param $target
         * @param $tooltip
         * @param option
         */
        renderArrow: function ($target, $tooltip, option) {
            let attrValue = util.getAttrOption($target, 'tooltip-arrow');
            if (attrValue === undefined) {
                attrValue = option.arrow;
            }
            if (attrValue) {
                $tooltip.addClass('arrow');
            } else {
                $tooltip.removeClass('arrow');
            }
        },
        /**
         * 计算定位
         * @param option
         * @param $container tooltip框依附的容器
         * @param $target 目标节点
         * @param $tooltip tooltip框
         */
        calcPosition: function (option, $container, $target, $tooltip) {
            var tooltipWidth = $tooltip.outerWidth(),
                tooltipHeight = $tooltip.outerHeight(),
                targetNodeWidth = $target.outerWidth(),
                targetNodeHeight = $target.outerHeight(),
                targetNodePos = $target.position(); // 获取相对于其父元素的偏移
            //targetNodeOffset = $target.offset(), // 获取相对于可视窗口的偏移
            //viewportHeight = $(window).height(),
            //viewportWidth = $(window).width();

            //var $parent = $target.parent();
            var position = {};
            var arrowClass = '';
            var offset = 10;

            switch (util.getAttrOption($target, 'tooltip-position')) {
                case 'bottom':
                {
                    position.left = targetNodePos.left - ((tooltipWidth - targetNodeWidth) / 2);
                    position.top = targetNodePos.top + targetNodeHeight + offset;
                    arrowClass = 'arrow-up';
                    break;
                }
                case 'top':
                {
                    position.left = targetNodePos.left - ((tooltipWidth - targetNodeWidth) / 2);
                    position.top = targetNodePos.top - tooltipHeight - offset;
                    arrowClass = 'arrow-down';
                    break;
                }
                case 'left':
                {
                    position.left = targetNodePos.left - tooltipWidth - offset;
                    position.top = targetNodePos.top - ((tooltipHeight - targetNodeHeight) / 2);
                    arrowClass = 'arrow-right';
                    break;
                }
                case 'right':
                {
                    position.left = targetNodePos.left + targetNodeWidth + offset;
                    position.top = targetNodePos.top - ((tooltipHeight - targetNodeHeight) / 2);
                    arrowClass = 'arrow-left';
                    break;
                }
            }

            $tooltip.removeClass('arrow-down arrow-up arrow-left arrow-right').addClass(arrowClass).animate(position, 'fast');
        },
        /**
         * 计算tooltip框反转显示的位置
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
            var position = util.getAttrOption($target, 'tooltip-position');
            position = position === undefined ? option.position : position;
            var flippedPosition = util.getFlippedPosition(position);
            util.updateAttrPopoverPosition($target, flippedPosition);
            ui.calcPosition(option, $container, $target, $tooltip);
        }
    };

    var methods = {
        init: function (option) {
            var $dom = this;
            option = $.extend(true, {}, DEFAULTS, option);

            // 绑定事件
            if (util.isDelegatedMode(option)) {
                util.bindDelegatedEvent($dom, option);
            } else {
                util.bindNormalEvent($dom, option);
            }
        }
    };

    var tooltip = function (method, options) {
        var _slice = Array.prototype.slice;
        if (typeof method === 'string' && methods[method]) {
            return methods[method].apply(this, _slice.call(arguments, 1));
        } else if (typeof method === 'object') {
            return methods['init'].apply(this, _slice.call(arguments, 0));
        } else {
            throw 'Illegal arguments: ' + _slice.call(arguments, 0);
        }
    };

    $.fn.uikits.register('tooltip', tooltip);
})(jQuery);