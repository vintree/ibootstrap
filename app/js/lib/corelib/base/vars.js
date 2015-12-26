/**
 *
 *   @description: 该文件用于给VARS扩展设备/平台判断的相关参数和部分方法扩展
 *
 *   @version    : 1.0.4
 *
 *   @create-date: 2015-02-20
 *
 *   @update-date: 2015-12-01
 *
 *   @update-log :
 *                 1.0.1 - VARS扩展设备、平台判断的相关参数和部分方法扩展
 *                 1.0.2 - 新增note3判断参数IsSAMSUNGNote3
 *                         新增IsBaiduBoxApp、IsOldBaiduBrowser和IsNewUCBrowser参数
 *                 1.0.3 - 新增SVP_URL参数
 *                         新增IsSoGouBrowser参数
 *                 1.0.4 - 新增VSTAR_API_URL、VSTAR_PXY_URL、VSTAR_PXY_TEST_URL、VSTAR_MAIN_PATH、IsSohuVideoClient参数
 *
 **/

svp.define('base.vars', function (require, exports, module) {

  'use strict';
  
  var $ = svp.$;

  /**
   * @module base/vars
   * @namespace VARS
   * @property {boolean}  ENABLE_DEBUG                - 是否启用全局调试
   * @property {string}   API_KEY                     - api_key
   * @property {string}   API_URL                     - 下载API的默认相对地址
   * @property {string}   SVP_URL                     - h5后台接口host
   * @property {string}   API_LIVE_URL                - 直播数据获取地址API
   * @property {string}   API_PROXY_URL               - 下载API的代理地址
   * @property {boolean}  IsAutoTrace                 - window加载完后是否自动发送trace类数据
   * @property {string}   H5_URL                      - h5首页地址
   * @property {string}   H5_TEST_URL                 - h5测试首页地址
   * @property {string}   UA                          - 浏览器userAgent
   * @property {number}   PixelRatio                  - 设备屏幕象素密度
   * @property {boolean}  IS_HISTORY_SUPPORT          - 是否支持h5，不刷新页面，修改页面访问历史链接
   * @property {boolean}  IS_EXTERNAL_PLAYER          - 是否启外部player
   * @property {boolean}  IsAndroid                   - 是否是androd设备
   * @property {boolean}  IsAndroidPad                - 是否是androd pad
   * @property {boolean}  IsIOS                       - 是否是ios设备
   * @property {boolean}  IsIpad                      - 是否是ios pad
   * @property {boolean}  IsIpod                      - 是否是ios pod
   * @property {boolean}  IsIphone                    - 是否是ios phone
   * @property {boolean}  IsWindowsPhone              - 是否是windows phone
   * @property {boolean}  IsOldWindowsPhone           - 是否是老版本windows phone(8.1之前算)
   * @property {boolean}  IsNewWindowsPhone           - 是否是新版本windows phone(8.1之后算)
   * @property {boolean}  IsWindowsPad                - 是否是windows pad
   * @property {boolean}  IsWindows                   - 是否是windows系统
   * @property {boolean}  IsVivoPhone                 - 是否是vivo手机
   * @property {boolean}  IsIEBrowser                 - 是否是ie browser
   * @property {boolean}  IsSafariBrowser             - 是否是safari browser
   * @property {boolean}  IsChromeBrowser             - 是否是chrome browser
   * @property {boolean}  IsWeixinBrowser             - 是否是微信 webview
   * @property {boolean}  IsQQBrowser                 - 是否是qq browser
   * @property {boolean}  IsUCBrowser                 - 是否是uc browser
   * @property {boolean}  IsOldUCBrowser              - 是否是老版本uc browser(10.2之前版本为老版本，认为不支持m3u8)
   * @property {boolean}  IsNewUCBrowser              - 是否是新版本uc browser(10.2之后版本为新版本，认为支持m3u8)
   * @property {boolean}  IsSoGouBrowser              - 是否是搜狗 browser
   * @property {boolean}  IsMiBrowser                 - 是否是小米 browser
   * @property {boolean}  IsBaiduBrowser              - 是否是baidu browser
   * @property {boolean}  IsOldBaiduBrowser           - 是否是旧baidu browser 5.7.3.0之前为新百度播放器 
   * @property {boolean}  IsNewBaiduBrowser           - 是否是新baidu browser 5.7.3.0之后为新百度播放器
   * @property {boolean}  IsBaiduBoxApp               - 是否是手机baidu
   * @property {boolean}  IsTouch                     - 是否支持触屏
   * @property {boolean}  OsVersion                   - 获取系统版本
   * @property {boolean}  IsMIOne                     - 是否是小米1
   * @property {boolean}  IsXiaoMI                    - 是否是小米
   * @property {boolean}  IsVivoPhone                 - 是否vivo手机
   * @property {boolean}  IsSonyPhone                 - 是否是索尼手机
   * @property {boolean}  IsSAMSUNG                   - 是否是三星
   * @property {boolean}  IsSAMSUNGNote3              - 是否是三星note3
   * @property {string}   BrowserVersion              - 浏览器版本
   * @property {string}   START_EVENT                 - 动作起始事件
   * @property {string}   MOVE_EVENT                  - 动作移动事件
   * @property {string}   END_EVENT                   - 动作结束事件
   * @property {string}   CANCEL_EVENT                - 动作取消事件
   * @property {string}   RESIZE_EVENT                - 屏幕横竖屏切换事件
   * @property {boolean}  IsShouSou                   - 是否是首搜页面
   * @property {string}   WebRoot                     - h5视频页面的域名
   * @property {function} BlankFn                     - 空方法
   * @property {string}   H5Channeled                 - h5 channeled
   * @property {boolean}  IsHistorySupport            - 是否支持history
   * @property {boolean}  IsSohuVideoClient           - 是否搜狐视频客户端
   * @property {number}   ADPingbackCount             - 统计技术调试参数
   * @property {string}   H5Src                       - 渠道号
   * @property {string}   VSTAR_API_URL               - 接口get请求地址
   * @property {string}   VSTAR_PXY_URL               - 接口post请求地址(走代理)
   * @property {string}   VSTAR_PXY_TEST_URL          - 测试代理地址
   * @property {string}   VSTAR_MAIN_PATH             - 粉丝团页面主路径
   *
   * @example
   *   var VARS = require('base.vars');
   *   if (VARS.ENABLE_DEBUG) {}
   *
   */
  var VARS = {};

  /**
   * @summary 对外接口，用户设置和获取播放记录，具体属性由播放器添加
   * @namespace SohutvJSBridge
   * @global
   */
  window.SohutvJSBridge = window.SohutvJSBridge || {};
   //别相互循环嵌套
  var __getQueryString = $.getUrlParam;

  VARS.__getQueryString = __getQueryString;
  // var _ENABLE_DEBUG = /t.m.tv.sohu.com/i.test(location.href) ? true : false;
  /**
   * @memberof VARS
   * @summary 是否启用全局调试
   * @type {boolean}
   */
  VARS.ENABLE_DEBUG = __getQueryString('debug') || __getQueryString('DEBUG') || false;

  /**
   * @memberof VARS
   * @summary 是否支持h5，不刷新页面，修改页面访问历史链接
   * @type {boolean}
   */
  VARS.IS_HISTORY_SUPPORT = ('pushState' in history);

  /**
   * @memberof VARS
   * @summary 是否启外部player
   * @type {boolean}
   */
  VARS.IS_EXTERNAL_PLAYER = location.href.match(/player=1/i) || (location.host.indexOf('m.sohu.com') > -1);

  /**
   * @memberof VARS
   * @summary api_key编码
   * @type {string}
   */
  VARS.API_KEY = 'f351515304020cad28c92f70f002261c';

  /**
   * @memberof VARS
   * @summary 下载API的默认相对地址
   * @type {string}
   */
  VARS.API_URL = 'http://api.tv.sohu.com/';
  // VARS.API_URL = 'http://dev.app.yule.sohu.com/';

  /**
   * @memberof VARS
   * @summary h5后台接口host
   * @type {string}
   */
  VARS.SVP_URL = 'http://m.tv.sohu.com/';

  /**
   * @memberOf VARS
   * @summary 直播数据地址
   * @type {String}
   */
  VARS.API_LIVE_URL = 'http://live.m.tv.sohu.com/api/';

  /**
   * @memberOf VARS
   * @summary 接口get请求地址
   * @type {String}
   */
  VARS.VSTAR_API_URL ='http://api.tv.sohu.com/';

  /**
   * @memberOf VARS
   * @summary 接口post请求地址(走代理)
   * @type {String}
   */
  VARS.VSTAR_PXY_URL ='http://fans.tv.sohu.com/api/';

  /**
   * @memberOf VARS
   * @summary 测试代理地址
   * @type {String}
   */
  VARS.VSTAR_PXY_TEST_URL ='http://t.m.tv.sohu.com/pxy1/';

  /**
   * @memberof VARS
   * @summary window加载完后是否自动发送trace类数据
   * @type {boolean}
   */
  VARS.IsAutoTrace = false;

  /**
   * @memberof VARS
   * @summary 粉丝团页面主路径
   * @type {boolean}
   */
  VARS.VSTAR_MAIN_PATH = 'http://fans.tv.sohu.com/h5/vstar/';

  /**
   * @memberof VARS
   * @summary h5首页地址
   * @type {string}
   */
  VARS.H5_URL = 'http://m.tv.sohu.com/';

  /**
   * @memberof VARS
   * @summary 下载API的代理地址
   * @type {string}
   */
  VARS.API_PROXY_URL = 'http://m.tv.sohu.com/api/';

  /**
   * @memberof VARS
   * @summary h5测试首页地址
   * @type {string}
   */
  VARS.H5_TEST_URL = 'http://t.m.tv.sohu.com/';

  /**
   * @memberof VARS
   * @summary 浏览器userAgent
   * @type {boolean}
   */
  VARS.UA = window.navigator.userAgent;

  
  //获取设备密度
  var getDevicePixelRatio = function () {
    var ratio = 1;
    
    try {
      
      if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
        ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
      
      } else if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
      
      } else {
        ratio = window.devicePixelRatio;
      }
      ratio = parseFloat(ratio) || 1;

    } catch (e) {}
    
    return ratio;
  };
  /**
   * @memberof VARS
   * @summary 设备屏幕象素密度
   * @type {number}
   */
  VARS.PixelRatio = getDevicePixelRatio();



  /**
   * @memberof VARS
   * @summary 是否是androd设备
   * @type {boolean}
   */
  // HTC Flyer平板的UA字符串中不包含Android关键词
  // 极速模式下视频不显示 UCWEB/2.0 (Linux; U; Adr 4.0.3; zh-CN; LG-E612) U2/1.0.0 UCBrowser/9.6.0.378 U2/1.0.0 Mobile
  VARS.IsAndroid = !!(/Android|HTC|Adr/i.test(VARS.UA)  || !!(window.navigator.platform + '').match(/Linux/i));
  
  /**
   * @memberof VARS
   * @summary 是否是ios pad
   * @type {boolean}
   */
  VARS.IsIpad = !VARS.IsAndroid && /iPad/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是ios pod
   * @type {boolean}
   */
  VARS.IsIpod = !VARS.IsAndroid && /iPod/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是是否是ios phone
   * @type {boolean}
   */
  VARS.IsIphone = !VARS.IsAndroid && /iPod|iPhone/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是ios设备
   * @type {boolean}
   */
  VARS.IsIOS = VARS.IsIpad || VARS.IsIphone;

  /**
   * @memberof VARS
   * @summary 是否是windows phone
   * @type {boolean}
   */
  VARS.IsWindowsPhone = /Windows Phone/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是老版本windows phone(8.1之前算) winphone 8.1之前算old(采用全屏播放),8.1(含)之后，采用的是标准播放(小窗+假全屏)
   * @type {boolean}
   */
  VARS.IsOldWindowsPhone = /Windows\sPhone\s([1234567]\.|8\.0)/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是新版本windows phone(8.1之前算) winphone 8.1之前算old(采用全屏播放),8.1(含)之后，采用的是标准播放(小窗+假全屏)
   * @type {boolean}
   */
  VARS.IsNewWindowsPhone = VARS.IsWindowsPhone && !VARS.IsOldWindowsPhone;

  /**
   * @memberof VARS
   * @summary 是否是windows pad
   * @type {boolean}
   */
  VARS.IsWindowsPad = /Windows\sPad/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是windows系统
   * @type {boolean}
   */
  VARS.IsWindows = /Windows/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是vivo手机
   * @type {boolean}
   */
  VARS.IsVivoPhone = /vivo/i.test(VARS.UA);

  VARS.ScreenSizeCorrect = 1;
  
  if (VARS.IsAndroid) {
    
    if ((window['screen']['width'] / window['innerWidth']).toFixed(2) ===  VARS.PixelRatio.toFixed(2)) {
      VARS.ScreenSizeCorrect = 1 / VARS.PixelRatio;
    }
  }
  VARS.AdrPadRegex = /pad|XiaoMi\/MiPad|lepad|YOGA|MediaPad|GT-P|SM-T|GT-N5100|sch-i800|HUAWEI\s?[MTS]\d+-\w+|Nexus\s7|Nexus\s8|Nexus\s11|Kindle Fire HD|Tablet|tab/i;
  VARS.ScreenSize = Math.floor(window.screen['width'] * VARS.ScreenSizeCorrect) + 'x' + Math.floor(window.screen['height'] * VARS.ScreenSizeCorrect);
  //根据这些值就可以反向算出屏幕的物理尺寸 ,屏幕尺寸=屏幕对角线的像素值/（密度*160）
  //屏幕尺寸=Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2))/ (密度*160)
  //判断是否为平板
  VARS.gpadJSON ={};
  var isGpad = function () {
    //安卓pad正则
    var padScreen = 1;
    var _IsAndroidPad = false;
    var _ratio = VARS.ScreenSizeCorrect || 1;
    //像素
    var sw = Math.floor(window.screen.width * _ratio);
    var sh = Math.floor(window.screen.height * _ratio);
    var inch = 1;
    
    try {
      //对角线长度大于
      padScreen = parseFloat(Math.sqrt(sw * sw + sh * sh));
      //尺寸
      inch = parseFloat(padScreen / (160 * VARS.PixelRatio));
    
    } catch (e) {}
    // 对角线长度大于1280 则为Pad
    if (!!('ontouchstart' in window) && VARS.IsAndroid) {
      var adrPad = !!(VARS.AdrPadRegex.test(VARS.UA));

      if (/mobile/i.test(VARS.UA) && !adrPad ) {
        _IsAndroidPad = false;

      } else {

        if (adrPad) {
          _IsAndroidPad = true;
        } else {
          // 对角线长度大于 2500 ,inch > 7.0  则为Pad
          if (!_IsAndroidPad && (padScreen >= 2500 || inch > 7.0)) {
            _IsAndroidPad = true;
          }
        }
      }
    }
    VARS.gpadJSON ={'width':sw,'height':sh,'PixelRatio':VARS.PixelRatio,' padScreen':padScreen,'inch':inch,'isGpad':_IsAndroidPad,'UA':VARS.UA};
    //alert(JSON.stringify(VARS.gpadJSON));
    return _IsAndroidPad;
  };

  /**
   * @memberof VARS
   * @summary 是否是androd pad
   * @type {boolean}
   */
  VARS.IsAndroidPad = isGpad();


  /**
   * @memberof VARS
   * @summary 是否是ie browser
   * @type {boolean}
   */
  VARS.IsIEBrowser = !!document.all && ((navigator.platform === 'Win32') || (navigator.platform === 'Win64') || (navigator.platform === 'Windows'));

  /**
   * @memberof VARS
   * @summary 是否是safari browser
   * @type {boolean}
   */
  VARS.IsSafariBrowser = !! (VARS.UA.match(/Safari/i) && !VARS.IsAndroid);

  /**
   * @memberof VARS
   * @summary 是否是chrome browser
   * @type {boolean}
   */
  VARS.IsChromeBrowser = !! (VARS.UA.match(/Chrome/i) && !VARS.IsAndroid);

  /**
   * @memberof VARS
   * @summary 是否是微信 webview
   * @type {boolean}
   */
  VARS.IsWeixinBrowser = !! (window['WeixinJSBridge'] || /MicroMessenger/i.test(VARS.UA));

  /**
   * @memberof VARS
   * @summary 是否是qq browser
   * @type {boolean}
   */
  VARS.IsQQBrowser = !!(/MQQBrowser/i.test(VARS.UA));

  /**
   * @memberof VARS
   * @summary 是否是uc browser
   * @type {boolean}
   */
  VARS.IsUCBrowser = !!(/UCBrowser/i.test(VARS.UA));

  /**
   * @memberof VARS
   * @summary 是否是老版本uc browser(10.2之前版本为老版本，认为不支持m3u8)
   * @type {boolean}
   */
  VARS.IsOldUCBrowser = !!(/UCBrowser\/([1-9]\..*|10\.[01].*)/i.test(VARS.UA));

  /**
   * @memberof VARS
   * @summary 是否是老版本uc browser(10.2之前版本为老版本，认为不支持m3u8)
   * @type {boolean}
   */
  VARS.IsNewUCBrowser = VARS.IsUCBrowser && !VARS.IsOldUCBrowser;

  /**
   * @memberof VARS
   * @summary 是否是搜狗 browser
   * @type {boolean}
   */
  VARS.IsSoGouBrowser = !!(/SogouMobileBrowser/i.test(VARS.UA));

  /**
   * @memberof VARS
   * @summary 是否是小米 browser
   * @type {boolean}
   */
  VARS.IsMiBrowser = !!(/MiuiBrowser/i.test(VARS.UA));

  /**
   * @memberof VARS
   * @summary 是否是baidu browser
   * @type {boolean}
   */
  VARS.IsBaiduBrowser = !!(/baidubrowser/i.test(VARS.UA));

  /**
   * @memberof VARS
   * @summary 是否是手机baidu
   * @type {boolean}
   */
  VARS.IsBaiduBoxApp = !!(/baiduboxapp/i.test(VARS.UA));

  /**
   * @memberof VARS
   * @summary 是否是老baidu browser 5.7.3.0之前为老版本百度播放器
   * @type {boolean}
   */
  VARS.IsOldBaiduBrowser = !!(/baidubrowser\/([01234]\..*|5\.[0123456]\..*|5\.7\.[012])/i.test(VARS.UA));

  /**
   * @memberof VARS
   * @summary 是否是新baidu browser 5.7.3.0之后为新百度播放器，新版本播放器能够正常触发timeupdate事件和允许小窗播放(小窗video标签能遮盖导航栏)
   * @type {boolean}
   */
  VARS.IsNewBaiduBrowser = VARS.IsBaiduBrowser && !VARS.IsOldBaiduBrowser;

  /**
   * @memberof VARS
   * @summary 是否支持触屏
   * @type {boolean}
   */
  VARS.IsTouch = 'ontouchstart' in window;

  //获取浏览器版本
  var getBrowserVer = function () {
    var ua = VARS.UA;
    var MQQBrowser = ua.match(/MQQBrowser\/(\d+\.\d+)/i),
        MQQClient = ua.match(/QQ\/(\d+\.(\d+)\.(\d+)\.(\d+))/i),
        WeChat = ua.match(/MicroMessenger\/((\d+)\.(\d+))\.(\d+)/) || ua.match(/MicroMessenger\/((\d+)\.(\d+))/),
        MiuiBrowser = ua.match(/MiuiBrowser\/(\d+\.\d+)/i),
        UC = ua.match(/UCBrowser\/(\d+\.\d+(\.\d+\.\d+)?)/) || ua.match(/\sUC\s/),
        IEMobile = ua.match(/IEMobile(\/|\s+)(\d+\.\d+)/),
        //HTC = ua.indexOf('HTC') > -1,
        ipod = ua.match(/(ipod\sOS)\s([\d_]+)/);
    var ver = NaN;

    if (window.ActiveXObject) {
      ver = 6;
      
      if (window.XMLHttpRequest || (ua.indexOf('MSIE 7.0') > -1)) {
        ver = 7;
      }

      if (window.XDomainRequest || (ua.indexOf('Trident/4.0') > -1)) {
        ver = 8;
      }
      
      if (ua.indexOf('Trident/5.0') > -1) {
        ver = 9;
      }

      if (ua.indexOf('Trident/6.0') > -1) {
        ver = 10;
      }
      
    } else if (ua.indexOf('Trident/7.0') > -1) {
      ver = 11;
    }

    if (ipod) {
      ver = ipod[2].replace(/_/g, '.');
    }

    if (MQQBrowser) {
      ver = MQQBrowser[1];
    }

    if (MQQClient) {
      ver = MQQClient[1];
    }

    if (WeChat) {
      ver = WeChat[1]; //weixin
    }

    if (MiuiBrowser) {
      ver = MiuiBrowser[1];
    }

    if (UC) {
      ver = UC[1] || NaN;
    }

    if (MQQBrowser && (!window.mtt || !window.mtt.getBrowserParam) && VARS.IsAndroid) {
      ver = '9.6.0' || NaN;
    }

    if (IEMobile) {
      ver = IEMobile[2];
    }

    return ver;
  };
  /**
   * @memberof VARS
   * @summary 浏览器版本
   * @type {string}
   */
  VARS.BrowserVersion = getBrowserVer();

  var getOsVer = function () {
    var ua = VARS.UA;
    var ver = NaN;

    if ($.os && $.os.version) {
      ver = $.os.version;
    
    } else {
      var webkit = ua.match(/Web[kK]it[\/]{0,1}([\d.]+)/),
          android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
          ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
          ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
          iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
          webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
          kindle = ua.match(/Kindle\/([\d.]+)/),
          blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
          bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
          rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/);

      if (webkit) {
        ver = webkit[1];
      }

      if (android) {
        ver = android[2];
      }

      if (iphone && !ipod) {
        ver = iphone[2].replace(/_/g, '.');
      }

      if (ipad) {
        ver = ipad[2].replace(/_/g, '.');
      }

      if (ipod) {
        ver = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
      }

      if (webos) {
        ver = webos[2];
      }

      if (blackberry) {
        ver = blackberry[2];
      }

      if (bb10) {
        ver = bb10[2];
      }

      if (rimtabletos) {
        ver = rimtabletos[2];
      }

      if (kindle) {
        ver = kindle[1];
      }
    }

    return ver;
  };
  /**
   * @memberof VARS
   * @summary 获取系统版本
   * @type {boolean}
   */
  VARS.OsVersion = getOsVer();

  /**
   * @memberof VARS
   * @summary 是否是小米1
   * @type {boolean}
   */
  VARS.IsMIOne = /MI-ONE/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是小米
   * @type {boolean}
   */
  VARS.IsXiaoMI = /MI/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否vivo手机
   * @type {boolean}
   */
  VARS.IsVivoPhone = /vivo/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是索尼手机
   * @type {boolean}
   */
  VARS.IsSonyPhone = /Sony/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是三星设备
   * @type {boolean}
   */
  VARS.IsSAMSUNG = /SAMSUNG/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是三星note3
   * @type {boolean}
   */
  VARS.IsSAMSUNGNote3 = /SAMSUNG SM-N90/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 动作起始事件
   * @type {boolean}
   */
  VARS.START_EVENT = VARS.IsTouch ? 'touchstart' : 'mousedown';

  /**
   * @memberof VARS
   * @summary 动作移动事件
   * @type {boolean}
   */
  VARS.MOVE_EVENT = VARS.IsTouch ? 'touchmove' : 'mousemove';

  /**
   * @memberof VARS
   * @summary 动作结束事件
   * @type {boolean}
   */
  VARS.END_EVENT = VARS.IsTouch ? 'touchend' : 'mouseup';

  /**
   * @memberof VARS
   * @summary 动作取消事件
   * @type {boolean}
   */
  VARS.CANCEL_EVENT = VARS.IsTouch ? 'touchcancel' : 'mouseup';

  /**
   * @memberof VARS
   * @summary 屏幕横竖屏切换事件
   * @type {boolean}
   */
  VARS.RESIZE_EVENT = 'onorientationchange' in window ? 'orientationchange' : 'resize';

  /**
   * @memberof VARS
   * @summary 是否是首搜页面
   * @type {boolean}
   */
  VARS.IsShouSou = location.host.indexOf('m.sohu.com') > -1;

  /**
   * @memberof VARS
   * @summary 是否站外页面内嵌播放器
   * @type {boolean}
   */
  VARS.IS_EXTERNAL_PLAYER = location.href.match(/player=1/i) || VARS.IsShouSou;

  /**
   * @memberof VARS
   * @summary h5视频页面的域名
   * @type {string}
   */
  VARS.WebRoot = '';
  // 这个变量的存在是因为体育频道是独立域名m.s.sohu.com，
  // 在体育频道点击视频推荐需要返回到m.tv.sohu.com
  if ('m.s.sohu.com' === location.host) {
    VARS.WebRoot = 'http://m.tv.sohu.com';
  }

  /**
   * @memberof VARS
   * @summary 空方法
   * @type {function}
   */
  VARS.BlankFn = function () {};

  /**
   * @memberof VARS
   * @summary h5 channeled
   * @property {string}
   */
  VARS.H5Channeled = VARS.IsWeixinBrowser ? '1200230001' : '1211010100';

  /**
   * @memberof VARS
   * @summary 是否支持history
   * @type {boolean}
   */
  VARS.IsHistorySupport = ('pushState' in history);

  /**
   * @memberof VARS
   * @summary 统计技术调试参数
   * @type {number}
   */
  VARS.ADPingbackCount = 0;

  /**
   * @memberof VARS
   * @summary 是否搜狐视频客户端
   * @type {boolean}
   */
  VARS.IsSohuVideoClient = (/SohuVideoMobile/i.test(VARS.UA) || __getQueryString('clientType') && __getQueryString('clientVer')) ? true : false;

  /**
   * @memberof VARS
   * @summary 渠道号
   * @type {string}
   */

  VARS.H5Src = __getQueryString('src') || __getQueryString('SRC') || '';

  //测试初始化
  var testInit = function () {
    //post和get接口地址统一采用测试机代理
    if (/t\.m\.tv\.sohu\.com/.test(window.location.host)) {
      VARS.VSTAR_API_URL = VARS.VSTAR_PXY_URL = VARS.VSTAR_PXY_TEST_URL;
      VARS.VSTAR_MAIN_PATH = '';
    }
  };
  testInit();
  
  //导出接口
  module.exports = VARS;
  
  window.svp.VARS = VARS;
   
});