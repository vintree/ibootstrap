/*
    视口
*/
var view = {
    init: function() {
        var node;
        $('[data-target-view]').on('click', function() {
            node = $($(this).data('target-view'));
            if(node.hasClass('view')) {
                $('html, body').addClass('ofHidden');
                node.addClass('fadeIn').removeClass('fade');
                setTimeout(function() {
                    node.find('.views').addClass('fadeIn').removeClass('fade');
                }, 100);
            }
        });
        this.close();
    },
    close: function() {
        var node;
        $('[data-close-view]').on('click', function() {
            $('html, body').removeClass('ofHidden');
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
    },
    showView: function() {

    },
    hideView: function() {

    }
}

module.exports = view;
