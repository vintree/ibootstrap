/**
 *
 *   @description: 该文件用于定义特殊名单列表
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-08-24
 *
 *   @update-log :
 *                 1.0.1 - cookie基础操作定义
 *                 1.0.2 - 修复del方法bug
 *
 **/

svp.define('base.cookie', function (require, exports, module) {

    'use strict';
    
    var $ = svp.$;
    var vars = require('base.vars');
    var util = require('base.util');
    var Console = require('base.console');

    /**
     * @module base.cookie
     * @namespace Cookie
     * @property {boolean} isEnabled                    - 是否支持Cookie
     * @property {function} set                         - 设置Cookie
     * @property {function} get                         - 读取指定的Cookie
     * @property {function} del                         - 删除指定的Cookie
     * @property {function} test                        - 测试浏览器是否支持Cookie
     * @property {function} serialize                   - 将对象转换成字符串
     * @property {function} deserialize                 - 将字符串转换成对象
     * @property {function} setSession                  - 设置sessionStorage
     * @property {function} getSession                  - 获取sessionStorage
     */
    var Cookie = {

        /**
         * @memberof Cookie
         * @summary 是否支持Cookie
         * @type {boolean}
         */
        isEnabled: false,

        /**
         * @memberof Cookie
         * @summary 设置Cookie
         * @type {function}
         * @param {String} name 要设置的Cookie名称
         * @param {String} value 要设置的Cookie值
         * @param {Int} expire 过期时间，单位是小时
         * @param {String} domain 域，默认为本域
         */
        set: function (name, value, expire, domain) {
            var expires = '';

            if (0 !== expire) {
                var t = new Date();
                t.setTime(t.getTime() + (expire || 24) * 3600000);
                expires = ';expires=' + t.toGMTString();
            }
            var s = escape(name) + '=' + escape(value) + expires + ';path=/' + (domain ? (';domain=' + domain) : '');
            document.cookie = s;

            return true;
        },

        /**
         * @memberof Cookie
         * @summary 读取指定的Cookie
         * @type {function}
         * @param {String} name 要获取的Cookie名称
         * @return {String} 对应的Cookie值，如果不存在，返回{null}
         */
        get: function (name) {
            var arrCookie = document.cookie.split(';'),
                arrS;

            for (var i = 0; i < arrCookie.length; i++) {
                var item = arrCookie[i];
                var index = item.indexOf('=');
                var cName = item.substr(0, index);
                var cValue = item.substr(index + 1);

                if (cName.trim() === name) {

                    if (name === 'SOHUSVP' || name === 'sohusvp') {

                        return cValue;

                    } else {

                        return unescape(cValue);
                    }
                }
            }

            return '';
        },

        /**
         * @memberof Cookie
         * @summary 删除指定的Cookie
         * @type {function}
         * @param {String} name 要获取的Cookie名称
         * @param {String} domain 域，默认为本域
         * @param {String} path 路径
         */
        del: function (name, domain, path) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            document.cookie = name + '=; expires=' + exp.toGMTString() + ';' + (path ? ('path=' + path + '; ') : 'path=/; ') + (domain ? ('domain=' + domain + ';') : ('domain=;'));
        },

        /**
         * @memberof Cookie
         * @summary 测试浏览器是否支持Cookie, 如果浏览器支持Cookie,Cookie.isEnabled的值为TRUE,不支持Cookie.isEnabled的值为FALSE
         * @type {function}
         * @return {boolean}
         */
        test: function () {
            var testKey = '_c_t_';
            this.set(testKey, '1');
            this.isEnabled = ('1' === this.get(testKey));
            this.del(testKey);

            return this.isEnabled;
        },

        /**
         * @memberof Cookie
         * @summary 将对象转换成字符串
         * @type {function}
         * @param {object} value                            - 数据对象
         * @return {string}
         */
        serialize: function (value) {

            return JSON.stringify(value);
        },

        /**
         * @memberof Cookie
         * @summary 将字符串转换成对象
         * @type {function}
         * @param {string} value                            - 数据字符串
         * @return {object|undefined}                       - 返回对象，出错时返回undefined
         */
        deserialize: function (value) {

            if (typeof value !== 'string') {

                return value;
            }

            try {

                return JSON.parse(value);

            } catch (e) {

                return value || {};
            }
        },

        /**
         * @memberof Cookie
         * @summary 设置sessionStorage
         * @type {function}
         * @param {string} name                             - 参数名称
         * @param {string} value                            - 参数值
         */
        setSession: function (name, value) {

            try {

                if (!!window.sessionStorage) {
                    window.sessionStorage.setItem(name, this.serialize(value));
                }

            } catch (e) {
                Console.log('not support session', e);
                this.set(name, this.serialize(value), 24);
            }
        },

        /**
         * @memberof Cookie
         * @summary 获取sessionStorage
         * @type {function}
         * @param {string} name                             - 参数名称
         * @return {string}
         */
        getSession: function (name) {
            var sRet = '';

            try {

                if (!!window.sessionStorage) {
                    sRet = this.deserialize(window.sessionStorage.getItem(name));
                }

            } catch (e) {
                Console.log('not support session', e);
                sRet = this.deserialize(this.get(name));
            }

            return sRet;
        },

        //substr domin last 2 chars
        gMD : function (d) {
            var u;
            
            if (d === u || d === null) {

                return null;
            }
            var i = d.length,
                s;
            
            if (d.charAt(i - 3) === '.') {
                s = d.lastIndexOf('.', d.lastIndexOf('.', i -= (d.indexOf('.com.') > 0) ? 8 : 4));
            
            } else {
                s = d.lastIndexOf('.', d.lastIndexOf('.') - 1);
            }
            s = (s === -1) ? 0 : ++s;
            
            return d.substring(s);
        },

        _init: function () {
            var domain = document.domain || '127.0.0.1';

            //渠道码标示src cookie,可以挪到refer.js里
            var _mtvsrc = vars.H5Src = $.getUrlParam('src') || $.getUrlParam('SRC') || '';
            
            if (_mtvsrc) {
                Cookie.set('MTV_SRC', vars.H5Src, 86400, '.sohu.com');
                Cookie.set('MTV_SRC', vars.H5Src, 86400, domain);
            }
            vars.H5Src = Cookie.get('MTV_SRC') || _mtvsrc;

            /*  统计用的用户唯一ID */
            var cookieSUV = Cookie.get('SUV') || '',
                cookieIPLOC = Cookie.get('IPLOC') || '';

            Console.log('init ck cookieSUV ' + cookieSUV + ' cookieIPLOC ' + cookieIPLOC);

            if (!cookieSUV || !cookieIPLOC) {
                var _suv = util.createUUID();
                
                //set IPLOC CN1100
                if (!cookieIPLOC && !vars.IS_EXTERNAL_PLAYER) {
                    svp.seajs.jsLoader('http://pv.sohu.com/suv/' + _suv,
                      function () {
                        Cookie.set('SUV', _suv, 500000, '.sohu.com');
                        Console.log('callback cookieSUV ' + Cookie.get('SUV') + ' cookieIPLOC ' + Cookie.get('IPLOC'));
                    });
                }
                
                if (!cookieSUV) {
                    Cookie.set('SUV', _suv, 500000, '.sohu.com');
                    Cookie.set('SUV', _suv, 500000, domain);
                    Cookie.set('H5UID', _suv, 500000, domain);
                }

            } else {
                Console.log('ck not write');
            }
        }

    };

    Cookie.test();
    Cookie._init();

    window.Cookie = Cookie;
    module.exports = Cookie;

});