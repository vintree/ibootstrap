/*
    触发对象：需添加 data-target = '#target'
    释放对象：需添加 data-dismiss = '.pop'
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
        $('[data-target]').on('click', function() {
            node = $($(this).data('target'));
            node.showPop();
        });
    },
    close: function() {
        var node;
        $('[data-closePop]').on('click', function() {
            Events.touchmove();
            node = $(this).parents($(this).data('closePop'));
            node.hidePop();
        });
    },
    showPop: function() {
        $.fn.extend({
            showPop: function() {
                var node = $(this);
                if(node.hasClass('pop')) {
                    Events.untouchmove();
                    node.addClass('fadeIn').removeClass('fade');
                }
            }
        })
    },
    hidePop: function() {
        $.fn.extend({
            hidePop: function() {
                var node = $(this);
                if(node.hasClass('pop')) {
                    node.addClass('fade').removeClass('fadeIn');
                    setTimeout(function() {
                        node.removeClass('fade');
                    }, 300);
                }
            }
        });
    }
}

module.exports = popup;
