//     Zepto.Extend.js 实现了通用fn方法。 
 /**
 * @file 平台特性检测
 * @name detect
 * @short detect
 * @desc 扩展zepto中对browser的检测
 * @import zepto.js
 */
;(function($, navigator ,undefined) {
    
    /**
     * @name $.browser
     * @desc 扩展zepto中对browser的检测
     *
     * **可用属性**
     * - ***qq*** 检测qq浏览器
     * - ***uc*** 检测uc浏览器, 有些老版本的uc浏览器，不带userAgent和appVersion标记，无法检测出来
     * - ***baidu*** 检测baidu浏览器
     * - ***version*** 浏览器版本 
     */ 

    var ua = navigator.userAgent,
        br = $.browser,
        detects = {
            wx: /WeixinJSBridge|MicroMessenger\/([\d.]+)/i,
            qq: /MQQBrowser\/([\d.]+)/i,
            uc: /UCBrowser\/([\d.]+)/i,
            miui: /MiuiBrowser\/([\d.]+)/i,
            sogo: /SogouMSE|SogouMobileBrowser\/([\d.]+)/i,
            baidu: /baidubrowser\/.*?([\d.]+)/i,
            SohuVideoMobile: /SohuVideoMobile\/([\d.]+)/i
        },
        ret;

    $.each( detects, function( i, re ) {
        
        if ( (ret = ua.match( re )) ) {
            br[ i ] = true;
            br.version = ret[ 1 ];

            // 终端循环
            return false;
        }
    } );

    // uc还有一种规则，就是appVersion中带 Uc字符
    if ( !br.uc && /Uc/i.test( navigator.appVersion ) ) {
        br.uc = true;
    }

    /**
     * 检测设备对某些属性或方法的支持情况
     * @method $.support
     * @grammar $.support.orientation ⇒ Boolean
     * @param {Boolean} orientation 检测是否支持转屏事件，UC中存在orientaion，但转屏不会触发该事件，故UC属于不支持转屏事件(iOS 4上qq, chrome都有这个现象)
     * @param {Boolean} touch 检测是否支持touch相关事件
     * @param {Boolean} cssTransitions 检测是否支持css3的transition
     * @param {Boolean} has3d 检测是否支持translate3d的硬件加速
     * @example
     * if ($.support.has3d) {      //在支持3d的设备上使用
     *     console.log('you can use transtion3d');
     * }
     */
     // TODO检测是否支持position: fixed
    function detectPosFixed () {  }

    $.support = $.extend($.support || {}, {
        orientation: !(br.uc || (parseFloat($.os.version)<5 && (br.qq || br.chrome))) &&
            !($.os.android && parseFloat($.os.version) > 3) && "orientation" in window &&
            "onorientationchange" in window,
        touch: "ontouchend" in document,
        cssTransitions: "WebKitTransitionEvent" in window,
        has3d: 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(),
        // fix: detectPosFixed,
        pushState: "pushState" in history && "replaceState" in history,
        scrolling: '',
        requestAnimationFrame: 'webkitRequestAnimationFrame' in window
    });

})( Zepto, window.navigator );

/**
 * @name fix
 * @grammar fix(options) => self
 * @desc 固顶fix方法，对不支持position:fixed的设备上将元素position设为absolute，
 * 在每次scrollstop时根据opts参数设置当前显示的位置，类似fix效果。
 *
 * Options:
 * - ''top'' {Number}: 距离顶部的px值
 * - ''left'' {Number}: 距离左侧的px值
 * - ''bottom'' {Number}: 距离底部的px值
 * - ''right'' {Number}: 距离右侧的px值
 * @example
 * var div = $('div');
 * div.fix({top:0, left:0}); //将div固顶在左上角
 * div.fix({top:0, right:0}); //将div固顶在右上角
 * div.fix({bottom:0, left:0}); //将div固顶在左下角
 * div.fix({bottom:0, right:0}); //将div固顶在右下角
 *
 */

;(function ($, undefined) {
	var doc = window.document, docElem = document.documentElement, win=window; 
    var fix_ext = {
        fix: function(opts) {
            var me = this;                      //如果一个集合中的第一元素已fix，则认为这个集合的所有元素已fix，
            if(me.attr('isFixed')) return me;   //这样在操作时就可以针对集合进行操作，不必单独绑事件去操作
            me.css(opts).css('position', 'fixed').attr('isFixed', true);
            var buff = $('<div style="position:fixed;top:10px;"></div>').appendTo('body'),
                top = buff[0].getBoundingClientRect().top,
                checkFixed = function() {
                    if(window.pageYOffset > 0) {
                        if(buff[0].getBoundingClientRect().top !== top) {
                            me.css('position', 'absolute');
                            doFixed();
                            $(window).on('scrollStop', doFixed);
                            $(window).on('ortchange', doFixed);
                        }
                        $(window).off('scrollStop', checkFixed);
                        buff.remove();
                    }
                },
                doFixed = function() {
                    me.css({
                        top: window.pageYOffset + (opts.bottom !== undefined ? window.innerHeight - me.height() - opts.bottom : (opts.top ||0)),
                        left: opts.right !== undefined ? document.body.offsetWidth - me.width() - opts.right : (opts.left || 0)
                    });
                    opts.width == '100%' && me.css('width', document.body.offsetWidth);
                };

            $(window).on('scrollStop', checkFixed);

            return me;
        }
    };
    $.extend($.fn, fix_ext );
    $.extend($, fix_ext );
   

   
	/**
	*   highlight
	 *  @file 实现了通用fn方法。
	 *  @name Highlight
	 *  @desc 点击高亮效果
	 *  @import zepto.js
	 */ 
     var $doc = $( document ),
        $el,    // 当前按下的元素
        timer;    // 考虑到滚动操作时不能高亮，所以用到了100ms延时
    // 负责移除className.
    function dismiss() {
        var cls = $el.attr( 'hl-cls' );

        clearTimeout( timer );
        $el.removeClass( cls ).removeAttr( 'hl-cls' );
        $el = null;
        $doc.off( 'touchend touchmove touchcancel', dismiss );
    }

    /**
     * @name highlight
     * @desc 禁用掉系统的高亮，当手指移动到元素上时添加指定class，手指移开时，移除该class.
     * 当不传入className是，此操作将解除事件绑定。
     *
     * 此方法支持传入selector, 此方式将用到事件代理，允许dom后加载。
     * @grammar  highlight(className, selector )   ⇒ self
     * @grammar  highlight(className )   ⇒ self
     * @grammar  highlight()   ⇒ self
     * @example var div = $('div');
     * div.highlight('div-hover');
     *
     * $('a').highlight();// 把所有a的自带的高亮效果去掉。
     */
    $.fn.highlight = function( className, selector ) {
        return this.each(function() {
            var $this = $( this );

            $this.css( '-webkit-tap-highlight-color', 'rgba(255,255,255,0)' )
                .off( 'touchstart.hl' );

            className && $this.on( 'touchstart.hl', function( e ) {
                var match;

                $el = selector ? (match = $( e.target ).closest( selector,
                    this )) && match.length && match : $this;

                // selctor可能找不到元素。
                if ( $el ) {
                    $el.attr( 'hl-cls', className );
                    timer = setTimeout( function() {
                        $el.addClass( className );
                    }, 100 );
                    $doc.on( 'touchend touchmove touchcancel', dismiss );
                }
            } );
        });
    };

    /**
	 * @file 减少对方法、事件的执行频率，多次调用，在指定的时间内只会执行一次
     * ```
     * ||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
     * X    X    X    X    X    X      X    X    X    X    X    X
     * ```
     * 
     * @method $.fn.throttle
     * @grammar $.fn.throttle(delay, fn) ⇒ function
     * @param {Number} [delay=250] 延时时间
     * @param {Function} fn 被稀释的方法
     * @param {Boolean} [debounce_mode=false] 是否开启防震动模式, true:start, false:end
     * @example var touchmoveHander = function(){
     *     //....
     * }
     * //绑定事件
     * $(document).bind('touchmove', $.fn.throttle(250, touchmoveHander));//频繁滚动，每250ms，执行一次touchmoveHandler
     *
     * //解绑事件
     * $(document).unbind('touchmove', touchmoveHander);//注意这里面unbind还是touchmoveHander,而不是$.fn.throttle返回的function, 当然unbind那个也是一样的效果
     *
     */
    $.fn.throttle = function(delay, fn, debounce_mode) {
            var last = 0,
                timeId; 
            if (typeof fn !== 'function') {
                debounce_mode = fn;
                fn = delay;
                delay = 250;
            }

            function wrapper() {
                var that = this,
                    period = Date.now() - last,
                    args = arguments;

                function exec() {
                    last = Date.now();
                    fn.apply(that, args);
                };

                function clear() {
                    timeId = undefined;
                };

                if (debounce_mode && !timeId) {
                    // debounce模式 && 第一次调用
                    exec();
                }

                timeId && clearTimeout(timeId);
                if (debounce_mode === undefined && period > delay) {
                    // throttle, 执行到了delay时间
                    exec();
                } else {
                    // debounce, 如果是start就clearTimeout
                    timeId = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - period : delay);
                }
            };
            // for event bind | unbind
            wrapper._zid = fn._zid = fn._zid || $.proxy(fn)._zid;
            return wrapper;
     };

    /**
     * @desc 减少执行频率, 在指定的时间内, 多次调用，只会执行一次。
     * **options:**
     * - ***delay***: 延时时间
     * - ***fn***: 被稀释的方法
     * - ***t***: 指定是在开始处执行，还是结束是执行, true:start, false:end
     *
     * 非at_begin模式
     * <code type="text">||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
     *                         X                                X</code>
     * at_begin模式
     * <code type="text">||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
     * X                                X                        </code>
     *
     * @grammar $.fn.debounce(delay, fn[, at_begin]) ⇒ function
     * @name $.fn.debounce
     * @example var touchmoveHander = function(){
     *     //....
     * }
     * //绑定事件
     * $(document).bind('touchmove', $.fn.debounce(250, touchmoveHander));//频繁滚动，只要间隔时间不大于250ms, 在一系列移动后，只会执行一次
     *
     * //解绑事件
     * $(document).unbind('touchmove', touchmoveHander);//注意这里面unbind还是touchmoveHander,而不是$.fn.debounce返回的function, 当然unbind那个也是一样的效果
     */
    $.fn.debounce=function(delay, fn, t) {
        return fn === undefined ? $.fn.throttle(250, delay, false) : $.fn.throttle(delay, fn, t === undefined ? false : t !== false);
    };

    function registerScrollStop() {
        $(win).on('scroll', $.fn.debounce(80, function () {
            $(win).trigger('scrollStop');
        }, false));
    }

    function backEventOffHandler() {
        //在离开页面，前进或后退回到页面后，重新绑定scroll, 需要off掉所有的scroll，否则scroll时间不触发
        $(win).off('scroll');
        registerScrollStop();
    }
    registerScrollStop();

    //todo 待统一解决后退事件触发问题
    $(win).on('pageshow', function (e) {
        //如果是从bfcache中加载页面，为了防止多次注册，需要先off掉
        e.persisted && $(win).off('touchstart', backEventOffHandler).one('touchstart', backEventOffHandler);
    });

     /**
     * 解析模版str。当data未传入时返回编译结果函数；当需要多次解析时，建议保存编译结果函数，然后调用此函数来得到结果。
     * 
     * @method $.fn.parseTpl 
     * @param {String} tplstr 模板
     * @param {Object} data 数据
     * @example var str = "<p><%=name%></p>",
     * obj = {name: 'ajean'};
     * console.log($.fn.parseTpl(tplstr, data)); // => <p>ajean</p>
     */
    $.fn.parseTpl = function( tplstr, data ) {
        var tmpl = 'var __p=[];' + 'with(obj||{}){__p.push(\'' +
                tplstr.replace( /\\/g, '\\\\' )
                .replace( /'/g, '\\\'' )
                .replace( /<%=([\s\S]+?)%>/g, function( match, code ) {
                    return '\',' + code.replace( /\\'/, '\'' ) + ',\'';
                } )
                .replace( /<%([\s\S]+?)%>/g, function( match, code ) {
                    return '\');' + code.replace( /\\'/, '\'' )
                            .replace( /[\r\n\t]/g, ' ' ) + '__p.push(\'';
                } )
                .replace( /\r/g, '\\r' )
                .replace( /\n/g, '\\n' )
                .replace( /\t/g, '\\t' ) +
                '\');}return __p.join("");',

            /* jsbint evil:true */
            func = new Function( 'obj', tmpl );
        
        return data ? func( data ) : func;
    };

    // 扩展
    var extFun = { 
        highlight : $.fn.highlight,
        throttle : $.fn.throttle,
        debounce : $.fn.debounce,
        parseTpl : $.fn.parseTpl,

          /**
         * @namespace $
         * @property {function} oriHide                   - 显示dom元素
         * @desc zepto中的show hide已被重写，这里还原原先的show hide方法
         */
        oriShow: function() {
          this.css({display: 'block'});

          return this;
        },

        /**
         * @namespace $
         * @property {function} oriHide                   - 隐藏dom元素
         * @desc zepto中的show hide已被重写，这里还原原先的show hide方法
         */
        oriHide: function() {
          this.css({display: 'none'});

          return this;
        },
        /**
         * @namespace $
         * @property {function} htmlLog                   - 添加日志
         */
        htmlLog: function (param1, param2) {

            if ($('#js_htmlLog').length === 0) {
                $('body').append($('<div id="js_htmlLog" style="height: 200px;overflow: scroll;"></div>'));
            }
            var arr = [];
            
            if (!$.isUndefined(param1)) {
                arr.push('<span>' + param1 + '</span>');
            }

            if (!$.isUndefined(param2)) {
                arr.push('<span>' + param2 + '</span>');
            }

            $('#js_htmlLog').prepend(arr.join(' ') + '<br>');
        },

        /**
         * @namespace $
         * @property {function} noop                      - 空函数
         */
          noop: function () {},

          /**
         * @namespace $
         * @property {function} blankFun                  - 空函数
         */
          blankFun: function () {},
          
          /**
         * @namespace $
         * @property {function} isString                  - 是否是字符串
         * @param {string} val
         * @returns {boolean}
         */
          isString: function (val) {
          
          return $.type(val) === 'string';
          },

          /**
         * @namespace $
         * @property {function} isUndefined                - 是否是字符串
         * @return {boolean}
         */
          isUndefined: function (val) {
          
             return typeof val === 'undefined';
          },

          isNumber: function (val) {

            return $.type(val) === 'number';
          },
          isEmpty:function (obj){ 
              if (obj == null) return true; 
              if (obj.length > 0)    return false;
              if (obj.length === 0)  return true;
              for (var key in obj) {
                if (hasOwnProperty.call(obj, key) || obj[key] !== null)  return false; 
              }  
              return true; 
          },
          isArray: function (val) {

            return ((!$.isUndefined(val)) && (val instanceof Array));
          },
          //对象非添加型合并
          merge: function (a, b) {

            for (var i in a) {

                if (!$.isUndefined(b[i])) {
                    a[i] = b[i];
                }
            }

            return a;
          },
        isScript : function ( filename ) {
            filename = filename || '';
            return !!/\.js(?=[\?#]|$)/i.exec( filename );
        },

        isCss : function ( filename ) {
            filename = filename || '';
            return !!/\.css(?=[\?#]|$)/i.exec( filename );
        },  
        isRegExp : function ( o ) {
            return o &&  Object.prototype.toString.call( o ) === '[object RegExp]';
        },
        now: function () { return new Date().getTime(); },
        nowDataString : function() {
            var dt = new Date();
            var dm = String((dt.getMonth() + 1) >= 12 ? 12 : (dt.getMonth() + 1));
            if (dm.length < 2) {
                dm = '0' + dm;
            }
            var dd = String(dt.getDate());
            if (dd.length < 2) {
                dd = '0' + dd;
            }
            var dh = String(dt.getHours());
            if (dh.length < 2) {
                dh = '0' + dh;
            }
            var dmi = String(dt.getMinutes());
            if (dmi.length < 2) {
                dmi = '0' + dmi;
            }
            var dse = String(dt.getSeconds());
            if (dse.length < 2) {
                dse = '0' + dse;
            }
            var dtstr = " " + dt.getFullYear() + '' + dm + '' + dd + ' ' + dh + ':' + dmi + ':' + dse;
            return dtstr;
        },
        getISOTimeFormat: function () {
          var date = new Date(),
            y = date.getFullYear(),
            m = date.getMonth() + 1,
            d = date.getDate(),
            h = date.getHours(),
            M = date.getMinutes(),
            s = date.getSeconds();
          
          return [[y, m < 10 ? "0" + m : m, d < 10 ? "0" + d : d].join("-"), [h < 10 ? "0" + h : h, M < 10 ? "0" + M : M, s < 10 ? "0" + s : s].join(":")].join(" ");
        },
        
        formatSeconds: function (seconds) {
            seconds = parseInt(seconds);
            var M = parseInt(seconds / 60),
                h = M >= 60 ? parseInt(M / 60) : 0,
                s = seconds % 60,
                str = "";
            M >= 60 && (M = M % 60);
            if (h > 0) {
                str += h < 10 ? "0" + h : h;
                str += ":";
            }
            str += M < 10 ? "0" + M : M;
            str += ":";
            str += s < 10 ? "0" + s : s;
            
            return str;
        },
        getHost: function () {
            var _host = window.location.hostname || window.location.host,
                _sarray = location.host.split(".");
            if (_sarray.length > 1) {
                _host = _sarray.slice(_sarray.length - 2).join(".");
            }
            return _host;
        },
        getUrlParam: function (p, u) {
            u = u || document.location.toString();
            var reg = new RegExp("(^|&|\\\\?)" + p + "=([^&]*)(&|$|#)"),
                r = null;
            if (r = u.match(reg)) return r[2];
            return "";
        },
            
        filterXSS: function (str) { 
            if (!$.isString(str)) return str;
            str=str.replace(/</g, "&lt;");
            str=str.replace(/>/g, "&gt;");
            str=str.replace(/\"/g, "&quot;"); 
            str=str.replace(/\'/g, "&apos;");  
            return str;    
        } ,
            
        //32 guid
        createGUID: function (len) {
            len = len || 32;
            var guid = "";
            for (var i = 1; i <= len; i++) {
                var n = Math.floor(Math.random() * 16.0).toString(16);
                guid += n;
            }
            return guid; 
        },
        formatSize: function (size) {
            var s = "" + size;
            if (s.indexOf("%") > 0) return s;
            if (s.indexOf("px") > 0) return s;
            if (/^\d+$/.test(s)) return s + "px";
            return s;
        },
        isTrue: function (v) {
            return eval(svp.$.filterXSS(v));
        }
    };
    $.extend($, extFun); 
    $.extend($.fn, extFun);
   

})( Zepto );
