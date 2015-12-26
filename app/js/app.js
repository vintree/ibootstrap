/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://127.0.0.1:9090/static/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _autoFont = __webpack_require__(1);

	var _autoFont2 = _interopRequireDefault(_autoFont);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	console.log(_autoFont2.default.init());
	// autoFont.init();

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	// export default class autoFont {
	//     constructor() {
	//         //手机改变状态时也执行该方法
	//         var _evt = 'onorientationchange' in window ? 'orientationchange' : 'resize';
	//         var _timer = null;
	//         //android,win系列
	//         window.addEventListener(_evt, function () {
	//             clearTimeout(_timer);
	//             _timer = setTimeout(setFontSize, 300);
	//         }, false);
	//         //ios系列
	//         window.addEventListener("pageshow", function(e) {
	//             if (e.persisted) {
	//                 clearTimeout(_timer);
	//                 _timer = setTimeout(setFontSize, 300);
	//             }
	//         }, false);
	//         setFontSize();
	//     }
	//     setFontSize() {
	//         // 获取window 宽度,动态计算
	//         var _self = this;
	//         _self.width = 750;   //psd750px宽度 ,default
	//         _self.fontSize = 100;//字体大小
	//         _self.widthProportion = function () {
	//             var p = ((document.body && document.documentElement.clientWidth || document.getElementsByTagName("html")[0].offsetWidth ) / _self.width );
	//             var px1 = (p * _self.fontSize).toFixed(4);
	//             //console.log("px1 ="+px1);
	//             px1 = px1 > 100 ? 100 : px1;
	//             px1 = px1 < 0.08 ? 0.08 : px1;
	//             return px1;
	//         };
	//         console.log("html fontSize: ",_self.widthProportion());
	//         document.getElementsByTagName("html")[0].setAttribute("style", "font-size:" + _self.widthProportion() + "px; !important");
	//     }
	// }
	var autoFont = function autoFont() {};
	autoFont.init = function () {
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
	};
	module.exports = autoFont;

/***/ }
/******/ ]);