/**
 *
 *   @description: 该文件用于对全局变量svp和播放器的整体定义
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-03-01
 *
 *   @update-date: 2015-05-12
 *
 *   @update-log :
 *                 1.0.1 - 基础工具类定义
 *                 1.0.2 - 新增发送play_display逻辑
 *
 **/
svp.define('svp.foxPlayer', function(require, exports, module) {
    /**
     * @summary 全局视频业务对象
     * @namespace svp
     * @global
     */
    window.svp = window.svp || {};
    var Console = require('base.console');
    var ClickTrace = require('trace.click');


    /**
     * @summary 全局视频业务对象
     * @namespace foxPlayer
     * @global
     */
    svp.foxPlayer = {
        //播放器个数
        maxId: 1
    };

    /**
     * @namespace foxPlayer
     * @method foxPlayer.ready
     * @example
     *   foxPlayer.ready(function (FoxPlayer) {
   *       var player = new FoxPlayer(settings);
   *    });
     * @property {function} ready                         - 播放器模块加载完成方法
     * @param {function} callback                  - 播放器模块加载完成回调方法
     */
    svp.foxPlayer.ready = function (callback) {
        Console.log('发送行为统计点:(play_display)');
        ClickTrace.pingback(null, 'play_display');

        $(document).ready(function () {
            var $ = svp.$;

            var useFlash = !!document.all && ((navigator.platform == "Win32") || (navigator.platform == "Win64") || (navigator.platform == "Windows"));

            if (useFlash) {
                if ($.isFunction(callback)) {
                    callback(require('player.flash'));
                }
            } else {
                if ($.isFunction(callback)) {
                    callback(require('player.foxPlayer'));
                }
            }
        });
    };

    module.exports = svp.foxPlayer;
});
/**
 *
 *   @description: 该文件用于android广告业务
 *
 *   @version    : 1.0.6
 *
 *   @create-date: 2015-04-02
 *
 *   @update-date: 2015-09-21
 *
 *   @update-log :
 *                 1.0.1 - android广告业务
 *                 1.0.2 - 修复当视频为ugc时，cateCode字段的读取bug
 *                 1.0.3 - 去掉了针对于百度浏览器的适配，修改了安卓广告分片结束逻辑，统一采用advended方法
 *                         将player._firstLoadFlag标志位设置为true，第一次播广告时不显示loading图
 *                         在手机百度中，如果广告播完直接发送realvv
 *                 1.0.4 - 修复了播放器有时始终加载的bug
 *                 1.0.5 - 在广告链接中加入ca参数
 *                         去掉了附加在广告url中的pt、pg、prod参数
 *                 1.0.6 - 给广告加入了SOHUSVP
 *
 **/

svp.define('adv.android', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var vars = require('base.vars');
  var URL = require('base.url');
  var Util = require('base.util');
  var Cookie = require('base.cookie');
  var vast = require('adv.andorid.parseData');
  var LoadCacheData = require('player.loadCacheData');
  var ClickTrace = require('trace.click');
  var sysMessage = require('base.sysMessage');
  var Action = require('base.action');
  var appDownload = require('data.appDownload');
  var Console = require('base.console');
  var VideoTrace = require('trace.video');

  /**
   * @class AndoridAdvertise
   * @classdesc android广告对象
   * @property {boolean}   isMediaPlayed                   - 视频广告是否播放完成
   * @property {function}  addAdvertise                    - 添加广告
   * @property {function}  updateAdv                       - 更新广告
   * @property {function}  gotoEnd                         - 结束广告,播放正片
   * @property {function}  hideMediaView                   - 隐藏广告相关UI
   *
   * @example
   *   var AndoridAdvertise = require('adv.android');
   *   var adv = new AndoridAdvertise(player, config);
   *   adv.isMediaPlayed();
   *   adv.updateAdv();
   */
  var tm = $.now();
  //对外接口
  var AndoridAdvertise = function (player, config) {

    var adv = {
      param: {
        //播放器
        player: null,
        //暂停广告容器class
        pauseAdConClass: 'svp_ad_pause_' + tm,
        //暂停广告关闭按钮class
        pauseAdCloseBtnClass: 'svp_ad_pause_close_' + tm,
        //视频广告倒计时容器class
        mediaTimerConClass: 'svp_poster_ad_time_' + tm,
        //视频广告倒计时class
        mediaTimerClass: 'svp_poster_ad_timer_' + tm,
        //广告详情按钮class
        adDetailBtnClass: 'svp_ad_detail_' + tm,
        //是否需要暂停广告,默认false
        isPauseAd: false,
        //视频广告类型
        mediaAdPlatform: 'none',
        //添加安卓视频广告后的回调
        addAdCallback: null,
        //是否需要屏蔽广告
        adClose: '0', //0: 能播, 1: 不能,敏感词屏蔽, 2: 不能,合作方不让播
        //是否是debug模式
        debug: false,
        //当前播放视频地址debug用
        debugCurUrl: '',
        //超时时间处理
        timeout: 2000,
        //超时标志位
        timeoutFlag: false,
        //获取广告信息标志位
        isGetFlag: false,
        //是否是有效广告
        isValidFlag: false,
        //是否首次加载
        isFirstLoad: true,
        //定制页面显示参数
        ps: '',
        //链接
        urls: {
          //安卓视频广告信息获取url
          adrMedia: 'http://m.aty.sohu.com/h',
          //调试模式
          adrMediaDebug: 'http://60.28.168.195/h',
          //展示广告页面地址
          advIframe: 'http://m.tv.sohu.com/upload/touch/public/showInIframe_new.html'
        }
      },
      model: {
        //之前广告播放索引
        oldAdIndex: 0,
        //当前广告播放索引
        curAdIndex: -1,
        //发送统计信息广告索引
        sendRepAdIndex: -1,
        //原始视频内部信息
        cache: null,
        //应用id
        appid: '',
        //广告列表缓存(包含空广告)
        mediaAd: {},
        //有效广告列表缓存(都是可播放的广告)
        effMediaData: [],
        //最近一次空广告索引
        mptIndex: [],
        //视频数据
        videoData: null
      },
      view: {},
      ctrl: {}
    };

    var p = adv.param,
        m = adv.model,
        v = adv.view,
        c = adv.ctrl;


    //参数初始化
    p.init = function (player, config) {

      if ($.isUndefined(player)) {

        return false;
      }
      p.player = player;
      //初始化参数
      p = $.merge(p, config);

      //在url和config中查找，是否有设置adClose参数
      if (URL.getQueryString('adClose') !== null) {
        p.adClose = URL.getQueryString('adClose');
      }

      //在url和config中查找，是否有设置ps参数
      if (URL.getQueryString('ps') !== null) {
        p.ps = URL.getQueryString('ps');
      }

      if (config.adClose !== '0') {
        p.adClose = config.adClose;
      }

      p.debug = vars.ENABLE_DEBUG;

      return true;
    };

    //重置参数
    p.reset = function () {
      //超时标志位
      p.timeoutFlag = false;
      //获取广告信息标志位
      p.isGetFlag = false;
      //是否是有效广告
      p.isValidFlag = false;
    };

    //模型初始化
    m.init = function (player, config) {
      //克隆视频信息
      m.cache = $.extend(true, {}, player.cache);
      m.videoData = player.videoData;
      m.appid = config.appid;
    };

    //重置模型参数
    m.reset = function () {
      //之前广告播放索引
      m.oldAdIndex = 0;
      //当前广告播放索引
      m.curAdIndex = -1;
      //原始视频内部信息
      m.cache = null;
      //广告列表缓存(包含空广告)
      m.mediaAd = {};
      //有效广告列表缓存(都是可播放的广告)
      m.effMediaData = [];
      //最近一次空广告索引
      m.mptIndex = [];
    };

    //加工播放器地址
    m.getQueryAdVideoURL = function (data, url) {
      var cateCode = data['cateCode'] || data['cate_code'] || '';
      var queryParams = [
        'vid=' + data.vid,
        '&uid=' + Cookie.get('SUV') || '',
        '&plat=17',
        '&eye=0',
        '&cateCode=' + cateCode.split(';')[0] || '',
        '&advEFId=' + data.advEFId,
        '&ca=4',
        '&SOHUSVP=' + Cookie.get('SOHUSVP')

      ].join('');

      if (!$.isUndefined(url)) {
        url += (url.match(/\?/) ? '&' : '?') + queryParams;
      }

      return url;
    };

    //获取平台id
    m.getPlatId = function () {
      //如果是android phone
      if (vars.IsAndroidPad) {

        return 'h0';
      
      } else if (vars.IsIphone) {

        return 'h3';
      
      } else if (vars.IsIpad) {

        return 'h1';
      
      } else if (vars.IsAndroid) {

        return 'h6';
      }

      return 'unknowm';
    };

    //获取广告相关请求参数
    m.getAdParam = function (data) {
      //如果编号有效
      var param = {};
      param.pt = 'oad';  //前贴片形式
      param.plat = m.getPlatId();
      param.sver = '';             //?
      param.sysver = vars.OsVersion;
      param.c = 'tv';
      param.vc = m.getVc(data);
      param.pn = m.getPn();
      param.al = data.plid || data.sid || data.aid || '';
      param.du = data.totalDuration || data.duration || data.total_duration || 0;
      param.vid = data.vid || '';
      param.tvid = data.tvid || '';
      param.tuv = Cookie.get('MUV') || Cookie.get('SUV') || '';
      param.vu = '';  //vip用户名置空
      param.prot = 'vast';
      param.cat = '1';
      param.ar = data.areaId || data.area_id || 6;
      param.callback = 'getAdsCallback';
      param.json = 'std';

      if (p.adClose !== '0') {
        param.adClose = p.adClose;
      }
      param.appid = m.appid;
      param.pageUrl = window.location.href,
      param.type = ((data.site && data.site === 2) || (data.cid && data.cid === '9001')) ? 'my' : 'vrs';
      param.ag = '';
      param.st = '';
      param.partner = URL.getQueryString('src') || URL.getQueryString('SRC')  || Cookie.get('MTV_SRC') || '-2';
      param.partner = param.partner.substr(0, 4);

      return param;
    };

    //获取vrs分类
    m.getVc = function (data) {

      var cateCode = data.cateCode || data.cate_code || data.cid || '';
      
      if (cateCode && cateCode.indexOf(';') > -1) {
        cateCode = cateCode.replace(/.*?;/, '');
      }

      return cateCode;
    };

    //获取设备名称
    m.getPn = function () {
      var platId = m.getPlatId();

      if (platId === 'h6') {

        return 'androidphone';

      } else if (platId === 'h3') {

        return 'iphone';
      
      } else if (platId === 'h16') {

        return 'androidpad';

      } else if (platId === 'h1') {

        return 'ipad';

      } else {

        return 'unknowm';
      }
    };

    //获取暂停广告信息
    m.getPauseAdInfo = function (param, callback) {
      callback({imgUrl: 'http://t12.baidu.com/it/u=3602855978,1840777505&fm=56'});
    };

    //暂停广告信息数据加工
    m.pauseAdInfoProcess = function (cbData) {
      
      return cbData;
    };

    //发送内部统计信息
    m.sendInnerPingback = function (type, param) {

      if (typeof type !== 'undefined') {

        var tracParam = {
          video_catecode:  (m.videoData.cateCode && m.videoData.cateCode.split(';')[0]) || '',    //正片分类编码
          video_plid: m.videoData.sid || m.videoData.plid || '',       //正片专辑id
          video_dur: m.cache.duration,                                 //正片总时长
          partner : URL.getQueryString('src') || URL.getQueryString('SRC')  || Cookie.get('MTV_SRC') || '-2' //src渠道号
        };

        tracParam.partner = tracParam.partner.substr(0, 4);

        if (type === 'video_ad_response') {
          tracParam.ad_status = 1;        //默认请求失败
          tracParam.ad_total_num = 0;     //默认广告总帖数(包含空广告)
          tracParam.ad_empty_num = 0;     //默认空广告总帖数
          tracParam.ad_eff_num = 0;       //默认有效广告总帖数
          tracParam.ad_total_dur = 0;     //默认广告总时间

        } else if (type === 'video_ad_play') {
          tracParam.ad_is_empty = 0;                            //默认空广告
          tracParam.ad_total_num = m.mediaAd.realTotalCounts;   //默认广告总帖数(包含空广告)
          tracParam.ad_eff_num = m.mediaAd.effCounts;           //默认有效广告总帖数
        
        } else if (type === 'video_ad_close') {
          tracParam.ad_total_num = m.mediaAd.realTotalCounts;   //默认广告总帖数(包含空广告)
          tracParam.ad_eff_num = m.mediaAd.effCounts;           //默认有效广告总帖数
        }

        //覆盖默认属性
        for (var i in param) {
          tracParam[i] = param[i];
        }

        Console.log('发送内部行为统计数据 (' + type + '):', tracParam);
        ClickTrace.pingback(null, type, tracParam);
      }
    };

    //获取安卓视频广告信息
    m.getAndroidAdInfo = function (param, callback) {
      var url;
      //如果是debug模式，采用测试地址
      if (p.debug) {
        url = p.urls.adrMediaDebug + '?' + m.toString(param);
        Console.log('android广告请求:' + url);

      } else {
        url =  p.urls.adrMedia + '?' + m.toString(param);
      }
      //超时处理
      setTimeout(function () {

        if (!p.isGetFlag) {
          Console.log('android广告请求超时，直接播放视频');
          //发送内部行为统计数据
          m.sendInnerPingback('video_ad_response');
          //修改超时标志位
          p.timeoutFlag = true;
          //置空
          player.adv.mediaAd = m.androidAdInfoProcess();

          c.process.ended();
        }
      }, p.timeout);
      svp.debug.playerLoadAdDataStartTime = Date.now();
      //vast是sohutvad.js的对象
      vast.getData(url, function (cbData) {
        // cbData.length = 1;
        cbData = m.androidAdInfoProcess(cbData);
        callback(cbData);
      });
    };

    //安卓视频广告信息加工
    m.androidAdInfoProcess = function (cbData) {
      var rst = {
        //几贴广告的总时长
        totalDuration: 0,
        //广告链接
        urls: {
          mp4: {
            nor: []
          },
          downloadUrl: []
        },
        //各个分片广告总时长列表
        durations: {
          nor: []
        },
        //广告对象列表(多个连续的空广告算一条广告内容)
        adDataList: [],
        //广告vid列表
        adVidList: [],
        //真正的广告总数(每一条空广告都算一条独立的内容)
        realTotalCounts: 0,
        //空广告总数
        emptyCounts: 0,
        //有效广告总帖数
        effCounts: 0
      };

      if (!$.isUndefined(cbData) && cbData instanceof Array) {
        //当前广告在广告列表中的位置(每一条广告算一条独立内容)
        var posIndex = 1,
        //当前广告在有效广告列表中的位置(不包含空广告)
            effPosIndex = 1;
        
        $.each(cbData, function (index, item) {

          if (!$.isUndefined(item.videoUrl)) {
            var data = {};
            data.duration = item.duration;
            data.clickUrl = item.clickUrl;
            data.vid = item.vid || '';
            data.cateCode = m.videoData.cateCode;
            data.advEFId = 'adv_id_' + index;
            data.counts = parseInt(item.cnt, 10) || 1;
            //正常广告
            if (item.videoUrl !== 'error') {
              data.src = m.getQueryAdVideoURL(data, item.videoUrl);
              //有效广告索引
              data.effAdPosition = effPosIndex;
              effPosIndex++;
            //空广告
            } else {
              data.src = item.videoUrl;
              data.effAdPosition = -1;
              //累计空广告个数
              rst.emptyCounts += data.counts;
            }

            if (!$.isUndefined(item.vid) && item.vid !== '') {
              rst.adVidList.push(item.vid);
            }

            var pArr = [];
            
            for (var i = 0; i < data.counts; i++) {
              pArr.push(posIndex + i);
            }
            //更新下一条广告的位置
            posIndex += data.counts;
            data.adPosition = pArr.join(',');

            rst.adDataList.push(data);
            rst.urls.mp4.nor.push(data.src);
            rst.durations.nor.push(data.duration);
            rst.realTotalCounts += data.counts;
            //累加总时长
            if (typeof data.duration === 'number') {
              rst.totalDuration += data.duration;
            }
          }
        });
        //有效广告数
        rst.effCounts = rst.realTotalCounts - rst.emptyCounts;
      }

      return rst;
    };

    //将对象转换成字符串
    m.toString = function (param) {
      var rst = [];

      for (var i in param) {
        rst.push(i + '=' + encodeURIComponent(param[i]));
      }

      return rst.join('&');
    };

    //获取有效播放信息
    m.getEffectiveMediaData = function (cbData) {
      var data = $.extend(true, {}, cbData), i;

      //清除adVidList中的error
      for (i = data.adVidList.length - 1; i >= 0; i--) {

        if (data.adVidList[i] === 'error') {
          data.adVidList.splice(i, 1);
        }
      }

      for (i = data.adDataList.length - 1; i >= 0; i--) {
        var item = data.adDataList[i];

        if (item.duration === 'error' && item.src === 'error') {
          data.adDataList.splice(i, 1);
        }
      }

      for (i = data.urls.mp4.nor.length - 1; i >= 0; i--) {

        if (data.urls.mp4.nor[i].indexOf('error') > -1) {
          data.urls.mp4.nor.splice(i, 1);
        }
      }

      for (i = data.durations.nor.length - 1; i >= 0; i--) {

        if ((data.durations.nor[i] + '').indexOf('error') > -1) {
          data.durations.nor.splice(i, 1);
        }
      }

      return data;
    };

    //暂停广告模板
    v.pauseAd = function (data) {
      var arr = [];

      arr.push('<div class="ad_pause ' + p.pauseAdConClass + '" style="display: none;">');
      arr.push('<img src="' + data.imgUrl + '">');
      arr.push('<em class="' + p.pauseAdCloseBtnClass + '"></em>');
      arr.push('</div>');

      return arr.join('');
    };

    //视频广告倒计时模板
    v.mediaTimer = function () {
      var arr = [];

      arr.push('<span class="ad_time ' + p.mediaTimerConClass + '" style="display: none;">');
      // arr.push('<span class="ad_time_desc">广告倒计时:</span>');
      arr.push('<span class="ad_time_timer ' + p.mediaTimerClass + '"></span>');
      // arr.push('<span class="ad_time_desc">秒</span>');
      arr.push('<span class="ad_remove" position="appdownload_adRemove">免费去广告</span>');
      arr.push('</span>');

      return arr.join('');
    };

    //广告详情点击按钮
    v.mediaAdvDetail = function () {
      var arr = [];

      arr.push('<div class="gg_area ' + p.adDetailBtnClass + '">');
      arr.push('<div class="ad_detail">');
      arr.push('详情');
      arr.push('</div></div>');

      return arr.join('');
    };

    //初始化
    c.init = function (player, config) {
      //参数初始化
      if (p.init(player, config)) {
        //模型参数初始化
        m.init(player, config);
      }
    };

    //展示暂停广告
    c.getPauseAdView = function (callback) {
      
      if (p.isPauseAd) {
        var param = {};

        m.getPauseAdInfo(param, function (cbData) {
          callback(v.pauseAd(cbData));
        });
      
      } else {
        callback('');
      }
    };

    //展示视频广告UI信息
    c.getMediaAdView = function (callback) {
      
      if (vars.IsAndroid) {
        var view = '';
        //倒计时
        view += v.mediaTimer();
        //如果ps为1的时候不显示详情按钮
        if (p.ps !== '1') {
          //广告详情
          view += v.mediaAdvDetail();
        }
        callback(view);
      
      } else {
        callback('');
      }
    };

    //展示暂停广告
    c.showParamAd = function () {

      if (p.isPauseAd) {
        $('.' + p.pauseAdConClass).show();
      }
    };

    //展示暂停广告
    c.hideParamAd = function () {

      if (p.isPauseAd) {
        $('.' + p.pauseAdConClass).hide();
      }
    };

    //获取安卓视频数据
    c.getAndroidAdInfo = function (callback) {
      //获取广告请求参数
      var param = m.getAdParam(m.videoData);
      //发送内部行为统计数据
      m.sendInnerPingback('video_ad_request');
      //获取数据
      m.getAndroidAdInfo(param, function (cbData) {
        Console.log('广告数据:', cbData)
        //如果没有超时，回调有效
        if (!p.timeoutFlag) {
          //发送内部行为统计数据
          var tracParam = {
            ad_status: 0,                                                //请求成功
            ad_total_num: cbData.realTotalCounts,                        //广告总帖数(包含空广告)
            ad_empty_num: cbData.emptyCounts,                            //空广告总帖数
            ad_eff_num: cbData.effCounts,                                //有效广告总帖数
            ad_total_dur: cbData.totalDuration                          //广告总时间
          };
          m.sendInnerPingback('video_ad_response', tracParam);
          //修改获取广告信息标志位
          p.isGetFlag = true;

          if (cbData.totalDuration !== 0) {
            p.isValidFlag = true;
          }
          //将处理过后的数据返回
          callback(cbData);
        }
      });
      
    };

    //显示广告倒计时
    c.showMediaTimer = function () {
      $('.' + p.mediaTimerConClass).css('display', 'block');
    };

    //隐藏广告相关UI
    c.hideMediaView = function () {
      $('.' + p.mediaTimerConClass).hide();
      $('.' + p.adDetailBtnClass).hide();
      $('.ad_remove').hide();
    };

    //更新广告倒计时数字
    c.updateMediaTimer = function (second) {
      $('.' + p.mediaTimerClass).html(second);
    };

    //添加广告相关UI
    c.addAdView = function (player) {

      if ($('.' + p.mediaTimerConClass).length === 0) {
        //如果有暂停广告,异步添加暂停广告模板
        if (p.isPauseAd) {
          
          c.getPauseAdView(function (view) {
            player.$main.append(view);
          });
        }

        //添加广告倒计时和广告详情按钮
        if (p.mediaAdPlatform.indexOf('android') > -1) {

          c.getMediaAdView(function (view) {
            player.$main.append(view);
          });
        }
        
      } else {
        $('.ad_remove').show();
        $('.' + p.adDetailBtnClass).show();
      }
    };

    //添加安卓广告
    c.addAdvertise = function (callback) {
      var player = p.player;
      //缓存回调
      p.addAdCallback = callback;
      //获取android广告视频
      c.getAndroidAdInfo(function (cbData) {
        //缓存广告信息
        player.adv.mediaAd = cbData;
        m.mediaAd = cbData;

        if (p.adClose === '0') {

          if (cbData.adDataList.length > 0) {
            Console.log('android广告获取成功', cbData);
          }

          //这里重新把_firstLoadFlag标志位设置为true是为了第一次播放广告时不显示loading图
          player._firstLoadFlag = true;

          //初始化广告总时长
          player.duration = cbData.totalDuration;
          //事件初始化
          if (p.isFirstLoad) {
            c.eventInit();
            p.isFirstLoad = false;
          }

          if (cbData.adDataList.length === 0) {
            Console.log('没有获取到android广告贴片内容');
            c.process.ended();

            return;
          }

          //获取可播放的广告列表,返回的信息里包含空广告，这里只取可播放的广告
          m.effMediaData = m.getEffectiveMediaData(m.mediaAd);
          
          if (m.effMediaData.adDataList.length > 0) {
            //声明是广告内容
            var adconfig = player.config;
            adconfig.isMediaAdContent = true;
            adconfig.modeType = 'nor';
            m.effMediaData.srcType = 'mp4';
            player.cache = new LoadCacheData(adconfig, m.effMediaData);
            //初始化video标签节点
            player.setSrc(player.cache.curPlayUrl);
            //显示广告相关UI
            c.addAdView(player);
            c.updateMediaTimer(player.cache.duration);
            c.showMediaTimer();
            
            //播放广告
            player.play();

          //如果全是空广告
          } else {
            m.curAdIndex = m.mediaAd.adDataList.length - 1;

            $.each(m.mediaAd.adDataList, function (index, item) {
              Console.log('发送android空广告上报 cIndex:' + index);
              vast.trackempty(index);
              //发送内部行为统计数据
              var tracParam = {
                ad_inc_num: item.counts,                                     //包含子广告帖数
                ad_pos: item.adPosition,                                     //当前广告在广告列表(包含空广告)中的位置 (从1开始)
                ad_eff_pos: item.effAdPosition,                              //当前广告在有效广告列表(不含空广告)中的位置 (从1开始)
                ad_dur: item.duration,                                       //当前单贴广告的时长
                ad_vid: item.vid                                             //当前单贴广告的vid
              };
              m.sendInnerPingback('video_ad_play', tracParam);
            });
            c.process.ended();
          }
            
        //如果为总时长为0，说明没有获取到广告信息
        } else {
          Console.log('android广告已经获取成功，但是广告被屏蔽');
          //发送内部行为统计数据
          m.sendInnerPingback('video_ad_close');
          c.process.ended();
        }
      });
    };

    //空广告检查上报,并获取当前内容播放索引位置
    c.emptyAdCheckAndReport = function (player) {
      var curPlayUrl = player.cache.curPlayUrl;
      //检查当前播放内容是否广告内容
      $.each(m.mediaAd.adDataList, function (index, item) {
        //必须是空广告
        if (index <= m.curAdIndex && item.duration === 'error' && item.src === 'error' && !item.reportFlag) {
          Console.log('发送android空广告上报 cIndex:' + index);
          m.mptIndex.push(index);
          vast.trackempty(index);
          //发送内部行为统计数据
          var tracParam = {
            ad_inc_num: item.counts,                                     //包含子广告帖数
            ad_pos: item.adPosition,                                     //当前广告在广告列表(包含空广告)中的位置 (从1开始)
            ad_eff_pos: item.effAdPosition,                              //当前广告在有效广告列表(不含空广告)中的位置 (从1开始)
            ad_dur: item.duration,                                       //当前单贴广告的时长
            ad_vid: item.vid                                             //当前单贴广告的vid
          };
          m.sendInnerPingback('video_ad_play', tracParam);
          //添加发送标志位
          item.reportFlag = true;
        }
        //如果已经找到
        if (curPlayUrl === item.src && index > m.oldAdIndex) {
          m.curAdIndex = index;

          return false;
        }
      });
    };

    c.getCurAdIndex = function () {
      var rst = 0;
      var curPlayUrl = player.getSrc() || '';
      
      //检查当前播放内容是否广告内容
      $.each(m.mediaAd.adDataList, function (index, item) {
        //如果已经找到
        if (item.src !== 'error' && curPlayUrl.indexOf(item.src.split('?')[1]) > -1) {
          rst = index;

          return false;
        }
      });

      return rst;
    };

    //更新广告
    c.updateAdv = function () {
      //相关参数重置
      p.reset();
      m.reset();
      p.player.adv.isMediaPlayed = false;
      m.cache = $.extend(true, {}, p.player.cache);
      m.videoData = p.player.videoData;
      c.addAdvertise(p.addAdCallback);
    };

    //事件初始化
    c.eventInit = function () {
      var cp = c.process,
          player = p.player;

      //播放广告事件
      player.$midPlay.on(vars.END_EVENT, function () {
        cp.play(this);
      });
      //绑定去广告点击事件
      player.$main.on(vars.END_EVENT, '.ad_remove', function () {
        cp.adRemove(this);
        
        return false;
      });
      //绑定广告详情点击事件
      player.$main.on(vars.END_EVENT, '.' + p.adDetailBtnClass, function () {
        cp.adDetail();
      });
      //广告时间更新事件,这里用timeupdate来模拟广告全部播放完成时的ended事件(百度浏览器除外)
      player._addEvent('timeupdate', cp.timeupdate);
      //暂停广告事件
      player._addEvent('pause', cp.pause);
      //广告播放结束事件
      player.on('advended', function () {
        cp.ended('force');

        if (vars.IsAndroid && vars.IsBaiduBoxApp && !player._sendRealVVFlag) {
          Console.log('统计: reallvv');
          VideoTrace.realVV(player._startPlayTime);
          player._sendRealVVFlag = true;
        }
      });

      if (p.isPauseAd) {
        //播放隐藏暂停广告
        player._addEvent('playing', cp.playing);
      }
    };

    c.process = {};
    //去广告点击
    c.process.adRemove = function (dom) {
      ClickTrace.pingback($(dom));
      //暂停视频
      p.player.pause();
      
      //如果禁止自动拉起app, 则尝试拉起app
      appDownload.getChannelInfo(null, function (cbData) {

        if (cbData.startapp === '1') {
          //获取拉起客户端全屏播放参数
          var param = Action.parserAttributes();
          param.action = '1.1';
          param.type = 'click';
          //尝试拉起客户端
          Action.sendAction(param);
        }
      });
      //显示下载提示
      sysMessage.downloadPopTips({title: '零广告看视频，请先安装搜狐视频APP'});
    };

    //广告详情点击
    c.process.adDetail = function () {

      if (m.mediaAd.adDataList) {
        var curNum = m.curAdIndex;
        var address = p.urls.advIframe + '?url=' + encodeURIComponent(m.mediaAd.adDataList[curNum].clickUrl);
        Console.log('android click广告上报: clickIndex: ' + curNum);
        vast.trackClick(curNum);
        ClickTrace.pingback(null, 'ad_detail_click');
        p.player.pause();
        
        setTimeout(function () {
          window.open(address);
        }, 50);
      }
    };
    //广告时间更新事件
    c.process.timeupdate = function () {
      var player = p.player;
      //如果在播放广告过程中,切换视频则终止广告业务
      if (!player.cache.isMediaAdContent) {
        //隐藏广告倒计时和广告详情按钮
        c.hideMediaView();

        return;
      }
      
      if (p.debug && p.debugCurUrl !== player.cache.curPlayUrl) {
        Console.log('当前播放视频地址:' + JSON.stringify(player.cache.curPlayUrl));
        p.debugCurUrl = player.cache.curPlayUrl;
      }

      if (!player.adv.isMediaPlayed) {
        //获取广告对象
        var ad = player.adv;

        //当前视频广告播放时间
        var curVideoCurTime = player.videoTag.currentTime;

        if (curVideoCurTime === 0) {

          return;
        }

        //获取当前播放时间
        var curTime = player.currentTime;
        
        /* 如果两次timeupdate之间的时间间隔大于2秒，认为用户拖动了视频，
          用来在某些使用系统播放器全屏播放的时候判断用户是否拖动视频进度 */
        if (curTime > 0 && Math.abs(curTime - player._lastCurTime) > 2) {
          player._startPlayTime = $.now();
        }
        //如果广告还没有播放完
        if (!ad.isMediaPlayed && !vars.IsBaiduBrowser && !vars.IsBaiduBoxApp) {
          //返回到广告播放点继续播放
          if (curTime - player._lastCurTime > 5) {
            player.seekTo(player._lastCurTime);

            return;
          
          } else {
            //更新播放时长
            player._lastCurTime = curTime;
          }
        
        } else {
          //更新播放时长
          player._lastCurTime = curTime;
        }

        if (m.curAdIndex === -1) {
          m.curAdIndex = c.getCurAdIndex();
        }

        player.hidePoster();

        player.$mid.oriHide();
        //隐藏主控界面
        player._hideMainCtrl();

        //空广告检查上报
        c.emptyAdCheckAndReport(player);

        //如果当前播放索引和缓存索引不一致，说明之前的已经播放完成，发送单条广告完成上报信息
        if (m.oldAdIndex !== m.curAdIndex) {

          if ($(m.mptIndex).indexOf(m.oldAdIndex) === -1) {
            Console.log('android end广告上报: endIndex: ' + m.oldAdIndex);
            vast.trackAdComplete(m.oldAdIndex);
          }
          //更新索引值
          m.oldAdIndex = m.curAdIndex;

          return;
        }
        //发送安卓广告上报信息
        // Console.log('android广告上报: curTime: ' + curVideoCurTime + ' ,curIndex: ' + m.curAdIndex);
        vast.trackAd(curVideoCurTime, m.curAdIndex);

        if (m.sendRepAdIndex !== m.curAdIndex) {
          var curAdObj = m.mediaAd.adDataList[m.curAdIndex];
          //发送内部行为统计数据
          var tracParam = {
            ad_is_empty: 1,                                              //有效广告
            ad_inc_num: curAdObj.counts,                                 //包含子广告帖数
            ad_pos: curAdObj.adPosition,                                 //当前广告在广告列表(包含空广告)中的位置 (从1开始)
            ad_eff_pos: curAdObj.effAdPosition,                          //当前广告在有效广告列表(不含空广告)中的位置 (从1开始)
            ad_dur: curAdObj.duration,                                   //当前单贴广告的时长
            ad_vid: curAdObj.vid                                         //当前单贴广告的vid
          };
          m.sendInnerPingback('video_ad_play', tracParam);
          m.sendRepAdIndex = m.curAdIndex;
        }
        c.updateMediaTimer(player.cache.duration - parseInt(player.currentTime, 10));
      }
      //三星note3用timeupdate事件触发广告结束事件
      // if (vars.IsSAMSUNGNote3 && player.duration - player.currentTime < 0.4) {
      //   c.process.ended();
      // }
    };

    //播放完成
    c.process.ended = function (type) {
      var player = p.player;

      if ((typeof type !== 'undefined' && type === 'force') || (!$.isUndefined(player.adv) && !player.adv.isMediaPlayed &&
          player.duration - player.currentTime < 1) || p.adClose !== '0') {
        //为合作方添加属性
        player.$video.attr('data-adover', 'true');
        //最后一条有效广告上报
        if (p.adClose === '0' && p.isGetFlag && p.isValidFlag) {
          Console.log('android end广告上报: endIndex: ' + m.curAdIndex);
          m.curAdIndex = (m.curAdIndex === -1 ? 0 : m.curAdIndex);
          vast.trackAdComplete(m.curAdIndex);
        }
        player.$maskLayer.oriHide();
        //隐藏广告倒计时和广告详情按钮
        c.hideMediaView();
        // player.pause();
        player.cache = m.cache;
        //暂停播放
        player.setSrc(player.cache.curPlayUrl);
        //修改播放结束标志位
        player.adv.isMediaPlayed = true;
        player.cache.isMediaAdContent = false;
        player.currentTime = 0;
        var adDataList = player.adv.mediaAd.adDataList;
        //在播放时视频报错，这是调ended方法，直接发送统计可能会引发错误，这里用trycatch处理
        try {
          
          if (m.curAdIndex < adDataList.length - 1) {
            //如果后面还有空广告，则上报
            for (var i = (m.curAdIndex + 1); i < adDataList.length; i++) {
              var info = '发送android' + ((p.adClose !== '0') ? '' : '空') + '广告上报 cIndex:';
              Console.log(info + i);
              vast.trackempty(i);
              //发送内部行为统计数据
              var tracParam = {
                ad_inc_num: adDataList[i].counts,                            //包含子广告帖数
                ad_pos: adDataList[i].adPosition,                            //当前广告在广告列表(包含空广告)中的位置 (从1开始)
                ad_eff_pos: adDataList[i].effAdPosition,                     //当前广告在有效广告列表(不含空广告)中的位置 (从1开始)
                ad_dur: adDataList[i].duration,                              //当前单贴广告的时长
                ad_vid: adDataList[i].vid                                    //当前单贴广告的vid
              };
              m.sendInnerPingback('video_ad_play', tracParam);
            }
          }
        } catch (e) {}

        //如果type为undefined，说明为空广告或广告请求异常
        if (!(vars.IsIphone && vars.IsWeixinBrowser) && typeof type !== 'undefined') {
          //显示主控界面
          player._showMainCtrl();
        }

        //直接播放
        if (vars.IsQQBrowser || vars.IsBaiduBrowser) {

          setTimeout(function () {
            player.play();
          }, 50);

        } else {
          player.play();
        }

        //执行回调
        if ($.isFunction(p.addAdCallback)) {
          p.addAdCallback();
        }
      }
    };

    //暂停
    c.process.pause = function () {

      if (!$.isUndefined(player.adv) && !player.adv.isMediaPlayed) {
        //广告时候被暂停，显示播放按钮
        player._showMidPlayBtn();
        //如果有广告，则显示广告
        if (p.isPauseAd) {
          c.showParamAd();
        }
      }
    };

    //播放按钮
    c.process.play = function (player) {

      if (player.adv && !player.adv.isMediaPlayed) {
        player.$mid.oriHide();
        player.play();
      }
    };

    //播放隐藏暂停广告
    c.process.playing = function () {
      c.hideParamAd();
    };
    //初始化
    c.init(player, config);

    /**
     * @memberof AndoridAdvertise.prototype
     * @summary 视频广告是否播放完成
     * @type {boolean}
     */
    this.isMediaPlayed = false;

    /**
     * @memberof AndoridAdvertise.prototype
     * @summary 添加广告
     * @type {function}
     * @param {function} fn                               - 可选参数, 添加完广告后的回调方法
     */
    this.addAdvertise = c.addAdvertise;

    /**
     * @memberof AndoridAdvertise.prototype
     * @summary 更新广告
     * @type {function}
     */
    this.updateAdv = c.updateAdv;

    /**
     * @memberof AndoridAdvertise.prototype
     * @summary 结束广告,播放正片
     * @type {function}
     */
    this.gotoEnd = c.process.ended;

    /**
     * @memberof AndoridAdvertise.prototype
     * @summary 隐藏广告相关UI
     * @type {function}
     */
    this.hideMediaView = c.hideMediaView;
  };

  module.exports = AndoridAdvertise;
});
/**
 *
 *   @description: 该文件用于ios广告业务
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-02-01
 *
 *   @update-date: 2015-05-07
 *
 *   @update-log :
 *                 1.0.1 - ios广告业务
 *                 1.0.2 - 修复当视频为ugc时，cateCode字段的读取bug
 *                         修正广告重复添加ui的bug
 *
 **/

svp.define('adv.ios', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var vars = require('base.vars');
  var URL = require('base.url');
  var Cookie = require('base.cookie');
  var Console = require('base.console');

  /**
   * @class IosAdvertise
   * @classdesc ios广告对象
   * @property {boolean}   isMediaPlayed                   - 视频广告是否播放完成
   * @property {function}  addAdvertise                    - 添加广告
   * @property {function}  updateAdv                       - 更新广告
   * @property {function}  gotoEnd                         - 结束广告,播放正片
   *
   * @example
   *   var IosAdvertise = require('adv.ios');
   *   var adv = new IosAdvertise(player, config);
   *   adv.isMediaPlayed();
   *   adv.updateAdv();
   */

  var IosAdvertise = function (player, config) {
    var adv = {
      param: {
        //player对象
        player: null,
        //是否需要屏蔽广告
        adClose: '0', //0: 能播, 1: 不能,敏感词屏蔽, 2: 不能,合作方不让播
        //是否是debug模式
        debug: false,
        //当前播放视频地址debug用
        debugCurUrl: '',
        //超时时间处理
        timeout: 2000,
        //超时标志位
        timeoutFlag: false,
        //获取广告信息标志位
        getAdInfoFlag: false,
        //视频广告后的回调
        addAdCallback: null,
        //拖拽广告标志位,这个标志位是为了处理，广告期间多次拖拽进度条，导致ios进度条不再与播放时长进度同步的bug
        dragCheckFlag: true,
        //链接
        urls: {
          //苹果视频广告信息获取url
          iosMedia: 'http://m.aty.sohu.com/h',
          //调试模式
          iosMediaDebug: 'http://60.28.168.195/h'
        }
      },
      model: {
        //原始视频信息
        cache: null,
        //广告总时长
        totDuration: 0,
        //应用id
        appid: '',
        //当前播放广告索引值
        curIndex: 0,
        //广告时长列表
        adDurList: [],
        //广告列表缓存(包含空广告)
        mediaAd: {},
        //视频数据
        videoData: null
      },
      view: {},
      ctrl: {}
    };

    var p = adv.param,
        m = adv.model,
        v = adv.view,
        c = adv.ctrl;

    //参数初始化
    p.init = function (player, config) {

      if ($.isUndefined(player)) {

        return false;
      }
      p.player = player;

      //初始化参数
      p = $.merge(p, config);

      //在url和config中查找，是否有设置adClose参数
      if (URL.getQueryString('adClose') !== null) {
        p.adClose = URL.getQueryString('adClose');
      }

      if (config.adClose !== '0') {
        p.adClose = config.adClose;
      }

      p.debug = vars.ENABLE_DEBUG;

      return true;
    };

    //重置参数
    p.reset = function () {
      //超时标志位
      p.timeoutFlag = false;
      //获取广告信息标志位
      p.getAdInfoFlag = false;
    };

    //模型初始化
    m.init = function (player, config) {
      m.cache = $.extend(true, {}, player.cache);
      m.videoData = player.videoData;
      m.appid = config.appid;
    };

    //重置模型参数
    m.reset = function () {
      //原始信息
      m.cache = null;
      //原始视频信息
      m.videoData = null;
      //广告总时长
      m.totDuration = 0;
      //当前播放广告索引值
      m.curIndex = 0;
      //广告时长列表
      m.adDurList = [];
      //广告列表缓存(包含空广告)
      m.mediaAd = {};
    };

    //获取广告相关请求参数
    m.getAdParam = function (data) {
      var param = {};
      //如果编号有效
      param.pt = 'oad';  //前贴片形式
      param.plat = m.getPlatId();
      param.sysver = vars.OsVersion;
      param.c = 'tv';
      param.cat = '1';
      param.vc = m.getVc(data);
      param.pn = m.getPn();
      param.al = data.plid || data.sid || data.aid || '';
      param.ag = '';  //年龄置空
      param.st = '';  //明星置空
      param.ar = data.areaId || data.area_id || 6;
      param.vu = '';  //vip用户名置空
      param.tuv = Cookie.get('MUV') || Cookie.get('SUV') || '';
      param.appid = m.appid;
      param.type = ((data.site && data.site === 2) || (data.cid && data.cid === '9001')) ? 'my' : 'vrs';

      if (p.adClose !== '0') {
        param.adClose = p.adClose;
      }
      param.vid = data.vid || '';
      param.tvid = data.tvid || data.tv_id || '';
      param.pageUrl = window.location.href;
      param.du = data.totalDuration || data.duration || data.total_duration || 0;
      param.partner = URL.getQueryString('src') || URL.getQueryString('SRC')  || Cookie.get('MTV_SRC') || '-2';
      param.partner = param.partner.substr(0, 4);

      return param;
    };

    //获取平台id
    m.getPlatId = function () {
      //如果是android phone
      if (vars.IsAndroidPad) {

        return 'h0';
      
      } else if (vars.IsIphone) {

        return 'h3';
      
      } else if (vars.IsIpad) {

        return 'h1';
      
      } else if (vars.IsAndroid) {

        return 'h6';
      }

      return 'unknowm';
    };

    //获取vrs分类
    m.getVc = function (data) {

      var cateCode = data.cateCode || data.cate_code || data.cid || '';

      if (cateCode && cateCode.indexOf(';') > -1) {
        cateCode = cateCode.replace(/.*?;/, '');
      }

      return cateCode;
    };

    //获取设备名称
    m.getPn = function () {
      var platId = m.getPlatId();

      if (platId === 'h6') {

        return 'androidphone';

      } else if (platId === 'h3') {

        return 'iphone';
      
      } else if (platId === 'h16') {

        return 'androidpad';

      } else if (platId === 'h1') {

        return 'ipad';

      } else {

        return 'unknowm';
      }
    };
    
    m.repOrAddParams = function (repUrl) {
       
      try {
        
        if (repUrl !== '' && repUrl.indexOf('mmg.aty.sohu.com') >= 1) {
          var partnerArr = repUrl.match(/partner=([a-zA-Z0-9\-_\|]*)/i);
          var nwpartner = URL.getQueryString('src') || URL.getQueryString('SRC')  || Cookie.get('MTV_SRC') || '-2';//src渠道号
          nwpartner = nwpartner.substr(0, 4);
          
          if (partnerArr === null || (partnerArr.length >= 2 && partnerArr[1] === '')) {
            repUrl = repUrl + '&partner=' + nwpartner;
          }
        }
       
      } catch (e) {
        Console.log(e);
      }

      var urldomainArr = repUrl.match(/urldomain=([a-zA-Z0-9\-_\|]*)/i);
      //添加urldomain字段
      if (urldomainArr === null || (urldomainArr.length >= 2 && urldomainArr[1] === '')) {
        repUrl = repUrl + '&urldomain=' + window.location.host;
      }

      return repUrl;
    };

    //发送上报统计信息
    m.sendPingback = function (url) {

      if (url !== '') {
        var repUrls = url.split('|');

        $.each(repUrls, function (index, repUrl) {
          var script = document.createElement('script');
          
          repUrl = m.repOrAddParams(repUrl);
          
          Console.log("上报统计URL", repUrl);
          script.src = repUrl;
          $('body').append(script);
        });
      }
    };

    //将对象转换成字符串
    m.toString = function (param) {
      var rst = [];

      for (var i in param) {
        rst.push(i + '=' + encodeURIComponent(param[i]));
      }

      return rst.join('&');
    };

    //获取ios广告信息
    m.getIosAdInfo = function (param, fn) {
      var url;
      //如果是debug模式，采用测试地址
      if (p.debug) {
        url = p.urls.iosMediaDebug;
        Console.log('ios广告请求:' + url + '?' + m.toString(param));
      
      } else {
        url =  p.urls.iosMedia;
      }

      $.ajax({
        url: url,
        data: param,
        dataType: 'jsonp',
        success: fn
      });
    };

    //初始化广告时长列表
    m.initAdDurList = function (mediaAdData) {
      var rst = [];

      //遍历广告列表
      $.each(mediaAdData.adDataList, function (index, item) {
        rst.push(item.duration);
      });

      return rst;
    };

    //ios视频广告信息加工
    m.isoAdInfoProcess = function (cbData) {
      var rst = {
        //广告vid列表
        adVidList: [],
        //广告对象列表(多个连续的空广告算一条广告内容)
        adDataList: [],
        //几贴广告的总时长
        totDuration: 0,
        //真正的广告总数(每一条空广告都算一条独立的内容)
        realTotalCounts: 0,
        //空广告总数
        emptyCounts: 0,
        //有效广告总帖数
        effCounts: 0
      };

      if (!$.isUndefined(cbData) && cbData.status === 1) {
        var dataList = cbData.data.oad;

        if (dataList instanceof Array) {
          //当前广告在广告列表中的位置(每一条广告算一条独立内容)
          var posIndex = 1,
          //当前广告在有效广告列表中的位置(不包含空广告)
            effPosIndex = 1;
          //遍历所有广告内容
          $.each(dataList, function (index, item) {
            var data = {};
            //有效广告
            if (!$.isUndefined(item.vid) && item.vid !== '') {
              //获取其vid
              rst.adVidList.push(item.vid);
              //有效广告索引
              data.effAdPosition = effPosIndex;
              effPosIndex++;
            //空广告
            } else {
              data.effAdPosition = -1;
            }
            //累加总时长
            if (typeof item.duration === 'number') {
              rst.totDuration += item.duration;
            }
            //缓存单条广告时长
            data.duration = item.duration || 0;
            //缓存单条广告点击链接
            data.clickUrl = item.clickurl ? item.clickurl : '';
            //缓存上报信息
            data.pingback = item.pingback || '';
            data.pingbacks = item.pingbacks || [];
            data.vid = item.vid || '';
            data.finishPingback = item.finishedstatistics || '';
            var pingbackParam = data.pingback ? URL.getQueryData(data.pingback) : '';
            var oadArr = pingbackParam.p ? pingbackParam.p.split(',') : [];
            data.counts = oadArr.length;
            //累加空广告总个数
            if (data.duration === 0) {
              rst.emptyCounts += data.counts;
            }
            rst.realTotalCounts += data.counts;
            var pArr = [];
            
            for (var i = 0; i < data.counts; i++) {
              pArr.push(posIndex + i);
            }
            //更新下一条广告的位置
            posIndex += data.counts;
            data.adPosition = pArr.join(',');
            //以map方式缓存
            rst.adDataList.push(data);
          });
          //有效广告数
          rst.effCounts = rst.realTotalCounts - rst.emptyCounts;
        }
      }

      return rst;
    };

    //发送内部统计信息
    m.sendInnerPingback = function (type, param) {

      if (typeof type !== 'undefined') {

        var tracParam = {
          video_catecode:  (m.videoData.cateCode && m.videoData.cateCode.split(';')[0]) || '',                      //正片分类编码
          video_plid: m.videoData.sid || m.videoData.plid || '',                //正片专辑id
          video_dur: m.cache.totalDuration,                                     //正片总时长
          partner : URL.getQueryString('src') || URL.getQueryString('SRC')  || Cookie.get('MTV_SRC') || '-2' //src渠道号
        };

        tracParam.partner = tracParam.partner.substr(0, 4);

        if (type === 'video_ad_response') {
          tracParam.ad_status = 1;        //默认请求失败
          tracParam.ad_total_num = 0;     //默认广告总帖数(包含空广告)
          tracParam.ad_empty_num = 0;     //默认空广告总帖数
          tracParam.ad_eff_num = 0;       //默认有效广告总帖数
          tracParam.ad_total_dur = 0;     //默认广告总时间

        } else if (type === 'video_ad_play') {
          tracParam.ad_is_empty = 0;                            //默认空广告
          tracParam.ad_total_num = m.mediaAd.realTotalCounts;   //默认广告总帖数(包含空广告)
          tracParam.ad_eff_num = m.mediaAd.effCounts;           //默认有效广告总帖数
        
        } else if (type === 'video_ad_close') {
          tracParam.ad_total_num = m.mediaAd.realTotalCounts;   //默认广告总帖数(包含空广告)
          tracParam.ad_eff_num = m.mediaAd.effCounts;           //默认有效广告总帖数
        }

        //覆盖默认属性
        for (var i in param) {
          tracParam[i] = param[i];
        }

        Console.log('发送内部行为统计数据 (' + type + '):', tracParam);
        // ClickTrace.pingback(null, type, tracParam);
      }
    };

    //初始化
    c.init = function (player, config) {
      //参数初始化
      if (p.init(player, config)) {
        //模型参数初始化
        m.init(player, config);
        //事件初始化
        c.eventInit();
      }
    };

    //添加ios广告
    c.addAdvertise = function (fn) {

      //重置广告播放完成标志位
      this.isMediaPlayed = false;
      //缓存回调函数
      p.addAdCallback = fn;
      var cache = p.player.cache;
      //超时处理
      setTimeout(function () {

        if (!p.getAdInfoFlag) {
          //修改超时标志位
          p.timeoutFlag = true;

          Console.log('ios广告请求超时，直接播放视频');
          //发送内部行为统计数据
          m.sendInnerPingback('video_ad_response');
          //更新当前播放地址(加入广告)
          cache.curPlayUrl = cache.srcList[cache.modeType][0].url;
          player.initVideoTag();

          //广告请求完成
          player.adv.isMediaPlayed = true;
          //继续后面逻辑
          if ($.isFunction(fn)) {
            fn();
          }
        }
      }, p.timeout);
      //发送内部行为统计数据
      m.sendInnerPingback('video_ad_request');
      svp.debug.playerLoadAdDataStartTime = Date.now();

      //获取ios广告视频
      c.getIosAdInfo(function (cbData) {
        Console.log('获取ios广告完成, 耗时--->' + (Date.now() - svp.debug.playerLoadAdDataStartTime) / 1000);
        //如果没有超时，回调生效
        if (!p.timeoutFlag) {
          m.mediaAd = cbData;
          //发送内部行为统计数据
          var tracParam = {
            ad_status: 0,                                                           //请求成功
            ad_total_num: cbData.realTotalCounts,                                   //广告总帖数(包含空广告)
            ad_empty_num: cbData.emptyCounts,                                       //空广告总帖数
            ad_eff_num: cbData.effCounts,                                           //有效广告总帖数
            ad_total_dur: cbData.totDuration                                        //广告总时间
          };
          m.sendInnerPingback('video_ad_response', tracParam);
          //缓存广告总时长
          m.totDuration = cbData.totDuration;
          var ad = p.player.adv;
          //缓存广告内容
          ad.mediaAd = cbData;
          //初始化广告时长列表
          m.adDurList = m.initAdDurList(ad.mediaAd);

          if (p.adClose === '0') {
            Console.log('ios广告获取成功', cbData);
            //修改cache播放列表地址，在地址中加入广告地址
            for (var i in cache.srcList) {
              //遍历所有模式
              $.each(cache.srcList[i], function (index, item) {

                if (cbData.adVidList.length > 0) {
                  item.url += (item.url.indexOf('?') > -1 ? '&' : '?') + 'ads=' + cbData.adVidList.join(',');
                }
              });
            }

          } else {
            player.adv.isMediaPlayed = true;

            Console.log('ios广告已经获取成功，但是广告被屏蔽', cbData);
            //发送内部行为统计数据
            m.sendInnerPingback('video_ad_close');
            ad = p.player.adv;
            //发送所有统计上报
            $.each(ad.mediaAd.adDataList, function (index, item) {
              m.sendPingback(item.pingback);

              var tracParam = {
                ad_inc_num: item.counts,                                                //包含子广告帖数
                ad_pos: item.adPosition,                                                //当前广告在广告列表(包含空广告)中的位置 (从1开始)
                ad_eff_pos: item.effAdPosition,                                         //当前广告在有效广告列表(不含空广告)中的位置 (从1开始)
                ad_dur: item.duration,                                                  //当前单贴广告的时长
                ad_vid: item.vid                                                        //当前单贴广告的vid
              };

              if (item.duration !== 0) {
                Console.log('ios广告上报 start:' + item.pingback);
                tracParam.ad_is_empty = 1;               //有效广告
                
              } else {
                Console.log('ios空广告上报 start:' + item.pingback);
              }
              //发送内部行为统计数据
              m.sendInnerPingback('video_ad_play', tracParam);
              //上报完成后删除地址
              item.pingback = '';

              if (item.pingbacks.length !== 0) {
                var firstPbs = item.pingbacks[0];
                
                if (firstPbs.v === 0) {
                  m.sendPingback(firstPbs.v);

                  if (item.duration !== 0) {
                    Console.log('ios广告上报 v:' + firstPbs.v + ', curIndex: 0');
                  
                  } else {
                    Console.log('ios空广告上报 v: ' + firstPbs.v + ', curIndex: 0');
                  }
                }
              }
            });
          }
          
          //更新当前播放地址(加入广告)
          cache.curPlayUrl = cache.srcList[cache.modeType][0].url;

          //测试
          // if ($('#sohu_player').length > 0) {
          //   var arr = [];
          //   arr.push('<div><span style="color:red">ios add playUrl: </span>' + cache.curPlayUrl + '</div>');
          //   arr.push('<div>========================</div>');

          //   $(arr.join('')).insertAfter($('#sohu_player'));
          // }

          player.setSrc(cache.curPlayUrl);

          //直接播放
          player._play();

          //继续后面逻辑
          if ($.isFunction(fn)) {
            fn();
          }
        }
      });
    };

    //更新广告
    c.updateAdv = function () {
      //相关参数重置
      p.reset();
      m.reset();
      p.player.adv.mediaAd = null;
      p.player.adv.isMediaPlayed = false;
      m.cache = $.extend(true, {}, p.player.cache);
      m.videoData = p.player.videoData;
      c.addAdvertise(p.addAdCallback);
    };

    //获取安卓视频数据
    c.getIosAdInfo = function (fn) {

      if (vars.IsIphone || vars.IsIpad) {
        //获取广告请求参数
        var param = m.getAdParam(m.videoData);
        //获取数据
        m.getIosAdInfo(param, function (cbData) {
          //修改获取广告信息标志位
          p.getAdInfoFlag = true;
          var rst = m.isoAdInfoProcess(cbData);
          //将处理过后的数据返回
          fn(rst);
        });
      
      } else {
        var rst = m.isoAdInfoProcess();
        //将处理过后的数据返回
        fn(rst);
      }
    };

    //事件初始化
    c.eventInit = function () {
      var cp = c.process;
      p.player._addEvent('timeupdate', cp.timeupdate);
    };

    c.process = {};

    c.process.timeupdate = function () {
      var player = this;
      //获取播放器当前播放时长
      var curTime = player.currentTime;

      if (p.debug && p.debugCurUrl !== player.cache.curPlayUrl) {
        Console.log('当前播放视频地址:' + JSON.stringify(player.cache.curPlayUrl));
        p.debugCurUrl = player.cache.curPlayUrl;
      }

      if (curTime === 0 || !p.dragCheckFlag) {

        return;
      }
      //获取广告对象
      var ad = player.adv;
      //广告对象列表
      var adList = ad.mediaAd.adDataList,
          vidList = ad.mediaAd.adVidList;

      if (!player.adv.isMediaPlayed && p.player.adv.mediaAd !== null) {
        //限制播放按钮
        player._showPlayBtn();
        //说明广告已经被屏蔽
        if (p.adClose !== '0') {
          player.adv.isMediaPlayed = true;

          //发送所有统计上报
          $.each(adList, function (index, item) {

            item.pingback += item.pingback.indexOf('?') > -1 ? '&' : '?';
            item.pingback += 'adClose=' + p.adClose;
            
            m.sendPingback(item.pingback);
            Console.log('ios广告上报 start:' + item.pingback);
            //发送内部行为统计数据
            var tracParam = {
              ad_is_empty: 1,                                                         //有效广告
              ad_inc_num: item.counts,                                                //包含子广告帖数
              ad_pos: item.adPosition,                                                //当前广告在广告列表(包含空广告)中的位置 (从1开始)
              ad_eff_pos: item.effAdPosition,                                         //当前广告在有效广告列表(不含空广告)中的位置 (从1开始)
              ad_dur: item.duration,                                                  //当前单贴广告的时长
              ad_vid: item.vid                                                        //当前单贴广告的vid
            };
            m.sendInnerPingback('video_ad_play', tracParam);

            //上报完成后删除地址
            item.pingback = '';
          });

        //广告正常播放
        } else {

          if (curTime > 0 && Math.abs(curTime - this._lastCurTime) > 2) {
            this._startPlayTime = $.now();
          }
          // $('body').append('<div>aaaaa ' + p.dragCheckFlag + ' ' + curTime - player._lastCurTime > 2  + ' ' +  curTime  + '</div>');
          //返回到广告播放点继续播放
          if (p.dragCheckFlag && curTime - player._lastCurTime > 2) {
            p.dragCheckFlag = false;
            player.seekTo(player._lastCurTime);

            setTimeout(function () {
              p.dragCheckFlag = true;
            }, 1000);

            return;
          }
          //之前已经播放完成分段广告的时长
          var preTotTime = 0,
              curTotTime = 0;
          //定位当前播放广告的位置和播过广告的总时长
          $.each(m.adDurList, function (index, item) {
            
            if (preTotTime === 0 && index === 0) {
              preTotTime = item;
              curTotTime = item;
            }

            curTime = parseInt(curTime, 10);

            if (curTime >= preTotTime && index !== 0) {
              preTotTime += item;
              curTotTime = item;

              if (preTotTime >= curTime) {
                m.curIndex = index;
              }

              if (index === m.adDurList.length - 1 && curTime >= preTotTime) {
                m.curIndex = index;
                //为合作方添加属性
                player.$video.attr('data-adover', 'true');

                return false;
              }
            }
          });

          //如果vidlist长度和广告list长度不相同，说明有空广告
          if (vidList.length !== adList.length) {

            $.each(adList, function (index, item) {
              // Console.log((index <= m.curIndex) + '  ' + (item.duration === 0)+ '  ' +( item.pingback !== ''));
              //空广告上报
              if (index <= m.curIndex) {

                if (item.duration === 0 && item.pingback !== '') {
                  m.sendPingback(item.pingback);
                  Console.log('ios空广告上报 start:' + item.pingback);
                  //发送内部行为统计数据
                  if (item.pingback !== '') {
                    var tracParam = {
                      ad_inc_num: item.counts,                                                //包含子广告帖数
                      ad_pos: item.adPosition,                                                //当前广告在广告列表(包含空广告)中的位置 (从1开始)
                      ad_eff_pos: item.effAdPosition,                                         //当前广告在有效广告列表(不含空广告)中的位置 (从1开始)
                      ad_dur: item.duration,                                                  //当前单贴广告的时长
                      ad_vid: item.vid                                                        //当前单贴广告的vid
                    };
                    m.sendInnerPingback('video_ad_play', tracParam);
                  }
                  item.pingback = '';

                  //如果还有在不同时间发送上报的情况
                  $.each(item.pingbacks, function (pbIndex, pbItem) {

                    if (pbItem.t === 0) {
                      m.sendPingback(pbItem.v);
                      //上报完成后删除
                      adObj.pingbacks.length = 0;
                      Console.log('ios空广告上报 v: ' + item.v + ', curIndex: ' + pbIndex);
                    }
                  });
                }

              } else {
                
                return false;
              }
            });
          }
          //当前播放时长超过广告时长，说明广告已经播放完成
          if (curTime > m.totDuration && m.curIndex === adList.length - 1) {
            player.adv.isMediaPlayed = true;
            player.trigger('advended');
          }
          //更新播放时长
          player._lastCurTime = curTime;
          // $('body').append('<div>bbbbb ' + player._lastCurTime + '</div>');
          //发送ios广告上报统计信息
          //获取广告数据对象
          var adObj = ad.mediaAd.adDataList[m.curIndex];

          //计算出当前广告播放的时间
          var curAdCurTime = parseInt(curTime, 10);

          curAdCurTime -= (preTotTime - curTotTime);

          //如果为0，说明刚开始播，发送上报请求
          if (curAdCurTime === 0 && adObj.pingback !== '') {
            //当广告播放的时候发送上报信息
            m.sendPingback(adObj.pingback);
            Console.log('ios广告上报 start:' + adObj.pingback);
            //发送内部行为统计数据
            if (adObj.pingback !== '') {
              Console.log('发送内部行为统计数据: video_ad_play');
              var tracParam = {
                ad_is_empty: 1,                                                         //有效广告
                ad_inc_num: adObj.counts,                                               //包含子广告帖数
                ad_pos: adObj.adPosition,                                               //当前广告在广告列表(包含空广告)中的位置 (从1开始)
                ad_eff_pos: adObj.effAdPosition,                                        //当前广告在有效广告列表(不含空广告)中的位置 (从1开始)
                ad_dur: adObj.duration,                                                 //当前单贴广告的时长
                ad_vid: adObj.vid                                                       //当前单贴广告的vid
              };
              m.sendInnerPingback('video_ad_play', tracParam);
            }
            //上报完成后删除地址
            adObj.pingback = '';
          }

          //如果还有在不同时间发送上报的情况
          $.each(adObj.pingbacks, function (index, item) {

            if (curAdCurTime === item.t) {
              m.sendPingback(item.v);
              //上报完成后删除
              adObj.pingbacks.splice(index, 1);
              Console.log('ios广告上报 v: ' + item.v + ', curIndex: ' + index);
            }
          });

          if (curAdCurTime >= (adObj.duration - 1) && adObj.finishPingback !== '') {
            m.sendPingback(adObj.finishPingback);
            adObj.finishPingback = '';
            Console.log('ios end广告上报: endIndex: ' + m.curIndex);
          }
        }
      }
    };
    //初始化
    c.init(player, config);

    /**
     * @memberof IosAdvertise.prototype
     * @summary 视频广告是否播放完成
     * @type {boolean}
     */
    this.isMediaPlayed = false;

    /**
     * @memberof IosAdvertise.prototype
     * @summary 添加广告
     * @type {function}
     * @param {function} fn                               - 可选参数, 添加完广告后的回调方法
     */
    this.addAdvertise = c.addAdvertise;

    /**
     * @memberof IosAdvertise.prototype
     * @summary 更新广告
     * @type {function}
     */
    this.updateAdv = c.updateAdv;

    /**
     * @memberof AndoridAdvertise.prototype
     * @summary 结束广告,播放正片
     * @type {function}
     */
    this.gotoEnd = function () {
      p.player.seekTo(p.player.cache.duration);
    };
  };

  module.exports = IosAdvertise;
});
/**
 *
 *   @description: 该文件用于安卓广告业务数据处理
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-03-26
 *
 *   @update-log :
 *                 1.0.1 - 安卓广告业务数据处理
 *
 **/

svp.define('adv.andorid.parseData', function (require, exports, module) {
  var URL = require('base.url');
  var vars = require('base.vars');
  var Console = require('base.console');

  window.getAdsCallback = function (data) {
  Console.log('获取Android广告完成, 耗时--->' + (Date.now() - svp.debug.playerLoadAdDataStartTime) / 1000);

  var base64encodechars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var base64decodechars = new Array(
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
      52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
      -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
      15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
      -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
      41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

  function base64encode(str) {
      var out, i, len;
      var c1, c2, c3;
      len = str.length;
      i = 0;
      out = "";
      while (i < len) {
          c1 = str.charCodeAt(i++) & 0xff;
          if (i == len) {
              out += base64encodechars.charAt(c1 >> 2);
              out += base64encodechars.charAt((c1 & 0x3) << 4);
              out += "==";
              break;
          }
          c2 = str.charCodeAt(i++);
          if (i == len) {
              out += base64encodechars.charAt(c1 >> 2);
              out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
              out += base64encodechars.charAt((c2 & 0xf) << 2);
              out += "=";
              break;
          }
          c3 = str.charCodeAt(i++);
          out += base64encodechars.charAt(c1 >> 2);
          out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
          out += base64encodechars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
          out += base64encodechars.charAt(c3 & 0x3f);
      }
      return out;
  }
  function base64decode(str) {
      var c1, c2, c3, c4;
      var i, len, out;
      len = str.length;
      i = 0;
      out = "";
      while (i < len) {

          do {
              c1 = base64decodechars[str.charCodeAt(i++) & 0xff];
          } while (i < len && c1 == -1);
          if (c1 == -1)
              break;

          do {
              c2 = base64decodechars[str.charCodeAt(i++) & 0xff];
          } while (i < len && c2 == -1);
          if (c2 == -1)
              break;
          out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

          do {
              c3 = str.charCodeAt(i++) & 0xff;
              if (c3 == 61)
                  return out;
              c3 = base64decodechars[c3];
          } while (i < len && c3 == -1);
          if (c3 == -1)
              break;
          out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));

          do {
              c4 = str.charCodeAt(i++) & 0xff;
              if (c4 == 61)
                  return out;
              c4 = base64decodechars[c4];
          } while (i < len && c4 == -1);
          if (c4 == -1)
              break;
          out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
      }
      return out;
  }
  function utf16to8(str) {
      var out, i, len, c;
      out = "";
      len = str.length;
      for (i = 0; i < len; i++) {
          c = str.charCodeAt(i);
          if ((c >= 0x0001) && (c <= 0x007f)) {
              out += str.charAt(i);
          } else if (c > 0x07ff) {
              out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f));
              out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f));
              out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
          } else {
              out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f));
              out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
          }
      }
      return out;
  }
  function utf8to16(str) {
      var out, i, len, c;
      var char2, char3;
      out = "";
      len = str.length;
      i = 0;
      while (i < len) {
          c = str.charCodeAt(i++);
          switch (c >> 4) {
              case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
              // 0xxxxxxx
              out += str.charAt(i - 1);
              break;
              case 12: case 13:
              // 110x xxxx   10xx xxxx
              char2 = str.charCodeAt(i++);
              out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
              break;
              case 14:
                  // 1110 xxxx  10xx xxxx  10xx xxxx
                  char2 = str.charCodeAt(i++);
                  char3 = str.charCodeAt(i++);
                  out += String.fromCharCode(((c & 0x0f) << 12) |
                      ((char2 & 0x3f) << 6) |
                      ((char3 & 0x3f) << 0));
                  break;
          }
      }
      return out;
  }

  xmlData = utf8to16(base64decode(data));
  vast.parseData(xmlData);
  Console.log('Android广告模块解析完成, 耗时--->' + (Date.now() - svp.debug.playerLoadAdDataStartTime) / 1000);

  };

  (function () {
      var vast = window.vast = {};
      var vastDataArray = new Array();
      var isShow = false;
      var trackes = [];
      var complete_callback;

      vast.parseData = function(xmlStr){
          if (window.DOMParser){
              parser = new DOMParser();
              xmlDoc = parser.parseFromString(xmlStr, "text/xml");
          }else{
              xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
              xmlDoc.async = "true";
              xmlDoc.loadXML(xmlStr);
          }//把string成Dom

          Console.log(xmlStr);
          var elements  = xmlDoc.getElementsByTagName("Ad");//获得Ad list
          for(var i = 0;i<elements.length;i++){
              var adObj = {};
              var inLineObj = {};//
              var InLine = elements[i].getElementsByTagName("InLine");//InLine
              for(var j = 0;j<InLine.length;j++){
                  var adTag = InLine[j].tagName;
                  var adSystemTag = InLine[j].getElementsByTagName("AdSystem")[0].tagName;//key
                  var adSystem = InLine[j].getElementsByTagName("AdSystem")[0].childNodes[0].nodeValue;//广告系统来源 adSystem value
                  inLineObj[adSystemTag] = adSystem;

                  var adTitleTag = InLine[j].getElementsByTagName("AdTitle")[0].tagName;
                  var adTitle = InLine[j].getElementsByTagName("AdTitle")[0].childNodes[0].nodeValue;//广告标题 adTitle
                  inLineObj[adTitleTag] = adTitle;

                  var adDescTag = InLine[j].getElementsByTagName("Description")[0].tagName;
                  var adDesc = InLine[j].getElementsByTagName("Description")[0].childNodes[0].nodeValue;//广告说明 adDesc
                  inLineObj[adDescTag] = adDesc;

                  var Impression = InLine[j].getElementsByTagName("Impression");

                  var ImpArr = new Array();
                  for(var k = 0;k<Impression.length;k++){
                      var impUrl = {};//impUrl
                      var impId = {};//impId
                      var impressionTag = InLine[j].getElementsByTagName("Impression")[k].tagName;
                      var impressionUrl = InLine[j].getElementsByTagName("Impression")[k].childNodes[0].nodeValue;
                      var impressionUrl = impressionUrl.replace(/\s/g,""); 
                      impUrl[impressionTag] = impressionUrl;
                      var impressionId = InLine[j].getElementsByTagName("Impression")[k].getAttribute("id");
                      impId[impressionId] = impUrl;
                      ImpArr.push(impId);
                  }   //主曝光服务器URL adImpurl[{url:"", id:""}]
                  //第三方广告服务器URL
                  inLineObj["Imp"] = ImpArr;
                  inLineObj["isImp"] = false;
                 
                  var Creatives = InLine[j].getElementsByTagName("Creatives")[0];//创意组
                  var Creative = Creatives.getElementsByTagName("Creative");//单个创意

                  for(var l = 0;l<Creative.length;l++){
                      var Linear = Creative[l].getElementsByTagName("Linear")[0];//Linear
                      var adDurTag = Linear.getElementsByTagName("Duration")[0].tagName;
                      var adDur = Linear.getElementsByTagName("Duration")[0].childNodes[0].nodeValue;//Duration
                      inLineObj[adDurTag] = parseTime(adDur);

                      var MediaFiles = Linear.getElementsByTagName("MediaFiles")[0];//MediaFiles

                      var MediaFile = MediaFiles.getElementsByTagName("MediaFile");
                      var mediaFileArr = new Array();
                      for( var m = 0;m<MediaFile.length;m++){
                          var mediaFile = {};
                          if(MediaFile[m].hasChildNodes()){//判断MediaFile[m]是否有子节点
                              var adUrlTag = MediaFile[m].tagName;
                              var adUrl = MediaFile[m].childNodes[0].nodeValue;
                              var adUrl = adUrl.replace(/\s/g,"");
                          }else{
                              var adUrl = null;//当MediaFile[m]没有value值的时候,adUrl为空.
                          }
                          mediaFile[adUrlTag] = adUrl;
                          var adWidth = MediaFile[m].getAttribute("width");
                          mediaFile["width"] = adWidth;
                          var adHeight = MediaFile[m].getAttribute("height");
                          mediaFile["height"] = adHeight;
                          var adVideoType = MediaFile[m].getAttribute("type");
                          mediaFile["type"] = adVideoType;
                          var vid = MediaFile[m].getAttribute("vid");
                          mediaFile["vid"] = vid;
                          mediaFileArr.push(mediaFile);
                      }//广告格式及大小和资源URL  adWidth,    adHeight,    adVideoType
                      inLineObj["MediaFile"] = mediaFileArr;

                      var VideoClicks = Linear.getElementsByTagName("VideoClicks")[0];
                      var ClickThrough = VideoClicks.getElementsByTagName("ClickThrough");
                      for(var n = 0; n<ClickThrough.length;n++){
                          var adClkUrlTag = ClickThrough[n].tagName;
                          var adClkUrl = ClickThrough[n].childNodes[0].nodeValue;//点击跳转连接 adClkUrl
                          var adClkUrl = adClkUrl.replace(/\s/g,"");
                          inLineObj[adClkUrlTag] = adClkUrl;
                      }

                      var ClickTracking = VideoClicks.getElementsByTagName("ClickTracking");
                      var clickTrackingArr = new Array();
                      if(VideoClicks.hasChildNodes()){
                          for(var x = 0 ;x < ClickTracking.length;x++){
                              var clickTracking = {};
                              var adClkTrackTag = ClickTracking[x].tagName;
                              var adClkTrackUrl = ClickTracking[x].childNodes[0].nodeValue;
                              var adClkTrackUrl = adClkTrackUrl.replace(/\s/g,"");
                              clickTracking[adClkTrackTag] = adClkTrackUrl;
                              var adClkTrackId = ClickTracking[x].getAttribute("id");
                              clickTracking["id"] = adClkTrackId; 
                              clickTrackingArr.push(clickTracking);
                          }//点击监测连接 adClkTrack[{url:"", id:""}]
                          //点击监测 admaster第三方的监测公司的名字
                          inLineObj["ClickTracking"] = clickTrackingArr;
                      }
                      
                      var TrackingEvents = Linear.getElementsByTagName("TrackingEvents")[0];
                      if(TrackingEvents != undefined){//判断TrackingEvents是否定义
                          var Tracking = TrackingEvents.getElementsByTagName("Tracking");
                          var trackingArr = new Array();
                          for(var y = 0;y<Tracking.length;y++){
                              var tracking = {};
                              var adProTrkTag = Tracking[y].tagName;
                              var adProTrkUrl = Tracking[y].childNodes[0].nodeValue;
                              var adProTrkUrl = adProTrkUrl.replace(/\s/g,"");//用正则表达式去掉url字符串中的空白字符
                              tracking[adProTrkTag] = adProTrkUrl;
                              adProTrkEvent = Tracking[y].getAttribute("event");
                              adProTrkId = Tracking[y].getAttribute("id");
                              adProTrkOffset = Tracking[y].getAttribute("offset");
                              tracking["event"] = adProTrkEvent;
                              tracking["id"] = adProTrkId;
                              tracking["isTrack"] = false;
                              if(adProTrkOffset!=null){
                                  tracking["offset"]  = parseTime(adProTrkOffset);
                              }else{
                                  tracking["offset"]  = adProTrkOffset;
                              } 
                              trackingArr.push(tracking);
                          }//tracking标签的属性及文本值.
                          inLineObj["Tracking"] = trackingArr;
                      }
                  }
                  var Extensions = InLine[j].getElementsByTagName("Extensions")[0];
                  var Extension = Extensions.getElementsByTagName("Extension");
                  for(var z= 0;z<Extension.length;z++){
                      var AdParams = Extension[z].getElementsByTagName("AdParams")[0];
                      var adStyle = AdParams.getAttribute("adStyle");//获得属性值,未处理!
                      var sequence = AdParams.getAttribute("sequence");
                      var CallbackFun = AdParams.getElementsByTagName("CallbackFun");
                      for( var a = 0 ;a<CallbackFun.length;a++){
                          //没有value 未处理
                      }
                  }
                  adObj[adTag] = inLineObj;
              }
              vastDataArray.push(adObj);
          }

          var urls = [];
          var oad = {};
          for(var i = 0 ;i<vastDataArray.length;i++){
              var videoUrl = vastDataArray[i].InLine.MediaFile[0].MediaFile;
              var clickUrl = vastDataArray[i].InLine.ClickThrough;
              var duration = vastDataArray[i].InLine.Duration;
              var vid = vastDataArray[i].InLine.MediaFile[0].vid;
              if(videoUrl != null){
                  oad["videoUrl"] = videoUrl;
                  oad["clickUrl"] = clickUrl;
                  oad["duration"] = duration;
                  oad["vid"] = vid;
                  oad = vast.cbDataProcess(oad, vastDataArray[i].InLine);
                  urls.push(oad);
                  oad = {};
              }else{
                  oad["videoUrl"] = "error";
                  oad["clickUrl"] = "error";
                  oad["duration"] = "error";
                  oad["vid"] = "error";
                  oad = vast.cbDataProcess(oad, vastDataArray[i].InLine);
                  urls.push(oad);
                  oad = {};
              }
          }

          function parseTime(timeStr){
              var timeArr = timeStr.split(":");
              var hours = parseInt(timeArr[0]);
              var minutes = parseInt(timeArr[1]);
              var seconds = parseInt(timeArr[2]);
              var total = hours * 3600 + minutes * 60 + seconds;
              return total;
          }

          if (vars.ENABLE_DEBUG) {
              Console.log('android 广告数据:' + JSON.stringify(vastDataArray));
          }

  //        vast.trackImp();
          complete_callback(urls);//调用回调函数
      }

      vast.getData = function (url, callBack){
          //每次掉getData的时候，清空缓存数据列表
          if (typeof vastDataArray !== 'undefined' && vastDataArray instanceof Array) {
              vastDataArray = [];
          }
          complete_callback = callBack;
          /** Jsonp */
          var script = document.createElement('script');
          script.setAttribute("type","text/javascript");
          script.src = url;
          document.body.appendChild(script);
          /** Jsonp */
      }

      //ajax曝光方法
      function doTrack(url){
          //=====h5 beg======
          if(url && url.indexOf('mmg.aty.sohu.com')>-1 ){ 
              url = vast.repOrAddParams(url);
          } 
          Console.log("adEngine trackImg URL",url);
        //=====h5 end======
          var trackImg = new Image();
          trackImg.src = url;
          trackes.push(trackImg);
      }

      //根据当前播放时间曝光
      vast.trackAd = function(sec, oadNumber){
          var oad = vastDataArray[oadNumber];
          var s = Math.floor(sec);
          vast.trackempty(oadNumber);

          if(oad.InLine.Tracking != undefined ){//if Tracking 不是未定义
              var len = oad.InLine.Tracking.length;
              for(var i = 0;i < len;i ++){
                  var trackObj = oad.InLine.Tracking[i];
                  if(!trackObj.isTrack && s == trackObj.offset){//当前播放时间等于达到曝光时间
                      doTrack(trackObj.Tracking);
                      trackObj.isTrack = true;
                  }
              }
          }
      }

      //曝光
      vast.trackImp = function(){
          var len = vastDataArray.length;
          var i = 0;
          for(i = 0;i < len; i++){
              var oad = vastDataArray[i];
              oad.InLine.isImp = true;
              var implen = oad.InLine.Imp.length;
              var j = 0;
              for(;j < implen;j ++){
                  var tmpImpObj = oad.InLine.Imp[j];
                  var impUrl;
                  for(var key in tmpImpObj){
                      impUrl = tmpImpObj[key].Impression; 
                  }
                  doTrack(impUrl);
              }
          }
      }

      vast.trackempty = function(oadNumber){
          var oad = vastDataArray[oadNumber];
          if(!oad.InLine.isImp){
              Console.log("fff:" + oadNumber);
              var implen = oad.InLine.Imp.length;
              var j = 0;
              for(;j < implen;j ++){
                  var tmpImpObj = oad.InLine.Imp[j];
                  var impUrl;
                  for(var key in tmpImpObj){
                      impUrl = tmpImpObj[key].Impression;
                  }
                  oad.InLine.isImp = true;
                  doTrack(impUrl);
              }
          }
      }

      //播放完成时曝光
      vast.trackAdComplete = function(oadNumber){
          var oad = vastDataArray[oadNumber];
          if(oad.InLine.Tracking != undefined){
              for(var i = 0; i<oad.InLine.Tracking.length;i++){
                  if(oad.InLine.Tracking[i].event == "complete"){
                      doTrack(oad.InLine.Tracking[i].Tracking);
                  }
              }
          }
      }

      //点击时曝光且打开一个新页面
      vast.trackClick = function(oadNumber){
          var oad = vastDataArray[oadNumber];
          if(oad.InLine.ClickTracking != undefined){
              var len = oad.InLine.ClickTracking.length;
              var i = 0;
              for(;i<len;i++){
                  var adClkTrackObj = oad.InLine.ClickTracking[i];
                  var adClkTrackUrl = adClkTrackObj.ClickTracking;
                  doTrack(adClkTrackUrl);
              }
          }
      }

      //============sohutv h5 add=================
     vast.getQueryString = function(name) {
          var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i"), r = window.location.search.substr(1).match(reg);
          if (r !== null) {
              return unescape(r[2]);
          }
          return null; 
     };
      
     vast.getCookie = function(name) {
          var arrCookie = document.cookie.split(';'), arrS;
          for (var i = 0; i < arrCookie.length; i++) {
              arrS = arrCookie[i].split('=');
              if (arrS[0].trim() == name) {
                  return unescape(arrS[1]);
              }
          }
          return "";
      };
      
      vast.repOrAddParams = function(repUrl){
          //replace OR add partner
          //修改partner字段
          try {
             if (repUrl !== '' && repUrl.indexOf('mmg.aty.sohu.com')>-1 ) { 
                 var partnerArr = repUrl.match(/partner=([a-zA-Z0-9\-_\|]*)/i);  
                 var nwpartner = vast.getQueryString('src') || vast.getQueryString('SRC')  || vast.getCookie('MTV_SRC')  || '-2';//src渠道号
                 //Console.log("partner="+nwpartner)
                 if (partnerArr === null || (partnerArr.length >= 2 && partnerArr[1] === '')) {
                     repUrl = repUrl + '&partner=' + nwpartner;
                 } 
             }
          } catch (e) {
            Console.log(e); 
          }

          var urldomainArr = repUrl.match(/urldomain=([a-zA-Z0-9\-_\|]*)/i);
          //添加urldomain字段
          if (urldomainArr === null || (urldomainArr.length >= 2 && urldomainArr[1] === '')) {
              repUrl = repUrl + '&urldomain=' + window.location.host;
          }
         return repUrl;
      };
       
      vast.cbDataProcess = function (oad, data) {
          var url = data.Imp[0].monitorServer.Impression;
          var param = URL.getQueryData(url);
          var arr = param.p ? param.p.split(',') : [];
          oad.cnt = arr.length;
          return oad;
      };
      
  })();

  module.exports = vast;
});
/**
 *
 *   @description: 该文件用于定义播放器主控界面业务
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-03-26
 *
 *   @update-log :
 *                 1.0.1 - 播放器主控界面业务
 *
 **/

svp.define('player.controls', function (require, exports, module) {

  'use strict';
  
  //扩展进度条操作
  require('player.ctrlProgress');
  //扩展播放按钮业务
  require('player.ctrlButton');
  //扩展清晰度选择业务
  require('player.ctrlHd');
  //扩展全屏业务
  require('player.ctrlFullscreen');

  var vars = require('base.vars');
  var $ = svp.$;
  var MediaPlayer = require('player.mediaPlayer');
  
  /**
   * @class MediaPlayer
   * @classdesc 播放器事件
   * @property {function}  _hideMainCtrl                   - 隐藏主控界面
   * @property {function}  _showMainCtrl                   - 显示主控界面
   * @property {function}  _initMainClick                  - 主控容器点击业务
   * @property {function}  _initControls                   - 控制面板业务
   */

  /**
   * @memberof MediaPlayer.prototype
   * @summary 隐藏主控界面
   * @type {function}
   */
  MediaPlayer.prototype._hideMainCtrl = function () {
    var _this = this;
    clearInterval(this._mainCtrlInterval);
    
    if (!vars.IsIphone) {
      this._mainCtrlInterval = setTimeout(function () {
        _this.$title.oriHide();
        _this.$ctrlBar.oriHide();
        _this.$midModeListCon.oriHide();
      }, 200);
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 显示主控界面
   * @type {function}
   */
  MediaPlayer.prototype._showMainCtrl = function () {
    var _this = this;
    clearInterval(this._mainCtrlInterval);

    this._mainCtrlInterval = setTimeout(function () {
      _this.$title.oriShow();
      _this.$ctrlBar.oriShow();
      _this.$midModeListCon.oriShow();
    }, 200);
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 主控容器点击业务
   * @type {function}
   */
  MediaPlayer.prototype._initMainClick = function () {
    var _this = this;
    //显示和隐藏主控界面计时器
    this._mainCtrlInterval = null;

    this.$ctrlCon.on(vars.END_EVENT, function () {
      //如果广告没播完，不进行后面的业务
      if (!$.isUndefined(_this.adv) && !_this.adv.isMediaPlayed) {

        return;
      }
      
      if (_this.$midPlay.css('display') === 'block') {
        _this._playOrPause('play');
      }

      if (_this.$ctrlBar.css('display') === 'none') {
        _this._showMainCtrl();

        //清除消失动画计时器
        clearTimeout(_this._hideMainCtrlTime);
        //如果没有任何操作，3秒后主操作界面隐藏
        _this._hideMainCtrlTime = setTimeout(function () {
          _this._hideMainCtrl();
        }, 3000);

      } else {
        _this._hideMainCtrl();
      }
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 控制面板业务
   * @type {function}
   */
  MediaPlayer.prototype._initControls = function () {
    //初始化进度条
    this._initCtrlProgress();
    //播放按钮业务
    this._initCtrlButton();
    //初始化清晰度选择列表
    this._initModeSelect();
    //主控容器点击业务
    this._initMainClick();
    //全屏业务
    this._initCtrlFullscreen();
  };

});
/**
 *
 *   @description: 该文件用于播放器合作相关业务
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-03-26
 *
 *   @update-log :
 *                 1.0.1 - 播放器合作相关业务
 *
 **/

svp.define('player.cooperation', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var MediaPlayer = require('player.mediaPlayer');
  var special = require('base.special');

  /**
   * @class MediaPlayer
   * @classdesc 播放器合作相关业务
   * @property {function}  _cooperatorVideoAttr            - 播放器合作相关业务
   */

  /**
   * @memberof MediaPlayer.prototype
   * @summary 合作方添加video标签上的自定义属性
   * @type {function}
   * @param {object}   seconds                             - 延迟时间，不填直接执行
   */
  MediaPlayer.prototype._cooperatorVideoAttr = function (seconds) {
    var _this = this;

    var addVideoAttr = function () {
      var urls = _this.cache.oriUrls['m3u8'],
          url = '';

      if (urls[_this.cache.modeType].length === 0) {
        var modeList = ['nor', 'hig', 'sup'];

        $.each(modeList, function (index, item) {

          if (urls[item].length !== 0) {
            url = urls[item][0];

            return false;
          }
        });

      } else {
        url = urls[_this.cache.modeType][0];
      }

      if (url !== '') {
        _this.$video.attr('data-playUrl', url);
      }

      if (!$.isUndefined(_this.videoData.urls.downloadUrl) && !$.isUndefined(_this.videoData.urls.downloadUrl[0])) {
        var downloadUrl = _this.videoData.urls.downloadUrl[0];
        _this.$video.attr('data-downloadUrl', downloadUrl);
      }
    };

    if (special.isCooperator()) {

      if ($.isNumber(seconds) && seconds > 0) {
        
        setTimeout(function () {
          addVideoAttr();
        }, 3000);
      
      } else {
        addVideoAttr();
      }
    }
  };
});

/**
 *
 *   @description: 该文件用于定义播放器banner-按钮业务
 *
 *   @version    : 1.0.4
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-09-08
 *
 *   @update-log :
 *                 1.0.1 - 播放器banner-按钮业务
 *                 1.0.2 - 在暂停方法中，加入了隐藏loading业务
 *                 1.0.3 - 修正_hideLoading方法不隐藏文字的bug
 *                 1.0.4 - 新增_hideMidPlayBtn方法
 *
 **/

svp.define('player.ctrlButton', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var vars = require('base.vars');
  var MediaPlayer = require('player.mediaPlayer');

  /**
   * @class MediaPlayer
   * @classdesc 播放器按钮条业务
   * @property {function}  _initCtrlButton                 - (播放器内部使用) 初始化播放器按钮业务
   * @property {function}  _showPlayBtn                    - (播放器内部使用) 显示播放按钮
   * @property {function}  _showMidPlayBtn                 - (播放器内部使用) 显示中间播放按钮
   * @property {function}  _hideMidPlayBtn                 - (播放器内部使用) 隐藏中间播放按钮
   * @property {function}  _showPauseBtn                   - (播放器内部使用) 显示暂停按钮
   * @property {function}  _showLoading                    - (播放器内部使用) 显示loading图
   * @property {function}  _hideLoading                    - (播放器内部使用) 隐藏loading图
   */
  
  /**
   * @memberof MediaPlayer.prototype
   * @summary 显示播放按钮 (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._showPlayBtn = function () {
    this.$ctrlPlay.oriShow();
    this.$ctrlPause.oriHide();
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 显示中间播放按钮 (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._showMidPlayBtn = function () {
    this._hideLoading();
    this._hideMainCtrl();
    this.$ctrlBar.oriHide();
    this.$midModeListCon.oriHide();
    this.$mid.oriShow();
    this.$midPlay.oriShow();
    this.$title.oriHide();
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 隐藏中间播放按钮 (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._hideMidPlayBtn = function () {
    this.$midPlay.oriHide();
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 显示暂停按钮 (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._showPauseBtn = function () {
    this.$ctrlPlay.oriHide();
    this.$ctrlPause.oriShow();
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 显示loading (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._showLoading = function () {
    //ios下的uc和qq不做loading处理
    if (!(vars.IsIOS && (vars.IsQQBrowser || vars.IsUCBrowser))) {

      if (!vars.IsBaiduBrowser) {
        this.$midPlay.oriHide();
      }
      this.$loading.oriShow();
      this.$mid.oriHide();
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 显示loading (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._hideLoading = function () {
    
    if (!vars.IsBaiduBrowser) {
      this.$midPlay.oriHide();
    }
    this.$loading.oriHide();
    this.$loadingDesc.oriHide();
  };

  //中间播放按钮业务
  var midPlayBtnService = function (player) {

    player.$midPlay.on(vars.END_EVENT, function () {
      $(this).oriHide();
      player._playOrPause('play');

      return false;
    });
  };

  //左下角播放、暂停按钮
  var playOrPauseBtnService = function (player) {
    //播放
    player.$ctrlPlay.on(vars.END_EVENT, function () {
      player._playOrPause('play');

      return false;
    });

    //暂停
    player.$ctrlPause.on(vars.END_EVENT, function () {
      player._playOrPause('pause');

      return false;
    });

    player._addEvent('pause', function () {
      //安卓广告暂停时显示特殊的样式
      if (vars.IsAndroid && !$.isUndefined(player.adv) && !player.adv.isMediaPlayed) {

        return;
      }
      //隐藏loading
      player._hideLoading();
      //显示播放按钮
      player._showPlayBtn();
      //显示标题、控制条
      player._showMainCtrl();
    });

    if (!vars.IsIphone) {
      player._addEvent('play', player._showPauseBtn);
      player._addEvent('playing', player._showPauseBtn);
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 初始化播放器按钮业务 (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._initCtrlButton = function () {
    //中间播放按钮业务
    midPlayBtnService(this);
    //左下角播放、暂停按钮
    playOrPauseBtnService(this);
  };
});
/**
 *
 *   @description: 该文件用于定义播放器全屏播放业务
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-09-10
 *
 *   @update-log :
 *                 1.0.1 - 播放器全屏播放业务
 *                 1.0.2 - 将全屏的class position_fullscreen 放到了播放器父级容器上，以至于可以支持多个播放器全屏
 *
 **/

svp.define('player.ctrlFullscreen', function (require, exports, module) {

  'use strict';
  
  var vars = require('base.vars');
  var player = require('player.mediaPlayer');

  /**
   * @class MediaPlayer
   * @classdesc 播放器全屏播放业务
   * @property {function}  _initCtrlFullscreen             - (播放器内部使用) 初始化播放器全屏播放业务
   * @property {function}  _isSupportSysFullScreen         - (播放器内部使用) 检测是否支持系统全屏
   * @property {function}  _apiEnterFullScreen             - (播放器内部使用) 进入系统全屏接口
   * @property {function}  _apiExitFullScreen              - (播放器内部使用) 退出系统全屏接口
   * @property {function}  _enterSysFullScreen             - (播放器内部使用) 进入系统全屏
   * @property {function}  _fullOrShrink                   - (播放器内部使用) 进入或退出全屏
   */

  /**
   * @memberof MediaPlayer.prototype
   * @summary 检测是否支持系统全屏 (播放器内部使用)
   * @type {function}
   */
  player.prototype._isSupportSysFullScreen = function () {
    // 不支持全屏的视频
    var isSptFullscreen = false;
    var elem = this.videoTag;
    
    if (elem.requestFullscreen) {
      isSptFullscreen = true;
    
    } else if (elem.mozRequestFullScreen) {
      isSptFullscreen = true;
    
    } else if (elem.webkitRequestFullscreen) {
      isSptFullscreen = true;
    
    } else if (elem.webkitEnterFullscreen) {
      isSptFullscreen = true;
    
    } else if (elem.msRequestFullscreen) {
      isSptFullscreen = true;
    }
    
    if ($(this.videoTag).hasClass('inline_player') && (!$.isEmpty(this.cache.fullscreenType) && this.cache.fullscreenType !== '1')) {
      isSptFullscreen = false;

    }
    
    return isSptFullscreen;
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 进入系统全屏接口 (播放器内部使用)
   * @type {function}
   */
  player.prototype._apiEnterFullScreen = function (elem) {
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    
    } else if (elem.webkitEnterFullscreen) {
      elem.webkitEnterFullscreen();
    
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 退出系统全屏接口 (播放器内部使用)
   * @type {function}
   */
  player.prototype._apiExitFullScreen = function (elem) {
    
    if (elem.exitFullscreen) {
      elem.exitFullscreen();
    
    } else if (elem.mozCancelFullScreen) {
      elem.mozCancelFullScreen();
    
    } else if (elem.webkitExitFullscreen) {
      elem.webkitExitFullscreen();
    
    } else if (elem.webkitCancelFullScreen) {
      elem.webkitCancelFullScreen();
    
    } else if (elem.msExitFullscreen) {
      elem.msExitFullscreen();
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 进入系统全屏 (播放器内部使用)
   * @type {function}
   */
  player.prototype._enterSysFullScreen = function () {
    var _this = this;
    // 开始播放后才可以全屏
    if (vars.UA.match(/HS\-U950|HUAWEI_C8812|vivo/i) && !vars.IsUCBrowser && !vars.IsQQBrowser) {
      _this.videoTag['play']();
    }
    var fullscreenchange = function () {
      
      if (_this.videoTag.paused && !vars.IsIOS) {
        
        setTimeout(function () {
          _this.videoTag['play']();
        }, 0);
      }
    };

    if (this._isSupportSysFullScreen()) {
      var elem = _this.videoTag;
      document.addEventListener("fullscreenchange", fullscreenchange, false);
      document.addEventListener("mozfullscreenchange", fullscreenchange, false);
      document.addEventListener("webkitfullscreenchange", fullscreenchange, false);
      document.addEventListener("MSFullscreenChange", fullscreenchange, false);
      _this._apiEnterFullScreen(elem);

    }
    
    setTimeout(function () {
      _this.videoTag['play']();
    }, 0);
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 退出系统全屏 (播放器内部使用)
   * @type {function}
   */
  player.prototype._exitSysFullScreen = function () {
    var _this = this;
    var elem = _this.videoTag;
    _this._apiExitFullScreen(elem);
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 进入/退出全屏 (播放器内部使用)
   * @type {function}
   * @property {string} type  -  全屏缩屏类型(fullScreen/shrinkScreen)
   */
  player.prototype._fullOrShrink = function (type) {
    var _this = this;
    clearTimeout(this._hideMainCtrlTime);
    
    //全屏
    if (type === 'fullScreen') {
      
      if (this.cache.fullscreenType === '1') {
        this._enterSysFullScreen();
      
      } else {
        //如果在iphone、8.1前winphone设备下，点击全屏直接播放
        if (vars.IsIphone || vars.IsOldWindowsPhone ||
            (vars.IsAndroid && vars.IsQQBrowser) || vars.IsBaiduBrowser) {
          this._playOrPause('play');
        
        } else {
          $('html').addClass('player_fullscreen');
          this.$main.parent().addClass('position_fullscreen');
          //缓存当前scrollTop
          this._scrollTop = $(window).scrollTop();
          //隐藏全屏按钮
          this.$ctrlFullScreen.oriHide();
          //显示缩小按钮
          this.$ctrlShrinkScreen.oriShow();
        }
  
        // $('.finPic').oriHide();
      }
    //缩屏
    } else {
      $('html').removeClass('player_fullscreen');
      this.$main.parent().removeClass('position_fullscreen');
      //显示全屏按钮
      this.$ctrlFullScreen.oriShow();
      //隐藏缩小按钮
      this.$ctrlShrinkScreen.oriHide();
      //恢复到原来的scrollTop
      $(window).scrollTop(this._scrollTop);

      // setTimeout(function () {
      //   $('.finPic').oriShow();
      // }, 500);
    }
    //如果没有任何操作，3秒后主操作界面隐藏
    this._hideMainCtrlTime = setTimeout(function () {
      _this._hideMainCtrl();
    }, 3000);
  };

  //进入全屏、退出全屏按钮事件注册
  var fullScreenBtnService = function (player) {
    
    player.$ctrlFullScreen.on(vars.END_EVENT, function () {
      player._fullOrShrink('fullScreen');
      
      return false;
    });

    player.$ctrlShrinkScreen.on(vars.END_EVENT, function () {
      player._fullOrShrink('shrinkScreen');

      return false;
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 初始化播放器全屏播放业务 (播放器内部使用)
   * @type {function}
   */
  player.prototype._initCtrlFullscreen = function () {
    fullScreenBtnService(this);
  };
});
/**
 *
 *   @description: 该文件用于定义播放器清晰度切换业务
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-05-04
 *
 *   @update-log :
 *                 1.0.1 - 播放器清晰度切换业务
 *
 **/

svp.define('player.ctrlHd', function (require, exports, module) {

  'use strict';

  var $ = svp.$;
  var vars = require('base.vars');
  var MediaPlayer = require('player.mediaPlayer');
  var ClickTrace = window.ClickTrace = require('trace.click');
  var appDownload = require('data.appDownload');
  var Action = require('base.action');

  /**
   * @class MediaPlayer
   * @classdesc 播放器事件
   * @property {function}  playByMode                      - 按清晰度播放
   * @property {function}  _initModeSelect                 - 初始化播放器清度选择业务
   */
   
  //清晰度列表
  var modelList = function (player) {

    player.$midModeListCon.on(vars.END_EVENT, function () {
      var dom = $(this);

      if (dom.hasClass('show_list')) {
        dom.removeClass('show_list');

      } else {
        dom.addClass('show_list');
      }

      //清除消失动画计时器
      clearTimeout(player._hideMainCtrlTime);
      
      return false;
    });
  };

  //清晰度选择
  var modelClick = function (player) {

    player.$midModeLi.on(vars.END_EVENT, function () {
      var dom = $(this);

      //变更标志位
      player._changeModeFlag = true;
      //获取选中模式
      var selectMode = dom.attr('data-mode'),
          selectModeName = dom.html();

      if (selectMode !== 'app') {
        //获取当前播放模式
        var curMode = player.$midCurMode.attr('data-mode'),
            curModeName = player.$midCurMode.html();
        //进行相互切换
        player.$midCurMode.attr('data-mode', selectMode).html(selectModeName);
        dom.attr('data-mode', curMode).html(curModeName);
      }
      //选择完成后隐藏选择列表
      player.$midModeListCon.removeClass('show_list');
      //发送行为统计点
      ClickTrace.pingback(null, 'video_play_code');
      //按类型播放
      player.playByMode(selectMode);

      player._hideMainCtrlTime = setTimeout(function () {
        player._hideMainCtrl();
      }, 3000);
      
      return false;
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 按模式播放清析度
   * @type {function}
   * @param {string}   mode                             - 清晰度 (nor: '流畅', hig: '高清', sup: '超清', ori:'原画', app: 'APP')
   */
  MediaPlayer.prototype.playByMode = function (mode) {
    var _this = this;
    //获取当前播放视频的cache
    var cache = this.cache;
    //如果和当前播放模式不一致，进行切换
    if ((!$.isUndefined(mode) && cache.modeType !== mode) || vars.IsWeixinBrowser) {

      if (mode === 'app') {
        //获取拉起客户端全屏播放参数
        var param = Action.parserAttributes();
        param.action = '1.1';
        param.type = 'click';
        //尝试拉起客户端
        Action.sendAction(param);
        //下载客户端
        appDownload.gotoDownload();


      } else {
        //首先判断传入的mode是否是有效类型
        $.each(cache.modeTypeList, function (index, item) {
          //有效类型
          if (item === mode) {
            _this._pause();
            //记录当前的播放时间
            var curTime = _this.currentTime;
            //切换播放模式，从头播
            var url = cache.srcList[mode][0].url;
            //更新当前播放内容
            cache.curPlayUrl = url;
            //索引值归0
            cache.curIndex = 0;
            //更新模式
            cache.modeType = mode;
            //更新模式
            _this.setSrc(url);

            if (vars.IsIphone && vars.IsUCBrowser) {
              _this.play();

            } else {
              
              setTimeout(function () {

                //继续原来的时间点播放
                _this.seekTo(curTime);
                //播放
                _this.play();
                //如果UC,QQ显示video标签
                if (vars.IsUCBrowser || vars.IsQQBrowser) {
                  _this.$video.oriShow();
                }
              }, 100);
            }

            return false;
          }
        });
      }
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 初始化清晰度选择 (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._initModeSelect = function () {
    //清晰度选择中标志位
    this._changeModeFlag = false;
    //清晰度列表
    modelList(this);
    //清晰度选择
    modelClick(this);
  };
});
/**
 *
 *   @description: 该文件用于定义播放器banner-进度条业务
 *
 *   @version    : 1.0.5
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-09-11
 *
 *   @update-log :
 *                 1.0.1 - 播放器banner-进度条业务
 *                 1.0.2 - 把_sendRealVVFlag移到foxPlayer.js中
 *                         把三星note3的判断方法改为vars.IsSAMSUNGNote3
 *                         删除note3下timeupdate触发ended的无效逻辑
 *                         触发timeupdate时发送统计vv
 *                         修改了试看提示文案
 *                 1.0.3 - 修改了时长限制的按钮文案提示和下载业务
 *                 1.0.4 - 加入了限播时长时候的下载统计
 *                 1.0.5 - 将模块player.errorTypes变更为base.errorTypes
 *                         兼容搜狗浏览器duration获取bug
 *
 **/


svp.define('player.ctrlProgress', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var MediaPlayer = require('player.mediaPlayer');
  var vars = require('base.vars');
  var playHistory = require('player.playHistory');
  var VideoTrace = require('trace.video');
  var Console = require('base.console');
  var errorTypes = require('base.errorTypes');
  var ClickTrace = require('trace.click');
  var appDownload = require('data.appDownload');

  /**
   * @class MediaPlayer
   * @classdesc 播放器进度条业务
   * @property {function}  _initCtrlProgress               - (播放器内部使用) 初始化进度条业务
   */
  
  //获取当前播放时间
  var getCurrentTime = function (player) {
    var cache = player.cache;
    var childDurList = cache.srcList[cache.modeType] || [];
    
    //多个子片
    if (childDurList.length > 1) {
      var curTime = player.videoTag.currentTime;
      var curIndex = cache.curIndex;
      //加上之前已经播放完成的分片时间
      $.each(childDurList, function (index, item) {

        if (index < curIndex) {
          curTime += item.duration || 0;
        
        } else {

          return false;
        }
      });

      return curTime;
    //直接返回当前视频播放时间
    } else {

      return player.videoTag.currentTime;
    }
  };

  //设置历史记录
  var setHistory = function (player) {
    var videoData = player.videoData,
        cache = player.cache;

    if (player.currentTime !== 0 && !cache.isMediaAdContent) {
      
      //生成播放记录
      if (!player._makeHistoryFlag) {
        var rec = {
          sid: videoData.sid,
          vid: videoData.vid,
          site: videoData.site,
          cid: videoData.cid,
          playTime: player.currentTime,
          duration: videoData.totalDuration,
          title: videoData.tvname || ''
        };
        //当前播放视频为广告
        if (cache.isMediaAdContent) {

          if (history !== null && history.flag !== 0) {
            
            return;
          
          } else {
            rec.flag = '0';
            rec.playTime = 1;
          }
        }
        playHistory.setHistory(rec);
        player._makeHistoryFlag = true;
        
        setTimeout(function () {
          player._makeHistoryFlag = false;
        }, 1000);
      }
    }
  };

  //断点续播
  var continuePlay = function (player) {
    var videoData = player.videoData;

    if (player.cache.isRemHistory) {
      var vData = {
        vid: videoData.vid,
        site: videoData.site
      };
      //获取历史记录
      var historyList = playHistory.getHistory(vData),
          history = null;

      if (historyList.length > 0) {
        history = historyList[0];
        //按照播放记录中的数据继续播放
        Console.log('prgress:', history.playTime);
        player.seekTo(history.playTime);
      }
      player._playByHistoryFlag = true;
      
    }
  };

  //绑定时间更新事件
  var timeupdateService = function (player) {
    //添加updatetime事件
    player._addEvent('timeupdate', function () {

      //发送统计vv
      if (!player._sendVVFlag) {
        //加载播放器完成发送统计vv
        Console.log('统计: vv');
        VideoTrace.vv();
        player._sendVVFlag = true;
      }

      if (!svp.debug.isShowPlayerPlayStartTime && player.currentTime > 0) {
        Console.log('视频加载时间:' + (Date.now() - svp.debug.playerPlayStartTime) / 1000 + '秒');
        svp.debug.isShowPlayerPlayStartTime = true;
      }
      var cache = player.cache;
      //如果videoData中总时长为''，则从视频中获取总时长
      if (player.videoData.totalDuration === '' && player.videoTag.duration || cache.duration === 1) {//cache.duration === 1兼容搜狗浏览器bug
        cache.duration = player.videoData.duration = player.videoData.totalDuration = player.videoTag.duration;
      }

      //给player对象设置duration属性
      var duration = player.duration = cache.duration;
      //给player对象设置currentTime属性
      var currentTime = player.currentTime = getCurrentTime(player);

      if (cache.timeLimit > 0) {

        if (currentTime >= cache.timeLimit && ($.isUndefined(player.adv) || (!$.isUndefined(player.adv) && player.adv.isMediaPlayed))) {
          player.$video.remove();

          player._showMsg({
            text:  errorTypes['SUPPORT']['304'],
            btns: {
              btnA: {
                // text: '重新播放',
                // callback: function () {
                //   //重新播放
                //   if (vars.IsIphone && /^[0-7]\./i.test(vars.OsVersion)) {
                //     player.seekTo(0);

                //   } else {
                //     player.updateMedia(player.videoData, true);
                //   }
                //   player._hideMsg();
                // }
                text: '立即下载',
                callback: function () {
                  Console.log('发送内部行为统计: time_limit_download');
                  ClickTrace.pingback(null, 'time_limit_download');
                  appDownload.gotoDownload();
                }
              }
            }
          });

          return;
        }
      }

      if (currentTime > 0) {
        //隐藏海报
        if (!vars.IsIphone) {
          player.hidePoster();
        }

        //隐藏loading
        player._hideLoading();

        //如果广告未播放完成，则不执行后面的脚本
        if (!$.isUndefined(player.adv) && !player.adv.isMediaPlayed) {

          return;
        }

        if (currentTime > 1) {
          //第一次播放成功发送realvv
          if (!player._sendRealVVFlag) {
            Console.log('统计: reallvv');
            VideoTrace.realVV(player._startPlayTime);
            player._sendRealVVFlag = true;

            //为合作方添加属性
            player.$video.attr('data-adover', 'true');
            //播放属性
            player._cooperatorVideoAttr();
          }
          //播放记录
          if (cache.isRemHistory) {
            //断点续播
            if (!player._playByHistoryFlag) {
              continuePlay(player);
            }
            //播放记录操作
            setHistory(player);
          }

          //如果两次timeupdate之间的时间间隔大于2秒，认为用户拖动了视频
          if (currentTime > 0 && Math.abs(currentTime - player._lastCurTime) > 2) {
            player._startPlayTime = $.now();
          }

          //如果是iphone或者8.1之前的winphone，隐藏播放模式选择列表
          if (vars.IsIphone || vars.IsOldWindowsPhone) {
            player.$midModeList.oriHide();
          }
          //更新播放时长
          player._lastCurTime = currentTime;

          //如果离播放事件还剩15秒之内，发送完成统计数据
          if (!player._sendEndFlag && currentTime > duration - 15) {
            Console.log('统计: ended');
            VideoTrace.ended(currentTime, this._bufferCount);
            player._sendEndFlag = true;
          }

          //2分钟发送心跳统计
          if (player._traceHeartInterval === null) {
            
            player._traceHeartInterval = setInterval(function () {
              Console.log('统计: heart');
              VideoTrace.heart(player.currentTime);
            }, 1000 * 60 * 2);
          }

          //变更标志位
          player._changeModeFlag = false;
          //更新拖拽状态
          player._dragRangeFlag = false;
          //更新首次加载请求标志位
          player._firstWaitingFlag = false;
          //广告播放结束
          player._mediaAdOverFlag = true;

          //iphone、安卓2.X mione、8.1前winphone播放时会调用系统播放器全屏
          if (vars.IsIphone || vars.IsOldWindowsPhone ||
              /Android\/?\s?2\../i.test(vars.UA) || vars.IsQQBrowser || vars.IsUCBrowser) {
            //显示播放按钮
            player._showPlayBtn();

          } else if (!vars.IsIphone) {
            //显示暂停按钮
            player._showPauseBtn();
          }

          //进度条宽度
          var playedPro = currentTime / duration * 100 + '%';
          //如果有播放时长限制，并且已经播放到最后
          if (currentTime >= duration && cache.timeLimit === duration) {
            currentTime = duration;
            playedPro = '100%';
            // _this.showMsgWidthBtn(svp.TYPE_CODE_MSG['SUPPORT']['101']);
            var freeTime = cache.timeLimit;
            var time = (freeTime - freeTime % 60) / 60;
            time = (freeTime % 60 === 0) ? time : (time + 1);
          }
          //更新时间
          if (currentTime > duration) {
            currentTime = duration;
          }

          player.$ctrlCurTime.html($.formatSeconds(currentTime));
          player.$ctrlDuration.html($.formatSeconds(duration));
          //如果当前描点没有处于拖拽状态，进行更新拖拽锚点位置
          if (!player._dragFlag) {
            player.$ctrlCurPlayedBar.css({width: playedPro});
          }

          //iphone下uc无法触发ended事件，这里通过监听当前播放时间来触发ended事件
          if (vars.IsUCBrowser && vars.IsIphone) {
            
            if (parseInt(currentTime, 10) === parseInt(duration, 10)) {
              player._fireEvent('ended');
            }
          }
        }
      }
    });
  };

  //拖拽进度条业务
  var dragService = function (player) {
    //时间锚点拖拽-开始
    player.$ctrlDragAnchor.on(vars.START_EVENT, function (e) {
      //停止隐藏控制界面的计时器
      clearTimeout(player._hideMainCtrlTime);
      //快进快退提示计时器
      clearTimeout(player._rewindForwardInterval);
      //显示快进快退提示
      player.$midRewindForwardCon.oriShow();
      //更新锚点拖动标志位
      player._dragFlag = true;
      //被拖拽（统计用）
      player._dragRangeFlag = true;
      //缓存触摸起始点的x坐标
      player._touchStratX = (e.touches && e.touches[0]) ? e.touches[0].pageX : e.pageX;
      
      return false;
    });

    //时间锚点拖拽-移动
    player.$ctrlDragAnchor.on(vars.MOVE_EVENT, function (e) {

      if (player._dragFlag) {
        //获取进度条总宽度
        var trackBarWidth = player.$ctrlTrackBar.width(),
        //获取视频总时长
            duration = player.duration,
        //当前播放时间
            currentTime = player.currentTime;
        //停止隐藏控制界面的计时器
        clearTimeout(player._hideMainCtrlTime);
        //快进快退提示计时器
        clearTimeout(player._rewindForwardInterval);
        //更新拖拽时间
        var moveTimeUpdate = function (moveTime, duration) {
          player.$mid.oriShow();

          if (currentTime > moveTime) {
            player.$midRewindForwardCon.addClass('rewind').removeClass('forward');

          } else {
            player.$midRewindForwardCon.addClass('forward').removeClass('rewind');
          }
          //缓存拖拽时间
          player._moveTime = moveTime;
          //更新内容,注:要先写内容，下面才能获取其准确宽度
          player.$midTime.html($.formatSeconds(moveTime));
          //更新拖拽锚点位置
          player.$ctrlCurPlayedBar.width((moveTime / duration) * 100 + '%');
        };

        //获取移动的距离并缓存
        player._touchMoveX =  (e.touches && e.touches[0]) ? e.touches[0].pageX : e.pageX;
        //计算出变化时间
        var changeTime = duration / trackBarWidth * (player._touchStratX -  player._touchMoveX) * -1;
        //计算出当前拖动的时间
        var moveTime = currentTime + changeTime;
        //拖动超出进度条最左边
        if (moveTime < 0) {
          moveTimeUpdate(0, duration);
        //拖动超出进度条最右边边
        } else if (moveTime > duration) {
          moveTimeUpdate(duration, duration);
        //正常范围内
        } else {
          moveTimeUpdate(moveTime, duration);
        }
      }
        
      return false;
    });

    //时间锚点拖拽-结束
    player.$ctrlDragAnchor.on(vars.END_EVENT + ' mouseout', function () {

      if (player._dragFlag) {
        //更新锚点拖动标志位
        player._dragFlag = false;
        //将视频跳至拖动时间点
        player.seekTo(player._moveTime);
        //重置卡顿计时
        player._startPlayTime = $.now();
        //隐藏快进快退界面
        player._rewindForwardInterval = setTimeout(function () {
          player.$midRewindForwardCon.oriHide();
        }, 2000);
        //如果没有任何操作，3秒后主操作界面隐藏
        player._hideMainCtrlTime = setTimeout(function () {
          player._hideMainCtrl();
        }, 3000);
      }

      return false;
    });
  };

  //点击进度条业务
  var clickService = function (player) {
    
    player.$ctrlBar.on(vars.END_EVENT, function () {
      
      return false;
    });

    player.$ctrlTrackBar.on(vars.START_EVENT, function (e) {
      var dom = $(this);
      var x = (e.touches && e.touches[0]) ? e.touches[0].pageX : e.pageX;
      var xDist = x - dom.offset().left;
      var width = dom.width();

      var clickTime = player.duration / width * xDist;
      //重置卡顿计时
      player._startPlayTime = $.now();
      //跳转到指定时间
      player.seekTo(clickTime);

      return false;
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 初始化播放器进度条业务 (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._initCtrlProgress = function () {
    //是否发送realvv标志位
    this._sendRealVVFlag = false;
    //vvend发送标志位
    this._sendEndFlag = false;
    //断点续播标志位
    this._playByHistoryFlag = false;
    //生成播放记录标志位
    this._makeHistoryFlag = false;
    //当前播放时间
    this._lastCurTime = 0;
    //起始时间，发送统计用
    this._startPlayTime = 0;
    //缓冲计数
    this._bufferCount = 0;
    //心跳统计计时器
    this._traceHeartInterval = null;
    //快进快退消失计时器
    this._rewindForwardInterval = null;
    //视频进度条是否处于拖拽状态标志位
    this._dragRangeFlag = false;
    //视频质量切换标志位
    this._changeModeFlag = false;
    //广告结束标志位,该标志位属于内部属性，不依赖于广告模块
    this._mediaAdOverFlag = false;
    //第一次加载等待标志位
    this._firstWaitingFlag = true;
     //时间锚点是否处于拖拽状态
    this._dragFlag = false;
    //触摸开始x坐标
    this._touchStratX = 0;
    //触摸移动x坐标
    this._touchMoveX = 0;
    //拖动时候的时间轴时间
    this._moveTime = -1;
    //绑定时间更新事件
    timeupdateService(this);
    //直播没有进度条
    if (this.config.mediaType === 'live') {
    
      return;
    }
    //拖拽进度条业务
    dragService(this);
    //点击进度条业务
    clickService(this);
  };
});
/**
 *
 *   @description: 该脚本用于播放器数据获取业务
 *
 *   @version    : 1.1.0
 *
 *   @create-date: 2015-03-01
 *
 *   @update-date: 2015-09-02
 *
 *   @update-log :
 *                 1.0.1 - 播放器数据获取业务
 *                 1.0.2 - 如果数据包含fee h5Limit mobileLimit ipLimit等字段并且为特殊值时，先进行版权认证
 *                 1.0.3 - 加入了防盗链信息业务
 *                 1.0.4 - 加入了防盗链处理标志位处理逻辑
 *                 1.1.0 - 修改了请求数据的业务流程和接口返回的数据结构
 *                         将模块player.errorTypes变更为base.errorTypes
 *
 */
svp.define('player.dataService', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var async = svp.async;
  var videoInfo = require('data.videoInfo');
  var liveInfo = require('data.liveInfo');
  var copyright = require('data.copyright');
  var errorTypes = require('base.errorTypes');
  var mySugar = require('data.mySugar');
  var Cookie = require('base.cookie');
  var util = require('base.util');
  var SugarTrace = require('trace.sugar');
  var appDownload = require('data.appDownload');

  //源数据处理
  var source = function (data, callback) {
    var videoData = {
      aid: data.aid || '',
      areaId: data.areaId || 6,
      cateCode: data.cateCode || '',
      channeled: data.channeled || '',
      cid: data.cid || '',
      durations: Object,
      hike: data.hike || '1',
      horHighPic: data.poster || '',
      hor_big_pic: data.poster || '',
      hor_high_pic: data.poster || '',
      plid: data.plid || '',
      sid: data.sid || '',
      site: data.site || 2,
      totalDuration: data.duration || '',
      tvid: data.tvid || '',
      tvname: data.title || '',
      urls: {
        downloadUrl: [data.src],
        m3u8: [],
        mp4: []
      },
      verHighPic: data.poster || '',
      ver_high_pic: data.poster || '',
      vid: data.vid || 'source',
      videoName: data.title || '',
      video_name: data.title || '',
      video_src: data.src || ''
    };

    var rst = {
      code: '200',
      msg: '',
      data: videoData
    };

    callback(rst);
  };

  //获取数据类型
  var getDataType = function (data) {
    //初始化为错误类型
    var rst = 'error';

    if (!$.isUndefined(data) && data !== null) {
      //videoData数据类型
      if (!$.isUndefined(data.vid) || !$.isUndefined(data.liveId)) {
        rst = 'videoData';
      //原始数据(无需走接口，直接播放源地址)
      } else if (!$.isUndefined(data.src)) {
        rst = 'source';
      }
    }

    return rst;
  };

  var dataService = {
    /**
    * @memberof dataService
    * @summary 根据数据特征自动调用直播或点播数据服务
    * @type  {function}
    * @param {object}   data                             - 视频数据
    * @param {function} callback                         - 回调方法
    * @param {object}   callback(rst)                    - 回调方法返回结果对象
    * @param {string}   callback(rst.code)               - 检验结果code码
    * @param {string}   callback(rst.msg)                - 检验结果说明
    * @param {object}   callback(rst.data)               - 数据对象
    * @param {object}   callback(rst.videoData)          - 视频数据对象
    * @param {object}   callback(rst.channelInfo)        - 频道数据对象
    */
    initData: function (data, callback) {
      var dataType = getDataType(data);

      //接口请求
      async.auto({
        //防盗链
        mySugar: function (cb) {
          
          if (dataType !== 'source') {
            var param = {};
            param.domain = document.domain;

            if (param.domain.indexOf('.com') > -1) {

              try {
                var arr = param.domain.split('.');
                var len = arr.length;
                param.domain = '.' + arr[len - 2] + '.' +  arr[len - 1];
              
              } catch (e) {
                param.domain = document.domain;
              }
            }
            param.vid = data.vid || data.liveId || '';
            param.uid = Cookie.get('SUV');
            param.pt = util.getUserPt();

            if (data.appid === 'test') {
              console.log('!!!!!!!!!!! test: ', data.appid)
              param.appid = data.appid;
            }
            //防盗链请求
            mySugar.getData(param, function (cbData) {
              SugarTrace.pv();
              cb(null, cbData);
            });
          //跳过防盗链处理，直接返回
          } else {
            cb(null, {code: '200', msg: '', data: null});
          }
        },
        //版权认证
        copyright: function (cb) {

          if (dataType !== 'source') {
            
            copyright.check(data, function (rst) {
              var result = {};
              result.code = rst.code || '';
              result.msg = rst.msg || '';
              result.data = data;
              cb(null, result);
            });
          
          } else {
            cb(null, {code: '200', msg: '', data: null});
          }
        },
        //视频数据
        videoData: ['mySugar', function (cb) {
          
          var cbFn = function (rst) {
            cb(null, rst);
          };

          if (!$.isUndefined(data.liveId)) {
            //获取播放地址等相关信息
            var param = {};
            param.liveId = data.liveId;
            param.appid = data.appid;

            liveInfo.getData(param, cbFn);
          //获取点播数据
          } else if (!$.isUndefined(data.vid)) {
            //获取播放地址等相关信息
            var param = {};
            param.vid = data.vid;
            param.site = data.site;
            param.appid = data.appid;

            videoInfo.getData(param, cbFn);
          //将源数据转换为videoData
          } else if (dataType === 'source') {
            source(data, cbFn);
          //非法数据类型
          } else {
            var rst = {};
            //接口请求参数错误
            rst.code = '402';
            rst.msg = errorTypes['REQUEST'][rst.code];
            cb(rst);
          }
        }],
        //频道信息
        channelInfo: function (cb) {

          appDownload.getChannelInfo(null, function (cbData) {
            var result = {};
            result.code = '200';
            result.msg = '';
            result.data = cbData;
            
            cb(null, result);
          });
        }

      }, function (err, results) {
        //获取结果
        var mySugarRst = results.mySugar,
            copyrightRst = results.copyright,
            channelInfoRst = results.channelInfo,
            videoDataRst = results.videoData;

        //防盗链请求错误
        if (mySugarRst.code !== '200') {
          mySugarRst.msg = errorTypes['COMMON']['500'] + mySugarRst.code;
          callback(mySugarRst);

          return;
        }

        //版权认证
        if (copyrightRst.code !== '200') {
          copyrightRst.msg = errorTypes['COMMON']['500'] + copyrightRst.code;
          callback(copyrightRst);

          return;
        }

        //频道信息
        if (channelInfoRst.code !== '200') {
          channelInfoRst.msg = errorTypes['COMMON']['500'] + channelInfoRst.code;
          callback(channelInfoRst);

          return;
        }

        //视频信息
        if (videoDataRst.code !== '200') {
          videoDataRst.msg = errorTypes['COMMON']['500'] + videoDataRst.code;
          callback(videoDataRst);

          return;
        }

        var videoData = videoDataRst.data;
        //扩展数据类型字段
        videoData.mediaDataType = dataType;

        var rst = {};
        rst.code = '200';
        rst.msg = '';
        rst.data = {
          videoData: videoData,
          channelInfo: channelInfoRst.data
        };
        //视频信息
        callback(rst);
      });
    }
  };

  module.exports = dataService;
});
/**
 *
 *   @description: 该文件为播放器实现事件方法
 *
 *   @version    : 1.0.5
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-08-25
 *
 *   @update-log :
 *                 1.0.1 - 为播放器实现事件方法
 *                 1.0.2 - 修改android下触发advended事件的判断方法
 *                         把三星note3的判断方法改为vars.IsSAMSUNGNote3
 *                         删除_fireEndedFlag标志位相关逻辑
 *                         修改了试看提示文案
 *                 1.0.3 - 将百度限制时长提示按钮改为立即下载
 *                 1.0.4 - 新增行为统计time_limit_download
 *                 1.0.5 - 将模块player.errorTypes变更为base.errorTypes
 *
 **/

svp.define('player.events', function (require, exports, module) {

  'use strict';

  var $ = svp.$;
  var MediaPlayer = require('player.mediaPlayer');
  var vars = require('base.vars');
  var special = require('base.special');
  var Console = require('base.console');
  var errorTypes = require('base.errorTypes');
  var ClickTrace = require('trace.click');
  var appDownload = require('data.appDownload');


  /**
   * @class MediaPlayer
   * @classdesc 播放器事件
   * @property {function}  on                              - 绑定播放器事件
   * @property {function}  off                             - 注销播放器事件
   * @property {function}  trigger                         - 触发播放器指定事件
   * @property {function}  one                             - 绑定播放器事件, 只触发一次后就注销
   * @property {function}  _addEvent                       - (播放器内部使用) 绑定播放器事件,添加到事件数组中
   * @property {function}  _removeEvent                    - (播放器内部使用) 注销播放器事件,从事件数组中删除
   * @property {function}  _fireEvent                      - (播放器内部使用) 触发指定播放器事件
   * @property {function}  _initEvent                      - (播放器内部使用) 初始化内部事件
   *
   * @example
   *   var FoxPlayer = require('player.foxPlayer');
   *   var player = new FoxPlayer(settings);
   *   player.on('timeupdate', function () {});
   *   player.on('ended', function () {});
   */
  
  /**
   * @memberof MediaPlayer.prototype
   * @summary 事件绑定
   * @type {function}
   * @param {string}   eventType                        - 事件名称(w3c标准播放器事件)
   * @param {function} fn                               - 事件触发后的回调函数
   */
  MediaPlayer.prototype.on = function (eventType, fn) {
    var _this = this;

    this._onDomLoaded(function () {

      if (eventType === 'ended' || eventType === 'onended') {
        
        _this.eventProcess.userEnded.push({
          name: 'ended',
          process: function () {
            fn.call(_this);
          }
        });
      
      } else {

        _this.$video.on(eventType, function (e) {
          
          fn.call(_this, e);
        });
      }
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 移除事件
   * @type {function}
   * @param {string}   eventType                        - 事件名称(w3c标准播放器事件)
   * @param {function} fn                               - 事件触发后的回调函数
   */
  MediaPlayer.prototype.off = function (eventType, fn) {
    var _this = this;

    this._onDomLoaded(function () {
      eventType = eventType.toLowerCase();
      _this.$video.off(eventType, fn);
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 触发事件
   * @type {function}
   * @param {string}   eventType                        - 事件名称(w3c标准播放器事件)
   */
  MediaPlayer.prototype.trigger = function (eventType) {
    var _this = this;

    this._onDomLoaded(function () {
      eventType = eventType.toLowerCase();
      _this.$video.trigger(eventType);
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 只触发一次
   * @type {function}
   * @param {string}   eventType                        - 事件名称(w3c标准播放器事件)
   * @param {function} fn                               - 事件触发后的回调函数
   */
  MediaPlayer.prototype.one = function (eventType, fn) {
    var _this = this;

    this._onDomLoaded(function () {
      eventType = eventType.toLowerCase();

      if (eventType === 'ended') {
        //在播最后一个视频的时候执行该事件
        this.$video.on(eventType, function () {

          if (_this.cache.curIndex === _this.cache.totCounts - 1) {
            _this.$video.one(eventType, function (e) {
              fn.call(_this, e);
            });
          }
        });

      } else {
        this.$video.one(eventType, function (e) {
          fn.call(_this, e);
        });
      }
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 为播放器添加事件处理 (播放器内部使用)
   * @type {function}
   * @param {string}   eventType                        - 事件名称(w3c标准播放器事件)
   * @param {string|function} param1                    - string: 给该事件添加别名(如果有删除removeEvent需求时用), 并且param2为对应的事件触发后回调方法
   *                                                    - function: 对应的事件触发后回调方法,如果该参数为function, param2则不填
   * @param {function} param2                           - param1为string时生效,对应的事件触发后回调方法
   * @example
   *      player.addEvent('timeupdate', fn);
   *      player.addEvent('timeupdate', 'myTimeupdate', fn);
   */
  MediaPlayer.prototype._addEvent = function (eventType, param1, param2) {
    var pro = this.eventProcess;
    var _this = this;

    // 转换成小写
    eventType = eventType.toLowerCase();

    if (!$.isUndefined(eventType) && !$.isUndefined(pro[eventType])) {
      var proObj = {};
      var isTimeupdateRepEnded = special.isAllowTimeupdateReplaceEnded() && (eventType === 'ended' || eventType === 'onended');
      //事件和处理方法
      if ($.isFunction(param1)) {
        
        if (isTimeupdateRepEnded) {
          eventType = 'timeupdate';
          proObj.process = function () {

            if (_this.videoTag.duration - _this.videoTag.currentTime < 0.5) {
              param1.call(_this);
            }
          };

        } else {

          proObj.process = function () {
            param1.call(_this);
          };
        }
        //自动为该处理事件生成一个属性名
        proObj.name = '_' + eventType + (new Date()).getTime();

        pro[eventType].push(proObj);
        //事件、处理方法名称和处理方法
      } else if ($.isString(param1) && $.isFunction(param2)) {

        if (isTimeupdateRepEnded) {
          proObj.process = function () {

            if (_this.videoTag.duration - _this.videoTag.currentTime < 0.5) {
              param2.call(_this);
            }
          };

        } else {
          proObj.process = function () {
            param2.call(_this);
          };
        }
        proObj.name = param1;
        

        pro[eventType].push(proObj);
      }
    }
  };

  //使用方式1: removeEvent('timeupdate'); //移除所有timeupdate事件处理
  //使用方式2: removeEvent('timeupdate', 'myTimeupdate'); //移除所有timeupdate事件中叫做myTimeupdate的相关处理
  /**
   * @memberof MediaPlayer.prototype
   * @summary 移除处理事件 (播放器内部使用)
   * @type {function}
   * @param {string}   eventType                        - 事件名称(w3c标准播放器事件)
   * @param {string}   param1                           - 可选参数，事件名称下的别名，如果该参数不填，则移除事件列表中的所有处理方法
   * @example
   *      player.addEvent('timeupdate');
   *      player.removeEvent('timeupdate', 'myTimeupdate');
   */
  MediaPlayer.prototype._removeEvent = function (eventType, param1) {
    var pro = this.eventProcess;

    if (!$.isUndefined(eventType) && !$.isUndefined(pro[eventType])) {
      //删除所有该事件处理方法
      if ($.isUndefined(param1)) {
        pro[eventType] = [];
        //删除指定事件下的指定处理方法
      } else if ($.isString(param1)) {

        $.each(pro[eventType], function (index, item) {

          if (item.name === param1) {
            pro[eventType].splice(index, 1);
          }
        });
      }
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 触发指定事件 (播放器内部使用)
   * @type {function}
   * @param {string}   eventType                        - 事件名称(w3c标准播放器事件)
   */
  MediaPlayer.prototype._fireEvent = function (eventType) {
    var pro = this.eventProcess,
        _this = this;

    if (!$.isUndefined(eventType) && !$.isUndefined(pro[eventType])) {

      $.each(pro[eventType], function (index, item) {

        item.process.call(_this);
      });
    }
  };

  //播放结束事件
  MediaPlayer.prototype._onBaseEnded = function () {
    var _this = this,
      cache = _this.cache;
    //播放起始时间更新
    this._startPlayTime = $.now();
    //缓冲次数重置
    this._bufferCount = 0;
    //如果是-1，说明是循环播放第一个子片，设置为0
    if (cache.curIndex === -1) {
      cache.curIndex = 0;
    }
    //百度浏览器中，直接修改cache的变量无效，下次触发ended事件还是原来的值，这里用window参数传值
    if (vars.IsBaiduBrowser || vars.IsBaiduBoxApp) {
      var srcList = cache.srcList[cache.modeType];
      var currentTime = 0;

      $.each(srcList, function (index, item) {

        currentTime += item.duration;

        if (index >= cache.curIndex) {

          return false;
        }
      });

      if (cache.timeLimit > 0) {

        if (currentTime >= cache.timeLimit && ($.isUndefined(_this.adv) || (!$.isUndefined(_this.adv) && player.adv.isMediaPlayed))) {
          _this.pause();
          _this.$video.remove();
          
          _this._showMsg({
            text: errorTypes['SUPPORT']['304'],
            btns: {
              btnA: {
                text: '立即下载',
                callback: function () {
                  Console.log('发送内部行为统计: time_limit_download');
                  ClickTrace.pingback(null, 'time_limit_download');
                  appDownload.gotoDownload();
                }
              }
            }
          });

          return;
        }
      }
    }
    var nextUrl = cache.getNextUrl();
    //继续播放后面的子片源
    if (nextUrl !== '') {
      //触发等待事件
      this.trigger('waiting');
      //修改cache中的信息
      cache.curPlayUrl = nextUrl;
      cache.curIndex++;
      this.setSrc(cache.curPlayUrl);
      //指定新地址，并播放
      setTimeout(function () {
        _this.videoTag.play();
      }, 100);
      //修改videoData中的属性，供统计用
      this.videoData.video_src = nextUrl;
    //已经播到该片源的最后
    } else {
      //如果是循环播放并且是非广告内容
      if (cache.loop && !cache.isMediaAdContent) {
        //触发等待事件
        this.trigger('waiting');
        var firstUrl = cache.getFirstUrl();
        //指定新地址，并播放
        this.setSrc(firstUrl);
        this.play();
        //修改cache中的信息
        cache.curPlayUrl = firstUrl;
        //如果是循环播放，设置器curIndex为-1
        cache.curIndex = -1;
        //修改videoData中的属性，供统计用
        this.videoData.video_src = firstUrl;
      //已经播放到最后，并不进行循环播放
      } else {
        //修改cache中的信息
        cache.curPlayUrl = nextUrl;
      }
      //广告播放结束
      if (!$.isUndefined(this.adv) && !this.adv.isMediaPlayed && vars.IsAndroid) {
        this.trigger('advended');
      //触发用户自定义结束事件
      } else {

        $.each(this.eventProcess.userEnded, function (index, item) {
          item.process();
        });
      }
    }
    //置空缓存预加载对象
    this._nextPreLoadImg = null;
  };

  //键盘事件
  MediaPlayer.prototype._onKeyDown = function (e, player) {
    var keyCode = e.keyCode || e.which || e.charCode;

    var volume = function (val) {
      var vol = player.getVolume();
      vol += val;
      player.setVolume(vol);
    };

    if (!$.isUndefined(keyCode)) {

      switch (keyCode) {
        //up 音量加
        case 38:
          volume(0.1);
          break;
        //down 音量减
        case 40:
          volume(-0.1);
          break;
        //left
        case 37:
          player.seekTo(player.currentTime - 10);
          break;
        //right
        case 39:
          player.seekTo(player.currentTime + 10);
          break;
      }
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 初始化内部事件 (播放器内部使用)
   * @type {function}
   * @param {string}   eventType                        - 事件名称(w3c标准播放器事件)
   */
  MediaPlayer.prototype._initEvent = function () {
    var _this = this;
    var pro = this.eventProcess;

    if (this.$video && this.$video.length > 0) {
      //绑定事件
      $.each(_this.eventList, function (index, item) {
        //note3时候不绑定ended事件
        if ($.isArray(pro[item]) && ((vars.IsSAMSUNGNote3 && item !== 'ended') || !vars.IsSAMSUNGNote3)) {

          _this.$video.on(item, function (e) {

            if ($(_this.$video, _this.$main).length > 0) {
              
              $.each(pro[item], function (eIndex, eItem) {
                eItem.process.call(_this, e);
              });
            }
          });
        }
      });
    }
    //添加ended事件
    this._addEvent('ended', this._onBaseEnded);
    //绑定键盘事件
    $('body').on('keydown', function (e) {
      _this._onKeyDown(e, _this);
    });
  };

});

/**
 *
 *   @description: 该文件用于播放器出错处理
 *
 *   @version    : 1.0.4
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-08-25
 *
 *   @update-log :
 *                 1.0.1 - 播放器出错处理
 *                 1.0.2 - 加入了对无效视频地址的错误处理
 *                 1.0.3 - 加入了ios下error.code为3时候的处理
 *                         新增内部处错误里_error:mysugarurl事件
 *                 1.0.4 - 将模块player.errorTypes变更为base.errorTypes
 *
 */
svp.define('player.exception', function (require, exports, module) {

  'use strict';

  var $ = svp.$;
  var MediaPlayer = require('player.mediaPlayer');
  var vars = require('base.vars');
  var ClickTrace = require('trace.click');
  var util = require('base.util');
  var errorTypes = require('base.errorTypes');
  var appDownload = require('data.appDownload');

  /**
  * @class MediaPlayer
  * @classdesc 播放器出错处理业务
  * @property {function}  _initException                  - (播放器内部使用) 初始化播放器错误处理业务
  * @property {function}  _sendException                  - (播放器内部使用) 发送播放出错统计
  */

  /**
   * @memberof MediaPlayer.prototype
   * @summary 发送播放出错统计 (播放器内部使用)
   * @type {function}
   */
  MediaPlayer.prototype._sendException = function (option) {
    //发送行为统计点
    ClickTrace.pingback(null, 'foxplayer', option);
  };

  var errorProcess = {};

  //播放下一视频/分片
  errorProcess.nextVideo = function (player) {
    var cache = player.cache;

    player._sendException({});
    //如果是m3u8视频源，直接播放下一视频
    if (vars.IsIOS) {
      player.trigger('ended');
    //如果是mp4,播放下一个分片
    } else if (vars.IsAndroid) {
      //播放下一条片源(可能是正片也可能是广告)
      if (cache.curIndex < cache.totCounts) {
        //暂停当前片源
        player.pause();
        //显示loading图
        player._showLoading();
        //修改当前播放的广告url
        player.cache.curPlayUrl = player.cache.getNextUrl();
        //修改地址
        player.setSrc(player.cache.curPlayUrl);
        //修改播放索引
        cache.curIndex++;
        //播放
        player.play();
      //最后一条分片
      } else {
        //如果是广告
        if (!$.isUndefined(player.adv) && player.adv.isMediaPlayed) {
          //跳过最后一条广告，直接播正片
          player.adv.gotoEnd();
        //如果是正片
        } else {
          player.trigger('ended');
        }
      }
    }
  };

  //无效地址
  errorProcess.invalidUrl = function (player) {
    // alert(player.cache.curPlayUrl)
    player._showMsg({
      text: errorTypes['SUPPORT']['306'],
      btns: {
        btnA: {
          text: '下载搜狐视频客户端',
          callback: function () {
            appDownload.gotoDownload();
          }
        }
      }
    });
  };

  //播放出错处理
  var errorService = function (player) {
    var error = player.videoTag.error;

    if (error !== null) {
      
      if (error.code === 4 || vars.IsIOS && error.code === 3) {
        //无效地址
        errorProcess.invalidUrl(player);
      
      } else {

        //屏蔽pc模拟手机ua时，不支持m3u8格式的错误
        if (/Win32|Win64|Windows|Mac68K|MacPC|Macintosh|MacIntel/i.test(window.navigator.platform)) {

          return false;
        }

        //2g3g出问题时不做处理
        if (/2g|3g/i.test(util.getConnectionType())) {

          return false;
        }
        //播放下一视频/分片
        errorProcess.nextVideo(player);
      }
    }
  };

  //播放器报错
  var onError = function (player) {

    //播放出错
    player._addEvent('error', function (e) {
      errorService(player);
    });

    //自定义无效视频频(无防盗链信息)链接事件
    player.on('_error:mysugarurl', function () {
      errorProcess.invalidUrl(player);
    });
  };

  //播放器出错中断
  var onAbort = function (player) {

    // player.on('abort', function () {
      
    //   // if (player.videoTag.error)
    // });
  };

  /**
  * @memberof MediaPlayer.prototype
  * @summary 初始化播放器错误处理业务 (播放器内部使用)
  * @type {function}
  */
  MediaPlayer.prototype._initException = function () {
    //播放器报错处理
    onError(this);
    //播放器中断
    onAbort(this);
  };
});
/**
 *
 *   @description: 该文件用于flash播放器生成业务
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-02-01
 *
 *   @update-date: 2015-08-25
 *
 *   @update-log :
 *                 1.0.1 - flash播放器生成业务
 *                 1.0.2 - 将模块player.errorTypes变更为base.errorTypes
 *
 **/
svp.define('player.flash', function(require, exports, module) {
  var $ = svp.$;
  var vars = require('base.vars');
  var Console = require('base.console');
  var MediaPlayer = require('player.mediaPlayer');
  var settings = require('player.settings');
  var special = require('base.special');
  var VideoTrace = require('trace.video');
  var errorTypes = require('base.errorTypes');
  var Cookie = require('base.cookie');
  var Trace = require('trace');
  var TraceVideo = require('trace.video');
  var VideoClick = require('trace.click');
  var dataService = require('player.dataService');
  var IsIE = vars.IsIEBrowser;

  /**
   * @memberof MediaPlayer.prototype
   * @summary 初始化方法
   * @type {function}
   * @param {object}   config                              - 播放器配置参数
   */
  MediaPlayer.prototype._init = function(config) {
    //广告初始化标志位
    this._initAdvFlag = false;
    //隐藏主控界面计时器
    this._hideMainCtrlTime = null;
    //第一次加载
    this._firstLoadFlag = true;
    //数据请求超时时间
    this._dataTimeout = 3000;
    //合并配置参数
    this.config = settings.initConfig(config);

    var localFlashData = {};

    var data = this.config.data || {};

    if ($.isArray(data.videoDataList) && data.videoDataList.length > 0) {
      localFlashData = data.videoDataList[0];

    } else if ($.isArray(data.vidList) && data.vidList.length > 0) {
      localFlashData = {
        vid: data.vidList[0],
        site: data.site || '1'
      };

    } else {
      localFlashData = data;
    }
    this.localFlashData = localFlashData;

    if (!!this.config.share) {
      this.config.share = true;
    
    } else {
      this.config.share = false;
    }
    this.vrsPlayer = null;
    this.swfObj = null;
    this.flashEmbed = '';
    this.pluginsvars = '';
    Console.log(this.config);
  };


  /**
   * @memberof MediaPlayer.prototype
   * @summary 添加播放器
   * @type {function}
   * @param {object}   dom                                 - 要添加播放器的dom节点
   */
  MediaPlayer.prototype.htmlTo = function (dom) {
    dom = $(dom);
    var _this = this;
    //缓存容器dom
    this.$parentDom = dom || $('.sohu_player'); //warp player 
    //缓存player对象
    this.$player = $('#' + this.config.mainId);

    this._getDataFlag = false;
    //获取视频数据
    dataService.video(this.localFlashData, function(cbData) { 
      
      if (cbData.code === '200' && !$.isUndefined(cbData.data)) {
        _this.localFlashData = cbData.data;
      
      } else {
        //数据无效
        Console.log('数据无效');
      }
    });

    var fp = _this.MakeFlashPlayer(_this.config.share, _this.localFlashData);

    window.swfGotoNewPage = function () {
        // empty go
    };
    
    return _this;
  };

  //callback trace
  window.Trace.flashOnPlay = function () {
    Console.log('flash onplay');
  };

  window.Trace.flashOnPlayed = function () {
    Console.log('flash onPlayed');
  };

  window.Trace.flashOnStop = function () {
    Console.log('flash onstop');
  };

  window.Trace.flashOnPause = function () {
    Console.log('flash onPause');
  };

  MediaPlayer.prototype.MakeFlashVideoVars = function (opts, videoData) {
    var _this = this;
    var pluginsvars = '&imgCutBtn=1&showRecommend=1&autoplay=true&sogouBtn=0&shareBtn=1&topBarFull=0&datashare=0&topBar=0&topBarNor=0&skin=0&skinNum=1&topBarFull=0&downloadBtn=1&domain=inner&oad=&ead=&pad=&showTipHistory=0&seekTo=0&jump=0&isWriteComm=0';
    
    try {
      var site = (videoData['site'] || '1');
      var cid = (videoData['cid'] || '');
      if ('9001' == cid || '2' == site) {
          pluginsvars = pluginsvars + '&id=' + (videoData['vid'] || '');
      } else {
          pluginsvars = pluginsvars + '&vid=' + (videoData['vid'] || '');
      }
      pluginsvars = pluginsvars + '&pageurl=' + encodeURI(location.href);
      pluginsvars = pluginsvars + '&nid=' + (videoData['nid'] || '');
      pluginsvars = pluginsvars + '&sid=' + ('sid', Cookie.get('SUV') || videoData['sid'] || '');
      pluginsvars = pluginsvars + '&api_key=' + vars.API_KEY;
      //pluginsvars = pluginsvars + '&onplay=Trace.flashOnPlay'; 
      _this.pluginsvars = pluginsvars;
    
    } catch (e) {}

    return pluginsvars;
  };

  MediaPlayer.prototype.getFlashVersion = function () {
    var _this = this;
    var flashObj, flashVersion = 0;
    
    if (IsIE) {
      flashObj = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      
      if (flashObj) {
        flashVersion = parseInt(flashObj['GetVariable']('$version').split(' ')[1].split(',')[0], 10);
      }
    
    } else {
      var plugins = window['navigator']['plugins'];
      
      if (plugins && plugins.length > 0) {
        flashObj = plugins['Shockwave Flash'];
        
        if (flashObj) {
          var descs = flashObj['description'].split(' ');
          
          for (var i = 0, l = descs.length; i < l; i++) {
            var _version = parseInt(descs[i], 10);
            
            if (!isNaN(_version)) {
              flashVersion = _version;

              break;
            }
          }
        }
      }
    }

    return flashVersion;
  };

  //直接生成html,  这个快些
  MediaPlayer.prototype.MakeFlashPlayer = function (opts, videoData) {
    var _this = this;
    var flashVersion = _this.getFlashVersion();
    var flashEmbed = '';
    var vid = videoData.vid || opts.vid;
    var isSwfObj = (flashVersion && vid);
    //isSwfObj = true; //test
    if (isSwfObj) {
      
      try {
         // svp.seajs.jsLoader('http://js.tv.itc.cn/base/plugin/swfobject_97e55f.js', function() {
         //     Console.log('SWFObject', SWFObject);
         // }); //test
        var a = TraceVideo.vv();
        _this.vrsPlayer = 'http://tv.sohu.com/upload/swf/20150701/Main.swf';

        var flashParams = {
          'pluginspage': 'http://www.adobe.com/go/getflashplayer',
          'type': 'application/x-shockwave-flash',
          'width': '100%',
          'height': '100%',
          'allowfullscreen': 'true',
          'allowscriptaccess': 'always',
          'wmode': 'Opaque',
          'quality': 'high',
          'shareBtn': '0',
          'skinNum': '1',
          'api_key': vars.API_KEY,
          'src': _this.vrsPlayer
        };

        var pluginsvars = _this.MakeFlashVideoVars(opts, videoData);
        var html = [];
        
        if (IsIE) {
          html.push('<object width="100%" height="100%" >');
        }
        html.push('<embed id="sohuplayer"');
        
        for (var flashKey in flashParams) {
          html.push(' ' + flashKey + '="' + flashParams[flashKey] + '"');
        }
        html.push(' flashvars="' + pluginsvars + '" ');
        html.push('></embed>');

        if (IsIE) {
          html.push('</object>');
        }
        flashEmbed = html.join('');
        Console.log('@@@@ makeFlashHtml flashEmbed ', flashEmbed);
        _this.flashEmbed = flashEmbed;
        _this.$parentDom.addClass('sohuplayer');
        $(_this.$parentDom).html(flashEmbed);
        TraceVideo.realVV();

      } catch (e) {
        Console.log(e);
      }

      return true;
    }

    return false;
  };

   //慢，ie有问题 ,old不推荐使用
  MediaPlayer.prototype.MakeFlashSwfObjPlayer = function (opts, videoData) {
    var _this = this;
    var flashVersion = _this.getFlashVersion();
    var flashEmbed = '';
    var vid = videoData.vid || opts.vid;
    var isSwfObj = (flashVersion && vid);
    // isSwfObj = true; 
    if (isSwfObj) {  
      svp.seajs.jsLoader('http://js.tv.itc.cn/base/plugin/swfobject_bd516f.js', function() {
        var flashPlayer;
        var vrsPlayer = 'http://tv.sohu.com/upload/swf/20150701/Main.swf';
        // ugc 
        if ('9001' == videoData['cid'] || '2' == videoData['site']) {
            vrsPlayer = vrsPlayer+ '?id=' + vid + '&imgCutBtn=1&showRecommend=1&autoplay=true&sogouBtn=0&shareBtn=1&topBarFull=0&datashare=0&topBar=0&topBarNor=0&skin=0&skinNum=1&topBarFull=0&downloadBtn=1&domain=inner&oad=&ead=&pad=&showTipHistory=0&seekTo=0&jump=0&isWriteComm=0&api_key=' + vars.API_KEY;
            flashPlayer = new SWFObject(vrsPlayer, 'sohuplayer', '100%', '100%', '9,0,115', '#000000');
        // tv
        } else {
          flashPlayer = new SWFObject(vrsPlayer, 'sohuplayer', '100%', '100%', '9,0,115', '#000000');
          flashPlayer['addVariable']('skinNum', '1');
          flashPlayer['addVariable']('pageurl', location.href);
          flashPlayer['addVariable']('vid', (videoData['vid']||''));
          flashPlayer['addVariable']('pid', (videoData['pid']||''));
          flashPlayer['addVariable']('nid', '');
          flashPlayer['addVariable']('seekTo', '0');
          flashPlayer['addVariable']('jump', '0');
          flashPlayer['addVariable']('autoplay', 'true');
          flashPlayer['addVariable']('showRecommend', '0'); 
          flashPlayer['addVariable']('sid', Cookie.get('SUV') || ( videoData['sid']||'') );
          flashPlayer['addVariable']('api_key', vars.API_KEY);
        }
        flashPlayer['addParam']('wmode', 'Opaque');
        flashPlayer['addParam']('quality', 'high');
        flashPlayer['addParam']('allowscriptaccess', 'always');
        flashPlayer['addParam']('allowfullscreen', 'true');
        flashPlayer['addParam']('width', '100%');
        flashPlayer['addParam']('height', '100%'); 
        flashEmbed = flashPlayer['getFlashHtml']();
        _this.swfObj = flashPlayer;
        Console.log('@@@@ MakeFlashSwfObjPlayer flashEmbed ', flashEmbed);
        _this.flashEmbed = flashEmbed;
         Console.log(_this.swfObj);
        _this.$parentDom.addClass('sohuplayer');
        $(_this.$parentDom).html(flashEmbed);
        TraceVideo.realVV();
      });

      return true; 
    }

    return false;
  };

  module.exports = MediaPlayer;
});
/**
 *
 *   @description: 该文件用于定义整体播放器
 *
 *   @version    : 1.1.3
 *
 *   @create-date: 2015-03-30
 *
 *   @update-date: 2015-09-21
 *
 *   @update-log :
 *                 1.0.1 - 整体播放器
 *                 1.0.1 - 整体播放器
 *                 1.0.2 - 把_sendVVFlag从ctrlProgress.js移到该文件中
 *                         修改vv发送逻辑，baidu，iosuc，iosqq play()时候直接发,其他播放器在timeupdate触发时候发送vv
 *                         _firstLoadFlag标志位放在_playOrPause方法中修改
 *                         新增_sendPlayDisplayCompleteFlag标志位
 *                 1.0.3 - _playOrPause方法中 如果是QQ或者UC显示video tag,之前是并且非自动播放才显示(有问题导致黑屏)
 *                 1.0.4 - 热点频道ios qq切换视频不能自动播放，增加延迟播放
 *                 1.0.5 - 修正htmlTo方法bug
 *                 1.0.6 - 修复ios播放bug
 *                 1.0.7 - 修复了逻辑中player替代this的bug
 *                 1.0.8 - 修复了播放器有时始终加载的bug
 *                 1.0.9 - 把超时请求时间改为6秒
 *                 1.1.0 - 新增_sendMySugarFlag标志位
 *                 1.1.1 - 将播放器超时时间改为4秒
 *                 1.1.2 - 修复了vivo手机无法播放的bug
 *                 1.1.3 - 修复直播-qq播放器点击第一次播放按钮无法播放的bug
 *
 **/

svp.define('player.foxPlayer', function (require, exports, module) {

  'use strict';

  //播放器事件
  require('player.events');
  //广告扩展
  require('player.adv');
  //播放器主控界面
  require('player.controls');
  //播放器更新
  require('player.update');
  //播放器更新
  require('player.poster');
  //信息提示
  require('player.message');
  //多视频数据处理业务
  require('player.videoList');
  //合作方业务
  require('player.cooperation');
  //播放器出错处理
  require('player.exception');
  //相关推荐业务
  require('player.showRecommend');

  var $ = svp.$;
  var vars = require('base.vars');
  var Console = require('base.console');
  var MediaPlayer = require('player.mediaPlayer');
  var html5UI = require('player.html5UI');
  var settings = require('player.settings');
  var VideoTrace = require('trace.video');
  var errorTypes = require('base.errorTypes');

  /**
   * @memberof MediaPlayer.prototype
   * @summary 初始化方法
   * @type {function}
   * @param {object}   config                              - 播放器配置参数
   */
  MediaPlayer.prototype._init = function (config) {
    //广告初始化标志位
    this._initAdvFlag = false;
    //隐藏主控界面计时器
    this._hideMainCtrlTime = null;
    //第一次加载
    this._firstLoadFlag = true;
    //数据请求超时时间
    this._dataTimeout = 4000;
    //是否需要限制相关推荐标志位
    this._showRecommendFlag = false;
    //是否发送vv标志位
    this._sendVVFlag = false;
    //合并配置参数
    this.config = settings.initConfig(config);
    //发送play_display_complete标志位
    this._sendPlayDisplayCompleteFlag = false;
    //是否已经执行防盗链请求
    this._sendMySugarFlag = false;
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 添加播放器
   * @type {function}
   * @param {object}   dom                                 - 要添加播放器的dom节点
   */
  MediaPlayer.prototype.htmlTo = function (dom) {
    dom = $(dom);

    if (dom.length > 0) {
      var _this = this;
      //缓存容器dom
      this.$parentDom = dom;
      //首次添加
      if ($.isUndefined(this.$player)) {
        svp.debug.playerLoadDomStartTime = Date.now();
        //添加背景loading图
        dom.html(html5UI.makeLoadingTmpl(this.config));
        Console.log('加载loading完成, 耗时--->' + (Date.now() - svp.debug.playerLoadDomStartTime) / 1000);
        //缓存player对象
        this.$player = $('#' + this.config.mainId);
        //缓存loading图对象
        this.$playerLoading = $('#' + this.config.mainId + ' .svp_player_loading');
        //重置标志位
        this._getDataFlag = false;

        var data = this.config.data;

        if (!$.isUndefined(data)) {
          //单视频处理,将单视频加工为一个只有videoData的数组
          if ($.isUndefined(data.vidList) && $.isUndefined(data.videoDataList)) {
            var tempData = {
              videoDataList: [data]
            };
            this.videoList = this._videoList(tempData);
            //更新视频
            this.updateMedia(data);
          //视频列表数据处理
          } else {
            var videoList = this.videoList = this._videoList(data);
            var curData;

            try {
              //vidList处理
              if (videoList.type === 'vidList') {
                curData = {
                  vid: videoList.vidList[videoList.curIndex],
                  site: videoList.site
                };
              //videoDataList处理
              } else {
                curData = videoList.videoDataList[videoList.curIndex];
              }

            } catch (e) {
              //数据错误
              _this._showMsg({text: errorTypes['PROCESS']['204']});
            }
            this.updateMedia(curData);
          }
          
        //数据无效
        } else {
          _this._showMsg({text: errorTypes['PROCESS']['202']});
        }
        
      //如果页面已经存在播放器，则移动播放器到指定dom中
      } else {
        this.$parentDom.html(this.$main);

        if (this.cache.autoplay) {
          this._playOrPause('play');
        }
      }
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 初始化dom节点
   * @type {function}
   */
  MediaPlayer.prototype._initDoms = function () {
    var mainId = '#' + this.config.mainId;
    //外围容器节点
    this.$main = $(mainId);
    //loading图
    this.$loading = $(mainId + ' .svp_player_loading');
    //loading说明
    this.$loadingDesc = $(mainId + ' .svp_player_loading_notice');
    //video标签$对象
    this.$video = $(mainId + ' #' + this.config.elemId);
    //video标签
    this.videoTag = $(mainId + ' #' + this.config.elemId)[0];
    //顶部通栏title标题容器节点
    this.$titleCon = $(mainId + ' .svp_title');
    //通栏标题内容节点
    this.$title = $(mainId + ' .svp_title_content');
    //海报容器
    this.$posterCon = $(mainId + ' .svp_poster');
    //右海报图
    this.$posterRight = $(mainId + ' .svp_poster_right');
    //广告倒计时
    this.$posterAdTime = $(mainId + ' .svp_poster_ad_time');
    //中间播放按钮容器
    this.$mid = $(mainId + ' .svp_mid');
    //中间播放按钮
    this.$midPlay = $(mainId + ' .svp_mid_play');
    //中间快进快退容器
    this.$midRewindForwardCon = $(mainId + ' .svp_mid_rewind_forward');
    //中间快进快退时间
    this.$midTime = $(mainId + ' .svp_mid_time');
    //中间靠右测播放模式选择容器
    this.$midModeListCon = $(mainId + ' .svp_mid_mode');
    //当前选中播放类型按钮
    this.$mideCurModeBtn = $(mainId + ' .svp_mid_cur_mode_btn');
    //当前选中的播放模型
    this.$midCurMode = $(mainId + ' .svp_mid_cur_mode');
    //除了当前选中模式之外的所有可选模式列表
    this.$midModeList = $(mainId + ' .svp_mid_mod_list');
    //除了当前选中模式之外的所有可选模式列表
    this.$midModeLi = $(mainId + ' .svp_mid_mod_list li');
    //控制界面容器
    this.$ctrlCon = $(mainId + ' .svp_ctrl');
    //视频控制条
    this.$ctrlBar = $(mainId + ' .svp_ctrl_bar');
    //视频控制条-播放按钮
    this.$ctrlPlay = $(mainId + ' .svp_ctrl_play');
    //视频控制条-暂停按钮
    this.$ctrlPause = $(mainId + ' .svp_ctrl_pause');
    //视频控制条-缓冲进度
    this.$ctrlBuffer = $(mainId + ' .svp_ctrl_buffer');
    //视频控制条-打点容器
    this.$ctrlPointsCon = $(mainId + ' .svp_ctrl_points');
    //视频控制条-当前播放进度条
    this.$ctrlCurPlayedBar = $(mainId + ' .svp_ctrl_played_bar');
    //视频控制条-时间显示区域
    this.$ctrlTime = $(mainId + ' .svp_ctrl_time');
    //视频控制条-当前播放时间显示
    this.$ctrlCurTime = $(mainId + ' .svp_ctrl_cur_time');
    //视频控制条-总时长显示
    this.$ctrlDuration = $(mainId + ' .svp_ctrl_duration');
    //拖拽锚点
    this.$ctrlDragAnchor = $(mainId + ' .svp_ctrl_drag_anchor');
    //整体进度条
    this.$ctrlTrackBar = $(mainId + ' .svp_ctrl_track_bar');
    //全屏缩屏容器
    this.$ctrlScreen = $(mainId + ' .svp_ctrl_screen');
    //全屏
    this.$ctrlFullScreen = $(mainId + ' .svp_ctrl_full_screen');
    //缩屏
    this.$ctrlShrinkScreen = $(mainId + ' .svp_ctrl_shrink_screen');
    //遮罩层
    this.$maskLayer = $(mainId + ' .svp_mask_layer');
    //暂停广告容器
    this.$pauseAdCon = $(mainId + ' .svp_ad_pause');
    //暂停广告关闭按钮
    this.$pauseAdCloseBtn = $(mainId + ' .svp_ad_pause_close');
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 播放/暂停按钮点击事件
   * @type {function}
   * @param {object}   type                                - 操作类型play/pause
   */
  MediaPlayer.prototype._playOrPause = function (type) {
    var _this = this;
    svp.debug.playerPlayStartTime = Date.now();
    //清除消失动画计时器
    clearTimeout(this._hideMainCtrlTime);
    //显示主界面
    if (type === 'pause') {
      //暂停
      this._pause();

      if (vars.IsNewWindowsPhone) {
        //8.1之后的winphone需要延迟显示，否徐需要点击2次暂停按钮才能显示playbtn
        setTimeout(function () {
          //显示播放按钮
          _this._showPlayBtn();
        }, 300);
        
      } else {
        //显示播放按钮
        this._showPlayBtn();
      }
      //显示标题、控制条
      this._showMainCtrl();

    } else {
      //如果还没初始化广告对象
      if (!this._initAdvFlag) {
        //广告及播放器相关参数初始化
        this.adInit();
        //修改标志位
        this._initAdvFlag = true;
      }

      //需要更新广告
      if (this.adv && this._adUpdateFlag) {

        this.adv.updateAdv(this);
        //修改标志位
        this._adUpdateFlag = false;
      }

      //如果是baidu、iosQQ、iosUC点击播放直接发送统计vv，这几类播放器timeupdate无法正常触发timeupdate事件
      if (!this._sendVVFlag && (vars.IsBaiduBrowser || vars.IsBaiduBoxApp || (vars.IsIOS && (vars.IsQQBrowser || vars.IsUCBrowser)))) {
        //加载播放器完成发送统计vv
        Console.log('统计: vv');
        VideoTrace.vv();
        this._sendVVFlag = true;
      }

      //ios 的qq uc浏览器无法捕获事件，这里直接发送realvv
      if (!this._sendRealVVFlag && ((/QQBrowser\/5\./i.test(vars.UA) || vars.IsUCBrowser) && vars.IsIOS || ($.isUndefined(this.adv) || this.adv.isMediaPlayed) && vars.IsBaiduBoxApp)) {
        Console.log('统计: reallvv');
        VideoTrace.realVV(this._startPlayTime);
        this._sendRealVVFlag = true;
        //为合作方添加属性
        this.$video.attr('data-adover', 'true');
        //播放属性
        this._cooperatorVideoAttr();
      }

      if (vars.IsUCBrowser || vars.IsQQBrowser) {
        this.$video.oriShow();
      }

      //播放
      if ((/UCBrowser\/9\./i.test(vars.UA) || vars.IsSonyPhone || vars.IsUCBrowser) && vars.IsAndroid) {
        
        setTimeout(function () {
          _this._play();
        }, 50);
      //window phone需要延迟300毫秒以上才能拉起播放器
      } else if (vars.IsWindowsPhone) {

        setTimeout(function () {
          _this._play();
        }, 300);
        //热点频道ios qq切换视频不能自动播放，增加延迟播放
      } else if (!this._firstLoadFlag && vars.IsIOS && vars.IsQQBrowser && this.config.mediaType !== 'live'){
        
        setTimeout(function(){
          _this._play();
        }, 50);
        
      } else {

        this._play();
      }

      //记录播放时间戳
      this._startPlayTime = $.now();

      //如果没有任何操作，3秒后主操作界面隐藏
      this._hideMainCtrlTime = setTimeout(function () {
        _this._hideMainCtrl();
      }, 3000);

      //第一次加载时候不显示loading图
      if (this._firstLoadFlag) {

        if (!vars.IsIphone && !vars.IsBaiduBrowser && this.cache.autoplay) {
          this.$midPlay.oriShow();
          this._showPlayBtn();
          this.showPoster();
        }
        //修改标志位
        this._firstLoadFlag = false;

      } else {
        //百度浏览器不支持timeupdate事件,所以showloading后无法消失
        if (!vars.IsBaiduBrowser) {
          //显示loading图
          this._showLoading();
        
        } else {
          //隐藏loading图
          this._hideLoading();
        }
      }
      
      if (vars.IsIphone || vars.IsOldWindowsPhone || vars.IsQQBrowser || vars.IsBaiduBrowser) {
        this._showMidPlayBtn();
      }

      if (vars.IsIphone && (vars.IsUCBrowser || vars.IsQQBrowser)) {
        this._hideMidPlayBtn();
        this._showMainCtrl();
      }
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 自动播放下一个片源
   * @type {function}
   * @param {object}   type                                - 操作类型play/pause
   */
  MediaPlayer.prototype._autoNextVideoService = function () {
    var _this = this;

    if (_this.config.isShowRecommend) {
      _this._showRecommendFlag = true;
      //继续播放下一个片源
      this.on('ended', function () {

        setTimeout(function () {

          if (_this._showRecommendFlag) {
            Console.log('显示相关推荐')
            var videoList = _this.videoList;
            var curIndex = videoList.curIndex;
            var nextVideo = null;
            //获取下一个需要播放的视频源
            if (videoList.type === 'vidList' && curIndex < videoList.vidList.length - 1) {
              videoList.curIndex++;

              nextVideo = {
                vid: videoList.vidList[videoList.curIndex],
                site: videoList.site
              };

            } else if (videoList.type === 'videoDataList' && curIndex < videoList.videoDataList.length - 1) {
              videoList.curIndex++;
              nextVideo = videoList.videoDataList[videoList.curIndex];
            }
            Console.log('nextVideo' + nextVideo);
            //播放下一条视频
            if (nextVideo !== null) {
              _this.updateMedia(nextVideo, true);
            //显示推荐列表
            } else {
              Console.log('showRecommend 11');
              _this.showRecommend();
            }
          }
        }, 800);
      });
    }
  };
  module.exports = MediaPlayer;
});
/**
 *
 *   @description: 该文件用于播放器模板管理
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-02-01
 *
 *   @update-date: 2015-09-02
 *
 *   @update-log :
 *                 1.0.1 - 播放器模板管理
 *                 1.0.2 - 加入了系统播放器样式
 *                         修复poster图路径bug
 *
 **/

svp.define('player.html5UI', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var template = svp.template;
  var vars = require('base.vars');
  var special = require('base.special');
  var settings = require('player.settings');
  
  /**
   * @module player/template
   * @namespace template
   * @property {function} makeVideoTmpl                    - 生成播放器整体模板
   * @property {function} makeLoadingTmpl                  - 播放器加载完成前的loading
   *
   * @example
   *   var html5UI = require('player.html5UI');
   *   var html = html5UI.makeVideoTmpl(cache);
   */
  var html5UI = {};

  var tmpl = {
    param: {},
    model: {},
    view: {},
    ctrl: {}
  };

  var p = tmpl.param,
      m = tmpl.model,
      v = tmpl.view,
      c = tmpl.ctrl;

  //数据处理
  m.parseCache = function (cache) {
    var rst = {
      title: cache.title || '',
      poster: cache.poster || '',
      pointList: [{left: 0}],
      mainId: cache.mainId || 'svp_main_1',
      height: cache.height || '100%',
      width: cache.width || '100%',
      srcType: cache.srcType || 'mp4',
      elemId: cache.elemId || '',
      autoplay: cache.autoplay || false,
      defControls: cache.defControls || false,
      isInitSrc: false,
      isIphone: vars.IsIphone || false,
      isUCBrowser: vars.IsUCBrowser || false,
      isQQBrowser: vars.IsQQBrowser || false,
      curMode: cache.modeType || '',
      curModeName: settings.PLAY_MODE[cache.modeType],
      selList: []
    };

    //在有没有广告的情况下设置src
    if (!(cache.mediaAdPlatform && special.isAllowPlayAdv() &&
         ((cache.mediaAdPlatform.indexOf('ios') > -1 && vars.IsIOS) ||
          (cache.mediaAdPlatform.indexOf('android') > -1 && vars.IsAndroid)))) {
      rst.isInitSrc = true;
    }

    //清晰度列表
    $.each(cache.modeTypeList, function (index, item) {
      
      if (item !== rst.curMode) {
        var data = {
          mode: item,
          modeName: settings.PLAY_MODE[item]
        };
        rst.selList.push(data);
      }
    });
    m._cache = rst || cache;

    return rst;
  };

  //配置参数处理
  m.parseConfig = function (config) {
    var rst = {
      mainId: config.mainId || 'svp_main_1',
      height: config.height || '100%',
      width: config.width || '100%'
    };

    return rst;
  };

  //video标签
  v.videoTag = function () {
              //video标签拼接
    var html = '<div class="video">' +
                 '<% if (srcType === "client") { %>' +
                    '<div data-noSupport="noSupport"' +
                 '<% } else { %>' +
                    '<video' +
                 '<% } %>' +
                 //添加id
                 ' id="<%=elemId%>"' +
                 //autoplay属性
                 '<% if (autoplay) { %> autoplay<% } %>' +
                 //controls属性
                 '<% if (defControls) { %> controls="controls" <% } %>' +
                 //设置默认属性
                 ' x-webkit-airplay="isHtml5UseAirPlay"' +
                 //广告是否播放完成标志位
                 ' data-adover="false"' +
                 //非自动播放时候不进行预加载视频
                 '<% if (autoplay) { %> preload="none" <% }%>' +
                 //src
                 '<% if (isInitSrc) { %> src="<%=curPlayUrl%>"<% }%>' +
                 //height
                 ' height="<%=height%>"' +
                 //width
                 ' width="<%=width%>"' +
                 //style属性
                 '<% if (isIphone) { %>' +
                   ' style="position:absolute; left:-200%;' +
                 '"<% } else if (!autoplay && isUCBrowser) { %>' +
                   ' style="display: none;"' +
                 '<% } %>' +
                 //音量属性
                 '>' +
               '</div>';

    return html;
  };

  //控制条
  v.ctrl = function () {
    var html = '<div class="player_controls svp_ctrl">' +
                 //中间大的播放/暂停按钮
                 '<div class="mid svp_mid">' +
                   //中间播放按钮
                   '<span class="mid_play svp_mid_play white">' +
                     '<b></b>' +
                   '</span>' +
                   //中间快进快退
                   '<span class="mid_rewind_forward rewind svp_mid_rewind_forward" style="display:none;">' +
                     '<b class="mid_forward"></b>' +
                     '<b class="mid_rewind"></b>' +
                     '<span class="mid_time svp_mid_time">02:04</span>' +
                   '</span>' +
                 '</div>' +
                 //底部控制条部分
                 '<div class="slider_bar svp_ctrl_bar">' +
                   //左侧播放按钮
                   '<div class="left_btn_play">' +
                     //左侧播放按钮
                     '<div class="svp_ctrl_play">' +
                       '<b class="state_play"></b>' +
                     '</div>' +
                     //左侧暂停按钮
                     '<div class="svp_ctrl_pause" style="display:none;">' +
                       '<b class="state_pause"></b>' +
                     '</div>' +
                   '</div>' +
                   //进度条
                   '<div class="action_trackBar svp_ctrl_track_bar">' +
                     '<% if (!((isUCBrowser || isQQBrowser) && isIphone)) { %>' +
                       '<div class="trackbar">' +
                         //已缓冲的进度条
                         '<b class="buffered svp_ctrl_buffer"></b>' +
                         '<div class="click_area svp_ctrl_click_area">' +
                           '<div class="time_points svp_ctrl_points">' +
                             //打点
                             '<% for (var i = 0, l = pointList.length; i < l; i++) { %>' +
                               '<em style="left:<%=pointList[i].left%>"></em>' +
                             '<% } %>' +
                           '</div>' +
                         '</div>' +
                         //当前播放的锚点
                         '<b class="played svp_ctrl_played_bar">' +
                           //当前进度锚点
                           '<em class="handle svp_ctrl_drag_anchor"></em>' +
                         '</b>' +
                       '</div>' +
                     '<% } %>' +
                   '</div>' +
                   '<% if (!((isUCBrowser || isQQBrowser) && isIphone)) { %>' +
                     //视频当前播放时间/总时长区域
                     '<div class="time svp_ctrl_time">' +
                       //当前播放时间/总时长
                       '<b class="current_time svp_ctrl_cur_time">00:00</b> / ' +
                       '<span class="duration svp_ctrl_duration" data-key="totalDuration" data-type="time">00:00</span>' +
                     '</div>' +
                   '<% } %>' +
                   //缩放控制
                   '<div class="controllers svp_ctrl_screen">' +
                   //全屏
                   '<div class="fullscreen disabled svp_ctrl_full_screen">' +
                     '<span></span>' +
                   '</div>' +
                   //退出全屏
                   '<div class="shrinkscreen disabled svp_ctrl_shrink_screen" style="display:none;">' +
                     '<span></span>' +
                   '</div>' +
                 '</div>' +
               '</div>';
    return html;
  };

  //播放清晰度
  v.playMode = function () {
    var html = '<% if (curMode !== "" && selList.length > 0) { %>' +

                  '<div class="quality_button quality_container svp_mid_mode' +
                    '<% if (selList.length > 2) { %>' +
                      ' smaller' +
                    '<% } %>' +
                  '">' +
                    '<% if (selList.length > 0) { %>' +
                       '<div class="quality_definition_button svp_mid_cur_mode_btn">' +
                         '<span class="svp_mid_cur_mode" data-mode="<%=curMode%>"><%=curModeName%></span>' +
                       '</div>' +
                       '<div class="quality_definition_list">' +
                         '<ul class="svp_mid_mod_list">' +
                            '<% for (var i = 0, l = selList.length; i < l; i++) { %>' +
                               '<li data-mode="<%=selList[i].mode%>"><span><%=selList[i].modeName%></span></li>' +
                            '<% } %>' +
                         '</ul>' +
                       '</div>' +
                    '<% } %>' +
                 '</div>' +
               '<% } %>';
    return html;
  };

  //整体模板
  v.video = function () {
    var html =  '<div class="player_main svp_player_main">' +
                  //video标签
                  v.videoTag() +
                  
                  //标题
                  '<div class="video_title svp_title">' +
                    '<strong>' +
                      '<span class="svp_title_content title_content"><%=title%></span>' +
                    '</strong>' +
                  '</div>' +

                  //海报
                  '<div class="poster svp_poster" style="background-image:url(<%=poster%>);"></div>' +

                  //控制条
                  v.ctrl() +

                  //暂停广告
                  '<div class="ad-img svp_ad_pause">' +
                    //关闭广告按钮
                    '<em class="svp_ad_pause_close"></em>' +
                  '</div>' +

                  //清晰度选择
                  v.playMode() +

                  //遮罩层
                  '<div class="mask-layer svp_mask_layer" style="display: none;"></div>' +
                '</div>';
    return html;
  };

  v.originVideo =function() {
      var html =  '<div class="player_main svp_player_main">' +
                    //video标签
                    v.videoTag() +
                  '</div>';

      return html;
  };

  //loading模板
  v.loading = function () {
    var html = '<div class="player inline_player" id="<%=mainId%>" style="height:<%=height%>; width:<%=width%>">' +
                  '<div class="svp_player_loading player_loading"></div>' +
                  '<div class="svp_player_loading_notice player_loading_notice">努力加载中,请稍后...</div>' +
               '</div>';

    return html;
  };

  /**
   * @memberof html5UI
   * @summary 生成播放器整体模板
   * @type {function}
   * @param {object} cache                             - 播放器内部数据缓存对象
   * @return {boolean}                                 - 结果
   */
  html5UI.makeVideoTmpl = function (cache) {
    var data = m.parseCache(cache);
    var render = null;
    
    if (cache && cache.defControls) {
      render = template.compile(v.originVideo());
    
    } else {
      render = template.compile(v.video());
    }

    return render(data);
  };

  /**
   * @memberof html5UI
   * @summary 播放器加载完成前的loading
   * @type {function}
   * @param {object} cache                             - 播放器内部数据缓存对象
   * @return {boolean}                                 - 结果
   */
  html5UI.makeLoadingTmpl = function (config) {
    var data = m.parseConfig(config);

    var render = template.compile(v.loading());

    return render(data);
  };

  module.exports = html5UI;
});
/**
 *
 *   @description: 该文件用于直播播放器模板管理
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-02-01
 *
 *   @update-date: 2015-02-01
 *
 *   @update-log :
 *                 1.0.1 - 直播播放器模板管理
 *
 **/

svp.define('player.liveUI', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var template = svp.template;
  var vars = require('base.vars');
  var special = require('base.special');
  var settings = require('player.settings');
  
  /**
   * @module player/template
   * @namespace template
   * @property {function} makeVideoTmpl                    - 生成播放器整体模板
   * @property {function} makeLoadingTmpl                  - 播放器加载完成前的loading
   *
   * @example
   *   var liveUI = require('player.liveUI');
   *   var html = liveUI.makeVideoTmpl(cache);
   */
  var liveUI = {};

  var tmpl = {
    param: {},
    model: {},
    view: {},
    ctrl: {}
  };

  var p = tmpl.param,
      m = tmpl.model,
      v = tmpl.view,
      c = tmpl.ctrl;

  //数据处理
  m.parseCache = function (cache) {
    var rst = {
      title: cache.title || '',
      poster: cache.poster || '',
      pointList: [{left: 0}],
      mainId: cache.mainId || 'svp_main_1',
      height: cache.height || '100%',
      width: cache.width || '100%',
      srcType: cache.srcType || 'mp4',
      elemId: cache.elemId || '',
      autoplay: cache.autoplay || false,
      defControls: cache.defControls || false,
      isInitSrc: false,
      isIphone: vars.IsIphone || false,
      isUCBrowser: vars.IsUCBrowser || false,
      volume: cache.volume || 1,
      curMode: cache.modeType || '',
      curModeName: settings.PLAY_MODE[cache.modeType],
      selList: []
    };

    //在有没有广告的情况下设置src
    if (!(cache.mediaAdPlatform && special.isAllowPlayAdv() &&
         ((cache.mediaAdPlatform.indexOf('ios') > -1 && vars.IsIOS) ||
          (cache.mediaAdPlatform.indexOf('android') > -1 && vars.IsAndroid)))) {
      rst.isInitSrc = true;
    }

    //清晰度列表
    $.each(cache.modeTypeList, function (index, item) {
      
      if (item !== rst.curMode) {
        var data = {
          mode: item,
          modeName: settings.PLAY_MODE[item]
        };
        rst.selList.push(data);
      }
    });

    return rst;
  };

  //配置参数处理
  m.parseConfig = function (config) {
    var rst = {
      mainId: config.mainId || 'svp_main_1',
      height: config.height || '100%',
      width: config.width || '100%',
    };

    return rst;
  };

  //video标签
  v.videoTag = function () {
              //video标签拼接
    var html = '<div class="video">' +
                 '<% if (srcType === "client") { %>' +
                    '<div data-nosupport="noSupport"' +
                 '<% } else { %>' +
                    '<video' +
                 '<% } %>' +
                 //添加id
                 ' id="<%=elemId%>"' +
                 //autoplay属性
                 '<% if (autoplay) { %> autoplay<% } %>' +
                 //controls属性
                 '<% if (defControls) { %> controls<% } %>' +
                 //设置默认属性
                 ' x-webkit-airplay="isHtml5UseAirPlay"' +
                 //添加controls属性
                 '<% if (isWeixinBrowser) { %> webkit-playsinline<% } %>' +
                 //广告是否播放完成标志位
                 ' data-adover="false"' +
                 //非自动播放时候不进行预加载视频
                 '<% if (autoplay) { %> preload="none"<% }%>' +
                 //src
                 '<% if (isInitSrc) { %> src="<%=curPlayUrl%>"<% }%>' +
                 //height
                 ' height="<%=height%>"' +
                 //width
                 ' width="<%=width%>"' +
                 //style属性
                 '<% if (isIphone) { %>' +
                   ' style="position:absolute; left:-200%;' +
                 '"<% } else if (!autoplay && isUCBrowser) { %>' +
                   ' style="display: none;"' +
                 '<% } %>' +
                 //音量属性
                 ' volume="<%=volume%>">' +
               '</div>';

    return html;
  };

  //控制条
  v.ctrl = function () {
    var html = '<div class="player_controls svp_ctrl">' +
                 //中间大的播放/暂停按钮
                 '<div class="mid svp_mid">' +
                   //中间播放按钮
                   '<span class="mid_play svp_mid_play white">' +
                     '<b></b>' +
                   '</span>' +
                   //中间快进快退
                   '<span class="mid_rewind_forward rewind svp_mid_rewind_forward" style="display:none;">' +
                     '<b class="mid_forward"></b>' +
                     '<b class="mid_rewind"></b>' +
                     '<span class="mid_time svp_mid_time">02:04</span>' +
                   '</span>' +
                 '</div>' +
                 //提示信息
                 '<div class="message">' +
                   '<p></p>' +
                 '</div>' +

                 //底部控制条部分
                 '<div class="slider_bar svp_ctrl_bar">' +
                   //左侧播放按钮
                   '<div class="left_btn_play">' +
                     //左侧播放按钮
                     '<div class="svp_ctrl_play">' +
                       '<b class="state_play"></b>' +
                     '</div>' +
                     //左侧暂停按钮
                     '<div class="svp_ctrl_pause" style="display:none;">' +
                       '<b class="state_pause"></b>' +
                     '</div>' +
                   '</div>' +
                   //进度条
                   '<div class="action_trackBar svp_ctrl_track_bar">' +
                     '<div class="trackbar">' +
                       //已缓冲的进度条
                       '<b class="buffered svp_ctrl_buffer"></b>' +
                       '<div class="click_area svp_ctrl_click_area">' +
                         '<div class="time_points svp_ctrl_points">' +
                           //打点
                           '<% for (var i = 0, l = pointList.length; i < l; i++) { %>' +
                             '<em style="left:<%=pointList[i].left%>"></em>' +
                           '<% } %>' +
                         '</div>' +
                       '</div>' +
                       //当前播放的锚点
                       '<b class="played svp_ctrl_played_bar">' +
                         //当前进度锚点
                         '<em class="handle svp_ctrl_drag_anchor"></em>' +
                       '</b>' +
                     '</div>' +
                   '</div>' +
                   //视频当前播放时间/总时长区域
                   '<div class="time svp_ctrl_time">' + 'LIVE' +
                   '</div>' +
                   //缩放控制
                   '<div class="controllers svp_ctrl_screen">' +
                   //全屏
                   '<div class="fullscreen disabled svp_ctrl_full_screen">' +
                     '<span></span>' +
                   '</div>' +
                   //退出全屏
                   '<div class="shrinkscreen disabled svp_ctrl_shrink_screen" style="display:none;">' +
                     '<span></span>' +
                   '</div>' +
                 '</div>' +
               '</div>';
    return html;
  };

  //播放清晰度
  v.playMode = function () {
    var html = '<% if (curMode !== "" && selList.length > 0) { %>' +
                  '<div class="quality_button quality_container svp_mid_mode">' +
                    '<% if (selList.length > 0) { %>' +
                       '<div class="quality_definition_button svp_mid_cur_mode_btn">' +
                         '<span class="svp_mid_cur_mode" data-mode="<%=curMode%>"><%=curModeName%></span>' +
                       '</div>' +
                       '<div class="quality_definition_list">' +
                         '<ul class="svp_mid_mod_list">' +
                            '<% for (var i = 0, l = selList.length; i < l; i++) { %>' +
                               '<li data-mode="<%=selList[i].mode%>"><span><%=selList[i].modeName%></span></li>' +
                            '<% } %>' +
                         '</ul>' +
                       '</div>' +
                    '<% } %>' +
                 '</div>' +
               '<% } %>';
    return html;
  };

  //整体模板
  v.video = function () {
    var html =  '<div class="player_main svp_player_main">' +
                  //video标签
                  v.videoTag() +
                  
                  //标题
                  '<div class="video_title svp_title">' +
                    '<strong>' +
                      '<span class="svp_title_content"><%=title%></span>' +
                    '</strong>' +
                  '</div>' +

                  //海报
                  '<div class="poster svp_poster" style="background-image:url(<%=poster%>);background-color:#444;"></div>' +
                  
                  //控制条
                  v.ctrl() +

                  //暂停广告
                  '<div class="ad-img svp_ad_pause">' +
                    //关闭广告按钮
                    '<em class="svp_ad_pause_close"></em>' +
                  '</div>' +

                  //清晰度选择
                  v.playMode() +

                  //遮罩层
                  '<div class="mask-layer svp_mask_layer" style="display: none;"></div>' +
                '</div>';
    return html;
  };

  //loading模板
  v.loading = function () {
    var html = '<div class="svp_player player inline_player" id="<%=mainId%>" style="height:<%=height%>; width:<%=width%>">' +
                  '<div class="svp_player_loading"></div>' +
                  '<div class="svp_player_loading_notice">努力加载中,请稍后...</div>' +
               '</div>';

    return html;
  };

  /**
   * @memberof liveUI
   * @summary 生成播放器整体模板
   * @type {function}
   * @param {object} cache                             - 播放器内部数据缓存对象
   * @return {boolean}                                 - 结果
   */
  liveUI.makeVideoTmpl = function (cache) {
    var render = template.compile(v.video());
    var data = m.parseCache(cache);

    return render(data);
  };

  /**
   * @memberof liveUI
   * @summary 播放器加载完成前的loading
   * @type {function}
   * @param {object} cache                             - 播放器内部数据缓存对象
   * @return {boolean}                                 - 结果
   */
  liveUI.makeLoadingTmpl = function (config) {
    var render = template.compile(v.loading());
    var data = m.parseConfig(config);

    return render(data);
  };

  module.exports = liveUI;
});
/**
 *
 *   @description: 该文件用于定义播放器内部数据
 *
 *   @version    : 1.0.5
 *
 *   @create-date: 2015-02-01
 *
 *   @update-date: 2015-09-02
 *
 *   @update-log :
 *                 1.0.1 - 播放器内部数据
 *                 1.0.2 - 修复限制时长可以限制广告的bug
 *                 1.0.3 - 加入了对isDoMySugar的判断和处理
 *                 1.0.4 - 去掉了对cookie中SOHUSVP的编码处理
 *                         修改了为播放地址添加参数的逻辑
 *                         在播放地址中加入了ca和_c参数
 *                 1.0.5 - 去掉了播放地址加工的业务
 *                         去掉了isDoMySugar相关处理
 *
 **/

svp.define('player.loadCacheData', function (require, exports, module) {

  'use strict';
  
  var vars = require('base.vars');
  var Cookie = require('base.cookie');
  var Util = require('base.util');
  var support = require('base.support');
  var special = require('base.special');
  var Action = require('base.action');
  var URL = require('base.url');
  var $ = svp.$;

  /**
   * @class LoadCacheData
   * @classdesc 播放器内部数据对象
   * @property {function}  getPlayList                     - 获取当前播放列表
   * @property {function}  getNextUrl                      - 获取下一条播放链接
   * @property {function}  getFirstUrl                     - 获取第一条播放链接
   *
   * @example
   *   var LoadCacheData = require('player.loadCacheData');
   *   cache = new LoadCacheData(config, videoData);
   */

  var defaultVideoInfo = {
    //是否是广告内容
    isMediaAdContent: false,
    //影片id
    vid: '',
    //标签id
    elemId: '',
    //容器id
    mainId: '',
    //海报
    poster: '',
    //海报类型
    posterType: '',
    //播放类型  live: 直播, vod: 点播
    mediaType: '',
    //模式类型  nor:标清, hig:高清, sup:超清
    modeType: '',
    //支持的播放类型
    modeTypeList: [],
    //源类型 点播 m3u8  mp4  直播 m3u8 client
    srcType: '',
    //宽
    width: '',
    //高
    height: '',
    //音量
    volume: 0,
    //当前视频url
    curPlayUrl: '',
    //播放源
    srcList: {},
    //打点列表
    pointList: [],
    //是否自动播放
    autoplay: false,
    //是否显示默认控制条
    defControls: false,
    //是否循环播放
    loop: false,
    //是否预加载
    preload: false,
    //内容标题,或者直播频道名称
    title: '',
    //总时长
    duration: 0,
    //当前播放的内容索引值
    curIndex: -1,
    //内容总数
    totCounts: -1,
    //记录播放位置
    history: {},
    //ip限制
    ipLimit: '',
    //直播频道英文名
    liveEnName: '',
    //直播频道图标
    liveIcon: '',
    //直播标示
    liveId: '',
    //播放时长限制, -1: 无限制, num: 指定播放时长(毫秒)
    timeLimit: -1,
    //地址
    liveUrl: '',
    //联播vid列表
    vidList: [],
    //联播播放索引
    vidCurIndex: -1,
    //是否要暂停广告
    isPauseAd: false,
    //暂停广告图片地址
    pauseAdImg: '',
    //视频广告类型
    mediaAdPlatform: 'none',
    //版权认证
    copyrightRst: {
      rst: true,
      msg: ''
    },
    //app来源 tv: 视频,  news: 新闻,  msohu: 手机搜狐网, 默认tv
    appid: '',
    //调试环境
    debug: false,
    //主要演员
    mainActor: '',
    //更新至多少集
    latestCount: '',
    //剧情梗概
    desc: '',
    //原始播放器地址列表
    oriUrls: null,
    //视频channeled,默认为接口返回的channeled数据
    channeled: '',
    //是否真全屏. 默认0：假全屏；1：系统默认全屏
    fullscreenType: 0,
    //是否记录播放记录, false: 不记录, true: 记录, 默认flase
    isRemHistory: false,
    //媒体数据源类型
    mediaDataType: 'videoData',
    //可展示的清晰度
    modeList: ['nor', 'hig', 'sup', 'app']
  };

  //播放信息操作
  var LoadCacheData = function (config, videoData) {

    //获取默认属性
    $.extend(true, this, defaultVideoInfo);
    /*合并 vid width height volume autoplay controls
      loop preload mediaType modeType html5SkinCss等属性*/
    $.merge(this, config);

    if (!$.isUndefined(videoData)) {
      //直播内容初始化
      if (config.mediaType === 'live') {
        this._initHLS(videoData);
      //点播内容初始化
      } else {
        this._initVOD(videoData);
      }
    }
  };

  //直播内容初始化
  LoadCacheData.prototype._initHLS = function (videoData) {
    var _this = this;
    $.merge(this, videoData);

    //标题
    _this.title = videoData.liveName || "";

    //如果是安卓2.XX则不能播放
    if (/Android 2\./i.test(vars.UA)) {
      _this.srcType = 'client';

    } else {
        //源类型,如果不支持就调用客户端
      if (support.isSupportM3u8()) {
        _this.srcType = 'm3u8';
      
      } else {
        _this.srcType = 'client';
      }
    }

    //内容id
    _this.liveId = videoData.liveId;

    //初始化内容列表
    _this.curPlayUrl = videoData.liveUrl;
  };

  /**
   * @memberof LoadCacheData.prototype
   * @summary 获取当前播放列表
   * @type {function}
   */
  LoadCacheData.prototype.getPlayList = function () {

    return this.srcList[this.modeType] || [];
  };

  /**
   * @memberof LoadCacheData.prototype
   * @summary 获取下一条播放链接
   * @type {function}
   */
  LoadCacheData.prototype.getNextUrl = function () {
    var playList = this.getPlayList(),
        curIndex = this.curIndex + 1;
    var nextVideo = playList[curIndex];

    return !$.isUndefined(nextVideo) ? nextVideo.url : '';
  };

  /**
   * @memberof LoadCacheData.prototype
   * @summary 获取第一条播放链接
   * @type {function}
   */
  LoadCacheData.prototype.getFirstUrl = function () {
    var playList = this.getPlayList();
    var firstVideo = playList[0];

    return !$.isUndefined(firstVideo) ? firstVideo.url : '';
  };

  //点播内容初始化
  LoadCacheData.prototype._initVOD = function (videoData) {
    var _this = this;
    //海报水平
    if (_this.posterType === 'horizon') {
      _this.poster = videoData.horHighPic || videoData.verHighPic || '';
    //垂直图
    } else {
      _this.poster = videoData.verHighPic || videoData.horHighPic || '';
    }
    //总时长
    var duration = videoData.totalDuration || videoData.total_duration || 0;
    _this.duration = parseInt(duration, 10);
    //配置时长限制
    if (_this.timeLimit > -1 && _this.timeLimit < _this.duration && !_this.isMediaAdContent) {
      _this.duration = _this.timeLimit;
    }
    //标题
    _this.title = videoData.tvname || videoData.videoName || videoData.video_name || '';
    //主要演员
    _this.mainActor = videoData.main_actor || '',
    //更新至多少集
    _this.latestCount =  videoData.latest_video_count || '';
    //剧情梗概
    _this.desc = videoData.video_desc || '';
    //数据源类型
    if (!$.isUndefined(videoData.mediaDataType)) {
      _this.mediaDataType = videoData.mediaDataType;
    }
    //源类型
    //如果videoData中直接制定了播放类型，直接按指定设置
    if (!$.isUndefined(videoData.srcType)) {
      _this.srcType = videoData.srcType;
    //如果未指定类型，自动获取
    } else {
      //非安卓平台或者安卓下且播放时长未受限制，采用正常流程
      if (_this.timeLimit === -1 && vars.IsAndroid || !vars.IsAndroid) {
        //判断是否需要强制使用m3u8播放
        if (special.isForceUseM3u8()) {
          _this.srcType = 'm3u8';
        //是否强制使用downloadUrl播放
        } else if (special.isForceUseDownloadUrl()) {
          //清空其他播放源，只保留donwloadUrl
          videoData.urls.mp4 = {};
          videoData.urls.mp4.nor = videoData.urls.downloadUrl;
        
        } else {
          
          if (support.isSupportM3u8()) {
            _this.srcType = 'm3u8';
          
          } else {
            _this.srcType = 'mp4';
          }
        }
      //安卓下如果有时长限制，统计采用分片处理
      } else {
        _this.srcType = 'mp4';
      }
    }

    //初始化原始播放列表
    if (!$.isUndefined(videoData.urls)) {
      _this.oriUrls = videoData.urls;
    }
    //初始化打点列表
    if (!$.isUndefined(videoData.ep) && videoData.ep instanceof Array) {
      //打点数据结构转换
      $.each(videoData.ep, function (index, item) {
        var point = {};
        point.time = parseInt(item.k, 10);
        point.desc = item.v;
        _this.pointList.push(point);
      });
    }
    //内容id
    _this.vid = videoData.vid;
    //内容channeled
    //如果有传进来的channeled,则同时修改videoData中的channeled
    if (_this.channeled !== '') {
      videoData.channeled = _this.channeled;

    } else {
      _this.channeled = videoData.channeled || '';
    }

    //是否有播放源
    var isHasSrc = false;
    //初始化内容列表
    if (!$.isUndefined(videoData.urls)) {
      //获取支持的分片链接和分片时长
      var urls = videoData.urls[_this.srcType],
          dura = videoData.durations;
      //遍历所有类型
      for (var i in urls) {
        //为每个类型的片子申请一个数组
        _this.srcList[i] = [];

        if (urls[i] instanceof Array) {
          //遍历所有链接
          $.each(urls[i], function (index, item) {
            var data = {};
            data.url = item;
            
            if (_this.srcType === 'm3u8') {
              data.duration = videoData.totalDuration || videoData.total_duration || -1;

            } else {
              data.duration = parseInt((dura[i][index] || -1), 10);
            }
            //将单个子片源缓存到数组中
            _this.srcList[i].push(data);
          });
        }
          
        if (!isHasSrc && _this.srcList[i].length > 0) {
          isHasSrc = true;
          //内容总数
          _this.totCounts = _this.srcList[i].length;
        }
      }

      var initDownloadUrl = function () {
        var data = {};
        data.url = '';

        if (!$.isUndefined(videoData.urls.downloadUrl)) {
          data.url = videoData.urls.downloadUrl[0] || '';
        }
        data.duration = parseInt((_this.duration || -1), 10);
        _this.srcType = 'mp4';
        _this.modeType = 'nor';
        _this.srcList['nor'] = [data];
        _this.totCounts = _this.srcList['nor'].length;
      };

      //如果匹配类型没有可播放内容，采用downloadUrl字段播放
      if (!isHasSrc && _this.srcType !== 'client') {
        initDownloadUrl();
      }

      if (_this.totCounts > 0) {
        //当前播放的内容索引值
        _this.curIndex = 0;
      }

      //android UC分片体验不好，这里只播downloadurl将流畅的分片改为downloadurl字段的值
      if (!_this.isMediaAdContent && (!vars.IsIphone && vars.IsUCBrowser && _this.srcType !== 'client')) {
        initDownloadUrl();
      }

      //如果是安卓2.xx，采用downloadurl播放
      if (/Android 2./i.test(vars.UA)) {
        initDownloadUrl();
      }
      //初始化当前可播放内容的url和modeType类型
      _this._initCurPlayUrlAndModeType();
    }
  };

  //初始化当前播放的链接
  LoadCacheData.prototype._initCurPlayUrlAndModeType = function () {
    var _this = this;
    //获取当前播放列表
    var playList = _this.getPlayList();
    //如果获取的列表为空
    var mList = this.modeList;
    //遍历支持的模型列表，获取可播放内容
    $.each(mList, function (index, item) {
      //如果有可播放内容
      if (!$.isUndefined(_this.srcList[item]) && _this.srcList[item].length > 0) {
        //如果默认类型没有可播放内容，则取可播放内容
        if (playList.length === 0) {
          //自动修改当前类型
          _this.modeType = item;

          return false;
        }
        //将其支持的类型缓存起来
        _this.modeTypeList.push(item);
      }
    });
    
    if ($(mList).indexOf('app') > -1) {
      this.modeTypeList.push('app');
    }
    //再次获取播放列表
    playList = this.getPlayList();

    if (playList.length > 0) {
      this.curPlayUrl = playList[0].url;
    }
  };

  module.exports = LoadCacheData;
});
/**
 *
 *   @description: 该文件用于定义原始播放器
 *
 *   @version    : 1.0.4
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-09-06
 *
 *   @update-log :
 *                 1.0.1 - 原始播放器
 *                 1.0.2 - 只有在autoplay为true的时候才自动检查是否播放，如果不播放将play状态改为pause
 *                 1.0.3 - 删除playerid属性
 *                 1.0.4 - 修复多个播放器时，事件触发混乱的bug
 *
 **/

svp.define('player.mediaPlayer', function (require, exports, module) {

  'use strict';

  var $ = svp.$;
  var Console = require('base.console');
  var vars = require('base.vars');

  /**
   * @module player.mediaPlayer
   * @namespace MediaPlayer
   * @summary 播放器抽象方法与事件
   * @param {Object} config 配置
   * @constructor
   * @property {dom}       videoTag                        - video标签对象
   * @property {object}    $video                          - video标签$对象
   * @property {object}    cache                           - 播放器内部当前视频播放的操作对象
   * @property {object}    videoData                       - 播放器当前播放视频数据
   * @property {object}    config                          - 播放器配置参数
   * @property {object}    videoList                       - 多视频数据对象
   * @property {number}    currentTime                     - 当前视频播放时间
   * @property {number}    duration                        - 视频总时长
   * @property {function}  _onDomLoaded                    - 获取成功加载完dom后
   * @property {function}  pause                           - 暂停
   * @property {function}  play                            - 播放
   * @property {function}  getSrc                          - 获取当前视频播放地址
   * @property {function}  setSrc                          - 设置当前视频播放地址
   * @property {function}  getPoster                       - 获取当前视频海报地址
   * @property {function}  setPoster                       - 设置当前视频海报地址
   * @property {function}  getPreLoad                      - 获取当前视频预加载方式
   * @property {function}  setPreLoad                      - 设置当前视频预加载方式
   */
 
  var MediaPlayer = function (config) {
    /**
     * @memberof MediaPlayer.prototype
     * @summary video标签对象
     * @type {dom}
     */
    this.videoTag = null;
    /**
     * @memberof MediaPlayer.prototype
     * @summary video标签$对象
     * @type {object}
     */
    this.$video = null;
    /**
     * @memberof MediaPlayer.prototype
     * @summary 播放器内部当前视频播放的操作对象
     * @type {object}
     */
    this.cache = null;
    /**
     * @memberof MediaPlayer.prototype
     * @summary 播放器当前播放视频数据
     * @type {object}
     */
    this.videoData = null;
    /**
     * @memberof MediaPlayer.prototype
     * @summary 播放器配置参数
     * @type {object}
     */
    this.config = null;
    /**
     * @memberof MediaPlayer.prototype
     * @summary 多视频数据对象
     * @type {object}
     */
    this.videoList = null;
    /**
     * @memberof MediaPlayer.prototype
     * @summary 当前视频播放时间
     * @type {number}
     */
    this.currentTime = 0;
    /**
     * @memberof MediaPlayer.prototype
     * @summary 视频总时长
     * @type {number}
     */
    this.duration = 0;
    //dom节点是否加载完
    this._loadedDomFlag = false;
    //超时
    this._timeoutFlag = false;
    //得到video数据
    this._getDataFlag = false;
    //播放监控标志位(就开始时候监控)
    this._playCheckFlag = false;
    //播放监控时间(mm)
    this._playCheckTime = 6000;
    //所有播放器的事件处理数组
    this.eventProcess = {
      'pause': [],              //pause()触发
      'ended': [],              //播放结束
      'userEnded': [],          //用户自定义播放结束(单个片源播放结束触发)
      'error': [],              //请求数据时遇到错误
      'play': [],               //play()和autoplay开始播放时触发
      'playing': [],            //正在播放
      'timeupdate': [],         //播放时间改变
    };
    //初始化方法
    this._init(config);
  };

  // canplay seeking seeked ended play pause loadeddata loadedmetadata timeupdate
  MediaPlayer.prototype.eventList = [
    'advended',               //广告正片播放后触发(自定义事件)
    'loadedvideodata',        //获取播放器相关数据(自定义事件)
    'loadstart',              //客户端开始请求数据
    'progress',               //客户端正在请求数据
    'suspend',                //延迟下载
    'abort',                  //客户端主动终止下载（不是因为错误引起），
    'error',                  //请求数据时遇到错误
    'stalled',                //网速失速
    'play',                   //play()和autoplay开始播放时触发
    'playing',                //正在播放
    'pause',                  //pause()触发
    'loadedmetadata',         //成功获取资源长度
    'loadeddata',             //当前帧的数据已加载，但没有足够的数据来播放指定音频/视频的下一帧
    'waiting',                //等待数据，并非错误
    'canplay',                //可以播放，但中途可能因为加载而暂停
    'canplaythrough',         //可以播放，歌曲全部加载完毕
    'seeking',                //寻找中
    'seeked',                 //寻找完毕
    'timeupdate',             //播放时间改变
    'ended',                  //播放结束
    'ratechange',             //播放速率改变
    'durationchange',         //资源长度改变
    'volumechange'            //音量改变
  ];

  /**
   * @memberof MediaPlayer.prototype
   * @summary 获取当前视频播放地址
   * @type {function}
   * @return {string}
   */
  MediaPlayer.prototype.getSrc = function () {
    
    return this.$video.attr('src');
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 设置当前视频播放地址
   * @type {function}
   * @param {string} srcUrl                             - 设置指定的url
   */
  MediaPlayer.prototype.setSrc = function (srcUrl) {
    this.$video.attr('src', srcUrl);
  };

    /**
   * @memberof MediaPlayer.prototype
   * @summary 获取当前视频音量
   * @type {function}
   * @return {string}
   */
  MediaPlayer.prototype.getVolume = function () {
    
    return this.videoTag.volume;
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 设置当前视频音量
   * @type {function}
   * @param {string} volume                             - 设置音量 0 - 1
   */
  MediaPlayer.prototype.setVolume = function (volume) {

    if ($.isNumber(volume)) {
      volume = volume < 0 ? 0 : volume;
      volume = volume > 1 ? 1 : volume;
      Console.log('音量:', volume);
      this.videoTag.volume = volume;
    }
    
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 获取当前视频海报地址
   * @type {function}
   * @return {string}
   */
  MediaPlayer.prototype.getPoster = function () {
    
    return this.cache.poster || '';
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 设置当前视频海报地址
   * @type {function}
   * @param {string} posterUrl                          - 海报地址
   * @param {string} srcUrl                             - 设置指定的url
   */
  MediaPlayer.prototype.setPoster = function (posterUrl) {
    this.changePoster(posterUrl);
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 获取当前视频预加载方式
   * @type {function}
   * @return {string}
   */
  MediaPlayer.prototype.getPreLoad = function () {
    
    return this.$video.attr('preload');
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 设置当前视频预加载方式
   * @type {function}
   * @param {string} preloadType                        - 预加载方式
   */
  MediaPlayer.prototype.setPreLoad = function (preloadType) {
    this.$video.attr('preload', preloadType);
  };
  // //获取当前视频控制条方式
  // MediaPlayer.prototype.getControls = function () {
  //   return this.$video.attr('controls');
  // };
  // //设置当前视频控制条方式
  // MediaPlayer.prototype.setControls = function (controlsType) {
  //   this.$video.attr('controls', controlsType);
  // };
  // //获取当前视频循环播放方式
  // MediaPlayer.prototype.getLoop = function () {
  //   return this.$video.attr('loop');
  // };
  // //设置当前视频循环播放方式
  // MediaPlayer.prototype.setLoop = function (loopType) {
  //   this.$video.attr('loop', loopType);
  // };
  // //获取当前视频是否静音
  // MediaPlayer.prototype.getMuted = function () {
  //   return this.$video.attr('muted');
  // };
  // //设置当前视频是否静音
  // MediaPlayer.prototype.setMuted = function (mutedType) {
  //   this.$video.attr('muted', mutedType);
  // };
  // //获取当前视频播放速度
  // MediaPlayer.prototype.getPlaybackRate = function () {
  //   return this.$video.attr('playbackRate');
  // };
  // //设置当前视频播放速度
  // MediaPlayer.prototype.setPlaybackRate = function (playbackRateNum) {
  //   this.$video.attr('playbackRate', playbackRateNum);
  // };
  // //获取当前播放时间
  // MediaPlayer.prototype.getCurrentTime = function () {
  //   return this.$video.attr('currentTime');
  // };
  // //set播放时间
  // MediaPlayer.prototype.setCurrentTime = function (seconds) {
  //   this.$video.attr('currentTime', seconds);
  // };

  //初始化
  MediaPlayer.prototype._init = function () {};
  //添加事件处理
  MediaPlayer.prototype._addEvent = function (eventType, param1, param2) {};
  //移除处理事件
  MediaPlayer.prototype._removeEvent = function (eventType, param1) {};
  //触发事件
  MediaPlayer.prototype._fireEvent = function (eventType) {};
  //暂停
  MediaPlayer.prototype._pause = function () {
    var _this = this;

    this._onDomLoaded(function () {

      if (_this.$video.attr('data-noSupport') === null) {
        _this.videoTag.pause();
      }
    });
  };
  //播放
  MediaPlayer.prototype._play = function () {
    var _this = this;

    //获取数据成功
    var loadSuccess = function () {

      if (_this.$video.attr('data-noSupport') === null) {

        try {
            //播放监控开始(就开始时候监控)
          if (!this._playCheckFlag && this.config.autoplay) {
            this._playCheckFlag = true;
            var startTime = 0,
                pTime = 200;

            var checkInterval = setInterval(function () {
              startTime += pTime;
              var notPlayFlag = (startTime >= _this._playCheckTime);
              //如果在检查时间内没播放或者播放都清空计时器
              if (notPlayFlag || _this.currentTime > 1) {
                //如果在检查时间内没播放,调用暂停事件
                if (notPlayFlag) {
                  _this.pause();
                  _this.$video.trigger('pause');
                }
                clearInterval(checkInterval);
              }
            }, pTime);
          }

          if (_this.$video.attr('preload') !== null) {
            _this.$video.removeAttr('preload');
          }
          _this.videoTag.play();

        } catch (e) {
          _this.$video.one('canplay', function () {

            if (_this.videoTag.paused) {
              _this.videoTag.play();
            }
          });
        }
      }
    };

    this._onDomLoaded(loadSuccess);
  };
  //暂停播放业务
  MediaPlayer.prototype._playOrPause = function (type) {};

  /**
   * @memberof MediaPlayer.prototype
   * @summary 暂停
   * @type {function}
   */
  MediaPlayer.prototype.pause = function () {
    var _this = this;

    this._onDomLoaded(function () {
      _this._playOrPause('pause');
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 播放
   * @type {function}
   */
  MediaPlayer.prototype.play = function () {
    var _this = this;
    
    this._onDomLoaded(function () {
      _this._playOrPause('play');
    });
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 跳转到指定位置，全片跳转(seconds: 跳转到指定时间)
   * @type {function}
   * @param {number}   seconds                          - 跳转到指定时间点，秒
   */
  MediaPlayer.prototype.seekTo = function (seconds) {
    var _this = this;
    var curMediaSeekTo = function (sec) {
      
      try {
        _this.videoTag.currentTime = sec;

        if (_this.videoTag.paused) {
          _this.videoTag.play();
        }
      
      } catch (e) {
        _this.$video.one("canplay", function () {
          _this.videoTag.currentTime = sec;

          if (_this.videoTag.paused) {
            _this.videoTag.play();
          }
        });
      }
    };

    var childDurList = this.cache.srcList[this.cache.modeType];

    if (/Android\s4\./i.test(vars.UA) && !vars.IsBaiduBrowser) {
      //显示加载状态
      this._showLoading();
    }

    //如果只有一个片源
    if (childDurList.length === 1) {
      //跳转播放
      curMediaSeekTo(seconds);

    //如果有多个片源
    } else {
      //查找拖拽时间所处的片源
      var beforeTotal = 0;

      $.each(childDurList, function (index, item) {
        //逐个累加每个播放片源的总时间，定位指定片源
        if ((beforeTotal + item.duration) > seconds) {
          var cache = _this.cache;
          //如果和当前播放的片源不是同一个
          if (index !== cache.curIndex) {
            //修改cache中的播放索引
            cache.curIndex = index;
            //获取播放链接
            var url = item.url;
            //更新当前播放内容
            cache.curPlayUrl = url;
            //更新video片源地址
            _this.setSrc(url);
          }
          //当前子内容播放时间
          seconds -= beforeTotal;
          //跳转播放
          setTimeout(function () {
            curMediaSeekTo(seconds);
          }, 300);

          return false;
        
        } else {
          beforeTotal += item.duration;
        }
      });
    }
  };
  //绑定事件
  MediaPlayer.prototype.on = function (eventType, fn) {};
  //移除事件
  MediaPlayer.prototype.off = function (eventType, fn) {};
  //触发事件
  MediaPlayer.prototype.trigger = function (eventType) {};
  //只触发一次
  MediaPlayer.prototype.one = function (eventType, fn) {};
  //获取播放总时长
  MediaPlayer.prototype.htmlTo = function (dom) {};
  //清晰度切换播放
  MediaPlayer.prototype.playByMode = function () {};
  //更新播放器
  MediaPlayer.prototype.updateMedia = function (data) {};
  //更新海报
  MediaPlayer.prototype.changePoster = function (posterUrl) {};

  /**
   * @memberof MediaPlayer.prototype
   * @summary 获取成功加载完dom后
   * @type {function}
   * @param {function}   successFun                     - dom加载完成后，执行的回调方法
   */
  MediaPlayer.prototype._onDomLoaded = function (successFun) {
    var _this = this;

    if (this._loadedDomFlag) {
      successFun.call(this);
    
    } else {
      var checkInterval = setInterval(function () {
        
        if (_this._loadedDomFlag) {
          clearInterval(checkInterval);
          successFun.call(_this);
        }
      }, 100);
    }
  };

  module.exports = MediaPlayer;
});
/**
 *
 *   @description: message
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-08-11
 *
 *   @update-log :
 *                 1.0.1 - 消息提示弹窗
 *                 1.0.2 - 修改UI显示，在显示消息提示时同时显示海报
 *
 */
svp.define('player.message', function (require, exports, module) {

    'use strict';

    var $ = svp.$;
    var vars = require('base.vars');
    var MediaPlayer = require('player.mediaPlayer');

    /**
     * @class MediaPlayer
     * @classdesc 信息提示业务
     * @property {function}  _showMsg                        - (播放器内部使用) 创建/显示信息提示窗口
     * @property {function}  _hideMsg                        - (播放器内部使用) 隐藏信息提示窗口
     *
     * @example
     *   var player = require('player.mediaPlayer');
     *
     *   //信息提示弹窗配置数据
     *   var msgData = {
   *                     text:'这里是提示内容',            //提示内容文字，若无法满足需求可在下面的dom属性中自定义dom
   *                     btns:{                            //按钮组，默认最多支持两个，若无法满足需求可在下面的dom属性中自定义
   *                             btnA:{                    //按钮A
   *                                    text:'下载',       //按钮A文字
   *                                    color:'',          //按钮A文字颜色
   *                                    background:'',     //按钮A背景样式
   *                                    fontSize:'',       //按钮A文字大小
   *                                    link:'http://m.tv.sohu.com', //按钮链接地址
   *                                    className:'',       //为按钮A增加一个自定义的class
   *                                    callback:function (){}   //按钮A点击时触发的函数，this指向按钮本身
   *                                },
   *                             btnB:{
   *                                    text:'直播',
   *                                    color:'',
   *                                    background:'',
   *                                    fontSize:'',
   *                                    link:'',
   *                                    className:'',
   *                                    callback:function (){}
   *                                }
   *                         },
   *                     dom:'',                            //自定义dom,非空时text属性将失效
   *                     className:'',                      //增加一个自定义的class
   *                     background:'',                     //背景样式
   *                     color:'',                          //前景色
   *                     fontSize:'',                       //字体大小
   *                     callback:function (){}              //初始化完成时执行的函数，可在其中为自定义dom中的元素注册事件
   *                   };
     *
     *  //创建信息提示弹窗
     *  player._showMsg(msgData);
     *
     */

    //合成样式
    var cusStyle = function (obj) {
        var cStyle = '';

        if (obj.background) {
            cStyle += 'background:' + obj.background + ';';
        }

        if (obj.color) {
            cStyle += 'color:' + obj.color + ';';
        }

        if (obj.fontSize) {
            cStyle += 'font-size:' + obj.fontSize + ';';
        }

        return cStyle;
    };

    //生成按钮HTML
    var createBtnHTML = function (btn, btnStyle, unit) {

        return '<a href="' + (btn.link ? btn.link : 'javascript:void(0);') + '" class="msg_btn_' + unit + ' msg_btn ' + (btn.ClassName ? btn.ClassName : '') + '" style="' + btnStyle + '">' + btn.text + '</a>';
    };

    /**
     * @memberof MediaPlayer.prototype
     * @summary 隐藏信息提示窗口 (播放器内部使用)
     * @type {function}
     */
    MediaPlayer.prototype._hideMsg = function () {

        if (!this.$main || this.$main.length === 0) {
            this._initDoms();
        }
        //隐藏信息提示窗口
        this.$main.children('.message').hide();
        //显示控制界面
        this.$main.find('.player_main').length && this.$main.find('.player_main').show();
    };

    /**
     * @memberof MediaPlayer.prototype
     * @summary 创建/显示信息提示窗口 (播放器内部使用)
     * @type {function}
     */
    MediaPlayer.prototype._showMsg = function (msgConf) {

        if (!this.$main || this.$main.length === 0) {
            this._initDoms();
        }
        //暂停播放
        this._pause();
        //隐藏loading
        this._hideLoading();
        //隐藏控制界面
        this.$video.oriHide();
        this.$titleCon.oriHide();
        this.$posterCon.oriShow();
        this.$ctrlCon.oriHide();

        var msgStyle, contHtml, btnsHtml, msgBoxHtml, btnAStyle, btnBStyle;
        msgStyle = btnsHtml = btnAStyle = btnBStyle = '';

        msgStyle = cusStyle(msgConf);

        //生成消息内容模板
        if (msgConf.dom) {
            contHtml = msgConf.dom;

        } else {
            contHtml = '<div class="msg_cont"><span class="msg">' + msgConf.text + '</span></div>';
        }

        //生成按钮组模板
        if (msgConf.btns) {

            if (msgConf.btns.btnA) {
                btnAStyle = cusStyle(msgConf.btns.btnA);
                btnsHtml += createBtnHTML(msgConf.btns.btnA, btnAStyle, "a");
            }

            if (msgConf.btns.btnB) {
                btnBStyle = cusStyle(msgConf.btns.btnB);
                btnsHtml += createBtnHTML(msgConf.btns.btnB, btnBStyle, "b");
            }

            if (btnsHtml !== '') {
                btnsHtml = '<div class="msg_btns">' + btnsHtml + '</div>';
            }
        }

        msgBoxHtml = '<div class="message ' + (msgConf.className ? msgConf.className : '') + '" style="' + msgStyle + '"><div class="inner_msg">' + contHtml + btnsHtml + '</div></div>';

        if (this.$main.children('.message').length) {
            this.$main.find('.message').empty().append('<div class="inner_msg">' + contHtml + btnsHtml + '</div>').attr('style', msgStyle).show();

        } else {
            this.$main.append(msgBoxHtml);
        }

        //注册按钮的点击事件,在事件处理程序中调用按钮数据中的callback方法，并将其this指针指向当前按钮
        if (msgConf.btns) {

            if (msgConf.btns.btnA && msgConf.btns.btnA.callback && $.isFunction(msgConf.btns.btnA.callback)) {
                this.$main.find('.message .msg_btn_a').on(vars.END_EVENT, function () {
                    msgConf.btns.btnA.callback.call(this);
                });
            }

            if (msgConf.btns.btnB && msgConf.btns.btnB.callback && $.isFunction(msgConf.btns.btnB.callback)) {
                this.$main.find('.message .msg_btn_b').on(vars.END_EVENT, function () {
                    msgConf.btns.btnB.callback.call(this);
                });
            }
        }

        //调用msgConf配置信息中的callback方法，可在其中为自定义dom中的元素绑定事件
        if (msgConf.callback && $.isFunction(msgConf.callback)) {
            msgConf.callback.call(this.$main.find('.message')[0]);
        }
    };
});
/**
 *
 *   @description: 播放器接入广告业务
 *
 *   @version    : 1.0.3
 *
 *   @create-date: 2015-02-01
 *
 *   @update-date: 2015-09-14
 *
 *   @update-log :
 *                 1.0.1 - 播放器接入广告业务
 *                 1.0.2 - 直播业务中不做广告接入
 *                 1.0.3 - 加入了try-catch处理,在某些机型下会出现模块加载失败的情况，这里做了下兼容处理
 *
 */
svp.define('player.adv', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var MediaPlayer = require('player.mediaPlayer');
  var vars = require('base.vars');
  var special = require('base.special');
  var AndoridAdvertise = require('adv.android');
  var IosAdvertise = require('adv.ios');


  MediaPlayer.prototype._initAdvFlag = false;

  MediaPlayer.prototype._adUpdateFlag = false;

  //初始化广告及播放器显示状态
  MediaPlayer.prototype.adInit = function () {
    var config = this.config;

    try {
    
      if (config.mediaType !== 'live') {
        //如果直接传播放源，不播广告
        if (config.dataType !== 'play_source' && special.isAllowPlayAdv()) {
          //添加广告对象
          if ((vars.IsIphone || vars.IsIpad) && config.mediaAdPlatform.indexOf('ios') > -1) {
            this.adv = new IosAdvertise(this, config);
          
          } else if (vars.IsAndroid && config.mediaAdPlatform.indexOf('android') > -1) {
            this.adv = new AndoridAdvertise(this, config);
          }
        }

        //添加android广告视频
        if (!$.isUndefined(this.adv)) {
          this.adv.addAdvertise();
        }

        //如果没有广告，直接修改广告标志位
        if ($.isUndefined(this.adv)) {
          this.$video.attr('data-adover', 'true');
        }
        //如果是ios平台、8.1前winphone、uc浏览器或者不是自动播放
        if (this.cache.autoplay || vars.IsIphone ||
            vars.IsOldWindowsPhone || vars.IsUCBrowser || vars.IsQQBrowser || vars.IsMIOne) {
          this._ctrlShowFlag = true;
        }
      }

    } catch (e) {
      console.error(e);
    }
  };
});
/**
 *
 *   @description: playHistory
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-02-05
 *
 *   @update-date: 2015-04-22
 *
 *   @update-log :
 *                 1.0.1 - 操作播放记录功能,对sid过滤的功能
 *
 */
svp.define('player.playHistory', function (require, exports, module) {

    'use strict';
    
    var Storage = require('base.store');

    /**
     * @module player.playHistory
     * @namespace playHistory
     * @property {object}   param
     * @property {object}   model
     * @property {object}   view
     * @property {object}   ctrl
     * @property {function} setHistory  设置播放历史
     * @property {function} getHistory  获取播放历史
     * @example
     *      var history = require('player.playHistory');
     *
     *      history.setHistory({
     *          sid: '',       //(必) 专辑id
     *          vid: '',       //(必) 视频id
     *          site: 2,       //(必) 视频类型
     *          playTime: 22,  //(必) 当前播放时间
     *          duration: 23,  //(必) 视频总时长
     *          cid: '',       //(可) 视频分类
     *          title: ''      //(可) 视频标题
     *      });
     *
     *      history.getHistory(data); //data参数可选，返回数组
     *
     *      1) 通过vid和site查找
     *         data : {          //(可)
     *             vid: '',      //(必) string 视频id
     *             site: '2'     //(必) string 视频类型
     *         }
     *      2) 通过sid查找
     *         data : {          //(可)
     *             sid: ''       //(必) string 专辑id
     *             type: 0       //(可) number 获取类型 0: 取最新一条, 1: 获取所有, 默认0
     *         }
     */
    var historyRec = {
        param: {
            //本地存储名称
            localHistoryName: 'sohu_video_history',
            //最大存储记录数
            maxSize: 20,
            //记录中必须有的字段
            checkArr: ['sid', 'vid', 'site', 'playTime', 'duration'],
            //数据属性全集
            paramArr: ['sid', 'vid', 'site', 'cid', 'playTime', 'duration', 'sysTime', 'title']
        },
        model: {
            //缓存本地存储数据对象字符串
            localDataStr: ''
        },
        view: {},
        ctrl: {}
    };

    var p = historyRec.param,
        m = historyRec.model,
        v = historyRec.view,
        c = historyRec.ctrl;

    //========================== 模型层 ================================
    //历史记录数据检查
    m.historyCheck = function (data) {
        var rst = true;

        $.each(p.checkArr, function (index, item) {

            if (typeof data[item] === 'undefiend') {
                rst = false;

                return false;
            }
        });

        return rst;
    };

    //数据处理,将数据对象转换成字符串
    m.objToStr = function (data) {
        var rstArr = [],
            isFinishedFlag = false;
        //检查是否已经播放完成
        try {
            var dur = parseInt(data.duration, 10),
                cur = parseInt(data.playTime, 10);
            //如果播放完成95%以上，我们认为该片子已经播放完成
            if (cur / dur > 0.97) {
                isFinishedFlag = true;
            }

        } catch (e) {}

        if (isFinishedFlag) {

          return 'finished';  

        } else {
            //设置时间
            data.sysTime = Date.now();

            $.each(p.paramArr, function (index, item) {

                if (item === 'playTime') {

                    try {
                        data[item] = parseInt(data[item], 10);

                    } catch (e) {}
                }
                data[item] = data[item] ? data[item] : '';
                rstArr.push(encodeURIComponent(data[item]));
            });

            return rstArr.join(',');
        }
    };

    //数据处理,将字符串转换成数据对象
    m.strToObj = function (data) {
        var rst = null;

        if (typeof data === 'string' && data !== 'null' && data !== '') {
            var dataArr = data.split(',');
            rst = {};

            $.each(p.paramArr, function (index, item) {

                if (item === 'playTime' || item === 'duration' || item === 'sysTime' ||
                    item === 'flag' || item === 'sid') {
                    rst[item] = parseInt(dataArr[index], 10);

                } else {
                    rst[item] = decodeURIComponent(dataArr[index]);
                }
            });
        }

        return rst;
    };

    //将字符串解析成数组对象
    m.strToArr = function (data) {
        var rst = [];

        if (typeof data === 'string' && data !== '' && data !== 'null') {

            if (data.indexOf('|') === 0) {
                data = data.substr(1);
            }
            var dataStrArr = data.split('|');

            $.each(dataStrArr, function (index, item) {
                rst.push(m.strToObj(item));
            });
        }

        return rst;
    };

    //========================== 控制层 ================================
    /**
     * @memberof playHistory
     * @summary 设置播放记录
     * @type {function}
     * @param {object} data 设置的记录
     */
    c.setHistory = function (data) {
        //数据检查
        if (m.historyCheck(data)) {
            //数据加工，转换成字符串
            var dataStr = m.objToStr(data);
            //如果缓存中还没有数据
            if (m.localDataStr === '') {
                //获取本地存储的数据(字符串)
                m.localDataStr = Storage.get(p.localHistoryName) || '';
            }
            //字符串数组
            var localDataStrArr = (m.localDataStr !== '') ? m.localDataStr.split('|') : [];
            //检查索引字符串(vid和site能判断数据是否已经存在)
            var keyStr = ',' + data.vid + ',' + data.site + ',';
            //本地还没有存储过当前播放记录且该视频还没播放结束(数组操作)
            if (dataStr !== 'finished' && m.localDataStr.indexOf(keyStr) === -1) {
                //首添加到数组
                localDataStrArr.unshift(dataStr);
            //本地已经存在该数据
            } else {
                var arr = [];
                //如果视频没播放完成,则更新记录，如果已经播放完成，则删除该记录
                if (dataStr !== 'finished') {
                    arr.push(dataStr);
                }

                $.each(localDataStrArr, function (index, item) {

                    if (item.indexOf(keyStr) === -1) {
                        arr.push(item);
                    }
                });
                localDataStrArr = arr;
            }

            if (localDataStrArr.length > p.maxSize) {
                localDataStrArr.length = p.maxSize;
            }
            m.localDataStr = localDataStrArr.join('|');

            Storage.set(p.localHistoryName, m.localDataStr);
        }
    };

    /**
     * @memberof playHistory
     * @summary 获取播放记录
     * @type {function}
     * @param {object} data 获取记录的条件
     * @returns {Array} 满足条件的记录
     */
    c.getHistory = function (data) {
        var rst = [];
        var localDataStr = (m.localDataStr && m.localDataStr !== '') ? m.localDataStr : Storage.get(p.localHistoryName);

        if (localDataStr && typeof data !== 'undefined') {

            if (typeof data.vid !== 'undefined' && typeof data.site !== 'undefined') {
                var reg = new RegExp('(^|\\|)\\d+' + ',' + data.vid + ',' + data.site + '(,[\\w\\.\\W]*){6}', 'ig');
                var rstStr = localDataStr.match(reg) + '';
                rst = m.strToObj(rstStr);
                rst = (rst === null) ? [] : [rst];

            } else if (typeof data.sid !== 'undefined') {
                var historyList = m.strToArr(localDataStr);

                $.each(historyList, function (index, item) {

                    if ((item.sid + '') === (data.sid + '')) {
                        rst.push(item);
                    }
                });

                if (typeof data.type === 'undefiend' || data.type === 0 || data.type !== 1) {
                    rst.length = 1;
                }
            }

        } else {
            rst = m.strToArr(localDataStr);
        }

        return rst;
    };

    //对外接口
    window.SohutvJSBridge = window.SohutvJSBridge || {};
    window.SohutvJSBridge.setHistory = c.setHistory;
    window.SohutvJSBridge.getHistory = c.getHistory;

    module.exports = {
        setHistory: c.setHistory,
        getHistory: c.getHistory
    };
});
/**
 *
 *   @description: poster
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015/3/4
 *
 *   @update-date: 2015/3/6
 *
 *   @update-log :
 *                 1.0.1 - 海报
 *                 1.0.2 - 新增用于“更换海报”的方法 changePoster
 *
 */
svp.define('player.poster', function (require, exports, module) {

    'use strict';
    
    var MediaPlayer = require('player.mediaPlayer');
    /**
     * @class MediaPlayer
     * @classdesc 播放器海报业务
     * @property {function}  hidePoster         - 隐藏海报
     * @property {function}  showPoster         - 显示海报
     */

    /**
     * @memberof MediaPlayer.prototype
     * @summary 隐藏海报
     * @type {function}
     */
    MediaPlayer.prototype.hidePoster = function () {
        
        if (this.$posterCon.length > 0) {
            this.$posterCon.addClass('hidden');
        }
    };

    /**
     * @memberof MediaPlayer.prototype
     * @summary 显示海报
     * @type {function}
     */
    MediaPlayer.prototype.showPoster = function () {
        
        if (this.$posterCon.length > 0) {
            this.$posterCon.removeClass('hidden');
        }
    };

    /**
     * @memberof MediaPlayer.prototype
     * @summary 更换海报
     * @type {function}
     * @property {object}  poster         - 海报数据对象
     */
    MediaPlayer.prototype.changePoster = function (poster) {
        
        if (!poster || !poster.url) {
            
            return;
        }
        
        if (this.$posterCon.length > 0) {
            this.$posterCon.css({
                'background-image': 'url(' + poster.url + ');'
            });
        }
    };
});
/**
 *
 *   @description: 该文件用于定义播放器配置参数
 *
 *   @version    : 1.0.5
 *
 *   @create-date: 2015-02-01
 *
 *   @update-date: 2015-09-06
 *
 *   @update-log :
 *                 1.0.1 - 定义播放器配置参数
 *                 1.0.2 - 加入了对禁止自动播放的设置(之前禁止播放名单是无效的)
 *                 1.0.3 - 将isRemHistory默认值改为false
 *                 1.0.4 - 加入了防盗链处理标志位
 *                 1.0.5 - 修改播放器计数器逻辑
 *                         config中新增index参数
 *                         修复videoTag id命名重复bug
 *
 **/

svp.define('player.settings', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var special = require('base.special');
  /**
   * @module base.settings
   * @namespace settings
   * @property {object}   PLAY_MODE                     - 播放类型
   * @property {function} initConfig                    - 将配置参数和默认参数合并
   *
   * @example
   *   var settings = require('player.settings');
   *   var config = settings.initConfig(config);
   */
  var settings = {};

  /**
   * @memberof settings
   * @summary 播放类型
   * @type {object}
   */
  settings.PLAY_MODE = {nor: '流畅', hig: '高清', sup: '超清', ori: '原画', app: '超清app'};

  //默认配置参数
  var DEFAULT_CONFIG = {
    //视频数据
    data: null,
    //外围容器id
    mainId: '',
    //video标签id
    playerId: '',
    //播放器计数器(索引)
    playerIndex: -1,
    //宽
    width: '100%',
    //高
    height: '100%',
    //父级容器的宽
    pWidth: '',
    //父级容器的高
    pHeight: '',
    //音量
    volume: 1,
    //video标签id, 默认是videoTagId + 时间戳 + 随机数
    elemId: 'videoTagId',
    //数据类型vid_list:vid的聚集列表; video_data: 页面videoData; play_source:带有src的播放源数据对象;  unknown
    dataType: '',
    //是否自动播放
    autoplay: true,
    //是否使用默认控制条
    defControls: false,
    //是否循环播放
    loop: false,
    //当前视频是否预加载
    preload: false,
    //播放类型 vod:点播, live:直播
    mediaType: 'vod',
    //片源类型 nor:流畅, hig:高清, sup:超清
    modeType: 'nor',
    //海报图片类型 horizon: 横图, vertical: 竖图
    posterType: 'horizon',
    //播放时长限制, -1: 无限制, num: 指定播放时长(秒)
    timeLimit: -1,
    //是否要暂停广告
    isPauseAd: false,
    //暂停广告图片地址
    pauseAdImg: '',
    //需要播放广告的平台类型，默认'none', 'android', 'ios', 'ios,android'
    mediaAdPlatform: 'none',
    //是否需要版权验证
    isCopyrightCheck: true,
    //是否需要屏蔽广告  0: 能播, 1: 不能,敏感词屏蔽, 2: 不能,合作方不让播, 默认0
    adClose: '0',
    //app来源 tv: 视频,  news: 新闻,  msohu: 手机搜狐网, 默认tv
    appid: 'tv',
    //调试环境
    debug: false,
    //视频channeled,默认为接口返回的channeled数据
    channeled: '',
    //是否真全屏. 默认0：假全屏；1：系统默认全屏
    fullscreenType: 0,
    //是否记录播放记录, false: 不记录, true: 记录, 默认flase
    isRemHistory: false,
    //可展示的清晰度
    modeList: ['nor', 'hig', 'sup', 'ori', 'app'],
    //在播放器结束后是否显示相关推荐
    isShowRecommend: false
  };

  /**
   * @memberof settings
   * @summary 将配置参数和默认参数合并
   * @type {function}
   * @param {object} config                             - 播放器配置参数
   * @return {object}                                   - 合并后的配置参数
   */
  settings.initConfig = function (config) {
    var rst = $.extend(true, {}, DEFAULT_CONFIG, {elemId: 'videoTagId_' + Date.now() + Math.round(Math.random() * 1000)}, config);
    //克隆一个数据对象，以免在后面修改数据时会对源数据一起修改
    if (rst.data !== null) {
      rst.data = $.extend(true, {}, rst.data);
    }
    
    if (rst.mainId === '') {
      
      if ($.isUndefined(svp.mainId)) {
        svp.mainId = 0;
      }
      rst.mainId = 'svp_main_' + svp.mainId;
    }
    rst.index = svp.mainId;
    //播放器计数器
    svp.mainId++;

    if (special.isForbidAutoplay()) {
      rst.autoplay = false;
    }

    //合并
    return rst;
  };

  module.exports = settings;
});
/**
 *
 *   @description: 该文件用于显示播放器浮层相关推荐
 *
 *   @version    : 1.0.4
 *
 *   @create-date: 2015-03-30
 *
 *   @update-date: 2015-09-06
 *
 *   @update-log :
 *                 1.0.1 - 播放器浮层相关推荐业务
 *                 1.0.2 - 重新播放时重置统计标志位
 *                 1.0.3 - 将推荐内容地址改为m.tv.sohu.com
 *                 1.0.4 - 修复相关推荐没有标题的bug
 *
 **/
svp.define('player.showRecommend', function (require, exports, module) {

    'use strict';

    var $ = svp.$;
    var vars = require('base.vars');
    var Console = require('base.console');
    var MediaPlayer = require('player.mediaPlayer');

    //获取推荐数据
    var recommend = require('data.recommend');
    //推荐视频 动画滚动效果
    var slide = require('base.slide');

    /**
     * @class MediaPlayer
     * @classdesc 播放器相关推荐业务
     * @property {function} showRecommend                 - 显示播放器浮层推荐
     * @property {function} hideRecommend                 - 隐藏播放器浮层推荐
     */

    //获取推荐DOM模版 video  推荐数据
    var _getRecommendTpl = function (video) {
        var tplArr = [], pagePoint = [];
        tplArr.push('<div class="svp_recommend_wrap player_recommend_wrap">');

        tplArr.push('<div class="about_recommend">');
        tplArr.push('<div class="title">相关推荐</div>');

        tplArr.push('<div class="right_btn">');
        tplArr.push('<span class="svp_replay replay btns">重新播放</span>');
        tplArr.push('<a  class="player_recommend_more btns" href="http://m.tv.sohu.com">更多</a>');
        tplArr.push('</div></div>');

        tplArr.push('<div class="recommend_videos_wrap">');
        tplArr.push('<div class="svp_recommend_videos recommend_videos">');

        pagePoint.push('<ul class="svp_page_point page_point">');

        for (var i = 0; i < video.length; i++) {

            if (i % 2 === 0) {
                pagePoint.push('<li>');
                tplArr.push('<ul class="svp_video_list video_list">');
            }
            tplArr.push('<li class="svp_item recommend_videos_item">');

            var recommendHref = video[i].url_html5 || 'http://m.tv.sohu.com/v'+ (video[i].vid || 0) +'.shtml';
            tplArr.push('<a href="' + (video[i].url_html5 || recommendHref) + '" data-href="' + (video[i].url_html5 || "") + '" class="svp_link item_link">');
            tplArr.push('<b style="background-image: url(' + (video[i].hor_big_pic || '') + ');background-size:cover;"></b>');

            tplArr.push('<div class="playend_recommend_vtilte">' + (video[i].album_name || video[i].video_name || '') + '</div>');
            tplArr.push('</a></li>');

            if (i % 2 === 1) {
                tplArr.push('</ul>');
            }
        }
        pagePoint.push('</ul>');

        tplArr.push('</div>');
        tplArr.push('</div>');

        //page point
        tplArr.push(pagePoint.join(''));
        tplArr.push('</div>');
        tplArr.push('</div>');

        return tplArr.join('');
    };

    /**
     * @memberOf MediaPlayer.prototype
     * @summary 显示播放器浮层推荐
     * @type {function}
     */
    MediaPlayer.prototype.showRecommend = function () {
        var _this = this;
        Console.log('showRecommend');
        Console.log('_this.lastVid' + _this.lastVid);
        Console.log('_this.videoData.vid' + _this.videoData.vid);
        var mainId = '#' + this.config.mainId;
        //已经请求过数据&&同一个视频 直接显示推荐
        if ($(mainId + ' .svp_recommend_wrap').length > 0 && _this.lastVid === _this.videoData.vid) {
            _this.$main.addClass('recommend_show');
            
            return;
        }
        recommend.getData('recommend', _this.videoData, function (data) {
            
            if (data !== null && data !== '' && data.videos && data.videos.length > 0) {
                data = data.videos;
                //如果不是同一个vid 需移除之前的推荐
                $(mainId + ' .svp_recommend_wrap').remove();
                var recommendDom = _getRecommendTpl(data);
                _this.$main.append(recommendDom).addClass('recommend_show');
                //记录当前播放视频vid
                _this.lastVid = _this.videoData.vid;
                //相关推荐 重新播放
                _this.$rePlay = _this.$main.find('.svp_replay');
                _this.$rePlay.click(function () {
                    _this._sendVVFlag = false;
                    _this._sendRealVVFlag = false;
                    _this._sendStartFlag = false;
                    _this._sendEndFlag = false;
                    _this._playByHistoryFlag = false;
                    _this._timeoutFlag = false;
                    //重新播放
                    if (vars.IsIphone && /^[0-7]\./i.test(vars.OsVersion)) {
                        _this.seekTo(0);

                    } else {
                        _this.updateMedia(_this.videoData, true);
                    }
                    //隐藏推荐layer
                    _this.$main.removeClass('recommend_show');
                    //修改显示相关推荐标志位
                    _this._showRecommendFlag = true;
                });
                
                slide.Scroll({
                    'scrollClass': 'svp_recommend_videos',
                    'moveSpeed': 200,
                    'loop': true,
                    'auto': false
                });
            }
        });
    };

    /**
     * @memberOf MediaPlayer.prototype
     * @summary 隐藏播放器浮层推荐
     * @type {function}
     */
    MediaPlayer.prototype.hideRecommend = function () {
        this.$main.removeClass('recommend_show');
    };
});
/**
 *
 *   @description: 该文件用于定义播放器视频更新业务
 *
 *   @version    : 1.1.0
 *
 *   @create-date: 2015-03-30
 *
 *   @update-date: 2015-08-27
 *
 *   @update-log :
 *                 1.0.1 - 播放器视频更新业务
 *                 1.0.2 - 新增逻辑：如果startApp为0，则禁止自动播放
 *                         _firstLoadFlag标志位放在_playOrPause方法中修改
 *                         修改了timelimit的设置逻辑
 *                         修改了play_display_complete逻辑
 *                 1.0.3 - 修复了微信播放器无法联播的bug
 *                         修复了有些浏览器不发送ended统计的bug
 *                 1.0.4 - 如果需要自动拉起app，则禁止自动播放，增加条件————并且是第一次加载
 *                 1.0.5 - 修复自动播放的没有总时长bug
 *                 1.0.6 - updatePlayerInfo中，_firstLoadFlag为false时，如果是自动播放，隐藏中间播放按钮
 *                 1.0.7 - 加入了对直播播放相关业务处理
 *                         修正了updateMedia时，autoplay为false时，始终自动播放的bug
 *                         微信播放页不再限制播放时长
 *                 1.0.8 - 加入了防盗链处理标志位
 *                 1.0.9 - 修复了播放源为source时的bug
 *                         修复了在全数据源时不进行防盗链处理的bug
 *                         新增防盗链链接检查，出错时触发_error:mysugarurl内部事件
 *                         加入了付费视频的错误的提示
 *                         新增行为统计pay_video_download和pay_video_tips
 *                 1.1.0 - 将模块player.errorTypes变更为base.errorTypes
 *                         变更了update方法业务逻辑
 *
 **/

svp.define('player.update', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var MediaPlayer = require('player.mediaPlayer');
  var vars = require('base.vars');
  var VideoTrace = require('trace.video');
  var dataService = require('player.dataService');
  var LoadCacheData = require('player.loadCacheData');
  var html5UI = require('player.html5UI');
  var liveUI = require('player.liveUI');
  var errorTypes = require('base.errorTypes');
  var appDownload = require('data.appDownload');
  var Console = require('base.console');
  var settings = require('player.settings');
  var Action = require('base.action');
  var ClickTrace = require('trace.click');
  var URL = require('base.url');

  /**
   * @class MediaPlayer
   * @classdesc 播放器进度条业务
   * @property {function}  updateMedia                    - 更新播放器视频
   */

  //更新界面信息
  var updateUIInfo = function (player) {
    var cache = player.cache;

    if (!$.isUndefined(player.adv) && $.isFunction(player.adv.hideMediaView)) {
      player.adv.hideMediaView();
    }
    //标题
    player.$title.html(cache.title);
    //修改页面标题
    document.title = cache.title;
    //更新时间轴
    player.$ctrlCurTime.html($.formatSeconds(0));
    player.$ctrlDuration.html($.formatSeconds(cache.duration));
    player.$ctrlCurPlayedBar.css({width: 0});
    //更换海报
    player.changePoster({url: cache.poster});
  };

  //更新播放器对象信息
  var updatePlayerInfo = function (player, vData, errorData) {
    var videoData = vData.videoData,
        channelInfo = vData.channelInfo;

    player.trigger('loadedvideodata');
    //重置防盗链标志位
    player._sendMySugarFlag = false;
    //覆盖全局变量
    if (player.videoList.type === 'videoDataList') {
      var curVideoData = player.videoList.videoDataList[player.videoList.curIndex];
      videoData.channeled = curVideoData.channeled || '1212120001';
      videoData.timeLimit = curVideoData.timeLimit || '0';
    }
    window.videoData = videoData;

    //时长设定
    if (player.config.timeLimit <= 0 && !vars.IsWeixinBrowser) {
      //videoData中的时长限制
      if (videoData.timeLimit > 0) {
        player.config.timeLimit = videoData.timeLimit;
      }
      //接口返回的时长限制
      if (!$.isUndefined(videoData.cid) && !$.isUndefined(channelInfo.cid)) {
        
        try {
          var cid = videoData.cid,
              cidArr = $(channelInfo.cid.split(','));

          if (cidArr.indexOf(cid + '') > -1 && channelInfo.timeLimit > 0) {
            player.config.timeLimit = channelInfo.timeLimit;
          }
        
        } catch (e) {}
      }
    }
    //如果需要自动拉起app，则禁止自动播放
    if (player._firstLoadFlag && channelInfo.startapp === '0' && !vars.IsWeixinBrowser) {
      player.config.autoplay = false;
    }

    //清晰度设定
    if (!$.isUndefined(channelInfo.quality)) {
      var modeList = (channelInfo.quality + '').split(',');

      if (modeList.length > 0) {
        player.config.modeList = modeList;
      }
    }
    //是否播放广告
    if (!$.isUndefined(channelInfo.isClosed)) {
      player.config.adClose = channelInfo.isClosed + '';
    }

    //添加播放器内部数据对象
    player.cache = new LoadCacheData(player.config, videoData);

    //添加播放器数据对象
    player.videoData = $.extend(true, {}, videoData);

    //如果第一次加载，添加dom节点，事件初始化
    if (player._firstLoadFlag) {
      //需要更新广告
      player._adUpdateFlag = false;
      //添加播放器模板
      if (player.config.mediaType === 'live') {
        player.$player.append(liveUI.makeVideoTmpl(player.cache));
      
      } else {
        player.$player.append(html5UI.makeVideoTmpl(player.cache));
      }
      Console.log('加载dom完成, 耗时--->' + (Date.now() - svp.debug.playerLoadDomStartTime) / 1000);
      //初始化dom节点
      player._initDoms();
      //浏览器不支持播放
      if (player.$video.attr('data-nosupport') === 'noSupport') {
        var noteInfo = (player.config.mediaType === 'live') ? errorTypes['SUPPORT']['305'] : errorTypes['SUPPORT']['300'];

        player._showMsg({
          text: noteInfo,
          btns: {
            btnA: {
              text: '下载搜狐视频客户端',
              callback: function () {
                appDownload.gotoDownload();
              }
            }
          }
        });

        return;
      }

      //修改dom加载完成标志位
      player._loadedDomFlag = true;
      //初始化事件
      player._initEvent();
      //初始化控制界面
      player._initControls();
      if (typeof errorData === 'undefined') {
        //初始化出错处理
        player._initException();

        if (player.cache.mediaDataType === 'videoData') {
          var urlSOHUSVP = URL.getParam(player.cache.curPlayUrl, 'SOHUSVP');
          //无效防盗链视频链接
          if (urlSOHUSVP === '' || urlSOHUSVP === null) {
            player.trigger('_error:mysugarurl');

            return;
          }
        }

        //启动自动播放下一个视频的业务
        player._autoNextVideoService();
        //隐藏努力加载中的文字
        player.$loadingDesc.oriHide();

        if (player.$video.length > 0) {
          //声音设置
          player.videoTag.volume = player.config.volume;
          player.$ctrlDuration.html($.formatSeconds(player.cache.duration));
        }
      }
    //更新界面信息
    } else {
      //触发页面更新信息事件
      $('body').trigger('player:updateMedia');

      updateUIInfo(player);
      //需要更新广告
      player._adUpdateFlag = true;
    }

    if (typeof errorData === 'undefined') {
      //修改视频源
      player.setSrc(player.cache.curPlayUrl);
      //更新player对象duration属性
      player.duration = player.cache.duration;
      //给重置currentTime属性
      player.currentTime = 0;
      //隐藏加载中
      player._hideLoading();

      if (player.cache.autoplay) {
        //隐藏中间播放按钮
        player.$midPlay.oriHide();
        //播放器加载就发送vv统计
        if (!player._sendVVFlag) {
          //加载播放器完成发送统计vv
          Console.log('统计: vv');
          VideoTrace.vv();
          player._sendVVFlag = true;
        }
        player._playOrPause('play');

      } else {
        player._playOrPause('pause');
        //隐藏主控界面
        player._hideMainCtrl();
        //显示中间播放按钮
        player._showMidPlayBtn();
        //显示海报
        player.showPoster();
        //如果UC,QQ切换片源时，先隐藏video标签，这样才能显示海报
        if (vars.IsUCBrowser || (vars.IsQQBrowser && !/QQBrowser\/4\.2/i.test(vars.UA))) {
          player.$video.oriHide();
        }
      }
    }

    if (player._firstLoadFlag) {
      //全屏处理
      if (!$.isUndefined(Action.URLGlobalParams.player)) {
        player._fullOrShrink('fullScreen');
        player._playOrPause('play');
      }
    }
    Console.log('播放器加载时间:' + (Date.now() - svp.debug.playerLoadStartTime) / 1000 + '秒');

    if (!player._sendPlayDisplayCompleteFlag) {
      Console.log('发送行为统计点:(play_display_complete)');
      //发送行为统计点(数据加载完成)
      ClickTrace.pingback(null, 'play_display_complete');
      player._sendPlayDisplayCompleteFlag = true;
    }

    if (typeof errorData !== 'undefined') {
      Console.log('发送内部行为统计: pay_video_tips');
      ClickTrace.pingback(null, 'pay_video_tips');
      //生成海报

      player._showMsg({
        text: errorData.msg, //观看本片请前往搜狐视频客户端
        btns: {
          btnA: {
            text: '下载搜狐视频客户端',
            callback: function () {
              Console.log('发送内部行为统计: pay_video_download');
              ClickTrace.pingback(null, 'pay_video_download');
              appDownload.gotoDownload();
            }
          }
        }
      });
    }
  };

  /**
   * @memberof MediaPlayer.prototype
   * @summary 播放器视频切换
   * @type {function}
   * @param {object}   data                                - 数据对象
   */
  MediaPlayer.prototype.updateMedia = function (data, isAutoplay) {
    var _this = this;

    if (!$.isUndefined(data)) {
      //数据检查
      if (!$.isUndefined(data.vid) && !$.isUndefined(data.liveId) && !$.isUndefined(data.src)) {
        //无效数据
        this._showMsg({text: errorTypes['PROCESS']['202']});
      
      } else {

        if (this.videoData !== null) {
          //隐藏相关推荐内容
          this.hideRecommend();

          if (_this.config.isShowRecommend) {
            var curPlayUrl = this.videoData.video_src || this.videoData.download_url || '';

            if (!$.isUndefined(data.src) && curPlayUrl.indexOf(data.src) > -1) {
              //修改显示相关推荐标志位
              this._showRecommendFlag = true;

              return;
            }
          }
        }

        //修改显示相关推荐标志位
        this._showRecommendFlag = false;

        if (!this._firstLoadFlag) {
          //更新播放器加载时间
          svp.debug.playerLoadStartTime = Date.now();
          //在iosqq浏览器中，无法捕获ended事件，这里在联播时候法从end统计
          // if (this._sendRealVVFlag && !this._sendEndFlag && (/QQBrowser\/5\./i.test(vars.UA) || vars.IsUCBrowser) && vars.IsIphone) {
          //更新视频时，如果没发ended统计，则补发
          if (this._sendRealVVFlag && !this._sendEndFlag) {
            Console.log('统计: ended');
            VideoTrace.ended(this.currentTime, this._bufferCount);
            this._sendEndFlag = true;
          }
          //用vid切换视频源的时候强制转换成video_data类型(采用通过查vid来查找详细信息的方式)
          if (!$.isUndefined(this.videoData)) {
            this.config.data = _this.videoData;
            this.config.dataType = 'video_data';
            this.config.isMediaAdContent = false;

            if (data.channeled && data.channeled !== 'default') {
              this.config.channeled = data.channeled;
            }
          }
          //重置标志位
          this._sendVVFlag = false;
          this._sendRealVVFlag = false;
          this._sendStartFlag = false;
          this._sendEndFlag = false;
          this._playByHistoryFlag = false;
          this._timeoutFlag = false;

          //如果没有配置参数
          if ($.isUndefined(this.config)) {
            //获取默认配置参数
            this.config = settings.initConfig({});
          }
          //重置数据
          data = $.extend(true, {}, data);
          //更新自动播放
          if (typeof isAutoplay !== 'undefined') {
            this.config.autoplay = isAutoplay;
          }
          //暂停
          this._playOrPause('pause');

          if (!vars.IsBaiduBrowser) {
            //显示加载中
            this._showLoading();
          }
        }

        //从接口获取详细数据
        //超时检查
        this._getDataFlag = false;

        setTimeout(function () {

          if (!_this._getDataFlag) {
            _this._timeoutFlag = true;
            _this._showMsg({
              text: errorTypes['REQUEST']['400'], //网络超时，请刷新重试
              btns: {
                btnA: {
                  text: '刷新',
                  callback: function () {
                    _this._timeoutFlag = false;
                    _this._hideMsg();
                    _this.updateMedia(data, isAutoplay);
                  }
                }
              }
            });
          }
        }, this._dataTimeout);

        svp.debug.playerLoadMediaDataStartTime = Date.now();
        //加入appid, h5统计用
        data.appid = _this.config.appid;
        //获取视频数据
        dataService.initData(data, function (cbData) {
          //修改标志位(如果数据源为source, 返回后也修改标志位)
          _this._sendMySugarFlag = true;
          Console.log('视频数据获取完成, 耗时--->' + (Date.now() - svp.debug.playerLoadMediaDataStartTime) / 1000);
          
          if (!_this._timeoutFlag) {
            _this._getDataFlag = true;

            if (cbData.code === '200' && !$.isUndefined(cbData.data)) {
              updatePlayerInfo(_this, cbData.data);

            } else if (cbData.code === '102' && !$.isUndefined(cbData.data)) {
              updatePlayerInfo(_this, cbData.data, cbData);

            } else if (cbData.code !== '' && !$.isUndefined(cbData.data)) {
              _this._showMsg({text: cbData.msg});

            } else {
              //数据无效
              _this._showMsg({
                text: errorTypes['PROCESS']['201'],
                btns: {
                  btnA: {
                    text: '刷新',
                    callback: function () {
                      _this.updateMedia(data, isAutoplay);
                    }
                  }
                }
              });
            }
          }
        });
      }
    }
  };
});
/**
 *
 *   @description: 该文件用于视频列表数据处理业务
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-02-01
 *
 *   @update-date: 2015-08-25
 *
 *   @update-log :
 *                 1.0.1 - 视频列表数据处理业务
 *                 1.0.2 - 将模块player.errorTypes变更为base.errorTypes
 *
 **/

svp.define('player.videoList', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;
  var MediaPlayer = require('player.mediaPlayer');
  var errorTypes = require('base.errorTypes');

  /**
   * @class MediaPlayer
   * @classdesc 播放器事件
   * @property {function}  _videoList                      - 视频列表数据处理
   */

  /**
   * @memberof MediaPlayer.prototype
   * @summary 处理多视频业务
   * @type {function}
   * @param {object}   data                                - config.data数据对象
   */
  MediaPlayer.prototype._videoList = function (data) {

    if (!$.isUndefined(data)) {
      var videoList = {};
      //初始化vidList数据
      if (!$.isUndefined(data.vidList) && $.isArray(data.vidList)) {
        videoList.vidList = data.vidList;
        videoList.site = data.site || '1';
        videoList.curIndex = 0;
        videoList.type = 'vidList';
      //初始化vidList数据
      } else if (!$.isUndefined(data.videoDataList) && $.isArray(data.videoDataList)) {
        videoList.videoDataList = data.videoDataList;
        videoList.curIndex = 0;
        videoList.type = 'videoDataList';
      }
      return videoList;
    //无效数据
    } else {
      this._showMsg({text: errorTypes['PROCESS']['202']});

      return false;
    }
  };
});