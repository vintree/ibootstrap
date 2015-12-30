/*
    查询是否是移动端
    userAgent.isMobile() //boo
*/
 var userAgent = {
    mobileArr: ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"],
    isMobile: function() {
        return this.mobileArr.some(function(v) {
            return window.navigator.userAgent.indexOf(v) > 0 ? true : false;
        });
    }
}
module.exports = userAgent;
