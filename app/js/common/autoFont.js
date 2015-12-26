/*
    查询是否是移动端，如果是则进行初始化em，如果不是还原
    autoFont.init(); //自动执行
*/

var userAgent = require('./userAgent');
var autoFont = {
    init: function() {
        var setFontSize = function () {
            // 获取window 宽度,动态计算
            var _self = this;
            _self.width = 750;   //psd750px宽度 ,default
            _self.fontSize = 100;//字体大小
            _self.widthProportion = function () {
                var p = ((document.body && document.documentElement.clientWidth || document.getElementsByTagName("html")[0].offsetWidth ) / _self.width );
                var px1 = (p * _self.fontSize).toFixed(4);
                //console.log("px1 ="+px1);
                px1 = px1 > 100 ? 100 : px1;
                px1 = px1 < 0.08 ? 0.08 : px1;
                return px1;
            };
            console.log("html fontSize: ",_self.widthProportion());
            document.getElementsByTagName("html")[0].setAttribute("style", "font-size:" + _self.widthProportion() + "px; !important");
        }.bind(window);
        // init 初始化
        setFontSize();
        //手机改变状态时也执行该方法
        var _evt = 'onorientationchange' in window ? 'orientationchange' : 'resize';
        var _timer = null;
        //android,win系列
        window.addEventListener(_evt, function () {
            clearTimeout(_timer);
            _timer = setTimeout(setFontSize, 300);
        }, false);
        //ios系列
        window.addEventListener("pageshow", function(e) {
            if (e.persisted) {
                clearTimeout(_timer);
                _timer = setTimeout(setFontSize, 300);
            }
        }, false);
    }
};
module.exports = autoFont;
