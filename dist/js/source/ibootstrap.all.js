webpackJsonp([0,1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _autoFont = __webpack_require__(1);

	var _autoFont2 = _interopRequireDefault(_autoFont);

	var _popup = __webpack_require__(3);

	var _popup2 = _interopRequireDefault(_popup);

	var _tips = __webpack_require__(5);

	var _tips2 = _interopRequireDefault(_tips);

	var _viewReveal = __webpack_require__(6);

	var _viewReveal2 = _interopRequireDefault(_viewReveal);

	var _paButton = __webpack_require__(7);

	var _paButton2 = _interopRequireDefault(_paButton);

	var _codeMsg = __webpack_require__(8);

	var _codeMsg2 = _interopRequireDefault(_codeMsg);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// 初始化 功能组件
	// require('../../sass/ibootstrap.scss');

	// 基本组件
	_autoFont2.default.init();

	// 功能组件

	_popup2.default.init();
	_viewReveal2.default.init();
	_tips2.default.init();
	_paButton2.default.init();
	_codeMsg2.default.init();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	/*
	    查询是否是移动端，如果是则进行初始化em，如果不是还原
	    autoFont.init(); //自动执行
	*/

	var userAgent = __webpack_require__(2);
	var autoFont = {
	    init: function init() {
	        var setFontSize = (function () {
	            // 获取window 宽度,动态计算
	            var _self = this;
	            _self.width = 750; //psd750px宽度 ,default
	            _self.fontSize = 100; //字体大小
	            _self.widthProportion = function () {
	                var p = (document.body && document.documentElement.clientWidth || document.getElementsByTagName("html")[0].offsetWidth) / _self.width;
	                var px1 = (p * _self.fontSize).toFixed(4);
	                //console.log("px1 ="+px1);
	                px1 = px1 > 100 ? 100 : px1;
	                px1 = px1 < 0.08 ? 0.08 : px1;
	                return px1;
	            };
	            console.log("html fontSize: ", _self.widthProportion());
	            document.getElementsByTagName("html")[0].setAttribute("style", "font-size:" + _self.widthProportion() + "px; !important");
	        }).bind(window);
	        // init 初始化
	        setFontSize();
	        //手机改变状态时也执行该方法
	        var _evt = 'onorientationchange' in window ? 'orientationchange' : 'resize';
	        var _timer = null;
	        //android,win系列
	        window.addEventListener(_evt, function () {
	            clearTimeout(_timer);
	            _timer = setTimeout(setFontSize, 300);
	        }, false);
	        //ios系列
	        window.addEventListener("pageshow", function (e) {
	            if (e.persisted) {
	                clearTimeout(_timer);
	                _timer = setTimeout(setFontSize, 300);
	            }
	        }, false);
	    }
	};
	module.exports = autoFont;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	/*
	    查询是否是移动端
	    userAgent.isMobile() //boo
	*/
	var userAgent = {
	    mobileArr: ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"],
	    isMobile: function isMobile() {
	        return this.mobileArr.some(function (v) {
	            return window.navigator.userAgent.indexOf(v) > 0 ? true : false;
	        });
	    }
	};
	module.exports = userAgent;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _events = __webpack_require__(4);

	var _events2 = _interopRequireDefault(_events);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var popup = {
	    init: function init() {
	        this.show();
	        this.close();
	        this.showPop();
	        this.hidePop();
	    },
	    show: function show() {
	        var node;
	        $('[data-target-pop]').on('click', function () {
	            node = $($(this).data('target-pop'));
	            node.showPop();
	        });
	    },
	    close: function close() {
	        var node;
	        $('[data-close-pop]').on('click', function () {
	            node = $(this).parents($(this).data('close-pop'));
	            node.hidePop();
	        });
	    },
	    showPop: function showPop() {
	        $.fn.extend({
	            showPop: function showPop() {
	                var node = $(this);
	                if (node.hasClass('pop')) {
	                    _events2.default.untouchmove();
	                    node.addClass('fadeIn').removeClass('fade');
	                }
	            }
	        });
	    },
	    hidePop: function hidePop() {
	        $.fn.extend({
	            hidePop: function hidePop() {
	                var node = $(this);
	                if (node.hasClass('pop')) {
	                    _events2.default.touchmove();
	                    node.addClass('fade').removeClass('fadeIn');
	                    setTimeout(function () {
	                        node.removeClass('fade');
	                    }, 300);
	                }
	            }
	        });
	    }
	}; /*
	       触发对象：需添加 data-target-pop = '#target'
	       释放对象：需添加 data-close-pop = '.pop'
	   */

	module.exports = popup;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	/*
	    基础事件
	*/
	var events = {
	    // 取消禁止滑动
	    touchmove: function touchmove() {
	        document.ontouchmove = function () {
	            return true;
	        };
	    },
	    // 设置禁止滑动
	    untouchmove: function untouchmove() {
	        document.ontouchmove = function () {
	            return false;
	        };
	    }
	};

	module.exports = events;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	/*
	    提示
	*/
	var tips = {
	    init: function init() {
	        this.show();
	        this.close();
	        this.showTips();
	        this.hideTips();
	    },
	    show: function show() {
	        $('[data-target-tips]').on('click', function () {
	            var node = $($(this).data('target-tips'));
	            node.showTips(3000);
	        });
	    },
	    close: function close() {
	        $('[data-close-tips]').on('click', function () {
	            var node = $(this).parents($(this).data('close-tips'));
	            node.hideTips();
	        });
	    },
	    showTips: function showTips() {
	        $.fn.extend({
	            showTips: function showTips(time) {
	                var node = $(this);
	                if (node.hasClass('tips')) {
	                    node.addClass('fadeIn');
	                }
	                if (!!time) {
	                    setTimeout(function () {
	                        if (node.hasClass('fadeIn')) {
	                            node.hideTip();
	                        }
	                    }, time);
	                }
	            }
	        });
	    },
	    hideTips: function hideTips() {
	        $.fn.extend({
	            hideTips: function hideTips() {
	                var node = $(this);
	                node.addClass('fade').removeClass('fadeIn');
	                setTimeout(function () {
	                    node.removeClass('fade');
	                }, 300);
	            }
	        });
	    }
	};

	module.exports = tips;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	/*
	    视口
	*/
	var view = {
	    init: function init() {
	        var node;
	        $('[data-target]').on('click', function () {
	            node = $($(this).data('target'));
	            if (node.hasClass('view')) {
	                $('html, body').addClass('ofHidden');
	                node.addClass('fadeIn').removeClass('fade');
	                setTimeout(function () {
	                    node.find('.views').addClass('fadeIn').removeClass('fade');
	                }, 100);
	            }
	        });
	        this.dismiss();
	    },
	    dismiss: function dismiss() {
	        var node;
	        $('[data-closeView]').on('click', function () {
	            $('html, body').removeClass('ofHidden');
	            node = $(this).parents($(this).data('closeView'));
	            if (node.hasClass('view')) {
	                node.find('.views').addClass('fade').removeClass('fadeIn');
	                setTimeout(function () {
	                    node.addClass('fade').removeClass('fadeIn');
	                });
	                setTimeout(function () {
	                    node.removeClass('fade');
	                    node.find('.views').removeClass('fade');
	                }, 300);
	            }
	        });
	    },
	    showView: function showView() {},
	    hideView: function hideView() {}
	};
	module.exports = view;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	var onButton = {
	    init: function init() {
	        var th = this;
	        $('[data-target-paButton]').on('click', function () {
	            var node = $($(this).data('target-pabutton'));
	            if (node.attr('data-state') === 'on') {
	                th.off(node);
	            } else {
	                th.on(node);
	            }
	        });
	        th.onPaButton();
	        th.offPaButton();
	    },
	    on: function on(node) {
	        node.addClass('on').removeClass('off');
	        node.attr('data-state', 'on');
	    },
	    off: function off(node) {
	        node.addClass('off').removeClass('on');
	        node.attr('data-state', 'off');
	    },
	    onPaButton: function onPaButton() {
	        var th = this;
	        $.fn.extend({
	            onPaButton: function onPaButton() {
	                th.on($(this));
	            }
	        });
	    },
	    offPaButton: function offPaButton() {
	        var th = this;
	        $.fn.extend({
	            offPaButton: function offPaButton() {
	                th.off($(this));
	            }
	        });
	    }
	};

	module.exports = onButton;

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	var codeMsg = {
	    init: function init() {
	        $('[data-target-codemsg]').on('click', function () {
	            var node = $($(this).attr('data-target-codemsg'));
	            var msg = node.attr('data-codemsg');
	            var re = /\{{([^}}]+)?}}/i;
	            var baseMsg = node.text();
	            var time = Number(re.exec(msg)[1]);
	            if (!node.attr('data-state')) {
	                (function () {
	                    node.attr('data-state', 'ing');
	                    node.text(msg.replace(re, time--));
	                    var tid = setInterval(function () {
	                        if (time !== 0) {
	                            node.text(msg.replace(re, time--));
	                        } else {
	                            clearInterval(tid);
	                            node.text(baseMsg);
	                            node.removeAttr('data-state');
	                        }
	                    }, 1000);
	                })();
	            }
	        });
	    }
	};
	module.exports = codeMsg;

/***/ }
]);