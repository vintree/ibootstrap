/*
    触发对象：需添加 data-target = '#target'
    释放对象：需添加 data-dismiss = '.pop'
*/

import Events from "./util/events.js";

var popup = {
    init: function() {
        var node;
        $('[data-target]').on('click', function() {
            Events.untouchmove();
            // document.ontouchmove = function() {
            //     return false;
            // };
            node = $($(this).data('target'));
            node.addClass('active').removeClass('unactive');
        });
        this.dismiss();
    },
    dismiss: function() {
        var node;
        $('[data-dismiss]').on('click', function() {
            document.ontouchmove = function() {
                return true;
            };
            Events.touchmove();
            node = $(this).parents($(this).data('dismiss'));
            node.addClass('unactive').removeClass('active');
            setTimeout(function() {
                node.removeClass('unactive');
            }, 300);
        });
    }
}
module.exports = popup;
