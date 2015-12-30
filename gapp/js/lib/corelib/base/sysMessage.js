/**
 *
 *   @description: 该文件用于定义系统弹框
 *
 *   @version    : 1.0.3
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-08-14
 *
 *   @update-log :
 *                 1.0.1 - 系统弹框
 *                 1.0.2 - 给系统弹框方法的参数中加入了downUrl参数
 *                 1.0.3 - 修复单词拼写错误 (laod改为load)
 *
 **/

svp.define('base.sysMessage', function (require, exports, module) {

  'use strict';
  
  //zepto扩展
  var $ = svp.$;
  var vars = require('base.vars');
  var download = require('data.appDownload');
  var ClickTrace = require('trace.click');

  /**
   * @module base.sysMessage
   * @namespace sysMessage
   * @property {function}  downloadPopTips          - 待下载按钮的弹框
   *
   * @example
   *   var sysMessage = require('base.sysMessage');
   *   sysMessage.downloadPopTips({title: '零广告看视频，请先安装搜狐视频APP'});
   *
   */


  var getPopTipsView = function () {
    //下载选择
    var html = '<div class="app_download_select js_download_select" style="display: none;">' +
                 '<div class="app_download_top">' +
                   '<span class="app_download_icon"></span>' +
                   '<span class="app_download_close js_app_download_close"></span>' +
                 '</div>' +
                 '<div class="app_download_title js_download_select_title"></div>' +
                 '<div class="app_download js_app_download" position="appdownload_floor">立即安装</div>' +
               '</div>' +
               '<div class="download_masklayer js_download_masklayer" style="display: none;"></div>';

    return html;
  };

  var sysMessage = {};
  var downUrlParam = null;

  /**
   * @memberof sysMessage
   * @summary 弹出-下载、关闭按钮界面
   * @type {function}
   * @param {object} param                              - 播放数据
   * @param {object} param.title                        - 弹框中要显示的提示信息
   * @param {object} param.downUrl                      - (可选参数)点击后指定下载地址，如果不填，则为默认地址
   * @param {object} param.downloadCB                   - (可选参数)下载后的回调方法
   * @param {object} param.closeCB                      - (可选参数)关闭后的回调方法
   */
  sysMessage.downloadPopTips = function (param) {
    var selectConDom = $('.js_download_select'),
        masklayerDom = $('.js_download_masklayer');
    
    //qq和uc浏览器隐藏导航栏后，显示video标签
    if (vars.IsQQBrowser || vars.IsUCBrowser || vars.IsAndroid && vars.IsNewBaiduBrowser) {
        
      if ($('video').length > 0) {
        $('video')[0].pause();
      }
      $('video').hide();
    }

    //download下载参数
    if (!$.isUndefined(param.downUrl) && param.downUrl !== '') {
      downUrlParam = {downUrl: param.downUrl};
    
    } else {
      downUrlParam = null;
    }

    //如果dom界面不存在则进行添加
    if (selectConDom.length === 0) {
      
      $('body').append(getPopTipsView());
      //添加完成后初始化节点参数
      selectConDom = $('.js_download_select');
      masklayerDom = $('.js_download_masklayer');

      //绑定下载按钮事件(立刻安装)
      $('.js_app_download').on('click', function () {
        var position = $(this).attr('position');
        //请求结果行为统计
        console.log('发送行为统计点: ' + position);
        ClickTrace.pingback(null, position);
        download.gotoDownload(downUrlParam);
        selectConDom.oriHide();
        masklayerDom.oriHide();

        if (typeof param !== 'undefined' && typeof param.downloadCB === 'function') {
          param.downloadCB();
        }

        return false;
      });

      //绑定右按钮事件(关闭)
      $('.js_app_download_close').on('click', function () {
        selectConDom.oriHide();
        masklayerDom.oriHide();

        if (vars.IsQQBrowser || vars.IsUCBrowser || vars.IsAndroid && vars.IsNewBaiduBrowser) {
          //动画时间是0.3秒
          setTimeout(function () {
            $('video').show();
          }, 300);
        }

        if (typeof param !== 'undefined' && typeof param.closeCB === 'function') {
          param.closeCB();
        }

        return false;
      });
    }
    //修改文字
    var title = param && param.title ? param.title : '高速观看需安装搜狐视频客户端';
    $('.js_download_select_title', selectConDom).html(title);
    //显示遮罩层和弹出框
    masklayerDom.oriShow();
    selectConDom.oriShow();
  };

  module.exports = sysMessage;
});