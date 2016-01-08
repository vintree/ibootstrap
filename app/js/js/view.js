import Events from "./util/events.js";

var view = {
    init: function() {
        var node;
        $('[data-target]').on('click', function() {
            node = $($(this).data('target'));
            if(node.hasClass('view')) {
                Events.untouchmove();
                node.addClass('fadeIn').removeClass('fade');
                setTimeout(function() {
                    node.find('.views').addClass('fadeIn').removeClass('fade');
                });

            }
        });
        this.dismiss();
    },
    dismiss: function() {
        var node;
        $('[data-closeView]').on('click', function() {
            Events.touchmove();
            node = $(this).parents($(this).data('closeView'));
            if(node.hasClass('view')) {
                node.find('.views').addClass('fade').removeClass('fadeIn');
                setTimeout(function() {
                    node.addClass('fade').removeClass('fadeIn');
                });
                setTimeout(function() {
                    node.removeClass('fade');
                    node.find('.views').removeClass('fade');
                }, 300);
            }
        });
    }
}
module.exports = view;
