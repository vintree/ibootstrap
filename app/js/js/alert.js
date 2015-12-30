var alert = {
    arg: function(key) {
        let args = {
            layer: 'alert-layer',
            group: 'alert-group'
        }
        return args[key];
    },
    init: function(val, callback) {
        document.ontouchmove = function() {
            return false;
        };
        //删除多余模块
        $('.' + this.arg['layer']).remove();
        //初始化view
        this.view(val, callback);
    },
    initIng: function(callback) {
        var objAlert,
            objGroup;
        //初始化对象
        objAlert = $('.' + this.arg('layer'));
        objGroup = objAlert.find('.' + this.arg('group'));
        //初始化样式
        objAlert.removeClass('unactive').addClass('active');
        //初始化功能
        this.confirm(objAlert, objGroup, callback);
    },
    hide: function(objAlert, objGroup) {//隐藏效果
        //移动短开启滚动
        document.ontouchmove = function() {
            return true;
        };
        objAlert.removeClass('active').addClass('unactive');
        setTimeout(() => {//等待animation完成，运行
            objAlert.remove();
        }, 500);
    },
    confirm: function(objAlert, objGroup, callback) {
        objGroup.find('[rol="confirm"]').on('click', function() {
            this.hide(objAlert, objGroup);
            if(callback) {
                callback();
            }
        }.bind(this));
    },
    view: function(tx, callback) {
        var html = '';
        html = '<div class="alert-layer">';
        html = '    <div class="alert-group">';
        html = '        <div class="alert-tx">'+ tx +'</div>';
        html = '        <div class="alert-btn">确定</div>';
        html = '    </div>';
        html = '</div>';
        $('body').append(html);
        this.initIng(callback);
    }
}

module.exports = alert;
