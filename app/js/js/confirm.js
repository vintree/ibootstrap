/*

    confirm组件
    _confirm.init('确定删除吗？', fn);

*/
var confirm = {
    arg: function(key) {//参数
        let args = {
            rol: 'confirm',
            group: 'confirm-group',
            time: 100
        }
        return args[key];
    },
    init: function(val, callback) {//初始化
        //移动短禁止滚动
        document.ontouchmove = function() {
            return false;
        };
        //删除多余模块
        $('[rol='+ this.arg('rol') +']').remove();
        //初始化view
        this.view(val, callback);
    },
    initIng: function(callback) {//初始化中，执行
        var objRol,
            objGroup;
        //初始化对象
        objRol = $('[rol='+ this.arg('rol') +']');
        objGroup = objRol.find('.' + this.arg('group'));
        //初始化样式
        objRol.removeClass('unactive').addClass('active');
        //初始化功能
        this.cancel(objRol, objGroup);
        this.confirm(objRol, objGroup, callback);
    },
    hide: function(objRol, objGroup) {//隐藏效果
        //移动短开启滚动
        document.ontouchmove = function() {
            return true;
        };
        objRol.removeClass('active').addClass('unactive');
        setTimeout(() => {//等待animation完成，运行
            objRol.remove();
        }, this.arg('time'));

    },
    cancel: function(objRol, objGroup) {//取消操作
        objGroup.find('[rol="cancel"]').on('click', function() {
            this.hide(objRol, objGroup);
        }.bind(this));
    },
    confirm: function(objRol, objGroup, callback) {//确定操作
        objGroup.find('[rol="confirms"]').on('click', function() {
            this.hide(objRol, objGroup);
            if(callback) {
                callback();
            }
        }.bind(this));
    },
    view: function(tx, callback) {//view初始化
        var html = '';
        html += '<div class="modal" rol="confirm">';
        html +=    '<div class="confirm-group">';
        html +=        '<div class="confirm-tx">'+ tx +'</div>';
        html +=        '<div class="confirm-fun">';
        html +=            '<div class="confirm-cancel" rol="cancel">取消</div>'
        html +=            '<div class="confirm-confirm" rol="confirms">确认</div>'
        html +=        '</div>'
        html +=    '</div>'
        html += '</div>';
        $('body').append(html);
        this.initIng(callback);
    },
}
module.exports = confirm;
