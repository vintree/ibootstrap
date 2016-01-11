/*
    基础事件
*/
var events = {
    // 取消禁止滑动
    touchmove: function() {
        document.ontouchmove = function() {
            return true;
        }
    },
    // 设置禁止滑动
    untouchmove: function() {
        document.ontouchmove = function() {
            return false;
        }
    }
}

module.exports = events;
