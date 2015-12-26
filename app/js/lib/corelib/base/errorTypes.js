/**
 *
 *   @description: 错误提示
 *
 *   @version    : 1.0.6
 *
 *   @create-date: 2015-03-26
 *
 *   @update-date: 2015-08-28
 *
 *   @update-log :
 *                 1.0.1 - 基本编码信息
 *                 1.0.2 - 新增"本片仅供试看，如果需要观看更多内容，请下载搜狐视频App"文案
 *                 1.0.3 - 新增直播相关提示
 *                 1.0.4 - 新增无效视频地址
 *                 1.0.5 - 新增观看本片请前往搜狐视频客户端
 *                 1.0.6 - 新增若干错误提示
 *                         变更模块名称为base.errorTypes
 *
 */
svp.define('base.errorTypes', function (require, exports, module) {

    'use strict';

    /**
     * @module base.errorTypes
     * @namespace Error
     * @summary 编码信息
     * @property {Object}   COPYRIGHT  版权提示信息
     * @property {Object}   PROCESS    数据处理提示信息
     * @property {Object}   SUPPORT    支持性提示信息
     * @property {Object}   REQUEST    请求提示信息
     *
     * @example
     *      var error = require('base.errorTypes');
     *      var msg = error.COPYRIGHT['100'];
     */
    var Error = {
        //版权提示信息
        'COPYRIGHT': {
            '100': '您所在的国家或地区，不在所播放的节目版权范围',
            '101': '该视频版权已到期，无法观看',
            '102': '观看本集请前往搜狐视频客户端'
        },
        //数据处理
        'PROCESS': {
            '200': '数据处理完成',
            '201': '无效视频数据,请刷新重试',
            '202': '无效视频数据',
            '203': '数据结构错误',
            '204': '解析数据出错'
        },
        //支持性提示信息
        'SUPPORT': {
            '300': '您的浏览器不支持播放功能，请使用搜狐视频客户端',
            '301': '该视频目前只支持5分钟观看，观看完整视频，请使用搜狐视频客户端',
            '302': 'UC浏览器不支持播放功能，建议使用系统浏览器或请使用搜狐视频客户端',
            '303': '直播请使用搜狐视频客户端',
            '304': '本片仅供试看，如果需要观看更多内容，请下载搜狐视频App',
            '305': '您的浏览器不支持直播功能，请使用搜狐视频客户端',
            '306': '播放地址无效，如果需要观看更多内容，请下载搜狐视频App'
        },
        //请求提示信息
        'REQUEST': {
            '400': '网络超时，请刷新重试',
            '401': 'mysugar接口请求错误',
            '402': 'video/info接口请求参数错误',
            '403': 'video/info接口请求错误',
            '404': 'video/info ugc接口请求错误',
            '405': 'play/urls接口请求参数错误',
            '406': 'play/urls接口请求错误',
            '407': 'live/url接口请求失败'
        },
        //通用
        'COMMON': {
            '500': '加载资源失败 code: '
        },
        //上传
        'UPLOAD': {
            '600': '上传失败! fileInput参数错误',
            '601': '上传失败! 上传内容不符合要求！',
            '602': '上传失败! 图片格式不符合要求！',
            '603': '上传失败! 服务器错误！',
            '604': '上传失败! 用户数据错误！',
        }
    };

    module.exports = Error;
});