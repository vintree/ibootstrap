var modal = {
    init: function() {
        $.fn.extend({
            modalPop: function(name) {
                alert(name);
            }
        });
    }
}

module.exports = modal;
