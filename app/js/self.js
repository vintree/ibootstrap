$(function() {

    // _confirm.init('确定删除吗？', function() {alert('asd')});

    //  _alert.init('警告！无权限操作', function() {alert('dsa')});


    $('#alertCB').on('click', function(e) {
        // alert('dasd');

        $($(this).data('modalpop')).modal('show');

        

    })
});
