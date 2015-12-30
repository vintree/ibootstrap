/*

    confirm组件
    _confirm.init('确定删除吗？', fn);

*/
var confirm = {
    arg: function(key) {//参数
        let args = {
            // rol: 'rol-confirm',
            group: 'confirm-group',
            layer: 'confirm-layer',
        }
        return args[key];
    },
    init: function(val, callback) {//初始化
        //移动短禁止滚动
        document.ontouchmove = function() {
            return false;
        };
        //删除多余模块
        $('.' + this.arg['layer']).remove();
        //初始化view
        this.view(val, callback);
    },
    initIng: function(callback) {//初始化中，执行
        var objConfirm,
            objGroup;
        //初始化对象
        objConfirm = $('.' + this.arg('layer'));
        objGroup = objConfirm.find('.' + this.arg('group'));
        //初始化样式
        objConfirm.removeClass('unactive').addClass('active');
        //初始化功能
        this.cancel(objConfirm, objGroup);
        this.confirm(objConfirm, objGroup, callback);
    },
    hide: function(objConfirm, objGroup) {//隐藏效果
        //移动短开启滚动
        document.ontouchmove = function() {
            return true;
        };
        objConfirm.removeClass('active').addClass('unactive');
        setTimeout(() => {//等待animation完成，运行
            objConfirm.remove();
        }, 500);

    },
    cancel: function(objConfirm, objGroup) {//取消操作
        objGroup.find('[rol="cancel"]').on('click', function() {
            this.hide(objConfirm, objGroup);
        }.bind(this));
    },
    confirm: function(objConfirm, objGroup, callback) {//确定操作
        objGroup.find('[rol="confirm"]').on('click', function() {
            this.hide(objConfirm, objGroup);
            if(callback) {
                callback();
            }
        }.bind(this));
    },
    view: function(tx, callback) {//view初始化
        var html = '';
        html += '<div id="confirm" class='+ this.arg('layer') +'>';
        html +=    '<div class="confirm-group">';
        html +=        '<div class="confirm-tx">'+ tx +'</div>';
        html +=        '<div class="confirm-fun">';
        html +=            '<div class="confirm-cancel" rol="cancel">取消</div>'
        html +=            '<div class="confirm-confirm" rol="confirm">确认</div>'
        html +=        '</div>'
        html +=    '</div>'
        html += '</div>';
        $('body').append(html);
        this.initIng(callback);
    },
}
module.exports = confirm;
