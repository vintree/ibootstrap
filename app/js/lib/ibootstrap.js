webpackJsonp([0,1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _autoFont = __webpack_require__(1);

	var _autoFont2 = _interopRequireDefault(_autoFont);

	var _popup = __webpack_require__(3);

	var _popup2 = _interopRequireDefault(_popup);

	var _tips = __webpack_require__(5);

	var _tips2 = _interopRequireDefault(_tips);

	var _viewReveal = __webpack_require__(6);

	var _viewReveal2 = _interopRequireDefault(_viewReveal);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	__webpack_require__(7);

	// 基本组件

	// 功能组件

	// 初始化 功能组件
	_autoFont2.default.init();

	_popup2.default.init();
	_viewReveal2.default.init();
	_tips2.default.init();

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
	        $('[data-closePop]').on('click', function () {
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
	       触发对象：需添加 data-target = '#target'
	       释放对象：需添加 data-dismiss = '.pop'
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
	    params: function params() {},
	    init: function init() {
	        this.show();
	        this.close();
	        this.showTip();
	        this.hideTip();
	    },
	    show: function show() {
	        $('[data-target]').on('click', function () {
	            var node = $($(this).data('target'));
	            node.showTip();
	        });
	    },
	    close: function close() {
	        $('[data-closeTips]').on('click', function () {
	            var node = $(this).parents($(this).data('closeTips'));
	            node.hideTip();
	        });
	    },
	    showTip: function showTip() {
	        $.fn.extend({
	            showTip: function showTip(time) {
	                var node = $(this);
	                if (node.hasClass('tips')) {
	                    node.addClass('fadeIn');
	                }
	                if (!!time) {
	                    setTimeout(function () {
	                        node.hideTip();
	                    }, time);
	                }
	            }
	        });
	    },
	    hideTip: function hideTip() {
	        $.fn.extend({
	            hideTip: function hideTip() {
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
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(8);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(10)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./ibootstrap.scss", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./../../node_modules/sass-loader/index.js!./ibootstrap.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(9)();
	// imports


	// module
	exports.push([module.id, "@charset \"UTF-8\";\n/*\n    文字省略\n*/\n/*\n    选中默认样式\n*/\n/*\n    长按：选中样式\n*/\n/*\n    弹性布局\n*/\n/*\n    input样式\n*/\n*, *::before, *::after {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box; }\n\n*:not(input):not(textarea):not(contenteditable) {\n  -webkit-user-select: none;\n  -khtml-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none; }\n\nhtml, body {\n  font-family: \"Helvetica Neue\", Helvetica, Microsoft Yahei, Hiragino Sans GB, WenQuanYi Micro Hei, sans-serif;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #333;\n  background-color: #fff;\n  margin: 0;\n  padding: 0; }\n\nul, ol {\n  margin: 0;\n  padding: 0;\n  list-style-type: none; }\n\na {\n  text-decoration: none; }\n\na:-webkit-any-link {\n  color: -webkit-link;\n  text-decoration: underline;\n  cursor: auto; }\n\ndiv, div[contentEditable], input, textarea, button, a:link {\n  -webkit-tap-highlight-color: rgba(255, 255, 255, 0); }\n\n*[class~=btn] {\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.5); }\n\ninput::-webkit-outer-spin-button, input::-webkit-inner-spin-button {\n  -webkit-appearance: none !important;\n  margin: 0; }\n\na:hover {\n  text-decoration: underline; }\n\n.ofHidden {\n  overflow: hidden; }\n\n@keyframes pop-fadeIn {\n  0% {\n    opacity: 0;\n    transform: scale(1.2, 1.2); }\n  100% {\n    opacity: 1;\n    transform: scale(1, 1); } }\n\n@keyframes pop-fade {\n  0% {\n    opacity: 1;\n    transform: scale(1, 1); }\n  100% {\n    opacity: 0;\n    transform: scale(1.2, 1.2); } }\n\n@keyframes tips-top-fadeIn {\n  0% {\n    opacity: 0;\n    transform: translateY(-1rem); }\n  100% {\n    opacity: 1;\n    transform: translateY(0); } }\n\n@keyframes tips-top-fade {\n  0% {\n    opacity: 1;\n    transform: translateY(0); }\n  100% {\n    opacity: 0;\n    transform: translateY(-1rem); } }\n\n@keyframes view-bottom-fadeIn {\n  0% {\n    opacity: 0;\n    transform: translateY(10rem); }\n  100% {\n    opacity: 1;\n    transform: translateY(0); } }\n\n@keyframes view-bottom-fade {\n  0% {\n    opacity: 1;\n    transform: translateY(0rem); }\n  100% {\n    opacity: 0;\n    transform: translateY(10rem); } }\n\n.defaultBackground {\n  background-color: rgba(0, 0, 0, 0.1); }\n\n.defaultSelect {\n  -webkit-user-select: text;\n  -khtml-user-select: text;\n  -moz-user-select: text;\n  -ms-user-select: text;\n  user-select: text; }\n\n.cl-primary {\n  color: #337ab7; }\n\n.cl-success {\n  color: #5cb85c; }\n\n.cl-info {\n  color: #5bc0de; }\n\n.cl-warning {\n  color: #f0ad4e; }\n\n.cl-danger {\n  color: #d9534f; }\n\n.cl-primaryBk {\n  background-color: #337ab7; }\n\n.cl-successBk {\n  background-color: #5cb85c; }\n\n.cl-infoBk {\n  background-color: #5bc0de; }\n\n.cl-warningBk {\n  background-color: #f0ad4e; }\n\n.cl-dangerBk {\n  background-color: #d9534f; }\n\n/*\n    按钮\n*/\n.btn {\n  width: 100%;\n  display: inline-block;\n  text-align: center;\n  cursor: pointer;\n  border: 1px solid transparent;\n  white-space: nowrap;\n  background-color: white;\n  -webkit-user-select: none;\n  border-radius: 3px;\n  line-height: 1rem;\n  font-size: 0.3rem;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  margin: 0.12rem 0; }\n\n.btn.disabled, .btn[disabled], fieldset[disabled] .btn {\n  cursor: not-allowed;\n  filter: alpha(opacity=65);\n  -webkit-box-shadow: none;\n  box-shadow: none;\n  opacity: .65; }\n\n.btn-default[disabled] {\n  background-color: #ccc; }\n\n.btn-primary[disabled] {\n  background-color: #265a88; }\n\n.btn-success[disabled] {\n  background-color: #398439; }\n\n.btn-primary[disabled] {\n  background-color: #265a88; }\n\n.btn-info[disabled] {\n  background-color: #46b8da; }\n\n.btn-warning[disabled] {\n  background-color: #eea236; }\n\n.btn-danger[disabled] {\n  background-color: #d43f3a; }\n\n.btn-block {\n  display: block;\n  width: 100%; }\n\n.btn-radius {\n  border-radius: .5rem; }\n\n.btn-unradius {\n  border-radius: 0; }\n\n/*\n    按钮组合样式\n*/\n.btn-group {\n  display: flex;\n  flex-flow: column; }\n  .btn-group.btn-inline {\n    flex-flow: row; }\n    .btn-group.btn-inline .btn {\n      margin: 0 0.1rem; }\n  .btn-group .btn {\n    flex: 1; }\n\n.btn-default {\n  color: #333;\n  background-color: #fff;\n  border-color: #ccc; }\n\n.btn-primary {\n  color: #fff;\n  background-color: #337ab7;\n  border-color: #2e6da4; }\n\n.btn-success {\n  color: #fff;\n  background-color: #5cb85c;\n  border-color: #4cae4c; }\n\n.btn-info {\n  color: #fff;\n  background-color: #5bc0de;\n  border-color: #46b8da; }\n\n.btn-warning {\n  color: #fff;\n  background-color: #f0ad4e;\n  border-color: #eea236; }\n\n.btn-danger {\n  color: #fff;\n  background-color: #d9534f;\n  border-color: #d43f3a; }\n\n/*\n     分配长度\n*/\n.col-md-1 {\n  width: 8.33333333%; }\n\n.col-md-2 {\n  width: 16.66666667%; }\n\n.col-md-3 {\n  width: 25%; }\n\n.col-md-4 {\n  width: 33.33333333%; }\n\n.col-md-5 {\n  width: 41.66666667%; }\n\n.col-md-6 {\n  width: 50%; }\n\n.col-md-7 {\n  width: 58.33333333%; }\n\n.col-md-8 {\n  width: 66.66666667%; }\n\n.col-md-9 {\n  width: 75%; }\n\n.col-md-10 {\n  width: 83.33333333%; }\n\n.col-md-11 {\n  width: 91.66666667%; }\n\n.col-md-12 {\n  width: 100%; }\n\n.form-group {\n  padding-left: 0.1rem;\n  border-top: 1px solid #ccc;\n  border-bottom: 1px solid #ccc;\n  margin: 0.12rem 0; }\n  .form-group .inp-group {\n    display: flex;\n    flex-flow: row;\n    border-bottom: 1px solid #ccc;\n    height: 1rem; }\n    .form-group .inp-group:last-child {\n      border: 0; }\n    .form-group .inp-group.inp-code input {\n      flex: 5;\n      height: 100%;\n      font-size: 0.3rem;\n      border-style: none;\n      color: #333; }\n    .form-group .inp-group.inp-code .inp-code-btn {\n      flex: 3;\n      line-height: 1rem;\n      text-align: center;\n      color: #aaa;\n      font-size: 0.35rem;\n      overflow: hidden;\n      white-space: nowrap;\n      text-overflow: ellipsis; }\n    .form-group .inp-group input {\n      flex: 8;\n      height: 100%;\n      font-size: 0.3rem;\n      border-style: none;\n      color: #333; }\n    .form-group .inp-group label {\n      flex: 2;\n      text-align: right;\n      line-height: 1rem;\n      overflow: hidden;\n      white-space: nowrap;\n      text-overflow: ellipsis; }\n\n.checkbox-inline {\n  display: -webkit-box;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  display: flex;\n  flex-flow: row;\n  text-align: center; }\n\n.checkbox-block {\n  display: -webkit-box;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  display: flex;\n  flex-flow: column; }\n\n.checkbox-label {\n  flex: 1; }\n\n[type=checkbox] {\n  margin: 0;\n  width: 0.45rem;\n  height: 0.45rem;\n  font-size: 0.6rem;\n  border: 1px solid #DCDCDC;\n  background-color: transparent;\n  -webkit-appearance: none;\n  appearance: none; }\n  [type=checkbox]:checked {\n    background-color: #4682b4; }\n\n.checkbox-describe {\n  display: inline-block;\n  position: relative;\n  top: -.1rem; }\n\n.radio-inline {\n  display: -webkit-box;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  display: flex;\n  flex-flow: row;\n  text-align: center; }\n\n.radio-block {\n  display: -webkit-box;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  display: flex;\n  flex-flow: column; }\n\n.radio-label {\n  flex: 1; }\n\n[type=radio] {\n  border-radius: 100%;\n  margin: 0;\n  width: 0.45rem;\n  height: 0.45rem;\n  font-size: 0.6rem;\n  border: 1px solid #DCDCDC;\n  background-color: transparent;\n  -webkit-appearance: none;\n  appearance: none; }\n  [type=radio]:checked {\n    background-color: #4682b4; }\n\n.radio-describe {\n  display: inline-block;\n  position: relative;\n  top: -.1rem; }\n\n.tips {\n  line-height: 1rem;\n  text-align: center; }\n  .tips.tips-top-group {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    font-size: 0.3rem;\n    transform: translateY(-1rem); }\n    .tips.tips-top-group .tips-describe {\n      padding: 0 .5rem;\n      overflow: hidden;\n      white-space: nowrap;\n      text-overflow: ellipsis; }\n  .tips.fade {\n    animation: 0.3s tips-top-fade;\n    animation-fill-mode: forwards; }\n  .tips.fadeIn {\n    animation: 0.5s tips-top-fadeIn;\n    animation-fill-mode: forwards; }\n  .tips.tips-primary {\n    background-color: #337ab7;\n    color: #fff; }\n  .tips.tips-success {\n    background-color: #5cb85c;\n    color: #fff; }\n  .tips.tips-info {\n    background-color: #5bc0de;\n    color: #fff; }\n  .tips.tips-warning {\n    background-color: #f0ad4e;\n    color: #fff; }\n  .tips.tips-danger {\n    background-color: #d9534f;\n    color: #fff; }\n  .tips [role~=cancel] {\n    position: absolute;\n    top: 0;\n    right: 0;\n    display: block;\n    width: .5rem;\n    line-height: 1rem;\n    text-align: center;\n    color: #fff; }\n\n.list-group {\n  display: block;\n  margin: 0;\n  padding: 0;\n  border-top: 1px solid #DCDCDC;\n  border-bottom: 1px solid #DCDCDC;\n  margin: 0.1rem 0; }\n\n.list-img1-group .list-unit {\n  position: relative;\n  display: flex;\n  flex-flow: row;\n  height: 2.2rem;\n  padding: 0.3rem 0;\n  border-bottom: 1px solid #DCDCDC; }\n  .list-img1-group .list-unit:last-child {\n    border: 0; }\n  .list-img1-group .list-unit .list-tx {\n    position: relative;\n    flex: 5;\n    padding-right: 0.1rem; }\n    .list-img1-group .list-unit .list-tx .list-tit {\n      font-size: 0.4rem;\n      color: #333;\n      display: -webkit-box;\n      text-overflow: -o-ellipsis-lastline;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      -webkit-line-clamp: 2;\n      -webkit-box-orient: vertical; }\n    .list-img1-group .list-unit .list-tx .list-time {\n      position: absolute;\n      bottom: -.05rem;\n      left: 0;\n      font-size: 0.25rem;\n      color: #aaa;\n      text-align: justify; }\n  .list-img1-group .list-unit .list-img {\n    flex: 2;\n    height: 100%; }\n    .list-img1-group .list-unit .list-img img {\n      width: 100%;\n      height: 100%; }\n\n.list-img3-group .list-unit {\n  position: relative;\n  padding: 0.3rem 0;\n  border-bottom: 1px solid #DCDCDC; }\n  .list-img3-group .list-unit:last-child {\n    border: 0; }\n  .list-img3-group .list-unit .list-tit {\n    font-size: 0.4rem;\n    color: #333;\n    display: -webkit-box;\n    text-overflow: -o-ellipsis-lastline;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    padding-bottom: 0.1rem; }\n  .list-img3-group .list-unit .list-img {\n    display: flex;\n    flex-flow: row;\n    height: 2.2rem;\n    padding-bottom: 0.1rem; }\n    .list-img3-group .list-unit .list-img img {\n      flex: 1;\n      width: 100%;\n      height: 100%;\n      padding-right: 0.05rem; }\n      .list-img3-group .list-unit .list-img img img:last-child {\n        padding: 0; }\n  .list-img3-group .list-unit .list-time {\n    font-size: 0.25rem;\n    color: #aaa; }\n\n.flist-group {\n  display: flex;\n  flex-flow: row;\n  margin: 0;\n  padding: 0; }\n  .flist-group .flist-unit-group {\n    height: 1.3rem;\n    line-height: 1.3rem; }\n    .flist-group .flist-unit-group:nth-child(1) {\n      flex: 1;\n      text-align: center;\n      font-size: 0.58333rem; }\n    .flist-group .flist-unit-group:nth-child(2) {\n      flex: 5; }\n      .flist-group .flist-unit-group:nth-child(2) .flist-tx {\n        flex: 5;\n        display: flex;\n        flex-flow: row;\n        border-bottom: 1px solid #DCDCDC; }\n        .flist-group .flist-unit-group:nth-child(2) .flist-tx:last-child {\n          border-bottom: 0; }\n        .flist-group .flist-unit-group:nth-child(2) .flist-tx .flist-tit {\n          flex: 6;\n          font-size: 0.35rem;\n          color: #808080; }\n        .flist-group .flist-unit-group:nth-child(2) .flist-tx .flist-rightIcon {\n          flex: 1;\n          text-align: right;\n          font-size: 0.7rem;\n          color: #DCDCDC; }\n\n.layer {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 999;\n  background-color: rgba(0, 0, 0, 0.7); }\n\n.pop {\n  display: -webkit-box;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: -webkit-flex;\n  display: flex;\n  -webkit-box-align: center;\n  -moz-box-align: center;\n  -ms-flex-align: center;\n  -webkit-align-items: center;\n  align-items: center;\n  -webkit-box-pack: center;\n  -moz-box-pack: center;\n  -ms-flex-pack: center;\n  -webkit-justify-content: center;\n  justify-content: center;\n  display: none; }\n  .pop.pop-modal {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    z-index: 9999;\n    background-color: rgba(0, 0, 0, 0.5); }\n    .pop.pop-modal.fadeIn {\n      display: flex;\n      animation: pop-fadeIn .5s;\n      animation-fill-mode: forwards; }\n    .pop.pop-modal.fade {\n      display: flex;\n      animation: pop-fade .3s;\n      animation-fill-mode: forwards; }\n    .pop.pop-modal .pop-foot {\n      flex: 2;\n      color: #1E90ff;\n      line-height: 3;\n      display: -webkit-box;\n      display: -moz-box;\n      display: -ms-flexbox;\n      display: -webkit-flex;\n      display: flex;\n      -webkit-box-align: center;\n      -moz-box-align: center;\n      -ms-flex-align: center;\n      -webkit-align-items: center;\n      align-items: center;\n      -webkit-box-pack: center;\n      -moz-box-pack: center;\n      -ms-flex-pack: center;\n      -webkit-justify-content: center;\n      justify-content: center;\n      overflow: hidden;\n      white-space: nowrap;\n      text-overflow: ellipsis;\n      border-top: 1px solid #DCDCDC;\n      font-size: 0.39rem; }\n      .pop.pop-modal .pop-foot [role~=dismiss] {\n        flex: 1;\n        font-weight: bold;\n        border-right: 1px solid #DCDCDC;\n        padding: 0 0.1rem; }\n        .pop.pop-modal .pop-foot [role~=dismiss]:hover {\n          background-color: rgba(0, 0, 0, 0.1); }\n      .pop.pop-modal .pop-foot [role~=confirm] {\n        padding: 0 0.1rem;\n        flex: 1; }\n        .pop.pop-modal .pop-foot [role~=confirm]:hover {\n          background-color: rgba(0, 0, 0, 0.1); }\n\n.pop-alert {\n  width: 85%;\n  background-color: #ffffff;\n  flex-flow: column;\n  display: flex;\n  text-align: center;\n  border-radius: 0.3rem; }\n  .pop-alert .pop-body {\n    color: #000000;\n    display: -webkit-box;\n    text-overflow: -o-ellipsis-lastline;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    display: -webkit-box;\n    display: -moz-box;\n    display: -ms-flexbox;\n    display: -webkit-flex;\n    display: flex;\n    -webkit-box-align: center;\n    -moz-box-align: center;\n    -ms-flex-align: center;\n    -webkit-align-items: center;\n    align-items: center;\n    -webkit-box-pack: center;\n    -moz-box-pack: center;\n    -ms-flex-pack: center;\n    -webkit-justify-content: center;\n    justify-content: center;\n    padding: 0.5rem 0.2rem;\n    font-size: 0.36rem; }\n\n.pop-confirm {\n  width: 85%;\n  background-color: #ffffff;\n  flex-flow: column;\n  display: flex;\n  text-align: center;\n  border-radius: 0.3rem; }\n  .pop-confirm .pop-body {\n    color: #000000;\n    display: -webkit-box;\n    text-overflow: -o-ellipsis-lastline;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    display: -webkit-box;\n    display: -moz-box;\n    display: -ms-flexbox;\n    display: -webkit-flex;\n    display: flex;\n    -webkit-box-align: center;\n    -moz-box-align: center;\n    -ms-flex-align: center;\n    -webkit-align-items: center;\n    align-items: center;\n    -webkit-box-pack: center;\n    -moz-box-pack: center;\n    -ms-flex-pack: center;\n    -webkit-justify-content: center;\n    justify-content: center;\n    padding: 0.5rem 0.2rem;\n    font-size: 0.36rem; }\n\n.pop-box {\n  width: 85%;\n  background-color: #ffffff;\n  flex-flow: column;\n  display: flex;\n  text-align: center;\n  border-radius: 0.3rem; }\n  .pop-box .pop-head {\n    color: #1E90ff;\n    line-height: 3;\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n    border-bottom: 1px solid #DCDCDC;\n    text-align: left;\n    font-size: 0.3rem;\n    padding: 0 0.2rem;\n    display: -webkit-box;\n    display: -moz-box;\n    display: -ms-flexbox;\n    display: -webkit-flex;\n    display: flex;\n    -webkit-box-align: center;\n    -moz-box-align: center;\n    -ms-flex-align: center;\n    -webkit-align-items: center;\n    align-items: center;\n    -webkit-box-pack: center;\n    -moz-box-pack: center;\n    -ms-flex-pack: center;\n    -webkit-justify-content: center;\n    justify-content: center; }\n  .pop-box .pop-body {\n    color: #000000;\n    display: -webkit-box;\n    text-overflow: -o-ellipsis-lastline;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    -webkit-line-clamp: 2;\n    -webkit-box-orient: vertical;\n    padding: 0.5rem 0.2rem;\n    font-size: 0.36rem;\n    text-align: left; }\n    .pop-box .pop-body .pop-box-group {\n      position: relative;\n      display: block; }\n      .pop-box .pop-body .pop-box-group:last-child .pop-box-tx {\n        border-bottom: 0; }\n      .pop-box .pop-body .pop-box-group label {\n        position: relative;\n        display: -webkit-box;\n        display: -moz-box;\n        display: -ms-flexbox;\n        display: -webkit-flex;\n        display: flex;\n        flex-flow: row; }\n        .pop-box .pop-body .pop-box-group label input[type=checkbox] {\n          margin: 0;\n          width: 0.45rem;\n          height: 0.45rem;\n          font-size: 0.6rem;\n          margin-top: 0.33rem;\n          border: 1px solid #DCDCDC;\n          background-color: transparent;\n          -webkit-appearance: none;\n          appearance: none; }\n          .pop-box .pop-body .pop-box-group label input[type=checkbox]:checked {\n            background-color: #4682b4; }\n        .pop-box .pop-body .pop-box-group label input[type=radio] {\n          border-radius: 100%;\n          margin: 0;\n          width: 0.45rem;\n          height: 0.45rem;\n          font-size: 0.6rem;\n          margin-top: 0.33rem;\n          border: 1px solid #DCDCDC;\n          background-color: transparent;\n          -webkit-appearance: none;\n          appearance: none; }\n          .pop-box .pop-body .pop-box-group label input[type=radio]:checked {\n            background-color: #4682b4; }\n        .pop-box .pop-body .pop-box-group label .pop-box-tx {\n          flex: 12;\n          font-size: 0.36rem;\n          color: #4682b4;\n          border-bottom: 1px solid #DCDCDC;\n          padding: 0.3rem 0;\n          margin-left: 0.2rem; }\n\n/*\n    从下往上移动的分窗口\n*/\n.view {\n  display: none; }\n  .view.view-modal {\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    z-index: 9999;\n    background-color: rgba(0, 0, 0, 0.5); }\n    .view.view-modal.fadeIn {\n      display: block;\n      animation: pop-fadeIn .1s;\n      animation-fill-mode: forwards; }\n    .view.view-modal.fade {\n      display: block;\n      animation: pop-fade .3s;\n      animation-fill-mode: forwards; }\n  .view [role~=dismiss] {\n    flex: 1;\n    font-weight: bold;\n    padding: 0 0.1rem 0 0;\n    color: #1E90ff;\n    font-size: 0.42rem; }\n  .view [role~=confirm] {\n    flex: 1;\n    padding: 0 0 0 0.1rem;\n    color: #1E90ff;\n    font-size: 0.42rem; }\n\n.views {\n  display: none; }\n  .views.view-reveal {\n    position: fixed;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    background-color: #ffffff;\n    border-radius: .3rem .3rem 0 0;\n    height: 10rem; }\n    .views.view-reveal .view-head {\n      display: flex;\n      flex-flow: row;\n      width: 98%;\n      margin: auto;\n      text-align: center;\n      line-height: 1.1rem;\n      border-bottom: 1px solid #DCDCDC; }\n      .views.view-reveal .view-head .view-tit {\n        flex: 3;\n        overflow: hidden;\n        white-space: nowrap;\n        text-overflow: ellipsis;\n        padding: 0 0.1rem;\n        font-size: 0.36rem; }\n    .views.view-reveal .view-body {\n      height: calc(100% - 1.1rem);\n      overflow-y: scroll;\n      -webkit-overflow-scrolling: touch; }\n  .views.fadeIn {\n    display: block;\n    animation: view-bottom-fadeIn .3s;\n    animation-fill-mode: forwards; }\n  .views.fade {\n    display: block;\n    animation: view-bottom-fade .2s;\n    animation-fill-mode: forwards; }\n\n/*\n    组件样式\n*/\n/*\n    长按呼出菜单\n*/\n.popover {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 99; }\n  .popover .popover-group {\n    overflow: hidden;\n    background-color: #000000;\n    border-radius: 0.1rem;\n    padding: 0.1rem 0; }\n    .popover .popover-group .popover-unit {\n      float: left;\n      width: 1.3rem;\n      height: 0.8rem;\n      line-height: 0.8rem;\n      color: #ffffff;\n      text-align: center;\n      border-right: 1px solid #DCDCDC; }\n      .popover .popover-group .popover-unit:last-child {\n        border: none; }\n", ""]);

	// exports


/***/ },
/* 9 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
]);