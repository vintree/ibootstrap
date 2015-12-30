/**
  *   @description: 该文件用于检测手机媒体格式支持情况
  *
  *   @version    :1.0.2
  *
  *   @create-date: 2015-03-25
  *
  *   @update-date: 2015-06-09
  *
  *   @update-log :
  *                 1.0.1 - 检测手机媒体格式支持情况
  *                 1.0.2 - 在是否支持m3u8的方法中加入了IsBaiduBoxApp判断
  *
  */
svp.define('base.support', function (require, exports, module) {

  'use strict';

  var $ = svp.$;
  var vars = require('base.vars');
  var URL = require('base.url');
  var special = require('base.special');
  
  /**
  * @module base.support
  * @namespace support
  * @property {function} isUserHtml5              - 是否使用h5video播放
  * @property {function} isLiveUseHTML5           - 直播是否使用h5video播放
  * @property {function} isUseFlash               - 是否使用flash播放
  * @property {function} isSupportM3u8            - 是否支持m3u8格式
  * @property {function} isSupportWebm            - 是否支持webm格式
  * @property {function} isSupportMP4             - 是否支持mp4格式
  * @property {function} isSupportSVG             - 是否支持svg格式
  */
  
  var support = {
    /**
    * @memberOf support
    * @summary 是否使用h5video播放
    * @type {function}
    * @param {object} config                      - 播放器配置参数
    * @return {boolean}
    */
    isUseHtml5: function (config) {
      var m = null;

      if (/ipad|ipod|iphone|lepad_hls|IEMobile/ig.test(vars.UA)) {

        return true;
      }
      //android
      if (!!vars.IsAndroid) {

        if (support.isSupportMP4(config)) {

          return true;
        }

        if (vars.IsQQBrowser && vars.BrowserVersion >= 4.2) {

          return true;
        }

        if (vars.UA.indexOf('MI-ONE') !== -1 || vars.UA.indexOf('MI2') !== -1) {

          return true;
        }

        if (vars.OsVersion >= '4' && (m = vars.UA.match(/MicroMessenger\/((\d+)\.(\d+))\.(\d+)/))) {

          if (m[1] >= 4.2) {

            return true;
          }
        }

        if (vars.OsVersion >= '4.1') {

          return true;
        }
      }

      if (support.isSupportMP4(config) || support.isSupportM3u8(config)) {

        return true;
      }

      if (!!vars.IsIEBrowser && !!vars.IsWindows && vars.BrowserVersion >= 9) {
        
        return true;
      }

      return false;
    },

    /**
    * @memberOf support
    * @summary 直播是否使用h5video播放
    * @type {function}
    * @return {boolean}
    */
    isLiveUseHTML5: function () {

      if (vars.IsIOS) {
        
        return true;
      }

      if (!!vars.IsAndroid) {
        // android
        if (vars.IsQQBrowser && vars.BrowserVersion >= 4.2) {

          return true;
        }
      }

      return false;
    },
    
    /**
    * @memberOf support
    * @summary 使用flash播放
    * @type {function}
    * @return {boolean}
    */
    isUseFlash: function () {

      if (!!vars.IsIEBrowser && !!vars.IsWindows) {

        return true;
      }

      return false;
    },

    /**
    * @memberOf support
    * @summary 检测支持音频或视频类型 是否支持m3u8格式
    * @type {function}
    * @return {boolean}
    */
    isSupportM3u8: function () {
      // anPlayType方法说明 'probably' ,表示浏览器最可能支持 。 'maybe' ,表示浏览器可能支持 。 '' (空字符串),不支持 。
      //如果在黑名单中，直接返回false
      if (special.isInBlackList('m3u8')) {

        return false;
      }

      //ios平台或者强制指定m3u8
      if (vars.IsIphone || vars.IsIpad || (URL.getQueryString('srcType') === 'm3u8')) {

        return true;
      }

      var video = document.getElementsByTagName('video')[0] || document.createElement('video');
      //android和其他平台
      if (typeof video.canPlayType === 'function') {
        var playType = video.canPlayType('application/x-mpegURL');

        if (vars.IsAndroid && (vars.IsBaiduBrowser || vars.IsBaiduBoxApp || vars.IsQQBrowser || vars.IsNewUCBrowser)) {

          return true;
        }

        if (vars.IsAndroid && !vars.IsXiaoMI) {

          return false;
        }

        if (playType === 'probably') {

          return true;

        } else if (playType === 'maybe') {

          return false;
        }
      }

      return false;
    },
    /**
    * @memberOf support
    * @summary 检测支持音频或视频类型 是否支持webm格式
    * @type {function}
    * @return {boolean}
    */
    isSupportWebm: function () {

      if (vars.IsAndroid && vars.OsVersion >= '4.1') {
        
        return true;
      }
      var video = document.getElementsByTagName('video')[0] || document.createElement('video');

      if (typeof video.canPlayType === 'function') {

        if (video.canPlayType('video/webm; codecs="vp8.0, vorbis"') === 'probably' ||
          video.canPlayType('video/webm; codecs="vp9.0, vorbis"') === 'probably') {

          return true;
        }
      }

      return false;
    },
    
    /**
    * @memberOf support
    * @summary 检测支持音频或视频类型 是否支持mp4格式
    * @type {function}
    * @return {boolean}
    */
    isSupportMP4: function () {

      //如果在黑名单中，直接返回false
      if (special.isInBlackList('mp4')) {

        return false;
      }
      //如果强制指定mp4播放
      if (vars.IsWindowsPhone || URL.getQueryString('srcType') === 'mp4') {

        return true;
      }
      var video = document.getElementsByTagName('video')[0] || document.createElement('video');

      if (typeof video.canPlayType === 'function') {

        if (video.canPlayType('video/mp4; codecs="mp4v.20.8"') === '') {

          return false;
        }

        if (video.canPlayType('video/mp4; codecs="avc1.42E01E"') === '' ||
          video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') === '') {

          return false;
        }
      }

      return true;
    },

    /**
    * @memberOf support
    * @summary 检测支持音频或视频类型 是否支持svg格式
    * @type {function}
    * @return {boolean}
    */
    isSupportSVG: function () {

      if (!document.implementation || !$.isFunction(document.implementation.hasFeature)) {

        return false;
      }

      return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
    }
  };

  //外部接口
  module.exports = support;

});