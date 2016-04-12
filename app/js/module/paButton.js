const onButton = {
    init: function() {
        const th = this;
        $('[data-target-paButton]').on('click', function() {
            const node = $($(this).data('target-pabutton'));
            if(node.attr('data-state') === 'on') {
                th.off(node);
            } else {
                th.on(node);
            }
        });
        th.onPaButton();
        th.offPaButton();
    },
    on: function(node) {
        node.addClass('on').removeClass('off');
        node.attr('data-state', 'on');
    },
    off: function(node) {
        node.addClass('off').removeClass('on');
        node.attr('data-state', 'off');
    },
    onPaButton: function() {
        const th = this;

        $.extend($.fn, {
            onPaButton: function() {
                th.on($(this));
            }
        });
    },
    offPaButton: function() {
        const th = this;

        $.extend($.fn, {
            offPaButton: function() {
                th.off($(this));
            }
        });
    }
}

module.exports = onButton;
