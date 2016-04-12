/*
    触发对象：需添加 data-target-pop = '#target'
    释放对象：需添加 data-close-pop = '.pop'
*/
import Events from "./util/events.js";

var popup = {
    init: function() {
        this.show();
        this.close();
        this.showPop();
        this.hidePop();
    },
    show: function() {
        var node;
        $('[data-target-pop]').on('click', function() {
            node = $($(this).data('target-pop'));
            node.showPop();
        });
    },
    close: function() {
        var node;
        $('[data-close-pop]').on('click', function() {
            node = $(this).parents($(this).data('close-pop'));
            node.hidePop();
        });
    },
    showPop: function() {
        $.extend($.fn, {
            showPop: function() {
                var node = $(this);
                if(node.hasClass('pop')) {
                    Events.untouchmove();
                    node.addClass('fadeIn').removeClass('fade');
                }
            }
        });
    },
    hidePop: function() {
        $.extend($.fn, {
            hidePop: function() {
                var node = $(this);
                if(node.hasClass('pop')) {
                    Events.touchmove();
                    node.addClass('fade').removeClass('fadeIn');
                    setTimeout(function() {
                        node.removeClass('fade');
                    }, 300);
                }
            }
        });
    }
};

module.exports = popup;
