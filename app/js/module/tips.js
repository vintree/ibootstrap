/*
    提示
*/
const tips = {
    init: function() {
        this.show();
        this.close();
        this.showTips();
        this.hideTips();
    },
    show: function() {
        $('[data-target-tips]').on('click', function() {
            const node = $($(this).data('target-tips'));
            node.showTips(3000);
        });
    },
    close: function() {
        $('[data-close-tips]').on('click', function() {
            const node = $(this).parents($(this).data('close-tips'));
            node.hideTips();
        });
    },
    showTips: function() {

        $.extend($.fn, {
            showTips: function(time) {
                const node = $(this);
                if(node.hasClass('tips')) {
                    node.addClass('fadeIn');
                }
                if(!!time) {
                    setTimeout(function() {
                        if(node.hasClass('fadeIn')) {
                            node.hideTip();
                        }
                    }, time);
                }
            }
        });

        // $.fn.extend({
        //     showTips: function(time) {
        //         const node = $(this);
        //         if(node.hasClass('tips')) {
        //             node.addClass('fadeIn');
        //         }
        //         if(!!time) {
        //             setTimeout(function() {
        //                 if(node.hasClass('fadeIn')) {
        //                     node.hideTip();
        //                 }
        //             }, time);
        //         }
        //     }
        // })
    },
    hideTips: function() {

        $.extend($.fn, {
            hideTips: function() {
                const node = $(this);
                node.addClass('fade').removeClass('fadeIn');
                setTimeout(function() {
                    node.removeClass('fade');
                }, 300);
            }
        });


        // $.fn.extend({
        //     hideTips: function() {
        //         const node = $(this);
        //         node.addClass('fade').removeClass('fadeIn');
        //         setTimeout(function() {
        //             node.removeClass('fade');
        //         }, 300);
        //     }
        // })
    }
}

module.exports = tips;
