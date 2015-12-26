/**
 *
 *   @description: 该文件用于获取下载和渠道信息
 *
 *   @version  : 1.0.4
 *
 *   @create-date: 2015-04-01
 *
 *   @update-date: 2015-08-27
 *
 *   @update-log :
 *                 1.0.1 - 获取下载和渠道信息业务
 *                 1.0.2 - 在频道信息中加入了cid字段
 *                 1.0.3 - 加入了$的声明
 *                 1.0.4 - 修复存储本地业务bug
 *
 */
svp.define('data.appDownload', function (require, exports, module) {

  'use strict';

  var $ = svp.$,
    vars = require('base.vars'),
    util = require('base.util'),
    cookie = require('base.cookie');

  /**
   * @module data.appDownload
   * @namespace appDownload
   * @property {string}   channelSrc        指定渠道号, 默认是0(采用默认下载地址), 在url中叫src，在cookie中叫MTV_SRC
   * @property {number}   updateTime        本地存储渠道信息有效时间
   * @property {number}   maxSaveCounts     本地存储最大记录数
   * @property {function} getLocalData      获取本地数据
   * @property {function} setLocalData      设置本地信息
   * @property {function} getChannelInfo    获取渠道相关信息
   * @property {function} getDownloadUrl    获取下载地址
   * @property {function} gotoDownload      下载app
   *
   * @example
   *    var download = require('data.appDownload');
   */
  var Download = {
    /**
     * @memberof appDownload
     * @summary 指定渠道号, 默认是0(采用默认下载地址), 在url中叫src，在cookie中叫MTV_SRC
     * @type {string}
     */
    channelSrc: '0',
    /**
     * @memberof appDownload
     * @summary 本地存储渠道信息有效时间
     * @type {number}
     */
    updateTime: 1000 * 60 * 60,
    /**
     * @memberof appDownload
     * @summary 本地存储最大记录数
     * @type {number}
     */
    maxSaveCounts: 10,
    /**
     * @memberof appDownload
     * @summary 获取本地数据
     * @type {function}
     * @param {string} src 渠道来源
     */
    getLocalData: function (src) {
      var localDataStr = cookie.get('localChannelInfo');
      var rstDataList = [],
        rstData = null;

      if (typeof localDataStr !== 'undefined' && localDataStr !== '' && localDataStr !== null) {
        rstDataList = JSON.parse(localDataStr);
      }
      //如果指定单个src数据，则返回指定数据对象或null
      if (typeof src !== 'undefined') {

        for (var i = 0, l = rstDataList.length; i < l; i++) {
          var data = rstDataList[i];
          //如果本地已经有存储数据
          if (data.channelSrc === src && Date.now() < (data.time + this.updateTime)) {
            rstData = data;

            break;
          }
        }

        return rstData;
        //如果未指定src，则返回列表
      } else {

        return rstDataList;
      }
    },
    /**
     * @memberof appDownload
     * @summary 设置本地信息
     * @type {function}
     * @param {object} data 需要修改的信息
     */
    setLocalData: function (data) {
      
      //当前时间
      var newInfo = $.extend({}, data);
      newInfo.time = Date.now();

      var saveList = this.getLocalData();
      var findLag = false;

      for (var i = 0, l = saveList.length; i < l; i++) {
        var item = saveList[i];

        if (item.channelSrc === newInfo.channelSrc) {
          findLag = true;
          saveList[i] = newInfo;

          break;
        }
      }

      if (!findLag) {
        saveList.unshift(newInfo);
      }

      if (saveList.length > this.maxSaveCounts) {
        saveList.length = this.maxSaveCounts;
      }
      //缓存到cookie中
      cookie.set('localChannelInfo', JSON.stringify(saveList));
    },
    /**
     * @memberof appDownload
     * @summary 获取渠道相关信息
     * @type {function}
     * @param {object} param 配置参数
     * @param {function} callback 回调函数
     */
    getChannelInfo: function (param, callback) {
      var _this = this;
      var channelSrc = (param && param.channelSrc) ? param.channelSrc : this.channelSrc;
      callback = (typeof callback === 'function') ? callback : function () {};

      if ((channelSrc + '').length > 4) {
        channelSrc = channelSrc.substr(0, 4);
      }
      var cbData = {
        appointUrl: util.getSohuDefaultApplink(),
        startapp: '1',      // '0' 尝试自动拉起app; '1' 尝试拉起app，并弹窗, '2' 不拉app，直接下载
        channelSrc: channelSrc, //渠道src
        cover: 1,         //1: 显示cover页, 0: 不显示
        isClosed: 0,      //0: 不关闭广告(播放广告), 1: 关闭广告(不播放广告)
        timeLimit: 0,       //限制播放时长, 秒
        channelNum: 680,    //渠道number
        cid: '',        //限制播放时长的分类id
        quality: 'nor,hig,sup'
      };
      //先从storage中获取相关信息
      if (this.getLocalData(channelSrc) !== null) {
        var localInfo = this.getLocalData(channelSrc);

        if ($.isUndefined(localInfo.cover)) {
          localInfo.cover = 1;
          localInfo.isClosed = 0;
          localInfo.timeLimit = 0;
          localInfo.quality = 'nor,hig,sup';
          localInfo.channelNum = 680;
        }
        if ($.isUndefined(localInfo.cid)) {
          localInfo.cid = '';
        }
        callback(localInfo);

      } else {
        //处理非数值的channelSrc
        channelSrc = parseInt(channelSrc, 10);
        
        if (isNaN(channelSrc)) {
          channelSrc = '0';
        }
        var ajaxUrl = 'http://m.tv.sohu.com/h5/cooperation/' + channelSrc + '.json?pos=1&platform=' + util.getUserPt() + '&callback=?';
        console.log('获取下载链接ajax:', ajaxUrl);
        //获取当天的时间戳
        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        //请求指定的渠道号下载地址
        $.ajax({
          data: {t: date.getTime()},
          url: ajaxUrl,
          type: 'get',
          dataType: 'jsonp',
          cache: true,
          success: function (data) {
            
            if (typeof data !== 'undefined' && data.records && data.records.length > 0) {
              var record = data.records[0];
              //设置返回值中的下载包地址，并缓存
              if (!(vars.IsIpad || vars.IsIphone || vars.IsWeixinBrowser)) {
                cbData.appointUrl = record.link;
              }
              //设置返回值中的自动拉起app标志位，并缓存
              cbData.startapp = (typeof record.startapp !== 'undefined') ? (record.startapp + '') : '1';
              cbData.cover = record.cover;
              cbData.isClosed = record.isClosed;
              //如果当前视频的专辑id在限制时长的列表内，则修改播放时长
              cbData.cid = record.cid || '';
              cbData.timeLimit = record.time_limit;
              cbData.quality = record.quality;
              cbData.channelNum = record.num;
              cbData.time = Date.now();
              //存储到本地
              _this.setLocalData(cbData);
            }
            //返回参数
            callback(cbData);
          },
          error: function () {
            //返回默认参数
            callback(cbData);
          }
        });
      }
    },
    /**
     * @memberof appDownload
     * @summary 获取下载地址
     * @type {function}
     * @param {object} param 配置参数
     * @param {function} callback 回调函数
     */
    getDownloadUrl: function (param, callback) {
      callback = (typeof callback === 'function') ? callback : function () {};
      //强制指定下载地址
      if (param && param.downUrl) {
        callback(param.downUrl);

      //如果制定了渠道号
      } else {
        var channelSrc = (param && param.channelSrc) || this.channelSrc;
        var localData = this.getLocalData(channelSrc);
        //如果之前已经取到了，则直接去缓存内的地址
        if (localData !== null) {
          callback(localData.appointUrl);
          //如果是第一次获取，则去请求相关信息
        } else {
          //发送ajax请求
          this.getChannelInfo(param, function (cbData) {
            callback(cbData.appointUrl);
          });
        }
      }
    },
    /**
     * @memberof appDownload
     * @summary 下载app
     * @type {function}
     * @param {object} param 配置参数
     *  param = {
     *    'downUrl':util.getSohuDefaultApplink(),
     *    'delayTime':Download.openTime ,
     *    'cckey',"appdownload_action"
     *  }
     */
    gotoDownload: function (param) {
      //获取下载链接
      this.getDownloadUrl(param, function (downUrl) {

        if (downUrl !== '') {
          //获取延迟下载时间
          var delayTime = (param && param.delayTime) ? param.delayTime : Download.openTime;

          setTimeout(function () {
            window.location.href = downUrl;
          }, delayTime);
        }
      });
    }
  };

  module.exports = Download;
});