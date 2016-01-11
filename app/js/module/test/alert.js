/*

    alert组件
    _alert.init('确定删除吗？', fn);

*/
var alert = {
    // arg: function(key) {
    //     let args = {
    //         rol: 'alert',
    //         group: 'pop-alert',
    //         yes: 'yes',
    //         time: 100
    //     }
    //     return args[key];
    // },
    // init: function(val, callback) {
    //     document.ontouchmove = function() {
    //         return false;
    //     };
    //     //删除多余模块
    //     $('[rol='+ this.arg('rol') +']').remove();
    //     //初始化view
    //     this.view(val, callback);
    // },
    // initIng: function(callback) {
    //     var objRol,
    //         objGroup;
    //     //初始化对象
    //     objRol = $('[rol='+ this.arg('rol') +']');
    //     objGroup = objRol.find('.' + this.arg('group'));
    //     //初始化样式
    //     objRol.removeClass('unactive').addClass('active');
    //     //初始化功能
    //     this.yes(objRol, objGroup, callback);
    // },
    // hide: function(objRol, objGroup) {//隐藏效果
    //     //移动短开启滚动
    //     document.ontouchmove = function() {
    //         return true;
    //     };
    //     objRol.removeClass('active').addClass('unactive');
    //     setTimeout(() => {//等待animation完成，运行
    //         objRol.remove();
    //     }, this.arg('time'));
    // },
    // yes: function(objRol, objGroup, callback) {
    //     objGroup.find('[rol='+ this.arg('yes') +']').on('click', function() {
    //         this.hide(objRol, objGroup);
    //         if(callback) {
    //             callback();
    //         }
    //     }.bind(this));
    // },
    // view: function(tx, callback) {
    //     var html = '';
    //     html += '<div class="pop-modal" rol="alert">';
    //     html += '    <div class="pop-alert">';
    //     html += '        <div class="pop-body">'+ tx +'</div>';
    //     html += '        <div class="pop-foot">';
    //     html += '           <div rol='+ this.arg('yes') +'>确定</div>';
    //     html += '        </div>';
    //     html += '    </div>';
    //     html += '</div>';
    //     $('body').append(html);
    //     this.initIng(callback);
    // }
}

module.exports = alert;
