/*

    confirm组件
    _confirm.init('确定删除吗？', fn);

*/
var confirm = {
    arg: function(key) {//参数
        let args = {
            rol: 'confirm',
            group: 'pop-confirm',
            no: 'no',
            yes: 'yes',
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
        this.no(objRol, objGroup);
        this.yes(objRol, objGroup, callback);
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
    no: function(objRol, objGroup) {//取消操作
        objGroup.find('[rol='+ this.arg('no') +']').on('click', function() {
            this.hide(objRol, objGroup);
        }.bind(this));
    },
    yes: function(objRol, objGroup, callback) {//确定操作
        objGroup.find('[rol='+ this.arg('yes') +']').on('click', function() {
            this.hide(objRol, objGroup);
            if(callback) {
                callback();
            }
        }.bind(this));
    },
    view: function(tx, callback) {//view初始化
        var html = '';
        html += '<div class="pop-modal" rol="confirm">';
        html +=    '<div class="pop-confirm">';
        html +=        '<div class="pop-body">'+ tx +'</div>';
        html +=        '<div class="pop-foot">';
        html +=            '<div rol='+ this.arg('no') +'>取消</div>'
        html +=            '<div rol='+ this.arg('yes') +'>确定</div>'
        html +=        '</div>'
        html +=    '</div>'
        html += '</div>';
        $('body').append(html);
        this.initIng(callback);
    },
}
module.exports = confirm;
