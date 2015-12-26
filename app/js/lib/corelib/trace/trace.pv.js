/**
 *
 *   @description: pv统计业务
 *
 *   @author     : wenlongliu205346
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-02-02
 *
 *   @update-date: 2015-07-20
 *
 *   @update-log :
 *                 1.0.1 - pv统计业务
 *                 1.0.2 - 在pv统计字段中加入了details字段
 */
svp.define('trace.pv', function(require, exports, module) {

    var $ = svp.$,
        vars = require('base.vars'),
        Util = require('base.util'),
        URL = require('base.url'),
        Trace = require('trace'),
        Cookie = require('base.cookie'),
        pp = require('base.passport');


    var TracePV = {
        pv: function(more, details) {
            var params = {};
            more = more || {};
            var videoData = window['VideoData'] || window['videoData'] || {};
             var channeled =  Trace.getChanneled() ;
            if (more && 'undefined' !== typeof more['channeled']) {
                channeled =more['channeled'];
            } 
            var vid = videoData["vid"] || '';
            var _href = location.href || "http://m.tv.sohu.com/";
            var plid = videoData['plid'] || videoData['aid'] || videoData['sid'] || '';
            details = (typeof details === 'undefined') ? {} : details;
            try {
                params = {
                    'url': encodeURIComponent(_href),
                    'refer': encodeURIComponent(document.referrer || ""),
                    'uid': Trace.getUid(),
                    'webtype': Trace.getConnectionType(),
                    'screen': Trace.getScreenSize(),
                    'catecode': Trace.getVideoData('cateCode') || Trace.getVideoData('cate_code') || "",
                    'pid': plid,
                    'vid': Trace.getVideoData('vid') || "",
                    'os': Trace.getOS(),
                    'platform': Trace.getPlatform(),
                    'passport': Trace.getPassport(),
                    't': +new Date(),
                    'channeled': channeled,
                    'MTV_SRC': encodeURIComponent(Trace.getChannelSrc())
                };

                if (vars.ENABLE_DEBUG) {
                    var appUserData = window.SohuAppUserData || {};
                    details.appUserData = JSON.stringify(appUserData);
                }
                if (details !== null) {
                    params.details = JSON.stringify(details);
                }

            } catch (e) {
                console.log("trace pv exception ", e);
            }
            if (vars.ENABLE_DEBUG) {
                console.log("trace pv ", params);
            }
            Util.pingback('http://z.m.tv.sohu.com/pv.gif?' + $.param(params));
        }
    };

    TracePV.iwt = function() {
//        //艾瑞 iwt-min
//        Util.loadScript('http://tv.sohu.com/upload/Trace/iwt-min.js', function() {
//            console.log('iwt-min pv http://tv.sohu.com/upload/Trace/iwt-min.js');
//        });
    };



    TracePV.wrating = function() {
        //缔元 c.wrating.com
//        Util.loadScript('http://tv.sohu.com/upload/Trace/wrating.js',function() {
//            console.log('wrating pv http://tv.sohu.com/upload/Trace/wrating.js');
//        });

    };

    TracePV.init = function(objs) {
        var _self = this;
        objs =objs||{};
        var more = $.extend({isAutoTrace:false},objs );
        var autoTrace =   more['isAutoTrace'] || false;
        //var columnid = URL.getParam('columnid');
        var IS_EXT =false;
        window['_iwt_UA'] = 'UA-sohu-123456';
            $(document).ready(function() {
                if (!!autoTrace) {
                    TracePV.pv(more);
                }

            });
    };

    $(function(){
        TracePV.init();
    });

    //兼容old
    window.TracePV = TracePV;

    module.exports = TracePV;

});