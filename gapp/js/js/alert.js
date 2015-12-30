var alert = {
    init: () => {
        $('[alert-rol]').on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var target = $(this).attr('alert-rol');
            var obj = $(target);
        })
    }
}

module.exports = alert;
