/**
 *
 *   @description: 该文件用于定义公共(工具)方法
 *
 *   @version    : 1.0.3
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-07-09
 *
 *   @update-log :
 *                 1.0.1 - 定义公共(工具)方法
 *                 1.0.2 - getSohuDefaultApplink方法中微信并且非iphone下才跳到应用宝
 *                 1.0.3 - 在带有parseXXX处理的方法中加入了try-catch处理
 *                         进行了jshint优化
 *
 **/

svp.define('base.util', function (require, exports, module) {

  'use strict';
  
  var vars = require('base.vars');
  var $ = svp.$;

  /**
   * @module base.util
   * @namespace Util
   * @property {function}  pingback                     - 发送统计数据
   * @property {function}  getOSVersion                 - 获取系统版本号
   * @property {function}  getAndroidVersionNumber      - 获取Android设备的系统版本
   * @property {function}  getVersionNumber             - 解析字符串版本号，返回一个数字版本号
   * @property {function}  timeFromNow                  - 加载评论列表后的时间(从现在到评论的时间)
   * @property {function}  secondsToTime                - 将秒数转换为hh:mm:ss格式
   * @property {function}  secondsToTimeText            - 将秒数转换为文本格式的时间，eg. 65 -> "1分5秒"
   * @property {function}  shortCount                   - 将数字数量缩短为带单位的字符串，如10,000转化为'1万'
   * @property {function}  shortFixedCount              - 将数字数量缩短为带单位的字符串，如10,000转化为'1万 106000 会转为1.1万 (四舍五入)
   * @property {function}  dateString                   - 截取日期字符串 2013-12-18 07:07:46:57.000 转换为2013-12-18
   * @property {function}  setLoad                      - 为dom节点添加loading效果
   * @property {function}  loadScript                   - 加载script
   * @property {function}  formatURL                    - 把web地址转为移动端地址
   * @property {function}  makePlayUrl                  - 生成播放页地址
   * @property {function}  getPageOffset                - 取得页面的垂直滚动距离
   * @property {function}  getSohuDefaultApplink        - 获取搜狐视频客户端默认下载链接
   * @property {function}  getConnectionType            - Android获取网络连接类型,如果取不到返回空字符串,取到的话返回值为 2g|3g|wifi
   * @property {function}  formatDateWithBar            - 格式化时间，返回xxxx-xx-xx
   * @property {function}  formatDateWithZh             - 格式化时间，返回xxxx年xx月xx日
   * @property {function}  formatDateStr                - 格式化时间，返回指定样式的字符串
   * @property {function}  getUserPt                    - 获取平台参数类型编码
   * @property {function}  reverse                      - 将数组逆序
   * @property {function}  getFnName                    - 获取方法名称
   * @property {function}  createUUIDPart               - 生成uuid的一部分
   * @property {function}  getRandomNum                 - 生成一个随机数
   * @property {function}  formatDateWithBar2           - 格式化当前日期 如20150325
   * @property {function}  formatDateTime               - 格式化当前日期 如刚刚
   * @property {function}  createUUID                   - 生成一个完整的uuid
   *
   * @example
   *   var util = require('base.util');
   *   util.pingback('http://xxx');
   */
 
  var Util = {

   /**
    * @memberof Util
    * @summary 发送统计数据;
    * @type {function}
    * @param {string} url                      - 发送统计的url的链接地址
    * @param {number|string} time              - 可选参数,是广告发统计用的,只是调试用到
    */
    pingback: function (url, time) {
      
      if (!url) {
       
        return;
      }

      var pingbackURLs = url.split('|'),
        i = 0,
        l = pingbackURLs.length;

      for (; i < l; i++) {
        (new Image()).src = pingbackURLs[i];
        
        if (vars.ENABLE_DEBUG && time !== undefined) {
          vars.ADPingbackCount++;
          console.log('第' + vars.ADPingbackCount + '个上报,第' + time + '秒:', pingbackURLs[i]);
        }
      }
    },

    /**
     * @memberof Util
     * @summary 获取系统版本号
     * @type {function}
     * @return {string}
     */
    getOSVersion: function () {
      var osVersion = '0';
      
      if (vars.IsIOS) {
        var match = vars.UA.match(/os ([0-9_]+)/i);
        
        if (match && match[1]) {
          osVersion = Util.getVersionNumber(match[1]);
        }
      
      } else if (vars.IsAndroid) {
        osVersion = Util.getAndroidVersionNumber();
      
      } else {
        osVersion = '4.0.1';
      }
      
      return osVersion;
    },

    /**
     * @memberof Util
     * @summary 获取Android设备的系统版本
     * @type {function}
     * @return {string}
     */
    getAndroidVersionNumber: function () {
      var versionNum = vars.UA.match(/android(.*?);/i) || [];
      
      return versionNum[1] || '0';
    },

    /**
     * @memberof Util
     * @summary 解析字符串版本号，返回一个数字版本号
     * @type {function}
     * @param {string} versionStr               - 版本号字符串
     * @return {Number}
     */
    getVersionNumber: function (versionStr) {
      var rst = 0;
      
      try {
        var versionNum = versionStr.replace(/_/g, '.').replace(/^([0-9]+\.[0-9]+)[0-9\.]*/, '$1');
        rst = parseFloat(versionNum || 0);
      
      } catch (e) {}

      return rst;
    },

    /**
     * @memberof Util
     * @summary 加载评论列表后的时间(从现在到评论的时间)
     * @type {function}
     * @param {number} time                     - 时间戳
     * @return {string}                         - 刚刚-1分钟前-59分钟前-1小时前-23小时前-1天前-29天前-1个月前-11个月前-1年前—2年前
     */
    timeFromNow: function (time) {
      var rst = time;

      try {
        var sec = 60,
            hour = sec * 60,
            day = hour * 24,
            month = day * 30,
            year = month * 12;

        time = (+new Date() - parseInt(time, 10)) / 1000;

        if (time >= year) {
          rst = Math.floor(time / year) + '年前';
        
        } else if (time >= month) {
          rst = Math.floor(time / month) + '个月前';
        
        } else if (time >= day) {
          rst = Math.floor(time / day) + '天前';
        
        } else if (time >= hour) {
          rst = Math.floor(time / hour) + '小时前';
        
        } else if (time >= sec) {
          rst = Math.floor(time / sec) + '分钟前';
        
        } else {
          rst = '刚刚';
        }

      } catch (e) {}

      return rst;
    },

    /**
     * @memberof Util
     * @summary 格式化时间
     * @type {function}
     * @param {date} time       - 时间1
     * @param {date} time       - 时间
     * @return {string}
     */
    formatDateTime : function (date,now) {
      var rt = '';
      try {

          date = date || new Date();
          now = now || new Date();
          var ss = 60,
              hh = ss * 60,
              dd = hh * 24,
              mm = dd * 30,
              yy = mm * 12;

          var month = date.getMonth() + 1,
              day = date.getDate();

          var subDate = now.getTime() - date.getTime();  //时间差的毫秒数
          //计算出相差天数
          var days = Math.floor(subDate / (24*3600*1000));
          //计算出小时数
          var leave1 = subDate % (24 * 3600 * 1000);   //计算天数后剩余的毫秒数
          var hours = Math.floor(leave1 / (3600 * 1000));
          //计算相差分钟数
          var leave2 = leave1 % (3600 * 1000);       //计算小时数后剩余的毫秒数
          var minutes = Math.floor(leave2 / (60 * 1000));
          //计算相差秒数
          var leave3 = leave2 % (60 * 1000);     //计算分钟数后剩余的毫秒数
          var seconds = Math.round(leave3 / 1000);

          //时间：小于5分钟显示”刚刚“，大于5分钟小于1小时显示N分钟前，
          // 大于1小时小于24小时显示N小时前，大于24小时小于48小时显示昨天，
          // 大于48小时小于7天显示消息推送对应星期N，大于7天显示y-m-d；
          if (month.toString().length < 2) {
            month = '0' + month;
          }

          if (day.toString().length < 2) {
            day = '0' + day;
          }

          if (days > 7) {
            //大于7天显示y-m-d
            return date.getFullYear() + '-' + month + '-' + day;
          
          } else if (days >= 2 && days <= 7) {
            //大于48小时小于7天显示消息推送对应星期N
            var wkday = date.getDay() || 1;
            var wkstr = '星期一';
            
            switch (wkday) {
              case 0:
                wkstr = '星期日';
                break;
              case 1:
                wkstr = '星期一';
                break;
              case 2:
                wkstr = '星期二';
                break;
              case 3:
                wkstr = '星期三';
                break;
              case 4:
                wkstr = '星期四';
                break;
              case 5:
                wkstr = '星期五';
                break;
              case 6:
                wkstr = '星期六';
                break;
            }
            rt = wkstr;

          } else if (days >= 1 && days < 2) {
              //大于24小时小于48小时显示昨天
              rt = '昨天';
          
          } else {
              
            if (hours < 24 && hours >= 1) {
              //大于1小时小于24小时显示N小时前
              rt = hours + '小时前';
            
            } else {
                
              if (hours < 1 && minutes >= 5) {
                //大于5分钟小于1小时显示N分钟前
                rt = minutes + '分钟前';
              
              } else {
                //小于5分钟显示'刚刚'
                rt = '刚刚';
              }
            }
          }

          return rt;

      } catch (e) {}
    },
    /**
     * @memberof Util
     * @summary 将秒数转换为hh:mm:ss格式
     * @type {function}
     * @param {number|string} seconds           - 秒数
     * @return {string}                         - hh:mm:ss格式的字符串
     */
    secondsToTime: function (seconds) {
      var rst = seconds;

      try {
        var totalSeconds = parseInt(seconds, 10);
        
        if (isNaN(totalSeconds)) {
          totalSeconds = 0;
        }
        var minutes = Math.floor(totalSeconds / 60);
        seconds = totalSeconds % 60;

        if (seconds < 10) {
          seconds = '0' + seconds;
        }

        if (minutes < 60) {
          
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          
          rst = minutes + ':' + seconds;
        
        } else {
          var hours = Math.floor(minutes / 60);
          minutes = minutes % 60;
          
          if (minutes < 10) {
            minutes = '0' + minutes;
          }
          
          if (hours < 10) {
            hours = '0' + hours;
          }
          
          rst = hours + ':' + minutes + ':' + seconds;
        }

      } catch (e) {}

      return rst;
    },

    /**
     * @memberof Util
     * @summary 将秒数转换为文本格式的时间，eg. 65 -> "1分5秒"
     * @type {function}
     * @param {number|string} seconds           - 秒数
     * @return {string}                         - 文本格式的时间
     */
    secondsToTimeText: function (seconds) {
      var rst = seconds;

      try {
        var totalSeconds = parseInt(seconds, 10);
      
        if (isNaN(totalSeconds)) {
          totalSeconds = 0;
        }
        var minutes = Math.floor(totalSeconds / 60);
        seconds = totalSeconds % 60 + '秒';

        if (minutes < 60) {
          
          rst = (minutes > 0 ? minutes + '分' : '') + seconds;

        } else {
          var hours = Math.floor(minutes / 60);
          minutes = minutes % 60;
          
          rst = (hours > 0 ? hours + '小时' : '') + minutes + '分' + seconds;
        }

      } catch (e) {}

      return rst;
    },

    /**
     * @memberof Util
     * @summary 将数字数量缩短为带单位的字符串，如10,000转化为'1万'
     * @type {function}
     * @param {number|string} count             - 数量
     * @return {string}                         - 带单位的字符串
     */
    shortCount: function (count) {
      var rst = count;

      try {
        count = parseInt(count, 10);
        
        if (count > 100000000) {
          count = Math.floor(count / 100000000) + '亿';
        
        } else if (count > 10000) {
          count = Math.floor(count / 10000) + '万';
        }

        rst = count;
      
      } catch (e) {}
      
      return rst;
    },

    /**
     * @memberof Util
     * @summary 将数字数量缩短为带单位的字符串，如10,000转化为'1万 106000 会转为1.1万 (四舍五入)
     * @type {function}
     * @param {number|string} count             - 数量
     * @return {string}                         - 带单位的字符串
     */
    shortFixedCount: function (count) {
      var rst = count;

      try {
        count = parseFloat(count);
      
        if (count && count >= 100000000) {
          count = (count / 100000000).toFixed(1) + '亿';
        
        } else if (count && count >= 10000) {
          count = (count / 10000).toFixed(1) + '万';
        }
        rst = count;

      } catch (e) {}
      
      return rst;
    },

    /**
     * @memberof Util
     * @summary 截取日期字符串 2013-12-18 07:07:46:57.000 转换为2013-12-18
     * @type {function}
     * @param {string} timeString               - 时间字符串
     * @return {string}                         - 日期字符串
     */
    dateString: function (timeString) {
      var match = timeString.match(/([0-9]{4}\-[0-9]+\-[0-9]+)/);
      
      if (match) {
        timeString = match[1];
      }

      return timeString;
    },

    /**
     * @memberof Util
     * @summary 为dom节点添加loading效果
     * @type {function}
     * @param {docElement} el                   - dom节点
     * @return {docElement}                     - 源dom节点
     */
    setLoad: function (el) {
      el = $(el);
      
      if (!el.hasClass('_load_inited')) {
        el.addClass('_load_inited').append($('<i class="ui_loading"><u></u><u></u><u></u></i>'));
      }

      return el;
    },

    /**
     * @memberof Util
     * @summary 加载script
     * @type {function}
     * @param {string} url                      - script的url地址
     * @param {function} callback               - 可选参数,加载完script后的回调函数
     * @param {object} opts                     - 可选参数,给回调函数传的参数
     */
    loadScript: function (url, callback, opts) {
      var head = document.getElementsByTagName('head')[0] || document.body,
        script = document.createElement('script'),
        done = false;

      script.src = url;

      script.onload = script.onreadystatechange = function () {
        
        if (!done && (!this.readyState || this.readyState !== 'loading')) {
          done = true;
          
          if (callback) {
            callback.apply(null, opts || []);
          }
          script.onload = script.onreadystatechange = null;
          head.removeChild(script);
        }
      };
      head.appendChild(script);
    },

    /**
     * @memberof Util
     * @summary 把web地址转为移动端地址
     * @type {function}
     * @param {string} url                      - web地址
     */
    formatURL: function (url) {
      url += '';
      url = url.replace(/^https?:\/\/(my\.|v\.)?tv\./i, 'http://m.tv.')
               .replace('http://s.', 'http://m.s.')
               .replace('http://m.s.', 'http://m.tv.')
               .replace(/^http:\/\/(video\.)?2012/i, 'http://m.s');

      return url;
    },

      /**
       * @memberof Util
       * @summary 生成播放页地址
       * @type {function}
       * @param {object} object
       * @param {string} channeled
       * @returns {string} url
       */
    makePlayUrl: function (object, channeled) {
      var url = 'http://' + location.host;
      if (object.vid) {
        object.site = object.site || 1;
        
        if (object.site === 1) {
          url += '/v';
        
        } else {
          url += '/u/vw/';
        }
        url += object.vid + '.shtml';
        
        if (channeled) {
          url += '?channeled=' + channeled;
        }
      }
      
      return url;
    },

    /**
     * @memberof Util
     * @summary 取得页面的垂直滚动距离
     * @type {function}
     * @return {Number}                         - 页面垂直滚动距离的象素值
     */
    getPageOffset: function () {
      
      return window.pageYOffset || (document.body && document.body.scrollTop) || 0;
    },

    /**
     * @memberof Util
     * @summary 获取搜狐视频客户端默认下载链接
     * @type {function}
     * @param {string} apkLink                  - 可选参数，如果填写改参数，直接返回
     * @return {string}                         - 搜狐视频客户端默认下载链接
     */
    getSohuDefaultApplink: function (apkLink) {
      
      if (apkLink && typeof(apkLink) === 'string') {
        
        return apkLink;
      }
      var downloadLink = 'http://m.tv.sohu.com/app';
      
      if (vars.IsAndroid) {
        
        if (vars.IsAndroidPad) {
          downloadLink = 'http://upgrade.m.tv.sohu.com/channels/hdv/5.0.0/SohuTVPad_5.0.0_1369_201507271523.apk';
        
        } else {
          downloadLink = 'http://upgrade.m.tv.sohu.com/channels/hdv/5.0.0/SohuTV_5.0.0_680_201506111914.apk';
        }
      }
      
      if (vars.IsIphone) {
        downloadLink = 'https://itunes.apple.com/cn/app/sou-hu-shi-pin-gao-qing/id458587755?mt=8';
      }
      
      if (vars.IsIpad) {
        downloadLink = 'https://itunes.apple.com/cn/app/sou-hu-shi-pin-hd/id414430589?mt=8';
      }
     
      if (vars.IsWindowsPhone) {
        downloadLink = 'http://www.windowsphone.com/zh-CN/apps/403faf93-d22c-4331-ac32-9560ee9fac94';
      }
      
      if (vars.IsWindowsPad) {
        downloadLink = 'http://apps.microsoft.com/windows/zh-CN/app/c5ae3c2a-5573-45c2-ac63-7d67e01de6bb';
      }
      //微信并且非iphone下 才跳到应用宝
      if (vars.IsWeixinBrowser && !vars.IsIphone) {
        downloadLink = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.sohu.sohuvideo&g_f=991881';
      }
      
      return downloadLink;
    },


    /**
     * @memberof Util
     * @summary Android获取网络连接类型,如果取不到返回空字符串,取到的话返回值为 2g|3g|wifi
     * @type {function}
     * @return {string}                         - 网络连接类型
     */
    getConnectionType: function () {
      var _connection = window.navigator['connection'],
          _connectionType,
          connectionType = '';
      
      if (_connection) {
        _connectionType = _connection['type'];
        
        if (_connectionType === _connection['CELL_2G']) {
          connectionType = '2g';
        
        } else if (_connectionType === _connection['CELL_3G']) {
          connectionType = '3g';
        
        } else if (_connectionType === _connection['WIFI']) {
          connectionType = 'wifi';
        }
      }
      
      return connectionType;
    },
 
    /**
     * @memberof Util
     * @summary 格式化时间，返回xxxx-xx-xx
     * @type {function}
     * @param {date} date                       - 时间对象，不填返回当前时间字符串
     * @return {string}                         - 返回时间字符串,如2013-12-04
     */
    formatDateWithBar: function (date) {
      date = date || new Date();
      var month = date.getMonth() + 1,
          day = date.getDate();

      if (month.toString().length < 2) {
        month = '0' + month;
      }

      if (day.toString().length < 2) {
        day = '0' + day;
      }

      return date.getFullYear() + '-' + month + '-' + day;
    },

    /**
     * @memberof Util
     * @summary 格式化时间，返回xxxx年xx月xx日
     * @type {function}
     * @param {date} date                       - 时间对象，不填返回当前时间字符串
     * @return {string}                         - 返回时间字符串,如2013年12月04日
     */
    formatDateWithZh: function (date) {
      date = date || new Date();
      var month = date.getMonth() + 1,
          day = date.getDate();

      if (month.toString().length < 2) {
        month = '0' + month;
      }

      if (day.toString().length < 2) {
        day = '0' + day;
      }

      return date.getFullYear() + '年' + month + '月' + day + '日';
    },

    /**
     * @memberof Util
     * @summary 格式化时间，返回指定样式的字符串
     * @type {function}
     * @param {date} date                       - 时间对象
     * @param {string} format                   - 格式化结果,如: yyyy-MM-dd hh:mm:ss
     * @return {string}                         - 返回时间字符串,如20131204
     */
    formatDateStr: function (date, format) {
      var o = {
        'M+' : date.getMonth() + 1, // month
        'd+' : date.getDate(), // day
        'h+' : date.getHours(), // hour
        'm+' : date.getMinutes(), // minute
        's+' : date.getSeconds(), // second
        'q+' : Math.floor((date.getMonth() + 3) / 3), // quarter
        'S' : date.getMilliseconds()
      // millisecond
      };

      if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
      }

      for (var k in o) {

        if (new RegExp('(' + k + ')').test(format)) {
          format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k]
              : ('00' + o[k]).substr(('' + o[k]).length));
        }
      }

      return format;
    },

    /**
     * @memberof Util
     * @summary 获取平台参数类型编码
     *          1. PC
     *          2. iPad
     *          3. iPhone
     *          4. AndroidPad
     *          5. AndroidPhone
     *          6. AndroidTV
     *          7. WindowsPad
     *          8. WindowsPhone
     *          9. Symbian
     * @type {function}
     * @return {number}                         - 返回对应的平台类型编码
     */
    getUserPt: function () {
      var pt = 1;

      if (typeof navigator.platform !== 'undefined') {
        var pcArr = ['Win32', 'Win64', 'Windows', 'Mac68K', 'MacPC', 'Macintosh', 'MacIntel'];
        
        for (var i = 0, l = pcArr.length; i < l; i++) {

          if (navigator.platform === pcArr[i]) {
            pt = 1;

            break;
          }
        }
      }

      if (vars.IsIpad) {
        pt = 2;
      }
      
      if (vars.IsIphone) {
        pt = 3;
      }
      
      if (vars.IsAndroid) {
        pt = 5;
        
        if (/tv/i.test(vars.UA)) {
          pt = 6;
        }
      }

      if (vars.IsAndroidPad) {
        pt = 4;
      }

      if (vars.IsWindowsPad) {
        pt = 7;
      }
      
      if (vars.IsWindowsPhone) {
        pt = 8;
      }

      return pt;
    },
    
    getUserPt2: function () {
      var pt = 'pc';

      if (typeof navigator.platform !== 'undefined') {
        var pcArr = ['Win32', 'Win64', 'Windows', 'Mac68K', 'MacPC', 'Macintosh', 'MacIntel'];
        
        for (var i = 0, l = pcArr.length; i < l; i++) {
          if (navigator.platform === pcArr[i]) {
            pt = 'pc';
            break;
          }
        }
      }
      
      if (vars.IsIpad) {
        pt = 'iPad';
      }
      
      if (vars.IsIphone) {
        pt = 'iPhone';
      }
      
      if (vars.IsAndroid) {
        pt = 'android';
      }
      
      if (vars.IsAndroidPad) {
        pt = 'androidPad';
      }
      
      if (vars.IsWindowsPad) {
        pt = 'windowsPad';
      }
      
      if (vars.IsWindowsPhone) {
        pt = 'windowsPhone';
      }
      
      return pt;
    },

    getUserSysPt: function () {
      var pt = 'pc';
      
      if (typeof navigator.platform !== 'undefined') {
        var pcArr = ['Win32', 'Win64', 'Windows', 'Mac68K', 'MacPC', 'Macintosh', 'MacIntel'];
        
        for (var i = 0, l = pcArr.length; i < l; i++) {
          
          if (navigator.platform === pcArr[i]) {
            pt = 'pc';
            
            break;
          }
        }
      }
      if (vars.IsAndroid) {
        pt = 'android';
      }
        if (vars.IsAndroidPad) {
        pt = 'android';
      } 

      if (vars.IsIpad) {
        pt = 'ios';
      }
      
      if (vars.IsIphone) {
        pt = 'ios';
      }
      
      if (vars.IsWindowsPad) {
        pt = 'windows';
      }
      
      if (vars.IsWindowsPhone) {
        pt = 'windows';
      }
    },
    /**
     * @memberof Util
     * @summary 将数组逆序
     * @type {function}
     * @param {array|object} obj               - 数组对象
     * @return {array|string}                  - 调整顺序后的数组对象
     */
    reverse: function (obj) {
      
      return Array.isArray(obj) ? obj.reverse() : String(obj).split('').reverse().join('');
    },
    
    /**
     * @memberof Util
     * @summary 获取方法名称
     * @type {function}
     * @param {function} fn                    - 方法
     * @return {string}                        - 方法名称
     */
    getFnName: function (fn) {
      var fnstr = '';
      
      if (typeof fn === 'function') {
        fnstr = fn.name || (/function ([^\(]+)/.exec(fn.toString()) || [])[1] || '';
      }
      
      return fnstr;
    },
   
    /**
     * @memberof Util
     * @summary 生成uuid的一部分
     * @type {function}
     * @param {number} length                  - 指定长度(默认16位)
     * @return {string}                        - uuid
     */
    createUUIDPart: function (length) {
      var uuidpart = '';

      try {
        length = (typeof length === 'number' && length > 0) ? length : 16;
        
        for (var i = 0; i < length; i++) {
          var uuidchar = parseInt((Math.random() * 256), 10).toString(16); //十六制
          
          if (uuidchar.length === 1) {
            uuidchar = '0' + uuidchar;
          }
          uuidpart += uuidchar;
        }

      } catch (e) {}
      
      return uuidpart;
    },
    
    /**
     * @memberof Util
     * @summary 生成一个随机数
     * @type {function}
     * @param {number} Min                     - 随机数最小值
     * @param {number} Max                     - 随机数最大值
     * @return {number}                        - 随机数
     */
    getRandomNum: function (Min, Max) {
      var Range = Max - Min;
      var Rand = Math.random();
      return (Min + Math.round(Rand * Range));
    },
    
    /**
     * @memberof Util
     * @summary 格式化当前日期
     * @type {function}
     * @return {number}                        - 格式化结果，如20150325
     */
    formatDateWithBar2: function () {
      var date = date || new Date(),
        month = date.getMonth() + 1,
        day = date.getDate();

      if (month.toString().length < 2) {
        month = '0' + month;
      }

      if (day.toString().length < 2) {
        day = '0' + day;
      }
      //yyyymmdd
      return date.getFullYear() + '' + month + day;
    },
    formatDateWithBar3: function () {
          var date = date || new Date(),
              month = date.getMonth() + 1,
              day = date.getDate();

          if (month.toString().length < 2) {
              month = '0' + month;
          }

          if (day.toString().length < 2) {
              day = '0' + day;
          }
          //yyyy-mm-dd
          return date.getFullYear() + '-' + month+'-' + day;
      },
    /**
     * @memberof Util
     * @summary 生成一个完整的uuid
     * @type {function}
     * @return {string}                        - uuid
     */
    createUUID: function () {
      //sublen 6 char
      //队角形斜边=Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2))
      //像素
      var sw = Math.floor(window.screen.width);
      var sh = Math.floor(window.screen.height);
      var screenSize = Math.floor(Math.sqrt(sw * sw + sh * sh)) || 0;
      var plt = Math.round(this.getUserPt()) || 1;
      var systime = (+new Date) * 1000;
      var uuid = systime + plt + screenSize + Math.round(Math.random() * 1000);
      console.log('h5-uuid:', uuid);
      
      return uuid;
    },
    evalJSON : function(src) {
          var obj={};
          try {
              if(/\\%/.test(src)) {
                  src = decodeURIComponent(src);
              }
              if (typeof (JSON) == 'object' && JSON.parse) {
                  obj = eval("[" + src + "]")[0];
              }else {
                  obj =  eval("(" + src + ")");
              }
          }catch(e) {
              try {
                  if(/\\%/.test(src)) {
                      src = decodeURIComponent(src);
                  }
                  obj = JSON.parse(src);
              }catch(b){console.log(b);}
          }
          return obj;
    }

  };

  String.prototype.replaceAll = function (s1, s2) {
    
    return this.replace(new RegExp(s1, 'gm'), s2); //g全局
  };

  //如果浏览器不支持String原生trim的方法，模拟一个
  if (!String.prototype.hasOwnProperty('trim')) {
    String.prototype.trim = function () {
      
      return this.replace(/^(\s|\r|\n|\r\n)*|(\s|\r|\n|\r\n)*$/g, '');
    };
  }

  //如果浏览器不支持Function原生bind的方法，模拟一个
  if (!Function.prototype.hasOwnProperty('bind')) {

    Function.prototype.bind = function (context) {
      var fn = this,
          args = arguments.length > 1 ? Array.slice(arguments, 1) : null;
      
      return function () {
        
        return fn.apply(context || this, args);
      };
    };
  };


  //兼容老版本
  svp.$.getScript = svp.seajs.jsLoader;
  svp.$.getCss = svp.seajs.cssLoader;

  Util.loadScript = svp.seajs.jsLoader;
  Util.loadCss = svp.seajs.cssLoader;

  module.exports = Util;

});