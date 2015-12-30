/*
    动态添加scrit
    addScript.init('http://t.m.tv.sohu.com/mb/dist/js/baseLib.min.js?v=1.0.1')
*/

var addScript = {
    init: function(data) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.src = data;
        script.type = 'text/javascript';
        document.body.appendChild(script);
    }
}
module.exports = addScript;
