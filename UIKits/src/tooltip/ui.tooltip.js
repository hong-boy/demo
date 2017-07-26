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
     * #8 支持自定义触发事件（主要包括：click、hover、mouse*）
     * #9 提示框可以自动关闭（即：鼠标移出目标元素时自动关闭），亦可手动关闭（通过代码关闭）
     */
    var DEFAULTS = {
        template: '<div class="uk-tooltip"><div class="content"></div></div>',
        selector: null, // 目标节点选择器; 若为空，则默认使用当前this节点作为目标节点
        arrow: false, // 是否显示箭头（箭头默认指向目标节点的中间位置）
        position: 'bottom', // 位置 bottom-底部（相对于目标节点）top-顶部 left-左侧 right-右侧
        flip: false, // 当tooltip框显示不全时，是否翻转显示
        trigger: 'hover', // 触发方式： hover事件
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
        getTooltipTitle: function ($target) {
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
         * tooltip-arrow: option.arrow
         * tooltip-position: option.position
         * tooltip-left: 调整tooltip框偏移
         * tooltip-top: 调整tooltip框偏移
         * @param $target
         * @param attr
         */
        getAttrOption: function ($target, attr) {
            var attrValue = $target.attr(attr);
            switch (attr) {
                case 'tooltip-arrow':
                {
                    attrValue = (attrValue === undefined ? undefined : (attrValue === 'true'));
                    break;
                }
                case 'tooltip-position':
                {
                    break;
                }
                case 'tooltip-left':
                case 'tooltip-top':
                {
                    attrValue = parseInt(attrValue);
                    break;
                }
                default:
                {
                    attrValue = undefined;
                }
            }
            return attrValue;
        }
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
            var tooltipTitle = util.getTooltipTitle($target);
            $content.text(tooltipTitle);

            $tooltip.appendTo($container);
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
                targetNodePos = $target.position(), // 获取相对于其父元素的偏移
                targetNodeOffset = $target.offset(), // 获取相对于可视窗口的偏移
                viewportHeight = $(window).height(),
                viewportWidth = $(window).width();

            var $parent = $target.parent();
            var position = {};
            var arrowClass = '';
            var offset = 10;

            // TODO option.flip
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
                    position.top = targetNodePos.top - targetNodeHeight - offset * 2;
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

            //$tooltip.css('left', position.left);
            //$tooltip.css('top', position.top);
            $tooltip.addClass(arrowClass).animate(position, 'fast');
        },
    };

    var methods = {
        init: function (option) {
            var $dom = this;
            option = $.extend(true, {}, DEFAULTS, option);

            // 绑定事件
            if (util.isDelegatedMode(option)) {
                var eventName = util.wrapEventNamespace(option.trigger);
                $dom.off('mouseover.uk', option.selector)
                    .on('mouseover.uk', option.selector, function (e) {
                        // 初始化tooltip框
                        var $target = $(this);
                        ui.depose($target);
                        ui.render(option, $target);
                        ui.show($target);
                    });

                $dom.off('mouseout.uk', option.selector)
                    .on('mouseout.uk', option.selector, function (e) {
                        ui.hide($(this));
                    });
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