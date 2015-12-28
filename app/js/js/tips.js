var tips = {
    init: function() {
        $('.tips-close').on('click', function() {
            var pobj = $(this).parents('.tips-top-group');
            if(!pobj.hasClass('.fade')) {
                pobj.addClass('fade');
            }
            $(this).parents('.tips-top-group').removeClass('active');
        });

        $('[data-targetTips]').on('click', function() {
            var target = $(this).attr('data-targetTips');
            var obj = $(target);
            if(!obj.hasClass('.fade')) {
                obj.addClass('fade');
            }
            obj.addClass('active');
        });
    }
}

module.exports = tips;
