'use strict';
(function ($, undefined) {
    /**
     * Steps步骤条
     */
    var DEFAULTS = {
        template: '<div class="uk-steps"><div class="steps-header"></div><div class="content"></div></div>',
        direction: 'horizonal', // 步骤排列方向 horizonal-水平 vertical-竖直
        current: 0, // 当前所在步骤 对应option.steps数组的索引
        space: '100px', // 步骤之间的间距
        steps: [{
            label: '步骤一',
            desc: 'some desc...',
            icon: null,
            render: '<p>This is step-1</p>'
        }],
        onFinished: null, // stepsbar插件初始化完成后的回调函数
        onNext: null, // 下一步回调
        onPrev: null, // 上一步回调
    };

    var ENUM_STEP_STATUS = {
        1: 'wait',
        2: 'progress',
        3: 'success',
        4: 'error'
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
                case 'mousedown':
                {
                    detachedEvent = 'mouseup';
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
         * popover-width: option.size.width
         * popover-height: option.size.height
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
                case 'popover-width':
                case 'popover-height':
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
         * 更新目标节点popover-position
         * @param $target
         * @param position
         */
        updateAttrPopoverPosition: function ($target, position) {
            var original = $target.attr('popover-position');
            $target.attr('popover-original-position', original);
            $target.attr('popover-position', position);
        },
    };

    var ui = {
        render: function($container, option){
            var $steps = $(option.template).hide();
            var $stepsHeader = $('.steps-header', $steps);
            var $stepsContent = $('.content', $steps);
            ui.renderStepsHeader($stepsHeader, option);
            ui.renderStepsContent($stepsContent, option.current, option);
            $steps.appendTo($container);
            return $steps;
        },
        show: function($steps){
            $steps.show();
        },
        renderStepsContent: function($stepContent, current, option){
            var step = option.steps[current];
            var $original = $stepContent.find('.step-page');
            if($original.length){
                $original.fadeOut(function(){
                    ui.renderStepsPage($stepContent, step);
                });
            }else {
                ui.renderStepsPage($stepContent, step);
            }
        },
        renderStepsPage: function($stepContent, step){
            var $stepPage = $('<div class="step-page"></div>').hide();
            var page = $.isFunction(step.render) ? step.render.call(null, step) : step.render;
            $stepPage.append(page).appendTo($stepContent).fadeIn();
        },
        /**
         * 绘制header
         * @param $stepsHeader
         * @param option
         */
        renderStepsHeader: function($stepsHeader, option){
            var steps = option.steps;
            steps.forEach(function(step, i){
                $stepsHeader.append(
                    ui.renderStepItem($stepsHeader, step, i + 1, option)
                );
            });

        },
        /**
         * 绘制步骤节点
         * (初始化)
         * @param $stepsHeader
         * @param step
         * @param index
         * @param option
         * @returns {*|HTMLElement}
         */
        renderStepItem: function($stepsHeader, step, index, option){
            var $stepItem = $([
                '<div class="step-item wait">',
                '<header class="item-header">',
                '<span class="step-line"><span class="progressbar"></span></span>',
                '<span class="step-icon"></span>',
                '</header>',
                '<section class="item-section">',
                '<span class="step-label"></span>',
                '<span class="step-desc"></span>',
                '</section>',
                '</div>'
            ].join(''));
            var $stepIcon = $('.step-icon', $stepItem);
            var $stepLabel = $('.step-label', $stepItem);
            var $stepDesc = $('.step-desc', $stepItem);

            // 绘制icon
            $stepIcon.append(
                step.icon ?
                '<i class="'+(step.icon)+'"></i>' :
                '<span>'+(index)+'</span>'
            );

            // 绘制label
            $stepLabel.text(step.label);

            // 绘制desc
            $stepDesc.text(step.desc);

            // 间距
            $stepItem.css('width', option.space);

            // 判断是否跳过本步骤
            if(option.current + 1 > index){
                // 将被跳过的步骤置为：success
                ui.updateStatus4StepItem($stepItem, 3);
                ui.updateStatus4Progressbar($stepItem, $stepsHeader);
            }else if(option.current + 1 === index){
                // 将当前步骤置为：progress
                ui.updateStatus4StepItem($stepItem, 2);
            }else {
                // 置为：wait
                ui.updateStatus4StepItem($stepItem, 1);
            }

            return $stepItem;
        },
        /**
         * 更新步骤的显示状态
         * @param $stepItem
         * @param status
         */
        updateStatus4StepItem: function($stepItem, status){
            $stepItem.removeClass('wait progress success error').addClass(ENUM_STEP_STATUS[status]);
        },
        /**
         * 更新最后一个状态为success的.step-item的progressbar宽度
         * （同时也需要更新前一个元素的progressbar宽度）
         * @param $stepItem
         * @param $stepsHeader
         */
        updateStatus4Progressbar: function($stepItem, $stepsHeader){
            $stepItem.find('.progressbar').css('width', '50%');
            $stepsHeader.find('.success').each(function(){
                $(this).find('.progressbar').css('width', '');
            });
        }
    };

    function Stepsbar($dom, option){
        this._dom = $dom;
        this._option = option;
        this._current = option.current;
    }
    Stepsbar.prototype = {
        constructor: Stepsbar,
        next: function(){

        },
        prev: function(){

        },
        isCompleted: function(){

        },
    };

    var methods = {
        init: function (option) {
            var $dom = this;
            option = $.extend(true, {}, DEFAULTS, option);
            var steps = option.steps;
            if(!$.isArray(steps) || !steps.length || !steps.length > 1){
                throw Error('Illegal arguments: options.steps should be an non-empty array and consist of two items at least.');
            }
            option.current = Math.min(option.current, option.steps.length - 1);
            var $steps = ui.render($dom, option);
            ui.show($steps);
            return new Stepsbar($dom, option);
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

    $.fn.uikits.register('stepsbar', plugin);
})(jQuery);