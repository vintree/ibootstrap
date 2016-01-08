var tips = {
    init: function() {
        var node;
        $('[data-target]').on('click', function() {
            node = $($(this).data('target'));
            if(node.hasClass('tips')) {
                node.addClass('fadeIn');
            }
        });
        this.dismiss();
    },
    dismiss: function() {
        var node;
        $('[data-closeTips]').on('click', function() {
            node = $(this).parents($(this).data('closeTips'));
            node.addClass('fade').removeClass('fadeIn');
            // node.removeClass('fadeIn').addClass('fade');
            setTimeout(function() {
                node.removeClass('fade');
            }, 300);
        });
    }
}

module.exports = tips;
