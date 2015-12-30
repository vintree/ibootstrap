var confirm = {
    // arg: function(key) {
    //     var args = {
    //         rol: 'rol-confirm',
    //         group: 'confirm-group',
    //     }
    //     return args[key];
    // },
    // init: function() {
    //     let rol = 'rol-confirm';
    //     let group = 'confirm-group';
    //     let athis = this;
    //     $('['+ rol +']').on('click', function(e) {
    //         var target = $(this).attr(rol),
    //             objConfirm = $(target),
    //             objGroup = objConfirm.find('.' + group);
    //         objConfirm.removeClass('unactive').addClass('active');
    //
    //         athis.cancel(objConfirm, objGroup);
    //         athis.confirm(objConfirm, objGroup);
    //     });
    // },
    // cancel: function(objConfirm, objGroup) {//取消操作
    //     var athis = this;
    //     objGroup.find('[rol="cancel"]').on('click', function() {
    //         console.log(objConfirm);
    //         objConfirm.removeClass('active').addClass('unactive');
    //         setTimeout(() => {
    //             objConfirm.remove();
    //         }, 500);
    //     });
    // },
    // confirm: function(objConfirm, objGroup) {
    //     objGroup.find('[rol="confirm"]').on('click', function() {
    //         alert('confirm');
    //     });
    // },
    // view: function(tx, callback) {
    //     var html = '';
    //     html += '<div id="confirm" class="confirm-layer">';
    //     html +=    '<div class="confirm-group">';
    //     html +=        '<div class="confirm-tx">'+ tx +'</div>';
    //     html +=        '<div class="confirm-fun">';
    //     html +=            '<div class="confirm-cancel" rol="cancel">取消</div>'
    //     html +=            '<div class="confirm-confirm" rol="confirm">确认</div>'
    //     html +=        '</div>'
    //     html +=    '</div>'
    //     html += '</div>';
    //
    //     this.binds(callback);
    // },
}

confirm.init = function() {
    alert('asd');
}

module.exports = confirm;
