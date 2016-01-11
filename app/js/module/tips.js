/*
    提示
*/

const tips = {
    params: function() {
    },
    init: function() {
        this.show();
        this.close();
        this.showTip();
        this.hideTip();
    },
    show: function() {
        $('[data-target]').on('click', function() {
            const node = $($(this).data('target'));
            node.showTip();
        });
    },
    close: function() {
        $('[data-closeTips]').on('click', function() {
            const node = $(this).parents($(this).data('closeTips'));
            node.hideTip();
        });
    },
    showTip: function() {
        $.fn.extend({
            showTip: function(time) {
                const node = $(this);
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
                const node = $(this);
                node.addClass('fade').removeClass('fadeIn');
                setTimeout(function() {
                    node.removeClass('fade');
                }, 300);
            }
        })
    }
}

module.exports = tips;
