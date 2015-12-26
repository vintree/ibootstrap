/**
 *
 *   @description: 该文件用于定义特殊名单列表
 *
 *   @version    : 1.0.4
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-08-17
 *
 *   @update-log :
 *                 1.0.1 - 特殊名单列表
 *                 1.0.2 - 禁止了小米设备的自动播放
 *                 1.0.3 - 注释了禁止自动播放名单中除iphone、winphone外的的全部内容
 *                 1.0.4 - 新增了FEE_DATA_TYPE_LIST列表
 *
 **/

svp.define('base.special', function (require, exports, module) {

  'use strict';
  
  var vars = require('base.vars');
  var URL = require('base.url');
  var $ = svp.$;

  /**
   * @module base/special
   * @namespace special
   * @property {boolean}                                - 是否启用全局调试
   * @property {array}    COOPERATOR_LIST               - 合作方名单，增加video标签属性data-playUrl(m3u8整片) 和 data-downloadUrl(mp4整片)
   * @property {array}    CONTINUE_PLAY_REFRESH_LIST    - 联播需要刷新页面的名单
   * @property {array}    FORBID_AUTOPLAY_LIST          - 禁止自动播放名单
   * @property {array}    WX_FORBID_AUTOPLAY_LIST       - 微信禁止自动播放名单
   * @property {array}    TIMEUPDATE_REPLACE_ENDED_LIST - 使用timeupdate模拟ended名单
   * @property {array}    FORCE_USE_DOWNLOADURL_LIST    - 强制使用download播放名单
   * @property {array}    FORCE_USE_M3U8_LIST           - 强制使用m3u8播放名单
   * @property {array}    PLID_LIST                     - 需要特殊处理页面a标签链接的plid列表
   * @property {array}    ADV_BLACK_LIST                - 广告黑名单
   * @property {array}    SERVICE_BLACK_LIST            - 业务黑名单
   * @property {array}    FULL_SCREEN_LIST              - 默认全屏列表
   * @property {array}    M3U8_BLACK_LIST               - m3u8黑名单
   * @property {array}    MP4_BLACK_LIST                - mp4黑名单
   * @property {array}    VIDEO_DOWNLOAD_SRC_LIST       - 强制使用downloadurl播放的合作方src列表 video src=download mp4
   * @property {array}    VIDEO_M3U8_SRC_LIST           - 强制使用m3u8播放的合作方src列表 需要video src=m3u8
   * @property {array}    AD_FILTER_SRC_LIST            - 通过渠道号屏蔽广告
   * @property {array}    FEE_DATA_TYPE_LIST            - 付费视频dataType列表
   * @property {function} isRefreshWhenContinuePlay     - 是否在联播时刷新页面
   * @property {function} isInBlackList                 - 是否在指定类型的禁止播放的名单中
   * @property {function} isForceUseM3u8                - 是否强制使用m3u8播放
   * @property {function} isForceUseDownloadUrl         - 是否强制使用downloadurl播放
   * @property {function} isCooperator                  - 检验是否是合作商，检查合作方的UA
   * @property {function} cooperatorProcess             - 合作商数据处理,修改videoData的urls
   * @property {function} isFullScreen                  - 是否全屏
   * @property {function} advFilter                     - 广告过滤 返回false表示不过滤, 返回true表示过滤
   * @property {function} isForbidAutoplay              - 是否禁止自动播放
   * @property {function} isAllowPlayAdv                - 是否允许播放广告
   * @property {function} isAllowTimeupdateReplaceEnded - 是否允许用timeupdate事件替代ended事件
   *
   * @example
   *   var special = require('base.special');
   *   if (special.isForceUseM3u8()) {}
   *   var list = special.FORBID_AUTOPLAY_LIST;
   */

  
  var special = {};

  /**
   * @memberof special
   * @summary 合作方名单，增加video标签属性data-playUrl(m3u8整片) 和 data-downloadUrl(mp4整片)
   * @type {array}
   */
  special.COOPERATOR_LIST = [
    /XiaoMi\/MiPad/i
  ];

  /**
   * @memberof special
   * @summary 联播需要刷新页面的名单
   * @type {array}
   */
  special.CONTINUE_PLAY_REFRESH_LIST = [
    // /MQQBrowser/i
  ];

  /**
   * @memberof special
   * @summary 禁止自动播放名单
   * @type {array}
   */
  special.FORBID_AUTOPLAY_LIST = [
    // /MI[\s\-_]ONE/i,
    // /Android\/?\s?2\../i,  //有Android/2.x 也有Android 2.x
    // /XiaoMi/i,
    // /SAMSUNG/i,
    /Windows Phone/i,
    /iphone/i
    // /GiONEE/i,             //金立
    // /OPPP|R80/i,
    // /HM NOTE/i,
    // /Nexus/i,
    // /iPad.*Mac OS/i,
    // /HTC\sZ710e/i,
    // /M032.*JRO03H/i,      //魅族
    // /GT-/i,
    // /HUAWEI\sG750-T00/i,
    // /A000/i,              //1+手机
    // /qqdownloader/        //腾讯应用宝
  ];

  /**
   * @memberof special
   * @summary 微信禁止自动播放名单
   * @type {array}
   */
  special.WX_FORBID_AUTOPLAY_LIST = [
    /MI[\s\-_]+/i,
    /SM\-N90/i,
    /HUAWEI/i,
    /Coolpad/i,
    /E7/i,
    /GT\-I95/i,
    /GT\-N71/i,
    /M032.*JRO03H/i,      //魅族
    /Android\/?\s?4\.0/i
  ];

  /**
   * @memberof special
   * @summary 使用timeupdate模拟ended名单
   * @type {array}
   */
  special.TIMEUPDATE_REPLACE_ENDED_LIST = [
    /SM\-N90/i           //三星note3 三星note3当切换片源后就不再会触发ended事件，这里，note3用timeupdate模拟
  ];

  /**
   * @memberof special
   * @summary 强制使用download播放名单
   * @type {array}
   */
  special.FORCE_USE_DOWNLOADURL_LIST = [
    /M032.*JRO03H/i       //魅族
  ];

  /**
   * @memberof special
   * @summary 强制使用m3u8播放名单
   * @type {array}
   */
  special.FORCE_USE_M3U8_LIST = [
    // /SogouMSE,SogouMobileBrowser/i
  ];

  /**
   * @memberof special
   * @summary 需要特殊处理页面a标签链接的plid列表
   * @type {array}
   */
  special.PLID_LIST = [];

  /**
   * @memberof special
   * @summary 广告黑名单
   * @type {array}
   */
  special.ADV_BLACK_LIST = [
    /M032.*JRO03H/i,
    /Android\/?\s?2\../i,  //有Android/2.x 也有Android 2.x
    /Android\/?\s?4\.0.*X907.*QQBrowser/i,  //4.0.x下的oppo x907的QQ浏览器无法切换视频源
    /QQBrowser\/4\.2/i,      //qq 4.2无法切换视频源，只能播放一个视频
    /HTC8088_TD/i            //htcone8088无法切换视频
  ];

  /**
   * @memberof special
   * @summary 业务黑名单
   * @type {array}
   */
  special.SERVICE_BLACK_LIST = {
    ios: [],
    android: [
      //屏蔽索尼lt29i
      // /SonyLT29i/i,
      //屏蔽华为C8650
      // /HuaweiC8650/i,
      //屏蔽三星sch-i879
      // /SCH-I879/i
    ],
    winPhone: []
  };

  /**
   * @memberof special
   * @summary 默认全屏列表
   * @type {array}
   */
  special.FULL_SCREEN_LIST = [
    /XiaoMi\/MiPad/i
  ];

  /**
   * @memberof special
   * @summary m3u8黑名单
   * @type {array}
   */
  special.M3U8_BLACK_LIST = {
    ios: [
      //iphone下 qq5.1.1浏览器屏蔽了所有video事件，我们这里疲敝该版本qq浏览器
      // /MQQBrowser\/5\.1\.1 Mobile/i
    ],
    android: [
      //红米note
      /HM\sNOTE/i,
      //红米自带浏览器不支持m3u8
      /Build\/HM.*XiaoMi\/MiuiBrowser/i,
      //vivo自带浏览器不支持m3u8
      /vivo/i,
      //中兴自带浏览器不支持m3u8
      /ZTE/i,
      //TCL咚咚锵手机
      /TCL/i,
      //酷派手机
      /Coolpad/i,
      //魅族
      /M032.*JRO03H/i,
      //4.x的qq浏览器
      /MQQBrowser(\/4\.|\s4\.)+/i
    ],
    winPhone: []
  };

  /**
   * @memberof special
   * @summary mp4黑名单
   * @type {array}
   */
  special.MP4_BLACK_LIST = {
    ios: [],
    android: [],
    winPhone: []
  };

  /**
   * @memberof special
   * @summary 强制使用downloadurl播放的合作方src列表 video src=download mp4
   * @type {array}
   */
  special.VIDEO_DOWNLOAD_SRC_LIST  = [
    '1000',  //小米手机
    '1102'   //豌豆荚
  ];

  /**
   * @memberof special
   * @summary 强制使用m3u8播放的合作方src列表 需要video src=m3u8
   * @type {array}
   */
  special.VIDEO_M3U8_SRC_LIST = [
    '1080',  //小米pad
    '1128'   //搜狗
  ];

  /**
   * @memberof special
   * @summary 通过渠道号屏蔽广告
   * @type {array}
   */
  special.AD_FILTER_SRC_LIST = [
    '1000',
    '1080'
  ];

  /**
   * @memberof special
   * @summary 付费视频dataType列表
   * @type {array}
   */
  special.FEE_DATA_TYPE_LIST = [
    '257',
    '258'
  ];

  //是否在指定的黑名单中
  var isInBlackList = function (type, blackList) {
    var isBlackName = false;

    if (!$.isUndefined(type) && $.isArray(blackList[type])) {
      
      $.each(blackList[type], function (index, item) {
               
        if (item.test(vars.UA)) {
          //如果是qq浏览器
          if (vars.IsQQBrowser && item.toString().indexOf('QQBrowser') === -1) {
            isBlackName = false;

            return false;
          //其他浏览器
          } else {
            isBlackName = true;

            return false;
          }
        }
      });
    }

    return isBlackName;
  };

  //获取合作方src
  var getCooperatorSrc = function () {
    var src = URL.getQueryString('src') || URL.getQueryString('SRC') || '';
    
    if (src !== '' && src.length >= 4) {
      src = src.substr(0, 4);
    }

    return src;
  };

  /**
   * @memberof special
   * @summary 是否在联播时刷新页面
   * @type {function}
   * @return {boolean}                                   - 结果
   */
  special.isRefreshWhenContinuePlay = function () {
    var rst = false;

    $.each(special.CONTINUE_PLAY_REFRESH_LIST, function (index, item) {

      if (item.test(vars.UA)) {
        rst = true;
        
        return false;
      }
    });

    return rst;
  };

  /**
   * @memberof special
   * @summary 是否在指定类型的禁止播放的名单中
   * @type {function}
   * @param {string} type                               - 指定播放类型
   * @return {boolean}                                   - 结果
   */
  special.isInBlackList = function (type) {
        //ua类型
    var uaType = '',
        //是否在黑名单中
        isBlackName = false;

    if (vars.IsIPhone || vars.IsIPad) {
      uaType = 'ios';
    
    } else if (vars.IsAndroid) {
      uaType = 'android';
    
    } else if (vars.IsWindowsPhone) {
      uaType = 'winPhone';
    }

    if (type === 'm3u8' && (isInBlackList(uaType, special.SERVICE_BLACK_LIST) ||
           isInBlackList(uaType, special.M3U8_BLACK_LIST))) {
      isBlackName = true;
    
    } else if (type === 'mp4' && (isInBlackList(uaType, special.SERVICE_BLACK_LIST) ||
           isInBlackList(uaType, special.MP4_BLACK_LIST))) {
      isBlackName = true;
    }

    return isBlackName;
  };

  /**
   * @memberof special
   * @summary 是否强制使用m3u8播放
   * @type {function}
   * @return {boolean}                                   - 结果
   */
  special.isForceUseM3u8 = function () {
    var rst = false;
    var src = getCooperatorSrc();

    if ($(special.VIDEO_M3U8_SRC_LIST).indexOf(src) >= 0) {
      rst = true;
    }

    if (!rst) {
      
      $.each(special.FORCE_USE_M3U8_LIST, function (index, item) {

        if (item.test(vars.UA)) {
          rst = true;
          
          return false;
        }
      });
    }

    return rst;
  };

  /**
   * @memberof special
   * @summary 是否强制使用downloadurl播放
   * @type {function}
   * @return {boolean}                                   - 结果
   */
  special.isForceUseDownloadUrl = function () {
    var rst = false;
    var src = getCooperatorSrc();

    if ($(special.VIDEO_DOWNLOAD_SRC_LIST).indexOf(src) >= 0) {
      rst = true;
    }

    if (!rst) {
      $.each(special.FORCE_USE_DOWNLOADURL_LIST, function (index, item) {

        if (item.test(vars.UA)) {
          rst = true;
          
          return false;
        }
      });
    }

    return rst;
  };

  /**
   * @memberof special
   * @summary 检验是否是合作商，检查合作方的UA
   * @type {function}
   * @return {boolean}                                   - 结果
   */
  special.isCooperator = function () {
    var isCooper = false;
    
    $.each(special.COOPERATOR_LIST, function (index, item) {

      if (item.test(vars.UA)) {
        isCooper = true;
        
        return false;
      }
    });

    return isCooper;
  };

  /**
   * @memberof special
   * @summary 合作商数据处理,修改videoData的urls
   * @type {function}
   * @param {videoData}                                 - 播放数据
   * @return {boolean}                                   - 结果
   */
  special.cooperatorProcess = function (videoData) {
    var src = URL.getQueryString('src') || URL.getQueryString('SRC') || '';

    if (src !== '' && src.length >= 4) {
      src = src.substr(0, 4);
      //有合作方,并且downloadUrl不为空
      if ($(special.VIDEO_DOWNLOAD_SRC_LIST).indexOf(src) >= 0 && videoData.urls.downloadUrl.length > 0) {
        videoData.urls.mp4 = {};
        videoData.urls.mp4.nor = videoData.urls.downloadUrl;
      }
    }
  };

  /**
   * @memberof special
   * @summary 是否全屏
   * @type {function}
   * @return {boolean}                                   - 结果
   */
  special.isFullScreen = function () {
    var rst = false;
    //如果在全屏名单中
    $.each(special.FULL_SCREEN_LIST, function (index, item) {

      if (item.test(vars.UA)) {
        rst = true;

        return false;
      }
    });
    //如果url在中出现player=1
    var fullScreen = URL.getQueryString('player') || URL.getQueryString('PLAYER') || '';

    if (fullScreen === '1') {
      rst = true;
    }

    return rst;
    
  };

  /**
   * @memberof special
   * @summary 广告过滤 返回false表示不过滤, 返回true表示过滤
   * @type {function}
   * @return {boolean}                                  - 结果
   */
  special.advFilter = function () {
    var rst = false;
    var src = URL.getQueryString('src') || URL.getQueryString('SRC') || '';
    
    if (src && (src.indexOf('|') > -1)) {
      src = src.split('|')[0];
    }

    $.each(special.AD_FILTER_SRC_LIST, function (index, item) {

      if (src === item) {
        rst = true;

        return false;
      }
    });
    
    return rst;
  };

  /**
   * @memberof special
   * @summary 是否禁止自动播放
   * @type {function}
   * @return {boolean}                                  - 结果
   */
  special.isForbidAutoplay = function () {
    var rst = false;
    //autoplay参数设置
    $.each(special.FORBID_AUTOPLAY_LIST, function (index, item) {

      if (item.test(vars.UA)) {
        rst = true;

        return false;
      }
    });

    if (vars.IsWeixinBrowser) {

      $.each(special.WX_FORBID_AUTOPLAY_LIST, function (index, item) {

        if (item.test(vars.UA)) {
          rst = true;

          return false;
        }
      });
    }

    if (vars.IsAndroidPad) {
      rst = true;
    }

    return rst;
  };

  /**
   * @memberof special
   * @summary 是否允许播放广告
   * @type {function}
   * @return {boolean}                                  - 结果
   */
  special.isAllowPlayAdv = function () {
    var rst = true;
    //如果在广告名单中
    $.each(special.ADV_BLACK_LIST, function (index, item) {

      if (item.test(vars.UA)) {
        rst = false;

        return false;
      }
    });
    //是否被过滤
    if (special.advFilter()) {

      return false;
    }

    return rst;
  };

  /**
   * @memberof special
   * @summary 是否允许用timeupdate事件替代ended事件
   * @type {function}
   * @return {boolean}                                  - 结果
   */
  special.isAllowTimeupdateReplaceEnded = function () {
    var rst = false;
    //如果在广告名单中
    $.each(special.TIMEUPDATE_REPLACE_ENDED_LIST, function (index, item) {

      if (item.test(vars.UA)) {
        rst = true;

        return false;
      }
    });

    return rst;
  };

  

  module.exports = special;
});