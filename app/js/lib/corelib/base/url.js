/**
 *
 *   @description: 该文件用于定义url工具类
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-03-25
 *
 *   @update-log :
 *                 1.0.1 - url工具类
 *
 **/

svp.define('base.url', function (require, exports, module) {

    'use strict';
    //zepto扩展
    var $ = svp.$;

    var vars = require('base.vars');

    /**
    * @module base.url
    * @namespace URL
    * @property {function} getQueryData             - 将url中的参数转换为json数据对象键值对形式的对象
    * @property {function} getQueryString           - 获取当前页面或者指定DOM对象的URL中的指定的GET参数的值
    * @property {function} getElSearchString        - 获取指定DOM对象的链接地址的queryString
    * @property {function} setQueryString           - 设置指定DOM对象或者页面的URL中的指定的GET参数的值
    * @property {function} objToQueryString         - 参数对象转为url，QueryString字符串
    * @property {function} updateGlobalParms        - 处理需要URL传递的全局参数
    * @property {function} getParam                 - 获取当前页面连接中指定参数
    * @property {function} setParam                 - 向指定url中添加参数
    * @property {function} setParams                - 向指定url中添加多个参数
    */
 
    var URL = {
        URLGlobalParms: {},

        /**
         * @memberOf URL
         * @summary 将url中的参数转换为json数据对象键值对形式的对象
         * @type {function}
         * @param {string} queryString              - 可选参数, 如果不指定url，则默认从当前页面url中获取参数
         * @return {object}
         */
        getQueryData: function (queryString) {

            /* 去掉字符串前面的"?"，并把&amp;转换为& */
            queryString = queryString.replace(/^\?+/, '').replace(/&amp;/, '&');
            var querys = queryString.split('&'),
                i = 0,
                _URLParms = {},
                item;

            while (i < querys.length) {
                item = querys[i].split('=');
                
                if (item[0]) {
                    var value = item[1] || '';
                    
                    try {
                        value = decodeURIComponent(value);
                    
                    } catch (e) {
                        value = unescape(value);
                    }
                    value = (value === 'null') ? null : value;
                    _URLParms[decodeURIComponent(item[0])] = value;
                }
                i++;
            }
            
            return _URLParms;
        },

        /**
         * @memberOf URL
         * @summary 获取当前页面或者指定DOM对象的URL中的指定的GET参数的值
         * @type {function}
         * @param {string} key                      - 要获取的GET参数的键
         * @param {dom} el                          - 如此传递此参数，则获取这个DOM对象的url，如果不传则获取当前页面的url
         * @return {string|null}
         */
        getQueryString: function (key, el) {
            var parms,
                queryString = el ? URL.getElSearchString(el) : window.location.search.substring(1);

            parms = URL.getQueryData(queryString);
            
            return (key in parms) ? parms[key] : null;
        },

        /**
         * @memberOf URL
         * @summary 获取当前页面连接中指定参数
         * @type {function}
         * @param {string} param1                     - 如果param2为undefined，param1是指从当前页面url中获取指定参数的key, 如果param2不为空，param1为指定的url
         * @param {string} param2                     - 可选参数，如果param2存在，则从指定的param1连接中获取对应参数的key
         * @return {string|null}
         */
        getParam: function (param1, param2) {
            var reg, url;

            if (typeof param2 === 'undefined') {
                url =  window.location.href;
                reg = new RegExp('(^|&?)' + param1 + '=([^&]*)(&|$)', 'i');

            } else {
                url = param1;
                reg = new RegExp('(^|&?)' + param2 + '=([^&]*)(&|$)', 'i');
            }
            var rstArr = url.match(reg);
            
            if (rstArr !== null) {
                
                return decodeURIComponent(rstArr[2]);
            }
            
            return null;
        },

        /**
         * @memberOf URL
         * @summary 获取指定DOM对象的链接地址的queryString
         * @type {function}
         * @param {dom} el                          - 要获取的GET参数的键
         * @return {string}
         */
        getElSearchString: function (el) {
            /* 在某些Android下获取不到el.search的值，要使用自定义方法从url中截取 */
            el = $(el).get(0);
            var searchString = el.search || '';
            
            if (!searchString) {
                var hrefString = ('FORM' === el.nodeName ? el.getAttribute('action') : el.getAttribute('href')),
                    pos = hrefString.indexOf('?');
                
                if (-1 !== pos) {
                    searchString = hrefString.slice(pos);
                }
            }
            
            return searchString;
        },

        /**
         * @memberOf URL
         * @summary 设置指定DOM对象或者页面的URL中的指定的GET参数的值
         * @type {function}
         * @param {dom} el                          - 设置这个DOM对象的url
         * @param {object} data                     - 要设置的GET参数，以键值对的方式提供
         * @return {string|dom}
         */
        setQueryString: function (el, data) {
            el = $(el);
            var elTag = el.get(0),
                elSearch = elTag.search,
                _searchString = elSearch || '',
                _key, nodeName, hrefString,
                _value, startPos, endPos;
            /* 非<A>对象没有search属性 */
            if (!elSearch) {
                nodeName = elTag.nodeName;
                
                if ('FORM' === nodeName) {
                    
                    if ('post' === elTag['method'].toLowerCase()) {
                        hrefString = el.attr('action') || (location.href + ''); /* 如果action为空则取当前页面的url */
                    
                    } else {
                        /* 如果使用GET方式提交的表单，要把GET参数以HIDDEN表单字段的方式附加到表单中去 */
                        for (_key in data) {
                            _value = data[_key];
                            var inputEl = $('input[name="' + _key + '"]', el);
                            
                            if (inputEl) {
                                inputEl.val(_value);
                            
                            } else {
                                el.append($('<input type="hidden" name="' + _key + '" value="' + _value + '" />'));
                            }
                        }
                        
                        return;
                    }
                
                } else {
                    hrefString = el.attr('href') || (location.href + ''); /* 如果href为空则取当前页面的url */
                }
                startPos = hrefString.indexOf('?');
                endPos = hrefString.indexOf('#');
                
                if (-1 === endPos) {
                    endPos = hrefString.length;
                }

                if (startPos < 0 || startPos > endPos) {
                    _searchString = '';
                    startPos = endPos; /* 用于下面设置searchString */
                
                } else {
                    _searchString = hrefString.slice(startPos + 1, endPos);
                }
            }

            var URLParms = URL.getQueryData(_searchString),
                /* 获取对象原有的GET参数 */
                _result = [];

            /* 把新参数和对象原有的GET参数合并 */
            for (_key in data) {
                URLParms[_key] = data[_key];
            }

            for (_key in URLParms) {
                _value = URLParms[_key];
                _result.push(_key + (_value ? ('=' + encodeURIComponent(_value)) : ''));
            }
            
            if (_result.length < 1) {
                return;
            }

            var newSearchString = '?' + _result.join('&');

            if (elSearch) {
                elTag.search = newSearchString;
            
            } else {
                var attri = ('FORM' === nodeName) ? 'action' : 'href';
                el.attr(attri, hrefString.slice(0, startPos) + newSearchString + hrefString.slice(endPos));
            }

            return newSearchString;
        },

        /**
         * @memberOf URL
         * @summary 参数对象转为url QueryString字符串
         * @type {function}
         * @param {dom} el                          - 设置这个DOM对象的url
         * @return {string}
         */
        objToQueryString: function (obj) {
            var result = [],
                key, value;

            for (key in obj) {
                value = obj[key];
                var clz = Object.prototype.toString.call(value);

                if (clz === '[object Array]') {
                    result.push(key + '=' + JSON.stringify(value));

                } else if (clz === '[object Object]') {
                    result.push(key + '=' + JSON.stringify(value));

                } else {
                    result.push(key + '=' + encodeURIComponent('undefined' === typeof value ? '' : value));
                }
            }
            return result.join('&');
        },

        /**
         * @memberOf URL
         * @summary 处理需要URL传递的全局参数
         * @type {function}
         * @param {dom} el                          - DOM对象的外层dom
         * @param {object} data                     - 要设置的参数，以键值对的方式提供
         * @return {string}
         */
        updateGlobalParms: function (domWrap, data) {
            var elLinks = $('a[href],form', domWrap),
                i = elLinks.length,
                elLink = null,
                link = '';
            data = data || URL.URLGlobalParms;

            while (i--) {
                elLink = elLinks.get(i);
                link = elLink.href;
                
                if (link && link.match(/^(sms|tel|mail)/i)) {
                    /* 短信和电话链接, 什么都不做 */
                } else {
                    URL.setQueryString(elLink, data);
                }
            }
        },

        /**
         * @memberOf URL
         * @summary 向指定url中添加参数
         * @type {function}
         * @param {string} url                      - 指定url链接
         * @param {string} key                      - 参数的键
         * @param {string} value                    - 参数的值
         * @return {string}
         */
        setParam: function (url, name, val) {
            try {

                if (typeof url !== 'undefined' && typeof name !== 'undefined' && typeof val !== 'undefined') {

                    if (url.indexOf('?') === -1) {
                        url += '?' + name + '=' + val;

                    } else {
                        var urlParamArr = url.split('?');
                        var pStr = urlParamArr[1];
                        var pArr = pStr.split('&');
                        var findFlag = false;

                        $.each(pArr, function (index, item) {
                            var paramArr = item.split('=');

                            if (name === paramArr[0]) {
                                findFlag = true;
                                pArr[index] = name + '=' + val;

                                return false;
                            }
                        });

                        if (!findFlag) {
                            url += '&' + name + '=' + val;
                        
                        } else {
                            url = urlParamArr[0] + '?' + pArr.join('&');
                        }
                    }
                }

            } catch (e) {
                console.log(e);
            }

            return url;
        },

        /**
         * @memberOf URL
         * @summary 向指定url中添加多个参数
         * @type {function}
         * @param {string} url                      - 指定url链接
         * @param {string|object} param             - 为string时,param表示key，param2标志value; object时，忽略param2，将对象中所有属性添加到url中
         * @param {string} param2                   - 当param为string时生效，标志value
         * @return {string}
         */
        setParams: function (url, param, param2) {
            //只添加1个参数
            if (typeof param === 'string' && typeof param2 !== 'undefined') {

                return this.setParam(url, param, param2);
                //添加多个参数
            } else if (typeof param === 'object') {

                for (var i in param) {
                    url = this.setParam(url, i, param[i]);
                }

                return url;

            } else {

                return url;
            }
        },

        _init: function () {

            var URLGlobalParmsKeys = ['clientType', 'clientVer', 'actionVer', 'plat', 'startClient', 'useVideoLink', 'r', 'player'],
                key,
                URLParms = URL.getQueryData(location.search.substring(1)),
                URLGlobalParms = {},
                n = 0; /* 保存需要全站传递的参数 {key: value, ...} */

            /* 用于站外内嵌播放器的时候，渠道值保持页面间传递 */
            if (vars.IS_EXTERNAL_PLAYER) {
                URLGlobalParmsKeys.push('channeled');
            }

            var l = URLGlobalParmsKeys.length;
            
            while (l--) {
                key = URLGlobalParmsKeys[l];
             
                if (URLParms.hasOwnProperty(key)) {
                    URLGlobalParms[key] = URLParms[key];
                    n++;
                }
            }

            URL.URLGlobalParms = URLGlobalParms;
            
            if (n > 0) {
                URL.updateGlobalParms(document, URLGlobalParms);
                
            }
            
            return URL.URLGlobalParms;
        }
    };

    URL._init();
    module.exports = URL;

});