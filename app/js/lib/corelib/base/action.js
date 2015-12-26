/**
 *
 *   @description: 与客户端交互，唤起客户端相关业务
 *
 *   @version    : 1.0.7
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-11-27
 *
 *   @update-log :
 *                 1.0.1 - 唤起客户端
 *                 1.0.2 - 移除自动拉起app时，暂停player的业务
 *                 1.0.3 - startClient为0的时候不自动拉起app
 *                 1.0.4 - formatArgs 添加参数 dataType
 *                 1.0.5 - videoData中ugc和pgc(site不为1)或者为直播的时候不拉起app
 *                 1.0.6 - 新增app_auto_start统计
 *                 1.0.7 - 新增setPageTitle方法
 *
 */
svp.define('base.action', function (require, exports, module) {

    'use strict';
    
    var $ = svp.$,
        vars = require('base.vars'),
        URL = require('base.url'),
        cookie = require('base.cookie'),
        Storage = require('base.store'),
        clickTrace = require('trace.click'),
        download = require('data.appDownload'),
        Console = require('base.console');
        
    /**
     * @module base.action
     * @namespace Action
     * @property {string}   URLProtocol         通过UA区分协议
     * @property {number}   openTime            延迟时间
     * @property {number}   appChanneled        h5 channel
     * @property {number}   maxEffectiveTime    本地存储app信息有效时间
     * @property {string[]} appPortArr          appinfo请求端口列表
     * @property {number}   appInfoReqCounts    请求本地app信息次数
     * @property {object}   URLGlobalParams     全局变量参数
     * @property {function} openIos             ios唤起客户端
     * @property {function} openAndroid         android唤起客户端
     * @property {function} formatArgs          格式化action url
     * @property {function} isIntentList        是否intent列表中
     * @property {function} isForceIntent       是否强制intent
     * @property {function} getAppChanneled     获取channeled
     * @property {function} makeActionParam     生成拉起app参数
     * @property {function} makeActionUrl       生成拉起客户端的url
     * @property {function} getIframe           获取 iframe 没有就新建
     * @property {function} sendAction          通过协议调用客户端
     * @property {function} updateGlobalParams  更新URLGlobalParams
     * @property {function} parserUrls          通过src或MTV_SRC获取对应渠道包的逻辑
     * @property {function} channelSrcInit      指定渠道号检查
     * @property {function} init                初始化
     * @property {function} addIosMeta          添加ios meta(abandon)
     * @property {function} isEnableWebSocket   webSocket是否可用
     * @property {function} parserAttributes    生成action参数
     * @property {function} autoStartClient     自动拉起客户端
     * @property {function} getAppInfo          获取app详情
     * @property {function} bindAction          绑定自动拉起事件
     * @property {function} setPageTitle        修改客户端页面title
     *
     * @example
     *   var Action = require('base.action');
     *   //获取拉起客户端全屏播放参数
     *   var param = Action.parserAttributes();
     *   param.action = '1.1';
     *   param.type = 'click';
     *   //尝试拉起客户端
     *   Action.sendAction(param);
     */
    var Action = {
        /**
         * @memberof Action
         * @summary 通过UA区分协议
         * @type {string}
         */
        URLProtocol: 'sohuvideo' + (vars.IsIpad ? 'hd' : '') + '://',
        /**
         * @memberof Action
         * @summary 延迟时间
         * @type {number}
         */
        openTime: vars.IsIOS ? 800 : 1000,
        /**
         * @memberof Action
         * @summary h5 channel
         * @type {number}
         */
        appChanneled: 1200120001,
        /**
         * @memberof Action
         * @summary 本地存储app信息有效时间
         * @type {number}
         */
        maxEffectiveTime: 1000 * 60 * 60 * 2,
        /**
         * @memberof Action
         * @summary appinfo请求端口列表
         * @type {string[]}
         */
        appPortArr: ['23456', '23457'],
        /**
         * @memberof Action
         * @summary 请求本地app信息次数
         * @type {number}
         */
        appInfoReqCounts: 0,
        /**
         * @memberof Action
         * @summary 全局变量参数
         * @type {object}
         */
        URLGlobalParams: {},

        /**
         * @memberof Action
         * @summary ios唤起客户端
         * 不同的浏览器app（包括webview），都有自己在后台的常驻时间, 在uc、chrome中，不会触发pagehide和pageshow的方法，而在safari中可以的。使用iframe调用schema URL, 使用定时器判断在一段时间内是否调起成功, 使用pageshow和pagehide来辅助定时器做更详细的判断
         * @type {function}
         * @param {string} url 唤起地址
         * @param {function} callback 回调函数
         */
        openIos: function (url, callback) {

            if (url) {
                //发送拉起客户端请求
                Console.log('发送行为统计点: app2_ios_action');
                clickTrace.pingback(null, 'app2_ios_action');
                var node = document.createElement('iframe');
                node.style.display = 'none';
                var body = document.body;
                var timer;
                var clear = function (evt, isTimeout) {

                    if (callback && typeof callback === 'function') {
                        callback(isTimeout);
                    }
                    window.removeEventListener('pagehide', hide, true);
                    window.removeEventListener('pageshow', hide, true);

                    if (!node) {

                        return;
                    }
                    node.onload = null;
                    body.removeChild(node);
                    node = null;
                };

                var hide = function (e) {
                    clearTimeout(timer);
                    clear(e, false);
                };
                //ios平台特有事件
                window.addEventListener('pagehide', hide, true);
                window.addEventListener('pageshow', hide, true);
                node.onload = clear;
                node.src = url;
                body.appendChild(node);
                var now = +new Date();
                //如果事件失败，则1秒设置为空
                timer = setTimeout(function () {
                    timer = setTimeout(function () {
                        var newTime = +new Date();

                        if (now - newTime > 1300) {
                            clear(null, false);

                        } else {
                            clear(null, true);
                        }
                    }, 1200);
                }, 60);
            }
        },
        /**
         * @memberof Action
         * @summary 拉起安卓客户端
         * @type {function}
         * @param {string} url 唤起地址
         * @param {function} callback 回调函数
         * @param {string} type 唤起类型
         */
        openAndroid: function (url, callback, type) {

            if (url) {

                if (url.indexOf('svawebsocket') === -1) {
                    //发送拉起客户端统计
                    Console.log('发送行为统计点: app1_android_action');
                    clickTrace.pingback(null, 'app1_android_action');
                }

                var URLParms = URL.getQueryData(location.search.substring(1));
                var clickFlag = false,
                    tryFlag = false;

                if (typeof type !== 'undefined') {

                    if (type === 'click') {
                        clickFlag = true;
                    }

                    if (type === 'try') {
                        tryFlag = true;
                    }
                }
                /* && (Action.isIntentList() ||
                 (typeof url !== 'undefined' && url.indexOf('intent') > -1) || /UCBrowser/i.test(UA)) &&
                 url.indexOf('svawebsocket') === -1 */
                if ((URLParms.startClient && '1' === URLParms.startClient && URLParms.clientType) ||
                    (!tryFlag &&
                        ((URLParms.startClient && '2' !== URLParms.startClient) || clickFlag) &&
                        (Action.isIntentList() && !/UCBrowser/i.test(vars.UA)) &&
                        url.indexOf('svawebsocket') === -1)) {
                    //intent 拉起app
                    window.location.href = url;

                } else {
                    var iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = url; //sohuvideo 拉起app
                    var body = document.body;
                    body.appendChild(iframe);

                    setTimeout(function () {
                        body.removeChild(iframe);
                        iframe.onload = null;
                        iframe = null;
                    }, 200);
                }
                //var cbargs = Array.prototype.slice.call(arguments);
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        },
        /**
         * @memberof Action
         * @summary intent列表
         * @type {function}
         * @returns {boolean}
         */
        isIntentList: function () {
            var f = false;

            if (vars.IsAndroid) {
                //三星note3和s5采用intent协议吊起客户端
                if (/(SAMSUNG[\s\\-_]+)?SM[\s\\-_]+(N90|G90|T|P6)+|Nexus/i.test(vars.UA)) {
                    f = true;
                }
            }

            return f;
        },
        /**
         * @memberof Action
         * @summary 是否强制intent
         * @type {function}
         * @returns {boolean} 是否强制intent
         */
        isForceIntent: function () {
            var f = false;

            if (vars.IsAndroid && this.isIntentList() && !/UCBrowser/i.test(vars.UA) && !/QQBrowser/i.test(vars.UA)) {
                f = true;
            }

            return f;
        },
        /**
         * @memberof Action
         * @summary 获取channeled
         * @type {function}
         * @returns {*|string|undefined|string}
         */
        getAppChanneled: function () {
            var videoData = window['VideoData'] || window['videoData'] || {},
                channeled = URL.getQueryString('channeled') || videoData['channeled'] || Action.appChanneled,
                _href = window.location.href || 'http://m.tv.sohu.com/';

            try {

                if (_href.indexOf("hots") > -1 || _href.indexOf("/x") > -1) {
                    //热点流&短视频
                    channeled = videoData['channeled'] || URL.getQueryString('channeled') || Action.appChanneled;
                }

            } catch (e) {
                channeled = Action.appChanneled;
                Console.log(e);
            }

            return channeled;
        },
        /**
         * @memberof Action
         * @summary 生成拉起app参数
         * @type {function}
         * @param {{}} params 传入参数
         * @returns {{}}
         */
        makeActionParam: function (params) {
            //拉起参数
            var scParam = {};
            //设置行为id
            scParam.action = params.action;
            //h5和客户端的体育cid、cateCode有区别，需要特殊处理
            if ($(['71', '72', '73', '74', '75', '76']).indexOf(params.cid) !== -1) {
                params.cid = '28';
                params.cateCode = '9009';
            }

            //执行动作码为1.1时(小窗播放),有2个动作，其中专辑是不带vid, 单视频带vid, 这里需要区分对待
            if (scParam.action === '1.1') {
                //无vid的情况下，打开专辑播放页
                scParam.sid = params.sid;
                scParam.cid = params.cid;
                scParam.cateCode = params.cateCode;
                scParam.enterid = params.enterid;
                scParam.site = params.site;
                scParam.dataType = params.dataType || '';

                //无vid的情况下，打开单视频播放页,vid优先级高于sid
                if (params.vid && params.vid !== '') {
                    scParam.vid = params.vid;
                }
                //视频名称(可选)
                if (params.ex1 && params.ex1 !== '1' && params.ex1 !== '') {
                    scParam.ex1 = params.ex1;
                }
                //主演(可选)
                if (params.ex2 && params.ex2 !== '') {
                    scParam.ex2 = params.ex2;
                }
                //视频类型(可选) 1: vrs,  2: ugc
                if (params.ex3 && params.ex3 !== '') {
                    scParam.ex3 = params.ex3;
                }
                //第三方app的名称（可选）
                if (params.appname && params.appname !== '' && params.appname !== 'none') {
                    scParam.appname = params.appname;
                    //不显示退出时的提示框
                } else {
                    scParam.backpage = '0';
                }
                //附加字段(可选)
                if (params.more && !vars.IsIOS) {
                    scParam.more = params.more;
                }
                //winphone
                if (vars.IsWindowsPhone) {
                    scParam.site = params.site;
                }
            }

            //跳转到任意分类指定频道页
            if (scParam.action === '1.2' || scParam.action === '2.4') {
                //ios下的频道页跳转参数需要特殊处理
                if (vars.IsIOS) {
                    scParam.action = '2.4';
                    scParam.ex1 = params.ex1;

                    if (window.location.href.indexOf('/hots') > -1) {
                        scParam.cid = params.cid;
                        scParam.ex2 = params.ex2;
                        //scParam.ex2 = params.cateCode; //此处不应该用cateCode覆盖原有ex2参数
                        //ios遗留问题!这里要做特殊处理 坑爹!!
                    } else {
                        scParam.cid = params.cateCode;
                        scParam.ex2 = params.cid;
                    }

                } else {
                    scParam.action = '1.2';
                    scParam.cid = params.cid;
                    scParam.cateCode = params.cateCode;
                }
            }

            //全屏播放
            if (scParam.action === '1.17') {
                scParam.ex1 = params.ex1;
                //客户端播放
                if (params.ex1 === '1') {
                    scParam.vid = params.vid;
                    scParam.cid = params.cid;
                    //直播
                } else if (params.ex1 === '3') {
                    //直播流id
                    scParam.ex2 = params.ex2;
                    //直播视频地址(UTF-8)
                    scParam.ex3 = params.ex3;
                }
            }

            //打开独立h5页面
            if (scParam.action === '1.18') {
                scParam.urls = params.urls;
                if (params.share !== '') {
                    scParam.share = params.share;
                }
                //页面专题，目前之定义1为专题，ex1的优先级高于ex2
                if (params.ex1 !== '') {
                    scParam.ex1 = params.ex1;
                }
                //configs(int)(可选) 文档上设这么写的...(不知道啥意思)
                if (params.ex2 !== '') {
                    scParam.ex2 = params.ex2;
                }
                //界面标题(可选)
                if (params.ex3 !== '') {
                    scParam.ex3 = params.ex3;
                }
                //是否显示地址栏(可选)
                if (params.bit0 !== '') {
                    scParam.bit0 = params.bit0;
                }
                //是否显示导航工具栏,后退刷新按钮等(可选)
                if (params.bit1 !== '') {
                    scParam.bit1 = params.bit1;
                }
            }

            //分享
            if (scParam.action === '1.21') {
                /*参数说明
                 more: {
                 title:名称,
                 description:描述,
                 imageurl:缩略图地址,
                 url:内容链接地址,
                 callbackurl:分享成功后的跳转页
                 } */
                scParam.more = params.more;
                //分享类型,1:QQ, 2:SinaWeibo, 3:Mail, 4:SMS, 5:微信好友, 6:微信朋友圈, 目前只实现了6 (=.=)
                scParam.type = params.type;
            }

            

            //登录
            if (scParam.action === '2.6') {
                var aParam = Action.parserAttributes();
                aParam.action = '1.18';
                aParam.urls = params.urls || window.location.href;
                aParam.share = '0';
                aParam.more = {
                  sourcedata: {
                    params: 'passport&token&uid&share'
                  }
                };
                var callbackAction = this.makeActionUrl(aParam);

                scParam.more = {
                    sourcedata: {
                        closeWebView: 1,    //登录成功后关闭原页面
                        callbackAction: callbackAction
                    }
                };
            
            } else {
                scParam.more = {
                    sourcedata: {
                        enterid: params.enterid || '4',
                        channeled: params.channeled,
                        preid: window.location.href
                    }
                };
                $.extend(true, scParam.more, params.more);
            }

            
            scParam.more = JSON.stringify(scParam.more);

            return scParam;
        },
        /**
         * @memberof Action
         * @summary 格式化action url
         * @type {function}
         * @param {object} args 需要格式化的对象
         */
        formatArgs: function (args) {
            var cateCode = args.cateCode || '',
                channeled = args.channeled || this.getAppChanneled();
            cateCode = cateCode.toString().split(',')[0] || '';
            cateCode = cateCode.split(';')[0] || '';

            var params = {
                action: args.action || '1.1',
                vid: args.vid || '',
                sid: args.sid || '',
                cid: args.cid || '',
                cateCode: cateCode,
                dataType: args.dataType || '',
                share: args.share || '',
                urls: args.urls  || '',
                h5url: args.h5url || args.url || '',
                ex1: args.ex1 || '1',
                ex2: args.ex2 || '',
                ex3: args.ex3 || '',
                site: args.site || '',
                enterid: '4_' + channeled + '_' + download.channelSrc, //h5身份id
                bit0: args.bit0 || '',
                bit1: args.bit1 || '',
                type: args.type || 6,
                appname: 'none',
                channeled: channeled,
                more: args.more || {}
            };

            if ('1.1' === args.action) {
                // UGC, 置sid为空
                if (args['cid'] === 9001 || args['site'] === '2') {
                    params.ex3 = 2;
                    params.site = '2';
                }
            }

            return params;
        },

        /**
         * @memberof Action
         * @summary 生成拉起客户端的url
         * @type {function}
         * @param args 需要生成的定制化参数对象
         * @returns {string} 生成好的地址
         */
        makeActionUrl: function (args) {
            var option = this.formatArgs(args);
            //获取拉起客户端的参数对象
            var params = this.makeActionParam(option);
            var clientUrl = '',
                URLParams = this.URLGlobalParams,
                sch = '';
            //在客户端内部，使用location跳转触发Action，不然在某些机型上无法调起,不支持cookie(客户端)
            if (/SohuVideoMobile/i.test(vars.UA) || (URLParams.clientType && URLParams.clientVer && URLParams.startClient === '1') || !cookie.test()) {
                sch = 'sohuvideo';

            } else {
                //在浏览器内部(就是说startClient=1不一定就是在客户端里)
                if ('1' === URLParams.startClient || this.isForceIntent()) {
                    //强制采用intent协议吊起客户端
                    sch = 'intent';

                } else {
                    sch = 'sohuvideo';
                }
            }

            if (sch.indexOf('intent') > -1) {
                clientUrl = 'intent://';
                clientUrl += '?' + URL.objToQueryString(params).replace(/index\.html%2C/, 'index.html');
                clientUrl += '#Intent;scheme=sohuvideo;package=com.sohu.sohuvideo;end';
                Console.log("android intent 1:", JSON.stringify(params));

            } else {
                clientUrl = Action.URLProtocol;
                clientUrl += 'action.cmd';
                clientUrl += '?' + URL.objToQueryString(params).replace(/index\.html%2C/, 'index.html');
                Console.log("sohovideo:", JSON.stringify(params));
            }

            Console.log("makeActionUrl : " + clientUrl);
            return clientUrl;
        },
        /**
         * @memberof Action
         * @summary 获取 iframe 没有就新建
         * @type {function}
         * @returns {*|HTMLElement}
         */
        getIframe: function () {
            var iframe = $('#j_redirectNativeFrame');

            if (iframe.length === 0) {
                iframe = $('<iframe id="j_redirectNativeFrame" style="display:none"></iframe>');
                $('body').append(iframe);
            }

            return iframe;
        },
        /**
         * @memberof Action
         * @summary 通过协议调用客户端
         * @type {function}
         * @param {object} param
         * @param {function} callback
         */
        sendAction: function (param, callback) {
            if (download.channelSrc !== '' && download.channelSrc !== '0') {
                Console.log('发送行为统计点: app_channel_action');
                clickTrace.pingback(null, 'app_channel_action');
            }
            var clientUrl = this.makeActionUrl(param);
            var URLParams = URL.getQueryData(location.search.substring(1));

            if ('1' === URLParams['startClient']) {
                Console.log('发送行为统计点: appdownload_jump1');
                clickTrace.pingback(null, 'appdownload_jump1');
            }

            if ('2' === URLParams['startClient']) {
                Console.log('发送行为统计点: appdownload_jump2');
                clickTrace.pingback(null, 'appdownload_jump2');
            }

            if (!!param.isHike) {
                Console.log('发送行为统计点: appdownload_jump0');
                clickTrace.pingback(null, 'appdownload_jump0');
            }

            if (vars.IsAndroid) {
                if (typeof param.type !== 'undefined') {
                    this.openAndroid(clientUrl, callback, param.type);

                } else {
                    this.openAndroid(clientUrl, callback);
                }

            } else if (vars.IsIOS) {
                this.openIos(clientUrl, callback);

            } else {
                Console.log('发送行为统计点: app3_others_action');
                clickTrace.pingback(null, 'app3_others_action');
                var iframe = this.getIframe();
                iframe.attr('src', clientUrl); //sohuvideo 拉起app
            }
        },
        sendClientAction: function (param, callback) {
            var clientUrl = this.makeActionUrl(param);

            var URLParams = URL.getQueryData(location.search.substring(1));
            var h5Url = param['h5url'] || param['url'] || "";
            if(!vars.IsSohuVideoClient && h5Url){
                window.location.href = h5Url;
                return;
            }
            Console.log('发送行为统计点: app_channel_action');
            clickTrace.pingback(null, 'app_channel_action');
            if (vars.IsAndroid) {
                if (typeof param.type !== 'undefined') {
                    this.openAndroid(clientUrl, callback, param.type);

                } else {
                    this.openAndroid(clientUrl, callback);
                }

            } else if (vars.IsIOS) {
                this.openIos(clientUrl, callback);

            } else {
                var iframe = this.getIframe();
                iframe.attr('src', clientUrl); //sohuvideo 拉起app
            }
        },
        /**
         * @memberof Action
         * @summary 把需要全站传递的参数注入到某个容器对象的子对象中去，在使用JS动态创建内容的之后一般需要使用这个方法把相关参数注入到动态生成的内容中去
         * @type {function}
         * @param {dom} wrap
         * @param {{}} data
         */
        updateGlobalParams: function (wrap, data) {

            var elLinks = $('a[href],form', wrap),
                i = elLinks.length,
                elLink;
            data = data || Action.URLGlobalParams;

            while (i--) {
                elLink = elLinks.get(i);
                // link = elLink.href;
                URL.setQueryString(elLink, data);
            }
        },
        /**
         * @memberof Action
         * @summary 通过src或MTV_SRC获取对应渠道包的逻辑
         * @type {function}
         */
        parserUrls: function () {
            // 判断是否客户端打开 actionVer判断是否老版本客户端
            if (!Action.URLGlobalParams['clientType'] && !Action.URLGlobalParams['actionVer']) {
                //Android老版本视频播放时添加视频地址参数: startClient = 1
                URL.setQueryString(this, {'startClient': 1});
            }
            /* 处理需要URL传递的全局参数 */
            var URLGlobalParamsKeys = ['clientType', 'clientVer', 'actionVer', 'startClient', 'actionId', 'player',
                                       'vid', 'vids', 'site', 'srcUrl', 'poster', 'title'],
                l = URLGlobalParamsKeys.length,
                key,
                URLParms = URL.getQueryData(location.search.substring(1)),
                URLVals = {};

            while (l--) {
                key = URLGlobalParamsKeys[l];

                if (URLParms.hasOwnProperty(key) &&  URLParms[key]) {
                    URLVals[key] = URLParms[key]; // set vals  k=v
                }
            }
            // /* 后续使用 */
            Action.URLGlobalParams = URLVals;
        },
        /**
         * @memberof Action
         * @summary 指定渠道号检查
         * @type {function}
         * @returns {string}
         */
        channelSrcInit: function () {
            //trace中的src在url中没有时候，还需要从cookie中取，而拉起时候就不需要走cookie中的src
            try {
                download.channelSrc = URL.getQueryString('src') || URL.getQueryString('SRC') || cookie.get('MTV_SRC') || '0';
                download.channelSrc = download.channelSrc.replace('|', '').replace('%7C', '');

                if (download.channelSrc.length > 4) {
                    download.channelSrc = download.channelSrc.substr(0, 4);
                }
                //处理非数值的channelSrc
                download.channelSrc = parseInt(download.channelSrc, 10);
                if (isNaN(download.channelSrc)) {
                    download.channelSrc = "0";
                }
                return download.channelSrc || '0';
            }catch(e){};
        },
        /**
         * @memberof Action
         * @summary 给所有的<A>标签增加的属性和方法
         * @type {function}
         */
        init: function () {
            /* <div id=test1 vid='1829930'  channeled="1211010100" data-params="[{cid:'76',sid:'6862794',cateCode:'169',ex1:'1',ex2:'',ex3:''}]"  data-actionId='1.17' data-scheme="intent"
             data-downUrl="http://upgrade.m.tv.sohu.com/channels/hdv/4.3.1/SohuTV_4.3.1_680_201407080857.apk?t=1"   class="actionLink">test  action Intent player</div> */
            this.parserUrls();
            //初始化渠道号
            this.channelSrcInit();
            Action.bindAction();
        },
        /**
         * @memberof Action
         * @summary 给所有的<A>标签增加的属性和方法
         * @type {function}
         */
        addIosMeta : function () {
            var meta = document.createElement("meta"),
                ms,
                pNode,
                content = '';

            if (vars.IsIOS) {
                // 在iOS中提供了两种在浏览器中打开APP的方法：Smart App Banner和schema协议
                /* <meta name="apple-itunes-app" content="app-id=458587755, app-argument=sohuvideo://action.cmd , affiliate-data=mt=8"> */
                if (vars.IsIphone) {
                    content = 'app-id=458587755';
                    content += ', app-argument=sohuvideo://action.cmd ';
                    content += ', affiliate-data=mt=8';

                    meta.setAttribute('content', content);
                    meta.setAttribute('name', 'apple-itunes-app');

                    ms = document.getElementsByTagName('meta');
                    pNode = ms[0].parentNode;
                    pNode.appendChild(meta);
                }

                if (vars.IsIpad) {
                    content = 'app-id=414430589';
                    content += ', app-argument=sohuvideo://action.cmd ';
                    content += ', affiliate-data=mt=8';

                    meta.setAttribute('content', content);
                    meta.setAttribute('name', 'apple-itunes-app');

                    ms = document.getElementsByTagName('meta');
                    pNode = ms[0].parentNode;
                    pNode.appendChild(meta);
                }
            }
        },
        /**
         * @memberof Action
         * @summary webSocket是否可用
         * @type {function}
         * @returns {boolean}
         */
        isEnableWebSocket: function () {
            var URLParms = URL.getQueryData(location.search.substring(1));
            var flag = true;
            var videoData = window['VideoData'] || window['videoData'];

            if (location.href.match(/player=1/i) ||              //如果默认是全屏播放(也是渠道来源)
                document.referrer.indexOf('m.sohu.com') > -1) {  //如果来自于手搜，默认不拉起app
                flag = false;

            } else if (typeof videoData !== 'undefined' && typeof videoData.hike !== 'undefined' && videoData.hike === '1') { //非渠道情况下,如果VideoData指定拉起app
                flag = true;
            }

            //如果有拉起需求
            if (typeof URLParms['startClient'] !== 'undefined') { //如果url中带有startClient参数

                if (URLParms['startClient'] === '2' && this.isIntentList()) {
                    flag = false;

                } else {
                    flag = true;
                }
            }

            if (typeof videoData === 'undefined' ||  //如果不是播放页
                (typeof videoData !== 'undefined' && videoData.mobileLimit === '1') ||     //如果只有h5才有播放权限
                !(/^(m|t\.m)\.tv\.sohu\.com$|^192\.168\.199\.186:85$/i.test(window.location.host)) ||         //非移动端h5播放页
                !cookie.test()) {                                                                        //如果不支持cookie
                flag = false;
            }

            return flag;
        },
        /**
         * @memberof Action
         * @summary 生成action参数
         * @type {function}
         * @param {object} data 参数videodata对象，如果不传的话默认使用需要全站传递的参数
         * @param {object} el
         * @returns {{}}
         */
        parserAttributes: function (data, el) {
            //create action data
            var videoParmsKeys = ['vid', 'cid', 'sid', 'plid', 'cateCode', 'site'],
                c = videoParmsKeys.length,
                URLParms = Action.URLGlobalParams,
                vd = data || window["VideoData"] || window["videoData"] || {},
                args = {};

            while (c--) {
                var key = videoParmsKeys[c];

                if (!!vd && vd[key]) {
                    args[key] = vd[key];
                }

                if (!!URLParms && URLParms.hasOwnProperty(key) &&  URLParms[key]) {
                    args[key] = URLParms[key];
                }
            }

            if (typeof args.site !== 'undefined') {
                args.site = args.site + '';
            }

            var channeled = URLParms['channeled'] || this.getAppChanneled();
            channeled = channeled.toString().replace('|', '').replace('%7C', '');
            var vid = args['vid'] || '',
                sch = Action.URLProtocol,
                downUrl = args['downUrl'] || '',
                actionId = args['actionId'] || args['actionVer'] || '1.17';

            if (typeof el !== 'undefined') {
                el = $(el);
                channeled = el.attr("channeled") || channeled;
                vid = el.attr("vid") || vid;
                var _sch = el.attr("data-scheme");

                if (_sch) {
                    sch = _sch.toLowerCase();
                }
                downUrl = el.attr("data-downUrl") || el.attr('data-downurl') || downUrl;
                actionId = el.attr('actionId') || el.attr('actionid') || '1.17';
                args['action'] = actionId;
                args['vid'] = vid;
                args['channeled'] = channeled;
                args['scheme'] = sch;
                args['downUrl'] = downUrl;
                args['enterid'] = '4_' + channeled; //h5身份id

                try {
                    //必须用数组
                    var _params = eval(el.attr("data-params")) || [];

                    for (var i in _params) {
                        var jsonObj = _params[i] || {};

                        if (jsonObj) {
                            $.extend(true, args, jsonObj);
                        }
                    }

                } catch (e) {
                    Console.log(e);
                }
            }
            //ugc
            if (vd.site && vd.site === '2') {
                args['ex3'] = '2';

            } else {
                args['ex1'] = '1';
            }
            args['action'] = actionId;
            args = this.formatArgs(args);  //格式化actionid,ex1,ex2,ex3,vid,sid
            args['scheme'] = sch;
            args['downUrl'] = downUrl;
            Console.log("parserAttributes:", JSON.stringify(args));

            return args;
        },
        parserAttrs: function (el,data) {
            try{
                var $el =  $(el);
                var args ={};
                if($.isPlainObject(data) && data.vid ){
                    args = data;
                }else{
                    args = {
                        action: $el.attr('data-action') || '1.1',
                        vid:$el.attr('data-vid') || '',
                        sid: $el.attr('data-sid')  || $el.attr('data-aid') ||'',
                        cid: $el.attr('data-cid')  || '',
                        cateCode: $el.attr('data-catecode') || '',
                        dataType: $el.attr('data-datatype') || '1',
                        site: $el.attr('data-site') || '1',
                        share: $el.attr('data-share') || '',
                        urls: $el.attr('data-urls') || '',
                        h5url: $el.attr('data-h5url') || $el.attr('data-url') || '',
                        downUrl: $el.attr('data-downUrl') || '',
                        ex1: $el.attr('data-ex1') || '1',
                        ex2: $el.attr('data-ex2') || '',
                        ex3: $el.attr('data-ex3') || '',
                        enterid: '4_' + 1200120001 + '_0',
                        bit0: $el.attr('data-bit0') || '',
                        bit1: $el.attr('data-bit1') || '',
                        type: $el.attr('data-type') || 6,
                        appname: 'vstar',
                        channeled: 1200120001,
                        more:  {}
                    };

                }
                args = this.formatArgs(args);  //格式化actionid,ex1,ex2,ex3,vid,sid
                console.log("parserAttrs:", JSON.stringify(args));
                return args;
            }catch(e){ console.log(e) }

        },


        /**
         * @memberof Action
         * @summary 自动拉起客户端
         * @type {function}
         */
        autoStartClient: function () {
            var autoStartFlag = true;
            var videoData = window['VideoData'] || window['videoData'];

            if (!this.isEnableWebSocket()) {
                autoStartFlag = false;
            }
            //特殊机型不做拉起
            if (this.isIntentList()) {
                autoStartFlag = false;
            }
            //微信不自动拉起
            if (vars.IsWeixinBrowser) {
                autoStartFlag = false;
            }
            //如果VideoData中有tabCard为0或者site不为1时或者是直播时，则不拉起app
            if (typeof videoData !== 'undefined' &&
                (videoData.tabCard === '0' || videoData.site !== '1' || !$.isUndefined(videoData.liveId))) {
                autoStartFlag = false;
            }
            //如果链接中有player=1(全屏)
            if (window.location.href.match(/player=1/i)) {
                autoStartFlag = false;
            }
            //如果url中的startClient为0也不拉起
            if (this.URLGlobalParams.startClient === '0') {
                autoStartFlag = false;
            }

            var actionParam = Action.parserAttributes();
            actionParam.action = '1.1';
            actionParam.type = 'try';

            download.getChannelInfo(null, function (cbData) {
                
                if (autoStartFlag && cbData.startapp === '0') {
                    //发送拉起客户端请求
                    Console.log('发送行为统计点: app_auto_start');
                    clickTrace.pingback(null, 'app_auto_start');
                    Action.sendAction(actionParam);
                }
            });

        },
        /**
         * @memberof Action
         * @summary 获取app详情
         * @type {function}
         * @param {function} callback
         */
        getAppInfo: function (callback) {
            //获取本地app信息
            var localAppInfo = Storage.get('localAppInfo');
            Console.log("localAppInfo ", localAppInfo);
            //如果本地存储信息有效
            if (localAppInfo && localAppInfo.time &&  Date.now() - localAppInfo.time < this.maxEffectiveTime) {

                if (typeof callback === 'function') {
                    callback(localAppInfo);
                }
            }
        },
        /**
         * @memberof Action
         * @summary 绑定自动拉起事件
         * @type {function}
         */
        bindAction: function () {
            //根据不同需要，自动拉起app
            Action.autoStartClient();

            var endEvent = ('ontouchstart' in window) ? 'touchend' : 'mouseup';  //触摸结束的时候触发

            $('body').on(endEvent, '.actionLink', function () {
                var el = this;
                var vd = window["VideoData"] || window["videoData"] || {};

                //获取拉起客户端全屏播放参数
                var param = Action.parserAttributes(vd, el);
                param.action = '1.1';

                //如果页面访问来自渠道直接下载
                if (download.channelSrc !== '0' && download.channelSrc !== '-2') {
                    Action.sendAction(param);

                } else {

                    //ios app大窗窗播放
                    if (vars.IsIOS) {

                        Action.sendAction(param, function () {
                            //延迟跳appstore
                            setTimeout(function () {
                                download.gotoDownload();
                            }, 2000);
                        });
                        //android下载操作
                    } else if (vars.IsAndroid) {

                        if (Action.isForceIntent()) {
                            Action.sendAction(param);

                        } else {
                            //获取客户端信息
                            Action.getAppInfo(function (cbData) {
                                //如果没有安装app或者是老本的app(不支持获取app信息的版本)，尝试拉起app，并下载最新app，已经安装，则不做操作
                                if (cbData === null) {
                                    //延迟下载app
                                    setTimeout(function () {
                                        download.gotoDownload();
                                    }, 2000);

                                    Action.sendAction(param);

                                } else {
                                    Action.sendAction(param);
                                }
                            });
                        }
                        //win phone和其他
                    } else {
                        Action.sendAction(param);
                    }
                }
            });
        },

        /**
         * @memberof Action
         * @summary 修改客户端页面title
         * @type {function}
         * @param {string} 标题
         */
        setPageTitle: function (title) {
            var ifr, body, title = title || '';
            document.title = title;
            if (vars.IsSohuVideoClient && vars.IsIOS) {
                ifr = document.createElement('iframe');
                ifr.style.display = 'none';
                body = document.body;
                ifr.src = 'js://updateTitle?title=' + encodeURIComponent(title);
                body.appendChild(ifr);
                setTimeout(function () {
                    body.removeChild(ifr);
                },2000);

            } else if (vars.IsSohuVideoClient && (vars.IsAndroid || vars.IsAndroidPad)) {
                
                try {
                    handler.appCallback(4,1,'{"title":"'+title+'"}');
                
                } catch (e){}

            }
        }
    };

    Action.init();

    window.Action = Action;
    
    module.exports = Action;
});