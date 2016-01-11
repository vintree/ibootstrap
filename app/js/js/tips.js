/*
    提示
*/

var tips = {
    init: function() {
        this.show();
        this.close();
        this.showTip();
        this.hideTip();
    },
    show: function() {
        var node;
        $('[data-target]').on('click', function() {
            node = $($(this).data('target'));
            node.showTip(3000);
        });
    },
    close: function() {
        var node;
        $('[data-closeTips]').on('click', function() {
            node = $(this).parents($(this).data('closeTips'));
            node.hideTip();
        });
    },
    showTip: function() {
        $.fn.extend({
            showTip: function(time) {
                var node = $(this);
                if(node.hasClass('tips')) {
                    node.addClass('fadeIn');
                }
                if(!!time) {
                    setTimeout(function() {
                        node.hideTip();
                    }, time);
                }
            }
        })
    },
    hideTip: function() {
        $.fn.extend({
            hideTip: function() {
                var node = $(this);
                node.addClass('fade').removeClass('fadeIn');
                setTimeout(function() {
                    node.removeClass('fade');
                }, 300);
            }
        })
    }
}

module.exports = tips;
