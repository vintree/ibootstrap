svp.define('WeixinApi', function(require, exports, module) {
    var $ = svp.$,
        vars = require('base.vars');

    var WeixinJS = (typeof WeixinJS == 'undefined') ? {} : WeixinJS;

    var getVideoMetaData = function() {
        var o = document.getElementsByTagName("meta");
        var rlt = {};
        for (var i = 0; i < o.length; i++) {
            var vn = o[i].getAttribute('name');
            var vp = o[i].getAttribute('property');
            var vl = o[i].getAttribute('content') || "";
            if (vn == null || vn == undefined || vn.length == 0) {
                vn = vp;
            }
            if (vn == null || vn == undefined || vn.length == 0) {
                continue;
            }
            rlt[vn] = vl;
        }
        return rlt;
    };
    WeixinJS.getVideoMetaData = window['getVideoMetaData'] = getVideoMetaData;
    var videoMetaData = getVideoMetaData();
    WeixinJS.dataForWeixin = {};

    WeixinJS.getData = function(){
            WeixinJS.dataForWeixin = {
                appId: "", //appid 设置空就好了,web id=25250114746637056375,微信app_id:wxb6c82517aa33d525
                MsgImg: videoMetaData['og:image'] || "http://css.tv.itc.cn/global/images/nav1/logo.gif", //分享qq朋友时所带的图片路径
                TLImg: videoMetaData['og:image'] || "http://css.tv.itc.cn/global/images/nav1/logo.gif", //分享朋友圈时所带的图片路径
                url: videoMetaData['og:url'] || encodeURIComponent(window.location.href), //分享附带链接地址
                imgWidth: videoMetaData['og:imgWidth'] || "300", //图片宽度
                imgHeight: videoMetaData['og:imgHeight'] || "300", //图片高度 
                title: videoMetaData['og:title'] || document.getElementsByTagName('title')[0].text.split(' ')[0] || "", //分享标题
                desc: videoMetaData['description'] || document.getElementsByTagName('title')[0].text.split(' ')[0] || "", //分享内容介绍 
                type: videoMetaData['og:type'] || "",
                callback: function() {}
            };
    }

    console.log(WeixinJS.dataForWeixin);
    var onBridgeReady = function() {
        if (typeof WeixinJSBridge == 'undefined') return;
        var dataForWeixin = WeixinJS.dataForWeixin;
        if (typeof dataForWeixin == 'undefined') return;

        var wxtitle = dataForWeixin.title.substr(0, 22);
        if (!(wxtitle.indexOf('搜狐视频') > -1)) {
            wxtitle += "-搜狐视频";
            dataForWeixin.title = wxtitle;
        }

        if (vars.IsWeixinBrowser) {
            try {
                var _href = dataForWeixin.url;
                _href = _href.replace(/http:\/\/tv\.sohu\.com/i, 'http://wx.m.tv.sohu.com');
                _href = _href.replace(/http:\/\/my\.tv\.sohu\.com/i, 'http://wx.m.tv.sohu.com');
                dataForWeixin.url = _href;
            } catch (e) {}
        }

        WeixinJSBridge.on('menu:share:appmessage', function(argv) {
            // 发送给qq好友
            WeixinJSBridge.invoke('sendAppMessage', {
                "appid": dataForWeixin.appId,
                "img_url": dataForWeixin.MsgImg,
                "img_width": dataForWeixin.imgWidth,
                "img_height": dataForWeixin.imgHeight,
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            }, function(res) {
                if (res.err_msg == "send_app_msg:ok") {
                    //发送给好友成功
                    console.log(res.err_msg);
                };
                (dataForWeixin.callback)();
            });
        });
        WeixinJSBridge.on('menu:share:timeline', function(argv) {
            // 分享到weixin朋友圈,oldshare
            (dataForWeixin.callback)(); //callback
            WeixinJSBridge.invoke('shareTimeline', {
                "img_url": dataForWeixin.TLImg,
                "img_width": dataForWeixin.imgWidth,
                "img_height": dataForWeixin.imgHeight,
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            }, function(res) {
                if (res.err_msg == "share_timeline:ok") {
                    console.log(res.err_msg);
                }
            });
        });
        //weixinNewShare
        WeixinJSBridge.on("menu:general:share", function(argv) {
            var content = "#分享视频#" + dataForWeixin.title;
            if (vars.IsIOS) {
                content += dataForWeixin.url;
                dataForWeixin.desc = dataForWeixin.desc.substr(0, 29)
            }
            argv.generalShare({
                "type": dataForWeixin.type,
                "content": content,
                "title": dataForWeixin.title,
                "desc": dataForWeixin.desc,
                "img_url": dataForWeixin.TLImg,
                "img_width": dataForWeixin.imgWidth,
                "img_height": dataForWeixin.imgHeight,
                "link": dataForWeixin.url,
                "data_url": dataForWeixin.url
            }, function(res) {
                WeixinJSBridge.log(res.err_msg);
            });
        });
    };

    WeixinJS.init= function() {
        if (!vars.IsWeixinBrowser) return;
        if (typeof(WeixinJSBridge) != 'undefined') {
            onBridgeReady();
        } else {
            setTimeout(WeixinJS.init, 300);
        }
    };

    WeixinJS.getData();
    WeixinJS.init();

  //window.WeixinApi = WeixinJS;
  module.exports = {
    getData:WeixinJS.getData,
    init: WeixinJS.init
  };
});
