/*
    触发对象：需添加 data-target = '#target'
    释放对象：需添加 data-dismiss = '.pop'
*/
import Events from "./util/events.js";

var popup = {
    init: function() {
        var node;
        $('[data-target]').on('click', function() {
            node = $($(this).data('target'));
            if(node.hasClass('pop')) {
                Events.untouchmove();
                node.addClass('fadeIn').removeClass('fade');
            }
        });
        this.dismiss();
    },
    dismiss: function() {
        var node;
        $('[data-closePop]').on('click', function() {
            Events.touchmove();
            node = $(this).parents($(this).data('closePop'));
            if(node.hasClass('pop')) {
                node.addClass('fade').removeClass('fadeIn');
                setTimeout(function() {
                    node.removeClass('fade');
                }, 300);
            }
        });
    }
}

module.exports = popup;
