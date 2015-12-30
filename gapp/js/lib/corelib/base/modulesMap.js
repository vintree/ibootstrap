/**
   baseURL : 'http://m.tv.sohu.com/mb/dist/js'
  jquery: {
        path: "base/core/j_1.7.2.js"
    },
    ifoxtip: {
        path: "site/play/ifoxtip13112001.js",
        requires: ["jquery"]
    }
    see http://js.tv.itc.cn/dict.js
 */
var __modulesMap = { 
     Zepto: {
        path: "http://m.tv.sohu.com/mb/dist/js/zepto-v1.1.3.min.js"
    },
    PassportSC:{
        path: "http://tv.sohu.com/upload/touch/js/PassportSC.min.20150214.js"
    }
};
if ("undefined" != typeof window.loader ) for (var m in __modulesMap) loader.add(m, __modulesMap[m]);