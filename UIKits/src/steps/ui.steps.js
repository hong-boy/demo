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
            label: '步骤一', // {required: false, type:String, desc:'步骤名称'}
            desc: 'some desc...', // {required: false, type:String, desc:'描述'}
            icon: null, // {required: false, type:String, desc:'自定义icon'}
            render: '<p>This is step-1</p>' // {required:true, type:jQuery|Function|String}
        }]
    };

    var ENUM_STEP_STATUS = {
        1: 'wait', // 等待
        2: 'progress', // 处理中
        3: 'success', // 成功
        4: 'error' // 出错
    };

    var ui = {
        render: function($container, option){
            var $steps = $(option.template).hide();
            var $stepsHeader = $('.steps-header', $steps);
            var $stepsContent = $('.content', $steps);
            ui.renderStepsHeader($stepsHeader, option);
            ui.renderStepsContent($stepsContent, option.current, option);
            $steps.addClass(option.direction).appendTo($container);
            return $steps;
        },
        show: function($steps){
            $steps.show();
        },
        /**
         * 绘制step-content
         * （初始化）
         * @param $stepContent
         * @param step
         */
        renderStepsContent: function($stepContent, current, option){
            var step = option.steps[current];
            if(!step){
                return;
            }
            var $original = $stepContent.find('.step-page');
            if($original.length){
                $original.fadeOut(function(){
                    $original.remove();
                    ui.renderStepsPage($stepContent, step);
                });
            }else {
                ui.renderStepsPage($stepContent, step);
            }
        },
        /**
         * 切换step-content视图
         * （更新）
         * @param $stepContent
         * @param option
         * @param current
         */
        refreshStepsContent: function($stepContent, option, current){
            ui.renderStepsContent($stepContent, current, option);
        },
        /**
         * 绘制step-page
         * （初始化）
         * @param $stepContent
         * @param step
         */
        renderStepsPage: function($stepContent, step){
            var $stepPage = $('<div class="step-page"></div>').hide();
            var page = $.isFunction(step.render) ? step.render.call(null, step) : step.render;
            $stepPage.append(page).appendTo($stepContent).fadeIn();
        },
        /**
         * 绘制header
         * （初始化）
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
         * 刷新header样式
         * (更新)
         * @param $stepsHeader
         * @param option
         */
        refreshStepsHeader: function($stepsHeader, option){
            var current = option.current;
            var $current = $stepsHeader.find('> .step-item:eq('+(current)+')');
            // 当前步骤前面的步骤项
            $stepsHeader.find('> .step-item:lt('+(current)+')')
                .each(function(){
                    ui.updateStatus4StepItem($(this), 3);
                });
            // 当前步骤后面的步骤项
            $stepsHeader.find('> .step-item:gt('+(current)+')')
                .each(function(){
                    ui.updateStatus4StepItem($(this), 1);
                });
            // 当前步骤
            ui.updateStatus4StepItem($current, 2);
            // 更新前一个step-item的progressbar
            ui.updateStatus4Progressbar($current.prev(), $stepsHeader, option.direction);
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
                ui.updateStatus4Progressbar($stepItem, $stepsHeader, option.direction);
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
         * @param direction
         */
        updateStatus4Progressbar: function($stepItem, $stepsHeader, direction){
            var prop = direction === 'vertical' ? 'height' : 'width';
            $stepItem.find('.progressbar').css(prop, '50%');
            $stepsHeader.find('.success').not($stepItem).each(function(){
                $(this).find('.progressbar').css(prop, '');
            });
        }
    };

    function Stepsbar($dom, option){
        this._dom = $dom;
        this._option = option;
        this._current = option.current;
        this._length = option.steps.length;
    }
    Stepsbar.prototype = {
        constructor: Stepsbar,
        next: function(){
            if(this.isLastStep()){
                console.warn('Steps done!');
                return;
            }
            this._current ++;
        },
        prev: function(){
            if(this.isFirstStep()){
                console.warn('First step!');
                return;
            }
            this._current --;
        },
        /**
         * 判断当前步骤是否是最后一步
         * @returns {boolean}
         */
        isLastStep: function(){
            return !(this._current < this._length);
        },
        /**
         * 判断当前步骤是否是第一步
         * @returns {boolean}
         */
        isFirstStep: function(){
            return !(this._current > 0);
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
            var length = steps.length;
            option.current = Math.min(option.current, length - 1);
            var $steps = ui.render($dom, option);
            ui.show($steps);
            var inst = new Stepsbar($dom, option);
            // 监听option.current
            Object.defineProperty(inst, '_current', {
                get: function(){
                    return option.current;
                },
                set: function(newVal){
                    newVal = newVal < 0 ? 0 : newVal;
                    newVal = newVal < length ? newVal : length;
                    if(this._current !== newVal){
                        option.current = newVal;
                        // 更新steps-header|content
                        ui.refreshStepsHeader($steps.find('.steps-header'), option);
                        ui.refreshStepsContent($steps.find('.content'), option, newVal);
                    }
                    return newVal;
                }
            });
            return inst;
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