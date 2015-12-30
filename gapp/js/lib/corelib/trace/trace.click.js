/**
 *
 *   @description: 行为统计业务
 *
 *   @author     : wenlongliu205346
 *
 *   @version    : 1.0.3
 *
 *   @create-date: 2015-02-02
 *
 *   @update-date: 2015-08-04
 *
 *   @update-log :
 *                 1.0.1 - 行为统计业务
 *                 1.0.2 - 在行为统计的details中加入了columnId字段
 *                 1.0.3 - 修复了微信播放页下channeled上报错误的bug
 */
svp.define('trace.click', function(require, exports, module){

    var $ = svp.$,
        vars = require('base.vars'),
        Util = require('base.util'),
        URL = require('base.url'),
        Trace = require('trace');
    /**
     * @module trace.click
     * @namespace Trace
     * @property {function}   pingBack  返回指定选择符的DOM集合
     *
     * @example
     *      var ClickTrace = require('trace.click');
     *      行为统计方法调用说明:
     *        针对链接点击的统计：
     *            DOM: <a class="link" href=".." position="sohuapp_download">Link</a>
     *            Javascript:
     *            $('.link').on('click', function() {
     *              var el = $(this);
     *              ClickTrace.pingback(el);
     *              setTimeout(function() {
     *                  location.href = el.attr('href');
     *              }, 50);
     *              return false; //为了在点击链接跳转的时候可以让统计数据发送出去，使用setTimeout做链接跳转
     *            });
     *
     *        针对非链接点击的自定义统计:
     *            ClickTrace.pingback(null, "sohuapp_download", JSON.stringify({"vid": 123}));
     */
    var ClickTrace = {

        /**
         * @memberof Trace
         * @summary 发送统计点信息
         * @type {function}
         * @param {object} el  RR.dom对象
         * @param {string} position (可选)统计字段名，如果为空会尝试从el的position属性获取
         * @param {string} details (可选)统计的附加数据，JSON.stringify()后的JSON字符串，如果为空会尝试从el的details属性获取
         */
        pingback: function(el, position, details) {
            position = position || (el && el.attr('position')) || '';
            var videoData = window['VideoData'] || window['videoData'] || {};
            var params = {};
            // var isRecomend = window.isRecomend || false;
            var channeled= Trace.getChanneled();
            var vid = Trace.getVideoData('vid') || '';
            var plid = videoData['plid'] || videoData['aid'] || videoData['sid'] || '';
            var _href = location.href || 'http://m.tv.sohu.com/';
            details = details || (el && el.attr('details')) || {};

            var columnid = URL.getParam('columnid');

            if (columnid !== null && columnid !== '') {
                details.columnId = columnid;
            }

            try {

                if (vars.IsWeixinBrowser) {
                    // if(channeled != '1211110100' && channeled != '1211110200'){
                    if (channeled.substr(0, 6) !== '121111') {
                        channeled = '1211110001';
                    }
                }

                params = {
                    't': +new Date,
                    'uid': Trace.getUid(),
                    'position': position,
                    'op': 'click',
                    'details': JSON.stringify(details),
                    'nid': Trace.getVideoData('nid') || '',
                    'url': encodeURIComponent(_href),
                    'refer': encodeURIComponent(document.referrer || "http://m.tv.sohu.com/"),
                    'screen': Trace.getScreenSize(),
                    'os': Trace.getOS(),
                    'platform': Trace.getPlatform(),
                    'passport': Trace.getPassport(),
                    'vid': vid || '',
                    'pid': plid || '',
                    'channeled': channeled ,
                    'MTV_SRC':encodeURIComponent(Trace.getChannelSrc())
                };

            } catch (e) {
                console.log('trace click exception ', e);
            }
            //console.log("trace click  ",params);
            Util.pingback('http://z.m.tv.sohu.com/h5_cc.gif?' + $.param(params));
        }

    };
    //兼容old
    window.ClickTrace=ClickTrace ;
    
    module.exports = ClickTrace ;

});