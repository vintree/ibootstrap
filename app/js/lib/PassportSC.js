/**
 * passport utf-8 date 2013-08 sohu sce support
 */
;
(function(window, undefined) {
	// 入口
	if (window['PassportSC']) {
		alert('全局变量PassportSC已被占用！');
		return false;
	}
	// 提供一个可以修改全局对象名称的方法
	// update 该方法不能提供
	window['passportSetGlobalName'] = function(name, flag) {
		if (window[name]) {
			alert('全局变量' + name + '已被占用！');
			return false;
		}
		window[name] = window['PassportSC'];
		if (flag) {
			window['PassportSC'] = null;
			delete window['PassportSC'];
		}
	};
	// 为Function构造函数增加bindFunc方法
	Function.prototype.bindFunc = function(pObject) {
		if (typeof (pObject) != "object") {
			return false;
		}
		var __method = this;
		return function() {
			return __method.apply(pObject, arguments);
		};
	};
	// 为不支持document.getElementsByClassName的浏览器添加该方法
	if (!document.getElementsByClassName) {
		document.getElementsByClassName = function(cname, ele) {
			if (!cname)
				return [];
			var arr = (ele || document).getElementsByTagName('*');
			var temp, result = [];
			for ( var i = 0, l = arr.length; i < l; i++) {
				temp = arr[i].getAttribute('class') ? arr[i].getAttribute(
						'class').split(' ') : [];
				if (temp.length === 0)
					break;
				for ( var j = 0, k = temp.length; j < k; j++) {
					if (temp[j] === cname) {
						result.push(arr[i]);
						break;
					}
				}
			}
			return result;
		};
	}
	/** *************静态方法，工具类对象开始，仅供本闭包内部使用**************** */
	// 得到字符串的长度，一个汉字算2个字节
	function getStringLen(str) {
		var cArr = str.match(/[^\x00-\xff]/ig);
		return str.length + (cArr == null ? 0 : cArr.length);
	}
	function getBrowserType() {
		if (window.ActiveXObject) {// IE的trident排版引擎
			if (window.XMLHttpRequest && !window.XDomainRequest) {
				return 5;// ie7
			} else if (window.XDomainRequest) {
				return 6;// ie8
			} else {
				return 1;// ie6
			}
		} else if (navigator.userAgent.toLowerCase().indexOf("firefox") >= 0) {
			return 2;// FireFox
		} else if (typeof (window.opera) == "object") {
			return 3;// Opera
		} else if (window.MessageEvent && !document.getBoxObjectFor) {
			return 7;// chrome
		} else if (navigator.appVersion.indexOf("Safari") >= 0) {
			return 4;// Safari
		}
	}
	function GetXmlHttpObject() {
		var xmlHttp = null;
		try {
			// Firefox, Opera 8.0+, Safari
			xmlHttp = new XMLHttpRequest();
		} catch (e) {
			// Internet Explorer
			try {
				xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
			}
		}
		return xmlHttp;
	}
	// 解析url以获得get请求url地址中包含的参数，对于重复的key，所有的取值会合并为一个数组
	function parseUrl(url) {
		var par = {};
		var parStr = unescape(url).split('?').length >= 2 ? unescape(url)
				.split('?')[1] : '';
		if (parStr.length === 0)
			return par;
		var parArr = parStr.split('&');
		var key, value;
		for ( var i = 0, l = parArr.length; i < l; i++) {
			key = parArr[i].split('=')[0];
			value = parArr[i].split('=').length == 2 ? parArr[i].split('=')[1]
					: '';
			if (typeof par[key] === 'undefined') {
				par[key] = value;
			} else if (typeof par[key] === 'string') {
				par[key] = [].concat(par[key]).concat(value);
			} else {
				par[key] = par[key].concat(value);
			}
		}
		return par;
	}
	// 判断浏览器是否支持cookie
	function checkCookieEnabled() {
		try {
			if (navigator.cookieEnabled === false) {
				return false;
			}
			// 添加一个测试的cookie
			var date = new Date();
			var cString = 'testCookie=yes;expires='
					+ new Date(date.getTime() + 5 * 1000).toGMTString() + ';';
			document.cookie = cString;
			if (!document.cookie) {
				return false;
			}
			// 删除掉测试cookie
			cString = 'testCookie=yes;expires='
					+ new Date(date.getTime() - 5 * 1000).toGMTString() + ';';
			document.cookie = cString;
		} catch (e) {
			return false;
		}
		return true;
	}
	var Base64 = {
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",// private
		// property
		encode : function(input) {// public method for encoding
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			input = this.encodeURL(input);// make url safe
			input = Base64._utf8_encode(input);
			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);

				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;

				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output + this._keyStr.charAt(enc1)
						+ this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3)
						+ this._keyStr.charAt(enc4);
			}
			return output;
		},
		decode : function(input) {// public method for decoding
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
			input = this.decodeUrl(input);// make url safe
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < input.length) {
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));

				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;

				output = output + String.fromCharCode(chr1);

				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = Base64._utf8_decode(output);
			return output;
		},
		_utf8_encode : function(string) {// private method for UTF-8 encoding
			string = string.replace(/\r\n/g, "\n");
			var utftext = "";

			for ( var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);
				if (c < 128) {
					utftext += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				} else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
			}
			return utftext;
		},
		_utf8_decode : function(utftext) {// private method for UTF-8 decoding
			var string = "";
			var i = 0;
			var c = 0, c1 = 0, c2 = 0;
			while (i < utftext.length) {
				c = utftext.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12)
							| ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		},
		encodeURL : function(str) {// the following method make the Base64
			// method url safe
			return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/,
					'');
		},
		// make the string url safe (str % 4 = 0)
		decodeUrl : function(str) {
			// str = (str + '===').slice(0, str.length + (str.length % 4));
			// return str.replace(/-/g, '+').replace(/_/g, '/');
			var temp, a;
			if (str.length % 4 === 0) {
				temp = str;
			} else {
				a = str.length % 4;
				temp = (str + '===').slice(0, str.length + 4 - a);
			}
			return temp.replace(/-/g, '+').replace(/_/g, '/');
		}
	};
	var MD5 = function(args) {
		var hexcase = 0;
		var b64pad = "";
		var chrsz = 8;
		function hex_md5(s) {
			return binl2hex(core_md5(str2binl(s), s.length * chrsz));
		}
		function b64_md5(s) {
			return binl2b64(core_md5(str2binl(s), s.length * chrsz));
		}
		function hex_hmac_md5(key, data) {
			return binl2hex(core_hmac_md5(key, data));
		}
		function b64_hmac_md5(key, data) {
			return binl2b64(core_hmac_md5(key, data));
		}
		function calcMD5(s) {
			return binl2hex(core_md5(str2binl(s), s.length * chrsz));
		}

		function core_md5(x, len) {
			x[len >> 5] |= 0x80 << ((len) % 32);
			x[(((len + 64) >>> 9) << 4) + 14] = len;
			var a = 1732584193;
			var b = -271733879;
			var c = -1732584194;
			var d = 271733878;
			for ( var i = 0; i < x.length; i += 16) {
				var olda = a;
				var oldb = b;
				var oldc = c;
				var oldd = d;

				a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
				d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
				c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
				b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
				a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
				d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
				c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
				b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
				a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
				d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
				c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
				b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
				a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
				d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
				c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
				b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
				a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
				d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
				c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
				b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
				a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
				d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
				c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
				b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
				a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
				d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
				c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
				b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
				a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
				d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
				c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
				b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
				a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
				d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
				c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
				b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
				a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
				d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
				c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
				b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
				a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
				d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
				c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
				b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
				a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
				d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
				c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
				b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
				a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
				d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
				c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
				b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
				a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
				d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
				c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
				b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
				a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
				d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
				c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
				b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
				a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
				d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
				c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
				b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

				a = safe_add(a, olda);
				b = safe_add(b, oldb);
				c = safe_add(c, oldc);
				d = safe_add(d, oldd);
			}
			return Array(a, b, c, d);
		}
		function md5_cmn(q, a, b, x, s, t) {
			return safe_add(
					bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
		}
		function md5_ff(a, b, c, d, x, s, t) {
			return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
		}
		function md5_gg(a, b, c, d, x, s, t) {
			return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
		}
		function md5_hh(a, b, c, d, x, s, t) {
			return md5_cmn(b ^ c ^ d, a, b, x, s, t);
		}
		function md5_ii(a, b, c, d, x, s, t) {
			return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
		}

		function core_hmac_md5(key, data) {
			var bkey = str2binl(key);
			if (bkey.length > 16)
				bkey = core_md5(bkey, key.length * chrsz);

			var ipad = Array(16), opad = Array(16);
			for ( var i = 0; i < 16; i++) {
				ipad[i] = bkey[i] ^ 0x36363636;
				opad[i] = bkey[i] ^ 0x5C5C5C5C;
			}
			var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length
					* chrsz);
			return core_md5(opad.concat(hash), 512 + 128);
		}

		function safe_add(x, y) {
			var lsw = (x & 0xFFFF) + (y & 0xFFFF);
			var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		}

		function bit_rol(num, cnt) {
			return (num << cnt) | (num >>> (32 - cnt));
		}

		function str2binl(str) {
			var bin = Array();
			var mask = (1 << chrsz) - 1;
			for ( var i = 0; i < str.length * chrsz; i += chrsz)
				bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
			return bin;
		}

		function binl2hex(binarray) {
			var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
			var str = "";
			for ( var i = 0; i < binarray.length * 4; i++) {
				str += hex_tab
						.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF)
						+ hex_tab
								.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
			}
			return str;
		}

		function binl2b64(binarray) {
			var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
			var str = "";
			for ( var i = 0; i < binarray.length * 4; i += 3) {
				var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16)
						| (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8)
						| ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
				for ( var j = 0; j < 4; j++) {
					if (i * 8 + j * 6 > binarray.length * 32)
						str += b64pad;
					else
						str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
				}
			}
			return str;
		}
		return hex_md5(args);
	};
	/** *************静态方法，对象结束**************** */
	/*
	 * 全局对象PassportSC声明 + 赋值 PassportSC是本js暴露到全局window下的唯一对象（还有一个全局的
	 * passportSetGlobalName 方法），避免命名空间污染 需求决定，上一行注释作废，下边的几个都需要是全局变量
	 */
	window['login_status'] = "";
	window['logout_status'] = "";
	window['renew_status'] = "";
	window['PassportCardList'] = [];
	window['PassportSC'] = {
		version : 27,
		versionDetail : 'New edition between 2013-08 to 2013-10 sohu passport team',
		appid : 9999,
		// 一个汉字算2个字节
		max_line_length : 30,
		domain : "",
		cookie : false,
		email : "",
		bindDomainSelector : true, /* 绑定域名列表选择框 */
		autopad : "", /* 自动填写的域名后缀，扩展为多个域名中间以逗号分隔 */
		autoRedirectUrl : "", /* 别的地方登陆后，刷新本页面时是否自动跳转 */
		loginRedirectUrl : "", /* 在本页面登录后是否自动跳转 */
		logoutRedirectUrl : "", /* 在本页面退出后是否自动跳转 */
		selectorTitle : "请选择您的用户账号类型",
		registerUrl : "https://passport.sohu.com/web/signup.jsp", /* 申请通行证的URL */
		recoverUrl : "https://passport.sohu.com/web/recover.jsp", /* 忘记密码的URL */
		postru : "",
		emailPostfix : false,
		curDSindex : -1,
		usePost : 1, // 关键参数，决定了页面是使用post方式(1)提交还是get方式(0)，默认是post，产品线可自定义
		successCalledFunc : false, /* 登录成功后的回调函数 */
		curCardIndex : 0,

		loginSuccCallbackName : 'loginSuccessCallFunction',
		loginFailCallbackName : 'loginFailCallFunction',
		returnUrl : '',

		oElement : false,
		rootElement : false,
		dsElement : false,
		sElement : false,
		cElement : false,
		dsAnchor : false,
		emailInput : false,
		passwdInput : false,
		pcInput : false,
		loginMsg : false,
		iElement : false,
		isSetFocus : true, /* 是否自动设置输入框的焦点 */
		showEmailInit : true, /* 初始化时是否在用户名栏根据lastdomain的cookie填入用户名 */

		loginProtocol : window.location.protocol === 'https:' ? 'https' : 'http',
		setCookieProtocol : window.location.protocol === 'https:' ? 'https' : 'http',
		http_url : false,
		loginUrl : '://passport.sohu.com/user/login',

		eInterval : false,
		maxIntervalCount : 100,
		intervalCount : 0,
		state : "0000", // 协议|第二次协议|第一次成功或者失败|第二次成功或者失败 https:1 http:2 ,失败：1,成功2
		
		postLoginClicked : false, //for post login clicked
		postLoginTimeout : false, //for post login time out
		postLoginTimeoutTime : 10 * 1000, //post login time out time by ms

		defualtRemPwd : "", /* checked为默认选中记住密码 */
		isShowRemPwdMsg : 0, /* 1为alert提示确认要记住密码 */
		campImg : "http://js.sohu.com/passport/images/pic007.gif", /* 定制大本营的图片 */
		campImgAlt : "大本营", /* 定制大本营的alt文字 */
		campUrl : "http://blog.sohu.com/camp?from=", /* 定制大本营的链接地址 */
		cardTitle : "上搜狐，知天下", /* 定制卡片上面的标题 */
		firstDomain : "", /* 产品定制的下拉域名显示的第一个域名 */

		defaultApp : "",
		domainPool : [ "chinaren.com", "sogou.com" ],
		// 自动提示的所有域名的列表
		domainList : [ "sohu.com", "uniqname", "chinaren.com", "sogou.com",
				"vip.sohu.com", "17173.com", "focus.cn", "game.sohu.com",
				"37wanwan.com" ],
		appList : {
			"1051" : "news_say",
			"1017" : "pp",
			"1019" : "blog",
			"1073" : "t",
			"1074" : "tv",
			"1000" : "mail",
			"1001" : "club",
			"1062" : "bai",
			"1005" : "alumni",
			"10050" : "chinaren",
			"1038" : "crclub",
			"1039" : "group",
			"1021" : "music",
			"1010" : "say",
			"1042" : "cbbs",
			"1028" : "focus",
			"1029" : "17173",
			"1013" : "vip",
			"1035" : "rpggame",
			"1044" : "pinyin",
			"1022" : "relaxgame"
		},
		appName : {
			"news_say" : "我来说两句",
			"pp" : "相册",
			"blog" : "博客",
			"t" : "微博",
			"tv" : "视频",
			"mail" : "邮件",
			"club" : "社区",
			"bai" : "白社会",
			"alumni" : "校友录",
			"chinaren" : "ChinaRen",
			"crclub" : "CR社区",
			"group" : "群组",
			"music" : "音乐盒",
			"say" : "说吧",
			"cbbs" : "校友论坛",
			"focus" : "焦点房产",
			"17173" : "游戏论坛",
			"vip" : "vip邮箱",
			"rpggame" : "RPG游戏",
			"pinyin" : "输入法",
			"relaxgame" : "休闲游戏"
		},
		appUrl : {
			"news_say" : "http://i.sohu.com/scomment/home/all/",
			"pp" : "http://pp.sohu.com/",
			"blog" : "http://blog.sohu.com/",
			"t" : "http://t.sohu.com",
			"tv" : "http://tv.sohu.com",
			"mail" : "http://mail.sohu.com/",
			"club" : "http://club.sohu.com",
			"bai" : "http://bai.sohu.com",
			"alumni" : "http://class.chinaren.com",
			"chinaren" : "",
			"crclub" : "http://club.chinaren.com",
			"group" : "http://i.chinaren.com/group",
			"say" : "http://s.sogou.com",
			"music" : "http://mbox.sogou.com/",
			"cbbs" : "http://cbbs.chinaren.com",
			"focus" : "http://www.focus.cn",
			"17173" : "http://bbs.17173.com",
			"vip" : "http://vip.sohu.com",
			"rpggame" : "http://game.sohu.com",
			"pinyin" : "http://pinyin.sogou.com",
			"relaxgame" : "http://game.sohu.com/index2.htm"
		},
		appPool : false,
		bottomRow : [],
		recomServ : [], /* Passport推荐其的服务 */
		reverseFirstDomain : false, // 如果输入的是手机号，firstdomain显示为sohu.com
		// ,否则，firstdomain还是原来的
		showEmailInputTip : true,
		usePostFix : true,
		gotohref : function(url) {
			var a;
			a = document.createElement('a');
			a.setAttribute("href", url);
			document.body.appendChild(a);
			a.click();
			/*
			if (getBrowserType() == 1) {
				// IE6特殊处理
				a = document.createElement('a');
				a.setAttribute("href", url);
				document.body.appendChild(a);
				a.click();
			} else {
				window.location = url;
				return;
			}
			*/
		},
		getDomain : function() {
			// 只支持 focus.cn/sohu.com/chinaren.com/17173.com/sogou.com 就够了
			return document.domain.split('.').slice(-2).join('.');
		},
		addCookie : function(name, value, expireHours, domain) {
			if (this.domain === "")
				this.domain = this.getDomain();
			var cookieString = name + "=" + escape(value)
					+ "; path=/; domain=." + (domain ? domain : this.domain)
					+ ";";
			// 判断是否设置过期时间
			if (expireHours > 0) {
				var date = new Date();
				date.setTime(date.getTime() + expireHours * 3600 * 1000);
				cookieString += "expires=" + date.toGMTString() + ";";
			}
			document.cookie = cookieString;
		},
		getCookie : function(name) {
			if (!name)
				return "";
			var cookies = document.cookie.split('; ');
			for ( var i = 0; i < cookies.length; i++) {
				if (cookies[i].indexOf(name + '=') === 0) {
					return cookies[i].substr(name.length + 1);
				}
			}
			return "";
		},
		deleteCookie : function(name) {
			if (this.domain === "")
				this.domain = this.getDomain();
			var date = new Date();
			date.setTime(date.getTime() - 100000);
			var cval = this.getCookie(name);
			document.cookie = name + "=" + cval + "; expires="
					+ date.toGMTString() + "; path=/; domain=." + this.domain
					+ ";";
		},
		preventEvent : function(e) {
			try {
				e.cancelBubble = true;
				e.returnValue = false;
				e.preventDefault && e.preventDefault();
				e.stopPropagation && e.stopPropagation();
			} catch (ee) {
			}
		},
		getPosition : function(ele, name) {
			var pos = 0;
			while (ele) {
				pos += ele[name];
				ele = ele.offsetParent;
			}
			return pos;
		},
		getTime : function() {
			return new Date().getTime();
		},
		getHead : function() {
			return document.getElementsByTagName('head')[0];
		},
		getBody : function() {
			return document.getElementsByTagName('body')[0];
		},
		strip : function(s) {
			return s.replace(/^\s+/, '').replace(/\s+$/, '');
		},
		reportMsg : function(code) {
			var msg = '';
			//兼容参数为数字的情况
			switch ( code.toString() ) {
			case '1':
				msg = '请输入通行证账号';
				break;
			case '2':
				msg = '通行证账号为邮件地址格式';
				break;
			case '3':
				msg = '账号后缀必须为' + arguments[1];
				break;
			case '4':
				msg = '请输入通行证密码';
				break;
			case '5':
				var email = this.strip(this.emailInput.value);
				if (email.lastIndexOf("@focus.cn") > 0) {
					msg = '账号或密码错误!咨询电话:010-58511234';
				} else {
					msg = '账号或密码错误';
				}
				break;
			case '6':
				msg = '登录超时，请稍后重试';
				break;
			case '7':
				msg = '登录失败，请重试';
				break;
			case '8':
				msg = '网络故障，退出失败，请重新退出';
				break;
			case '9':
				msg = '登录失败，请稍后重试';
				break;
			case '10':
				// msg += '暂时不可登录，请稍后重试';
				msg = '您登录过于频繁，请24小时后再试';
				break;
			case '11':
				msg = '检测到浏览器cookie被禁用，请启用cookie后重试';
				break;
			case '12':
				msg = '服务器故障，请稍后再试';
				break;
			case '13':
				msg = '账号已被锁定，请先到<a href="http://hudun.sohu.com/help/help9.html" target="blank">狐盾</a>解锁';
				break;
			case '14':
				msg = '动态密码错误，请重新输入';
				break;
			case '15':
				msg = '请输入动态密码';
				break;
			case '16':
				msg = '账号未激活，请先进入邮箱激活账号';
				break;
			case '17':
				msg = '账号已被锁定，请联系客服';
				break;
			case '18':
				msg = '验证码错误';
				break;
			case '19':
				msg = '用户IP已被限制';
				break;
			case '20':
				msg = '账号或密码错误';
				break;
			case '21':
				msg = '账号被狐盾锁定，请进入狐盾解锁！';
				break;
			default:
				msg = '登录错误，请稍后重试';
				break;
			}
			this.showMsg(msg);
		},
		showMsg : function(msg) {
			if (!this.loginMsg)
				return;
			this.loginMsg.innerHTML = msg;
		},
		// 可以由外部的产品来调用该函数，返回userid
		cookieHandle : function() {
			if (!this.cookie) {
				this.parsePassportCookie();
			}
			if (this.cookie && this.cookie['userid'] !== '') {
				return this.cookie['userid'];
			}
			return "";
		},
		getDisplayName : function() {
			var userid = this.cookieHandle();
			var userid_prefix = userid.split("@")[0];
			var pattern = /^1\d{10}$/;
			if (pattern.test(userid_prefix)) {
				return userid_prefix.substring(0, 3) + "****"
						+ userid_prefix.substring(7);
			} else {
				return userid;
			}
		},
		// 根据lastdomain的cookie值来生成 emailPostfix
		parseLastDomain : function(list) {
			this.emailPostfix = [];
			var entiredomain = "", specDomain = "";
			var lastdomain_ar = [];
			var cookies = document.cookie.split('; ');
			for ( var i = 0; i < cookies.length; i++) {
				if (cookies[i].indexOf('lastdomain=') === 0) {
					try {
						lastdomain_ar = unescape(cookies[i].substr(11)).split('|');
						/*
						if (lastdomain_ar.length == 4) {
							var isnotSLogin = lastdomain_ar[3];
							if (isnotSLogin !== null && isnotSLogin == "1") {
								this.loginProtocol = "http";
								this.setCookieProtocol = "http";
							}
						}
						*/
					} catch (e) {
					}
					break;
				}
			}
			var j = 0;
			// 解析cookie中保存的登录用户名，放在最前面
			var lastAccount = '';
			if (lastdomain_ar.length >= 3) {
				var userid_raw_info = Base64.decode(lastdomain_ar[1]);
				var userid_ar = userid_raw_info.split("|");
				for ( var i = userid_ar.length - 1; i >= 0 ; i--) {
					if (userid_ar[i] !== "") {
						this.emailPostfix[j] = userid_ar[i];
						j++;
						lastAccount = userid_ar[i];
					}
				}
				if( /^.*@.{1,}\.sohu\.com$/.test(lastAccount) ){
					lastAccount = '';
				}
				if( this.showEmailInit && this.emailInput ){
					this.emailInput.value = lastAccount;
				}
			}
			// 如果指定了firstDomain,则首先放前面
			if (this.firstDomain !== "") {
				for ( var m in list) {
					if (this.firstDomain == list[m]) {
						specDomain = list[m];
						break;
					}
				}
				if (specDomain !== "") {
					this.emailPostfix[j] = specDomain;
					j++;
				}
			}
			// 如果当前是game.sohu.com，则也将它放置前面
			if (document.domain.indexOf("game.sohu.com") >= 0) {
				entiredomain = "game.sohu.com";
				this.emailPostfix[j] = entiredomain;
				j++;
			}
			// 然后放置本域的domain
			this.emailPostfix[j] = this.domain;
			j++;
			// 最后放置其它的domain
			for ( var n in list) {
				if (typeof list[n] != 'string')
					continue;
				if (list[n] != this.domain && list[n] != entiredomain
						&& list[n] != specDomain) {
					this.emailPostfix[j] = list[n];
					j++;
				}
			}
		},
		drawPassport : function(element) {
			if (typeof (element) != "object") {
				return;
			}
			// 保证只有在PassportSC.drawPassport调用时才写入第一个元素
			if (PassportCardList.length == 0) {
				PassportCardList[0] = this;
			}
			// 缺省第一个卡片的回调函数
			if (!this.successCalledFunc) {
				try {
					this.successCalledFunc = eval("drawAppInfo");
				} catch (e) {
					this.successCalledFunc = this.drawPassportInfo;
				}
			}
			this.init(element);

			if (this.cookie
					&& (this.cookie['userid'] != '' || this.relationHandle() != '')) {
				if (this.autopad != "") {
					// 如果设置了autopad，那么即使当前登录了，但用户名和autopad不符，也会显示登录框,
					// edit by jiangyan@20100720 多账户关联时应该考虑relationHandle
					var userid = this.relationHandle() != '' ? this
							.relationHandle() : this.cookie['userid'];
					var at = userid.lastIndexOf("@");
					if (at > 0) {
						if (this.autopad.lastIndexOf(userid.substr(at + 1)) < 0) {
							this.drawLoginForm();
							return;
						}
					}
				}
				// 判断首页是否自动跳转
				if (this.autoRedirectUrl != "") {
					PassportSC.gotohref(this.autoRedirectUrl);
				}
				// 不需要自动跳转，则直接画卡片
				else {
					this.drawPassportCard();
				}
			} else {
				this.drawLoginForm();
			}
		},
		init : function(element) {
			this.rootElement = element;
			var noTitle = this.selectorTitle === null
					|| this.selectorTitle.length === 0;
			this.rootElement.innerHTML = '<div class="ppselecter" style="display: none;border:1px solid #B6D3FC; border-top:0 none;">'
					+ '<table width="100%" cellspacing="0" cellpadding="0" style="table-layout:fixed;">'
					+ '<tbody>'
					+ '<tr>'
					+ (noTitle ? ''
							: ('<td style="" class="ppseltit" id="ppseltitId">'
									+ this.selectorTitle + '</td>'))
					+ '</tr>'
					+ '<tr>'
					+ (noTitle ? '<td height="0"></td>'
							: '<td height="2"></td>')
					+ '</tr>'
					+ '<tr>'
					+ '<td></td>'
					+ '</tr>'
					+ '</tbody>'
					+ '</table>'
					+ '</div>'
					+ '<div style="display: none;">'
					+ '</div>'
					+ '<div class="passportc">' + '</div>';
			this.dsElement = this.rootElement.childNodes[0];
			this.sElement = this.rootElement.childNodes[1];
			this.cElement = this.rootElement.childNodes[2];
			this.dsAnchor = this.dsElement.firstChild.rows[2].firstChild;
			// 得到当前输入域的domain
			this.domain = this.getDomain();
			// 生成domanselect list
			this.parseLastDomain(this.domainList);
			this.parseAppid();
			// 必须执行 parseAppid 后才能 parsePassportCookie
			this.parsePassportCookie();
			// 解析完Cookie后，再生成下面的服务文字
			// this.getBottomRow();
			// 这里还差一些代码.. 需要分析 URL，看看是不是 http post 失败跳转回来的页面
			if (this.postru == "") {
				this.postru = document.location.href;
			}
		},
		parseAppid : function() {
			var id = this.appid.toString();
			var i = 0;
			this.appPool = new Array();
			for ( var j in this.appList) {
				var x = this.appList[j];
				if (typeof (x) != 'string')
					continue;
				if (j == id) {
					this.defaultApp = this.appName[x];
				} else {
					// Focus的单独处理，使用2个链接
					if (j == "1028") {
						this.appPool[i] = {
							"app" : "focus",
							"name" : "北京业主论坛",
							"url" : "http://house.focus.cn/group/yezhu.php"
						};
						i++;
						this.appPool[i] = {
							"app" : "focus",
							"name" : "装修论坛",
							"url" : "http://home.focus.cn/group/group_forum.php"
						};
					} else {
						this.appPool[i] = {
							"app" : x,
							"name" : this.appName[x],
							"url" : this.appUrl[x]
						};
					}
					i++;
				}
			}
		},
		parsePassportCookie : function() {
			var cookies = document.cookie.split('; ');
			var cvalue;
			for ( var i = 0; i < cookies.length; i++) {
				if (cookies[i].indexOf('ppinf=') === 0) {
					cvalue = cookies[i].substr(6);
					break;
				}
				if (cookies[i].indexOf('ppinfo=') === 0) {
					cvalue = cookies[i].substr(7);
					break;
				}
				if (cookies[i].indexOf('passport=') === 0) {
					cvalue = cookies[i].substr(9);
					break;
				}
			}
			if (typeof cvalue === 'undefined') {
				this.cookie = false;
				return;
			}
			try {
				var x = unescape(cvalue).split('|');
				if (x[0] == '1' || x[0] == '2') {
					var cookie_raw_info = Base64.decode(x[3]);
					this._parsePassportCookie(cookie_raw_info);
					return;
				}
			} catch (e) {
			}
		},
		_parsePassportCookie : function(str) {
			var arr = str.split('|');
			this.cookie = {};
			var key, value, tmp;
			for ( var i = 0, l = arr.length; i < l; i++) {
				if (arr[i].length === 0)
					continue;
				tmp = arr[i].split(':');
				if (tmp.length !== 3)
					continue;
				if (parseInt(tmp[1], 10) !== tmp[2].length)
					continue;
				key = tmp[0];
				value = tmp[2];
				this.cookie[key] = value;
			}
			relation_userid = this._parserRelation();
			if (relation_userid) {
				this.cookie[k] = relation_userid;
			}
		},
		_parserRelation : function() {
			var relations = this.cookie['relation'];
			if (relations) {
				var arr = relations.split(";");
				for ( var i = 0; i < arr.length; i++) {
					var barr = arr[i].split(",");
					var appids = barr[2].split("#");
					for ( var j = 0; j < appids.length; j++) {
						if (this.appid == appids[j]) {
							return barr[0];
						}
					}
				}
			}
			return "";
		},
		doLogin : function() {
			var email = this.strip(this.emailInput.value);
			var password = this.strip(this.passwdInput.value);
			var pc = this.pcInput.checked == true ? 1 : 0;
			// 用户名为空，提示输入用户名
			if (email == "") {
				this.reportMsg('1');
				this.emailInput.focus();
				return false;
			}
			// 如果autopad不为空，则限制只能输入本域的用户
			if (this.autopad != "") {
				var dpostfix = email.substr(email.lastIndexOf('@') + 1);
				if (this.autopad.lastIndexOf(dpostfix) < 0) {
					this.reportMsg('3', this.autopad);
					this.emailInput.focus();
					this.passwdInput.value = "";
					return false;
				}
			}
			// 密码为空，提示输入密码
			if (password == "") {
				this.reportMsg('4');
				this.passwdInput.value = "";
				this.passwdInput.focus();
				return false;
			}
			// 显示Passport等待状态框
			// this.drawPassportWait( '正在登录搜狐通行证，请稍候...' );
			if (this.usePost === 1) {
				if( this.postLoginClicked ){
					return false;
				}else{
					return this.doPostLogin();
				}
			} else {
				if (this.eInterval)
					return false; // 必须判断一下，避免连续两次点击
				if (arguments[0]) {
					PassportCardList[index].doLogin();
				}
				login_status = "";
				this.intervalCount = 0;
				this.sElement.innerHTML = "";
				return this.loginHandle(email, password, pc, this.sElement,
						this.loginFailCall.bindFunc(this),
						this.loginSuccessCall.bindFunc(this));
			}
		},
		doPostLogin : function() {
			var self = this;
			this.postLoginClicked = true;
			this.postLoginTimeout = setTimeout(function(){
				self.postLoginClicked = false;
				self.reportMsg('6');
			}, this.postLoginTimeoutTime);
			var form, _forms = document.forms;
			for ( var i = 0, l = _forms.length; i < l; i++) {
				if (_forms[i].name == "loginform") {
					form = _forms[i];
					break;
				}
			}
			// 没有找到登录的form表单，则直接跳转到psssport.sohu.com页面
			if (!form) {
				document.location.href = this.loginProtocol
						+ "://passport.sohu.com";
				return false;
			}
			// 得到浏览器的类型
			var b = getBrowserType();
			// 得到屏幕宽度
			var w = screen.width;
			//remember password or not
			var pc = this.pcInput.checked == true ? 1 : 0;
			var slogin = window.location.protocol == 'https:' ? 1 : 0;
			// 如果是在passport.sohu.com页面登陆，则无需考虑跨域问题，直接post即可。
			/*
			 * if( document.domain === 'passport.sohu.com' ){ form.method =
			 * 'post'; form.action = this.loginProtocol + this.loginUrl;
			 * this.addHiddenInput(form, 'appid', this.appid);
			 * this.addHiddenInput(form, 'b', b); this.addHiddenInput(form, 'w',
			 * w); return true; }
			 */
			// 为了使成功的回调可以正确的被调用，需要设置 document.domain 值为父域的域名
			// 如house.focus.cn需要设置document.domain='focus.cn'
			// 这个是对document.domain的不可恢复的破坏性操作，可能会对原页面内嵌入的其它iframe造成影响，直至页面刷新方可恢复
			// 如果是在passport.sohu.com页面登陆，则无需考虑跨域问题。
			/*
			if (document.domain !== 'passport.sohu.com') {
				document.domain = this.getDomain();
				d = this.getDomain();
			}
			*/
			document.domain = this.getDomain();
			var d = this.getDomain();
			// 插入隐藏的iframe，作为form提交的target
			// IE在调用document.createElement('iframe')方法后为iframe.name赋值会被IE自动修改为submitName，导致form表单的target无法正确指向，需要特殊处理
			if (!document.getElementById('sohuPassportFrame')) {
				var ifr;
				try {
					ifr = document
							.createElement('<iframe name="sohuPassportFrame"></iframe>');
				} catch (e) {
					ifr = document.createElement('iframe');
					ifr.name = "sohuPassportFrame";
				}
				ifr.id = "sohuPassportFrame";
				ifr.style.width = '0px';
				ifr.style.height = '0px';
				ifr.style.display = 'none';
				document.body.appendChild(ifr);
			}
			// 为form表单增加隐藏input，需要post的数据
			try {
				this.addHiddenInput(form, 'appid', this.appid);
				this.addHiddenInput(form, 'loginSuccessCallFunction', 'postLoginSuccessCall');
				this.addHiddenInput(form, 'loginFailCallFunction', 'postLoginFailCall');
				this.addHiddenInput(form, 'domain', d);
				this.addHiddenInput(form, 'ru', this.postru);
				this.addHiddenInput(form, 'b', b);
				this.addHiddenInput(form, 'w', w);
				this.addHiddenInput(form, 'v', this.version);
				this.addHiddenInput(form, 'persistentcookie', pc);
				this.addHiddenInput(form, 'isSLogin', slogin);
			} catch (e) {
				return false;
			}
			form.target = 'sohuPassportFrame';
			form.method = 'post';
			form.action = this.loginProtocol + this.loginUrl;
			// form.action = "http://ptest.sohu.com:9000/sso/login_js.jsp";

			this.sendLog(document.getElementsByTagName('head')[0], 'beginLogin', '0');

			return true;
		},
		// 为form表单增加隐藏input
		addHiddenInput : function(ele, key, val) {
			if (typeof ele !== 'object' && ele.tagName.toLowerCase() !== 'form')
				return;
			var inputs = document.getElementsByTagName('input', ele);
			for ( var i = 0, l = inputs.length; i < l; i++) {
				if (key === inputs[i].getAttribute('name')) {
					//this persistentcookie hidden input should be refreshed every time
					if(key === 'persistentcookie'){
						inputs[i].value = val;
					}
					return;
				}
			}
			var tmp = document.createElement('input');
			tmp.type = 'hidden';
			tmp.name = key;
			tmp.value = val;
			ele.appendChild(tmp);
		},
		// 可以由外部的产品调用该js来实现登录，参数为一个node
		loginHandle : function(user_id, pwd, pc, ele, lfc, lsc) {
			// 判断ele是否是对象类型的
			if (typeof (ele) != "object") {
				return false;
			}
			if (!checkCookieEnabled()) {
				lfc();
				return false;
			}
			login_status = "";
			// 得到浏览器的类型
			var b = getBrowserType();
			// 得到屏幕宽度
			var w = screen.width;
			// 得到当前输入域的domain
			if (this.domain == "") {
				this.domain = this.getDomain();
			}
			var ra = this.getTime();
			var pwd_md5 = MD5(pwd);
			var t = this.getTime();

			var stoken = "";
			if (document.getElementById("stoken")) {
				stoken = PassportSC
						.strip(document.getElementById("stoken").value);
			}
			this.http_url = (this.loginProtocol == "https"
					&& ra > MIN_HTTS_TIMESTAMP ? 'https' : 'http')
					+ '://passport.sohu.com/act/login?userid='
					+ (typeof encodeURIComponent === 'function' ? encodeURIComponent(user_id)
							: user_id)
					+ '&password='
					+ pwd_md5
					+ '&appid='
					+ this.appid
					+ '&persistentcookie='
					+ pc
					+ (this.loginProtocol == "https" && ra > MIN_HTTS_TIMESTAMP ? '&isSLogin=1'
							: '')
					+ '&s='
					+ ra
					+ '&b='
					+ b
					+ '&w='
					+ w
					+ '&pwdtype=1'
					+ '&v='
					+ this.version
					+ '&t='
					+ t
					+ '&stoken='
					+ stoken
					+ (this.domain != "sohu.com" ? '&domain=' + this.domain
							: '');
			if (this.loginProtocol == "https") {
				this.state = "1100";
			} else {
				this.state = "2200";
			}

			// 记录发送登陆请求的日志
			this.sendLog(ele, "beginLogin", "0");

			var newScript = document.createElement("script");
			//newScript.src = url;
			newScript.src = this.http_url;
			newScript.id = "loginele";
			ele.appendChild(newScript);

			var self = this;
			this.eInterval = setInterval(function() {
				self.loginIntervalProc(lfc, lsc, ele);
			}, 100);
			return false;
		},
		loginIntervalProc : function(lfc, lsc, ele) {
			if (login_status == ""
					&& this.intervalCount < this.maxIntervalCount) {
				this.intervalCount++;
				return;
			}
			/* 此时有返回结果，或者已经超时。clear..... */
			clearInterval(this.eInterval);
			this.eInterval = false;
			// 超时记日志
			if (login_status == ""
					&& this.intervalCount >= this.maxIntervalCount) {
				var flag = "";
				if (this.state == "2200") {
					// 首次http超时
					flag = "1";
					this.state = "2210";
				} else if (this.state == "1200") {
					// 首次请求协议https超时的，且后续的http登录请求仍超时的，flag为3
					this.state = "1210";
					flag = "3";
				}
				this.sendLog(ele, "login timeout" + this.state, flag);
			}
			// 首次请求协议https超时的，但后续的http登录请求成功的，flag为2
			if (login_status == "success") {
				this.addCookie("pp_login_time", this.loginProtocol + "|"
						+ this.email + "|" + this.appid + "|"
						+ getBrowserType() + "|" + this.intervalCount + "|"
						+ this.state, -1, "sohu.com");
				if (this.state == "1200") {
					this.sendLog(ele, "login success", "2");
				}
			}
			if (login_status != "success"
					|| this.intervalCount >= this.maxIntervalCount) {
				if (this.loginProtocol == "https" && login_status == "") {
					this.intervalCount = 0;
					this.loginProtocol = "http";
					this.state = "1200";
					/**
					 * Jady@2011.9.5: 把url从https改为http
					 */
					if (this.http_url.charAt(4) == 's') {
						this.http_url = 'http' + this.http_url.substr(5);
					}
					if (this.domain != "sohu.com") {
						this.http_url += "&domain=" + this.domain;
					}
					var newScript = document.createElement("script");
					newScript.src = this.http_url;
					ele.appendChild(newScript);
					var self = this;
					this.eInterval = setInterval(function() {
						self.loginIntervalProc(lfc, lsc, ele);
					}, 100);
				} else {
					lfc();
				}
				return;
			}
			// 非自动跳转的页面才种其它域的cookie
			if (this.loginRedirectUrl == "") {
				this.autoProcAllDomain("login", ele);
			}
			// 自动跳转的，则设置cookie
			else {
				this.addCookie("crossdomain", this.getTime(), 336);
			}
			lsc();
		},
		// 登录失败后的回调函数
		loginFailCall : function() {
			this.sElement.innerHTML = "";
			this.drawLoginForm();
			if (this.intervalCount >= this.maxIntervalCount) {
				this.reportMsg('6');
				this.emailInput.focus();
			} else if (login_status == 'error3' || login_status == 'error2') {
				this.reportMsg('5');
				this.passwdInput.focus();
			} else if (login_status == 'error5') {
				this.reportMsg('10');
				this.passwdInput.focus();
			} else if (login_status == 'error13') {
				window.location = this.loginProtocol
						+ "://passport.sohu.com/web/remind_activate.jsp";
				return;
			} else if (login_status == 'error11') {
				this.reportMsg('12');
				this.passwdInput.focus();
			} else if (login_status == 'error8') {
				this.reportMsg('13');
				this.passwdInput.focus();
			} else if (login_status == 'error9') {
				this.reportMsg('14');
			} else if (!checkCookieEnabled()) {
				this.reportMsg('11');
				this.emailInput.focus();
			} else {
				this.reportMsg('9');
				this.passwdInput.focus();
			}
		},
		// 登录成功后回调函数
		loginSuccessCall : function() {
			this.parsePassportCookie();
			if (this.cookie && this.cookie['userid'] != '') {
				this.email = "";
				// 登录成功后是否自动跳转
				if (this.loginRedirectUrl != "") {
					this.gotohref(this.loginRedirectUrl);
				} else {
					// 不需要自动跳转，就画卡片
					this.drawPassportCard();
				}
			} else {
				this.drawLoginForm();
				this.reportMsg('7');
			}
		},
		//post login callback
		postLoginSuccessCall : function(){
			if( this.postLoginTimeout ){
				clearTimeout( this.postLoginTimeout );
				this.postLoginTimeout = false;
			}
			this.postLoginClicked = false;
			this.loginSuccessCallFunction();
		},
		postLoginFailCall : function(){
			if( this.postLoginTimeout ){
				clearTimeout( this.postLoginTimeout );
				this.postLoginTimeout = false;
			}
			this.postLoginClicked = false;
			this.loginFailCallFunction( arguments[0] );
		},
		loginSuccessCallFunction : function() {
			//产品线需要自己实现的登录成功回调
		},
		loginFailCallFunction : function( type ) {
			//产品线需要自己实现的登录失败回调
			//参数type表示失败的类型
			//参照reportMsg方法
		},
		drawPassportCard : function() {
			this._drawPassportCard();
			var vlink = document.getElementById("ppcontid");
			vlink.onclick = this.doClickLink.bindFunc(this);
			this.initiElement();
			// 登录成功后，再调用其它产品的提供的一个方法
			try {
				if (this.iElement != null) {
					this.successCalledFunc(this.iElement);
				} else {
					try {
						this.drawPassportInfo();
					} catch (e) {

					}
				}
			} catch (e) {
				this.drawPassportInfo();
			}
		},
		// TODO:这里是登录成功后画passport卡片用的方法，貌似这个产品线都各不相同，所以这个是否还是需要产品线自己来实现，有待考察
		_drawPassportCard : function() {

		},
		// 处理链接的点击事件
		doClickLink : function(_event) {
			var event = window.event ? window.event : _event;
			var srcName = event.srcElement || event.target;
			var tName = srcName.tagName.toLowerCase();
			var userid = this.cookie['userid'];
			var furl = document.location.href;
			var pname = "";
			if (tName == "img") {
				tName = srcName.parentNode.tagName.toLowerCase();
				srcName = srcName.parentNode;
			}
			if (tName == "a") {
				var newScript = document.createElement("script");
				newScript.src = this.loginProtocol
						+ "://passport.sohu.com/web/golog.jsp?userid=" + userid
						+ "&fappid=" + this.appid + "&furl=" + furl + "&turl="
						+ srcName;
				this.iElement.appendChild(newScript);
			}
		},
		initiElement : function() {
			this.iElement = document.getElementsByClassName('listContA')[0];
		},
		// 显示登陆等待信息
		drawPassportWait : function(str) {

		},
		drawPassportInfo : function() {

		},
		// 提供给产品线重写，登陆成功的回调
		loginSuccessCallback : function() {

		},
		// 提供给产品线重写，登陆失败的回调
		loginFailCallback : function() {

		},
		doLogout : function() {
			if (this.eInterval)
				return; // 必须判断一下，避免连续两次点击退出
			this.intervalCount = 0;
			this.sElement.innerHTML = "";
			this.logoutHandle(this.sElement,
					this.logoutFailCall.bindFunc(this), this.logoutSuccessCall
							.bindFunc(this, "dd"));
		},
		// 可以由外部产品来调用退出
		logoutHandle : function(ele, lfc, lsc) {
			// 判断ele是否是对象类型的
			if (typeof (ele) != "object") {
				return false;
			}
			logout_status = "";
			// 得到当前输入域的domain
			if (this.domain == "") {
				this.domain = this.getDomain();
			}
			var ra = this.getTime();
			var url = this.loginProtocol
					+ '://passport.sohu.com/act/logout?s=' + ra + '&appid='
					+ this.appid;
			if (this.domain != "sohu.com") {
				url += "&domain=" + this.domain;
			}
			var newScript = document.createElement("script");
			newScript.src = url;
			ele.appendChild(newScript);
			var self = this;
			this.eInterval = setInterval(function() {
				self.logoutIntervalProc(lfc, lsc, ele);
			}, 100);
		},

		logoutIntervalProc : function(lfc, lsc, ele) {
			if (logout_status == ""
					&& this.intervalCount < this.maxIntervalCount) {
				this.intervalCount++;
				return;
			}

			/* 此时有返回结果，或者已经超时。clear..... */
			clearInterval(this.eInterval);
			this.eInterval = false;
			// 退出失败
			if (logout_status == ""
					&& this.intervalCount >= this.maxIntervalCount) {
				lfc();
				var newScript = document.createElement("script");
				var browerType = getBrowserType();
				newScript.src = this.loginProtocol
						+ "://passport.sohu.com/web/cardlog.jsp?desc=logout timeout&loginProtocol="
						+ this.loginProtocol + "&userid=" + this.email
						+ "&appid=" + this.appid + "&browserType=" + browerType;
				ele.appendChild(newScript);
				return;
			}
			if (logout_status != "success") {
				lfc();
				return;
			}
			// 非自动跳转的页面才清除其它域的cookie
			if (this.logoutRedirectUrl == "") {
				this.autoProcAllDomain("logout", ele);
			} else {// 自动跳转的，则设置cookie
				this.addCookie("crossdomain_logout", this.getTime(), 336);
			}
			lsc();
		},

		// logout失败后的回调函数
		logoutFailCall : function() {
			this.sElement.innerHTML = "";
			this.reportMsg('8');
		},

		// logout成功后回调函数
		logoutSuccessCall : function(aa) {
			// 再重新生成一次domanselect list
			this.parseLastDomain(this.domainList);
			// 将cookie置空
			this.cookie = false;
			this.drawLoginForm();
			// 同时重绘其它的卡片
			for ( var i = 0; i < PassportCardList.length; i++) {
				if (i == this.curCardIndex)
					continue;
				PassportCardList[i].drawLoginForm();
			}
			// 退出成功后，在调用其它产品的提供的一个方法
			try {
				logoutApp();
			} catch (e) {
			}
		},
		// 重新生成cookie，该函数可由外部产品来进行调用
		renewCookie : function(ele, lfc, lsc) {
			// 判断ele是否是对象类型的
			if (typeof (ele) != "object") {
				return false;
			}
			// 得到当前输入域的domain
			if (this.domain == "") {
				this.domain = this.getDomain();
			}
			var ra = this.getTime();
			var url = this.loginProtocol
					+ "://passport.sohu.com/sso/renew.jsp?s=" + ra;
			if (this.domain != "sohu.com") {
				url += "&domain=" + this.domain;
			}
			var newScript = document.createElement("script");
			newScript.src = url;
			ele.appendChild(newScript);
			var self = this;
			this.eInterval = setInterval(function() {
				self.renewIntervalProc(lfc, lsc, ele);
			}, 100);
			return false;
		},
		renewIntervalProc : function(lfc, lsc, ele) {
			if (renew_status == ""
					&& this.intervalCount < this.maxIntervalCount) {
				this.intervalCount++;
				return;
			}
			/* 此时有返回结果，或者已经超时。clear..... */
			clearInterval(this.eInterval);
			this.eInterval = false;

			if (renew_status != "success"
					|| this.intervalCount >= this.maxIntervalCount) {
				try {
					lfc();
				} catch (e) {
				}
				return;
			}
			this.autoProcAllDomain("renew", ele);
			try {
				lsc();
			} catch (e) {
			}
		},
		getRanServ : function() {
			var relen = this.recomServ.length;
			if (relen == 0)
				return "";
			var i = Math.floor(relen * (Math.random()));
			var rtn = '<a href="' + this.recomServ[i]['url']
					+ '" target="_blank">' + this.recomServ[i]['name'] + "</a>";
			if (relen == 1)
				return rtn;
			var j = Math.floor(relen * (Math.random()));
			while (i == j) {
				j = Math.floor(relen * (Math.random()));
			}
			rtn += ' | <a href="' + this.recomServ[j]['url']
					+ '" target="_blank">' + this.recomServ[j]['name'] + "</a>";
			return rtn;
		},
		_drawLoginForm : function() {
		},
		drawLoginForm : function() {
			this._drawLoginForm();
			var inputs = this.cElement.getElementsByTagName("input");
			for ( var i = 0; i < inputs.length; i++) {
				if (inputs[i].name == "email")
					this.emailInput = inputs[i];
				if (inputs[i].name == "password")
					this.passwdInput = inputs[i];
				if (inputs[i].name == "persistentcookie")
					this.pcInput = inputs[i];
			}
			this.loginMsg = document.getElementsByClassName("error")[0];

			if (this.isShowRemPwdMsg == 1) {
				var self = this;
				this.pcInput.onclick = function() {
					if (self.pcInput.checked == false)
						return;
					var confirm = window
							.confirm("浏览器将在两周内保持通行证的登录状态，网吧或公共机房上网者请慎用。您能确认本次操作吗？");
					if (confirm == false) {
						self.pcInput.checked = false;
					}
				};
			}

			this.bindSelector(); // 抽象出来，给狐首 pi18030 调用
			this.autoFillUserId();
			var self = this;
			if (this.emailInput.value == "") {
				if (this.isSetFocus) {
					setTimeout(function() {
						self.emailInput.focus();
					}, 50);
				}
			} else {
				if (this.isSetFocus && this.emailInput.value != "通行证账号/手机号") {
					setTimeout(function() {
						self.passwdInput.focus();
					}, 50);
				}
			}
		},
		// 设置其它所有域的cookie
		autoProcAllDomain : function(action, ele) {
			var vurl = this.crossDomainIframeUrl(action);
			if (vurl) {
				var iframe = document.createElement("iframe");
				iframe.src = vurl;
				iframe.style.width = "0";
				iframe.style.height = "0";
				ele.appendChild(iframe);
			}
		},
		// 该函数由自动跳转后的页面来调用，从而完成跨域种其它域的cookie
		doCrossDomainCookie : function(ele, action) {
			if (typeof (ele) != "object") {
				return;
			}
			var cookiename = "crossdomain";
			if (action == "logout")
				cookiename = "crossdomain_logout";
			// 判断是否需要跨域设置cookie
			var cookie = this.getCookie(cookiename);
			if (cookie == "" || cookie == "0")
				return;
			if (this.domain == "")
				this.domain = this.getDomain();
			var vurl = this.crossDomainIframeUrl(action);
			if (vurl) {
				var iframe = document.createElement("iframe");
				iframe.src = vurl;
				iframe.style.width = "0";
				iframe.style.height = "0";
				iframe.style.display = "none";
				ele.appendChild(iframe);
				this.deleteCookie(cookiename);
			}
		},
		crossDomainUrl : function(action, domain) {
			var curtime = this.getTime();
			var vurl = this.setCookieProtocol
					+ "://passport.sohu.com/sso/crossdomain.jsp?s=" + curtime
					+ "&action=" + action + "&domain=" + domain;
			return vurl;
		},
		crossDomainIframeUrl : function(action) {
			var vurl = this.setCookieProtocol + "://"
					+ this.getPassportDomain()
					+ "/sso/crossdomain_all.jsp?action=" + action;
			return vurl;
		},
		// 根据当前的domain，来获取passport对应的domain
		getPassportDomain : function() {
			if (this.domain === "")
				this.domain = this.getDomain();
			var p_domain = "passport." + this.domain;
			if (this.domain in {
				"focus.cn" : "",
				"17173.com" : "",
				"37wanwan.com" : "",
				"51f.com" : ""
			}) {
				p_domain = "pass." + this.domain;
			}
			return p_domain;
		},
		// 设置某个域的cookie，该函数可由外部产品来调用
		setDomainCookie : function(ele, domain, lsc, lfc) {
			login_status = "";
			crossdomain_status = "";
			var curl = this.crossDomainUrl("login", domain);
			if (curl) {
				newScript = document.createElement("script");
				newScript.src = curl;
				ele.appendChild(newScript);
			}
			var self = this;
			this.eInterval = setInterval(function() {
				self.setCookieIntervalProc(ele, lsc, lfc);
			}, 100);
		},
		setCookieIntervalProc : function(ele, lsc, lfc) {
			if (crossdomain_status != "") {
				clearInterval(this.eInterval);
				this.eInterval = false;
				lfc();
				return;
			}
			if (login_status == ""
					&& this.intervalCount < this.maxIntervalCount) {
				this.intervalCount++;
				return;
			}

			/* 此时有返回结果，或者已经超时。clear..... */
			clearInterval(this.eInterval);
			this.eInterval = false;

			if (login_status != "success"
					|| this.intervalCount >= this.maxIntervalCount) {
				lfc();
				return;
			}
			lsc();
		},
		autoFillUserId : function() {
			if (this.showEmailInputTip) {
				this.showEmailInputTip = false;
				return;
			}
			var cuserid = this.getCookie("pptmpuserid");

			if (this.email.length > 0) {
				this.emailInput.value = this.email; // 登录失败后自动填入错误的用户名
			} else {
				this.emailInput.value = cuserid;
			}
			if (cuserid.length > 0) {
				// this.deleteCookie("pptmpuserid");
				var self = this;
				setTimeout(function() {
					self.deleteCookie("pptmpuserid");
				}, 1000);
			}
		},

		/* 下面这一部分函数是用于 domain select 提示的 */
		downDSindex : function() {
			if (this.dsAnchor.firstChild == null)
				return;
			var x = this.dsAnchor.firstChild.rows;
			for ( var i = 0; i < x.length; i++) {
				if (x[i].firstChild.idx == this.curDSindex)
					break;
			}
			if (i >= x.length - 1) { // 没有找到，或者最后一个
				this.curDSindex = x[0].firstChild.idx;
			} else {
				this.curDSindex = x[i + 1].firstChild.idx;
			}
		},
		upDSindex : function() {
			if (this.dsAnchor.firstChild == null)
				return;
			var x = this.dsAnchor.firstChild.rows;
			var last = -1;
			for ( var i = 0; i < x.length; i++) {
				if (x[i].firstChild.idx == this.curDSindex)
					break;
				last = x[i].firstChild.idx;
			}
			if (i == x.length) { // 没有找到
				this.curDSindex = x[0].firstChild.idx;
			} else if (last == -1) { // 第一个
				this.curDSindex = x[x.length - 1].firstChild.idx;
			} else {
				this.curDSindex = last;
			}
		},
		findDSindex : function(index) {
			try {
				var x = this.dsAnchor.firstChild.rows;
				for ( var i = 0; i < x.length; i++) {
					if (x[i].firstChild.idx == index)
						return x[i].firstChild;
				}
			} catch (e) {
			}
			return false;
		},

		clearFocus : function(index) {
			if (typeof (index) != "number")
				index = this.curDSindex;
			try {
				var x = this.findDSindex(index);
				x.className = '';
				x.style.fontWeight = 'normal';
			} catch (e) {
			}
		},
		setFocus : function(index) {
			if (typeof (index) != "number")
				index = this.curDSindex;
			try {
				var x = this.findDSindex(index);
				x.className = 'active';
			} catch (e) {
			}
		},
		// 输入字符的同时，填充下面的列表
		fillEmailSelect : function() {
			var e = this.emailInput.value;
			var p = /^[\u4e00-\u9fa5,a-zA-Z0-9-_.@]{1,100}$/;
			if (e == "" || !p.test(e)) {
				this.dsElement.style.display = "none";
				// 下拉框消失的时候设置curDindex为-1
				this.curDSindex = -1;
				return;
			}
			var x_postfix = "";
			var x_prefix = "";
			var x_index = e.lastIndexOf("@");
			if (x_index < 0) {
				x_prefix = e;
			} else if (x_index == e.length - 1) { /* 第一次输入 @ */
				x_prefix = e.substr(0, x_index);
			} else {
				x_prefix = e.substr(0, x_index);
				x_postfix = e.substr(x_index + 1);
			}
			var mleft = this.getPosition(this.emailInput, "offsetLeft")
					- this.getPosition(this.cElement, "offsetLeft");
			if (document.all && !document.addEventListener) { // 处理 IE
				// 浏览器的盒式模型 bug
				mleft += 1;
			}
			// this.dsElement.style.marginLeft = mleft + "px";
			// this.dsElement.style.marginTop =
			// (this.getPosition(this.emailInput,"offsetTop") -
			// this.getPosition(this.cElement,"offsetTop") +
			// this.emailInput.offsetHeight) + "px";
			this.dsElement.style.zIndex = "2000";
			this.dsElement.style.paddingRight = "0";
			this.dsElement.style.paddingLeft = "0";
			this.dsElement.style.paddingTop = "0";
			this.dsElement.style.paddingBottom = "0";
			this.dsElement.style.backgroundColor = "white";
			this.dsElement.style.display = "block";

			var myTable = document.createElement("TABLE");
			myTable.width = "100%";
			myTable.style.tableLayout = "fixed";
			myTable.cellSpacing = 0;
			myTable.cellPadding = 3;
			var tbody = document.createElement("TBODY");
			myTable.appendChild(tbody);

			var j = 0;
			var haveCurrent = false;
			var isUserid = false;
			var firstItem = -1;
			var userid_postfix = "", userid_prefix = "";

			var domainList = this.emailPostfix;
			var pattern = /^1\d{0,10}$/;
			var pattern_1 = /^\d*$/;
			if (pattern_1.test(e)) {
				domainList = this.autopad === '' ? [ "qq.com", "focus.cn" ] : [
						"qq.com", "focus.cn", this.autopad ];
			}
			if (pattern.test(e)) {
				domainList = this.autopad === '' ? [ "mobile", "qq.com",
						"focus.cn" ] : [ "mobile", "qq.com", "focus.cn",
						this.autopad ];
			}
			// 从emailPostfix中依次取出userid和domain的list，userid位于前3个
			for ( var i = 0; i < domainList.length; i++) {
				var postfix = domainList[i];
				if (typeof (postfix) != 'string' || postfix.length == 0)
					continue;
				if (x_postfix != "" && postfix.lastIndexOf(x_postfix) != 0) {
					continue;
				}
				// 包含@，表明是从lastdomain中取出的userid
				if (postfix.lastIndexOf("@") >= 0) {
					tmp_pos = postfix.lastIndexOf("@");
					if (this.autopad != ""
							&& this.autopad.lastIndexOf(postfix
									.substring(tmp_pos + 1)) < 0) {
						continue;
					}
					userid_prefix = postfix.substring(0, tmp_pos);
					// Cookie的Userid中不包含已经输入的字符，则跳过即可
					if (userid_prefix.indexOf(x_prefix) != 0) {
						continue;
					}
					// Cookie的Userid的前缀完全等于已经输入的字符，需要标志一下，过滤掉下面的重复的记录
					if (userid_prefix == x_prefix) {
						userid_postfix = postfix.substring(postfix
								.lastIndexOf("@") + 1);
					}
					isUserid = true;
				} else {// 不是从lastdomain中取出的
					// 对于设置了autopad的，只显示autopad域的域名，其它的不予提示
					if (this.autopad != ""
							&& this.autopad.lastIndexOf(postfix) < 0) {
						continue;
					}
				}
				// 过滤掉重复的后缀
				if (postfix == userid_postfix) {
					continue;
				}
				// 过滤掉后缀中包含中文的，后缀中如果有中文，肯定是乱码
				// 这里需要先split('@')是因为这里的postfix并不是真正的后缀，可能包含了从cookie中取出的完整历史登陆用户名，而focus.cn允许用户名中包含中文
				var domain_fix = postfix.split('@').slice(-1).toString();
				var _regArr = domain_fix.match(/[^\x00-\xff]/ig);
				if (_regArr != null && _regArr.length != 0) {
					continue;
				}
				j++;
				if (firstItem == -1)
					firstItem = i;
				if (this.curDSindex == i)
					haveCurrent = true;
				var tr = document.createElement("TR");
				var td = document.createElement("TD");
				td.nowrap = "true";
				td.align = "left";
				// 判断emailPostfix的项是否是从cookie中读取的userid，这时不需要在额外增加@...了

				if (postfix == "mobile" || postfix == "uniqname") {// 为显示手机号码添加，显示完整的手机号，不再添加@
					td.innerHTML = x_prefix;
				} else {
					if (isUserid == false) {
						if (this.usePostFix) {
							td.innerHTML = x_prefix + "@" + postfix;
						} else {
							td.innerHTML = x_prefix;
						}
					} else {
						if (this.usePostFix) {
							td.innerHTML = postfix;
						} else {
							td.innerHTML = postfix.substring(0, postfix
									.lastIndexOf("@"));
						}
					}
				}
				// 添加title以及文本溢出等样式处理
				td.title = td.innerHTML;
				td.style.width = "166px";
				td.style.lineHeight = "1.6em";
				td.style.textOverflow = "ellipsis";
				td.style.whiteSpace = "nowrap";
				td.style.overflow = "hidden";

				td.id = "email_postfix_" + i;
				td.idx = i;
				var self = this;
				// mouseover以及click事件绑定
				td.onmouseover = function() {
					self.clearFocus();
					self.curDSindex = this.idx;
					self.setFocus();
					this.style.cursor = "pointer";
				};
				td.onclick = function() {
					self.doSelect();
				};
				tr.appendChild(td);
				tbody.appendChild(tr);
				isUserid = false;
			}
			if (j > 0) {
				this.dsAnchor.innerHTML = "";
				this.dsAnchor.appendChild(myTable);
				if (haveCurrent == false)
					this.curDSindex = firstItem;
				this.setFocus();
			} else {
				this.dsElement.style.display = "none";
				this.curDSindex = -1;
			}
		},
		doSelect : function() {
			// if(this.emailInput.value=="") return; jiangyan@2009-12-08 注释掉
			// for：
			// 在chrome下，如果使用拼音输入法，在汉字状态下，去选择下来框中的英文的时候，textfield值将为空，注释掉这句话将解决这个问题
			var x = this.findDSindex(this.curDSindex);
			if (x) {
				var c = x.innerHTML;
				if (c) {
					this.emailInput.value = c.replace(/&amp;/g, "&");
				}
			}
			if (this.emailInput.value != "")
				this.passwdInput.focus();
			this.dsElement.style.display = "none";
		},
		blurUserid : function() {
			var self = this;
			setTimeout(function() {
				if (self.dsElement && self.dsElement.style.display != "none") {
					self.dsElement.style.display = "none";
				}
				;
			}, 150);
		},
		// 这里的KeyDown事件主要处理IE的上下箭头事件,IE 必须用 keydown 事件，否则判断不出来 'Up/Down'
		checkKeyDown : function(event) {
			// var keyCode = event.keyCode;
			event = event || window.event;
			var keyCode = event.keyCode || event.which || event.charCode;
			if (keyCode == 38 || keyCode == 40) {
				if (event.shiftKey == 1) {
					return;
				}
				this.clearFocus();
				if (keyCode == 38) {
					this.upDSindex();
				} else if (keyCode == 40) {
					this.downDSindex();
				}
				this.setFocus();
			}
		},
		// 这里的KeyPress事件主要处理FIREFOX的上下箭头事件和TT的BUG产生的olns四个字符
		checkKeyPress : function(event) {
			event = event || window.event;
			var keyCode = event.keyCode || event.which || event.charCode;
			// var keyCode = event.keyCode;
			if (keyCode == 13) {
				this.preventEvent(event);
			} else if (keyCode == 38 || keyCode == 40) {// 上下箭头
				if (event.shiftKey == 1) {
					return;
				}
				this.preventEvent(event);
				this.clearFocus();
				if (keyCode == 38) {
					this.upDSindex();
				} else if (keyCode == 40) {
					this.downDSindex();
				}
				this.setFocus();
			} else if (keyCode == 108 || keyCode == 110 || keyCode == 111
					|| keyCode == 115) {// TT的Bug的四个字符
				var self = this;
				setTimeout(function() {
					self.fillEmailSelect();
				}, 10);
			}
		},
		// 响应用户的输入，填充下拉列表
		checkKeyUp : function(event) {
			event = event || window.event;
			var keyCode = event.keyCode || event.which || event.charCode;
			// var keyCode = event.keyCode;
			// 不论是否是"回车"键，均先填充email列表，解决用户用输入法中文模式"回车"来输入英文的情况
			this.fillEmailSelect();
			if (keyCode == 13) {
				this.doSelect();
			}
			// chrome&saferi 浏览器的上下箭头不响应 keydown和keypress，只响应keyup
			// jiangyan@2009-12-08
			if (getBrowserType() == 7 || getBrowserType() == 4) {
				if (keyCode == 38 || keyCode == 40) {
					if (event.shiftKey == 1) {
						return;
					}
					this.clearFocus();
					if (keyCode == 38) {
						this.upDSindex();
					} else if (keyCode == 40) {
						this.downDSindex();
					}
					this.setFocus();
				}
			}
		},
		bindSelector : function() {
			if (this.bindDomainSelector) {
				this.curDSindex = -1;
				if (typeof (this.emailInput) != "undefined") {
					try {
						this.emailInput.addEventListener('keypress',
								this.checkKeyPress.bindFunc(this), false);
						this.emailInput.addEventListener('keyup',
								this.checkKeyUp.bindFunc(this), false);
						// this.emailInput.addEventListener('blur',this.doSelect.bindFunc(this),
						// false);
						this.emailInput.addEventListener('blur',
								this.blurUserid.bindFunc(this), false);
					} catch (e) {
						try {
							this.emailInput.attachEvent("onkeydown",
									this.checkKeyDown.bindFunc(this));
							this.emailInput.attachEvent("onkeypress",
									this.checkKeyPress.bindFunc(this));
							this.emailInput.attachEvent("onkeyup",
									this.checkKeyUp.bindFunc(this));
							// this.emailInput.attachEvent("onblur",
							// this.doSelect.bindFunc(this));
							this.emailInput.attachEvent("onblur",
									this.blurUserid.bindFunc(this));
						} catch (e) {
						}
					}
				}
			}
		},
		/* 从第2个卡片开始，调用这个函数来进行绘制 */
		drawPassportNew : function(element, appid, scf) {
			if (typeof (element) != "object") {
				return;
			}
			var pBaseClass = new Function();
			pBaseClass.prototype = this;
			var cardCount = PassportCardList.length;
			var PassportSN = new pBaseClass();
			/* 设置登录成功后的回调函数 */
			PassportSN.successCalledFunc = scf;
			PassportSN.appid = appid;
			PassportSN.curCardIndex = cardCount;
			/* 设置以后的卡片默认不setFocus */
			PassportSN.isSetFocus = false;
			PassportCardList[cardCount] = PassportSN;
			drawPassportNewInit(cardCount, element);
			return;
		},
		// 类似于37wanwan这样，通过js的请求，来自动画passportCard
		drawPassportJS : function() {
			if (!this.oElement || typeof (this.oElement) != "object") {
				return;
			}
			var cookie_ppinf = this.getCookie('ppinf');
			var sso_url = 'http://sso.passport.sohu.com/mirror/'
					+ this.getPassportDomain() + '/' + cookie_ppinf;
			var newScript = document.createElement("script");
			newScript.src = sso_url;
			ele.appendChild(newScript);
		},
		// 类似于37wanwan.com这样的域名，创建iframe进行setcookie或clearcookie的操作
		doCrossDomainIframe : function(iurl) {
			var iframe = document.createElement("iframe");
			iframe.src = iurl;
			iframe.style.width = "0";
			iframe.style.height = "0";
			iframe.id = "ifr_crossdomain";
			PassportSC.oElement.appendChild(iframe);
		},
		sendLog : function(ele, desc, flag) {
			var newScript = document.createElement("script");
			var browerType = getBrowserType();
			newScript.src = '//passport.sohu.com/web/cardlog.jsp?desc='
					+ desc + '&loginProtocol=' + this.loginProtocol
					+ '&userid=' + this.email + '&appid=' + this.appid
					+ '&browserType=' + browerType + '&status=' + login_status
					+ '&count=' + this.intervalCount + '&max='
					+ this.maxIntervalCount + '&flag=' + flag;
			ele.appendChild(newScript);
		}
	};
	// 对于登陆后自动跳转的情况，如果定义了全局变量，则不需要自动跨域种其它域的cookie，而是手工去调用
	if (typeof PP_SETCROSSDOMAIN == "undefined") {
		// 用于在跳转后的新页面上直接在后台跨域处理cookie
		var ele = document.getElementsByTagName("head")[0];
		if (typeof PP_SETCOOKIEPROTOCOL != "undefined") {
			PassportSC.setCookieProtocol = PP_SETCOOKIEPROTOCOL;
		}
		PassportSC.doCrossDomainCookie(ele, "login");
		PassportSC.doCrossDomainCookie(ele, "logout");
	}
	// IE版本在5.5以下时，采用post方式提交
	if (typeof encodeURIComponent == "undefined") {
		PassportSC.usePost = 1;
	}
	// 处理手机上的opera mini浏览器
	if (getBrowserType() == 3 && (screen.height == 5000 || window.navigator.userAgent.lastIndexOf("Mini") >= 0)) {
		PassportSC.usePost = 1;
	}

	window.svp = window.svp || {};
	window.svp.PassportSC = window['PassportSC'];  
	window.svp._MD5 = MD5;
	window.svp._Base64 = Base64;
	// seajs || RequireJS 
	if (typeof window.svp.define === 'function' ) {
    	svp.define('PassportSC', function (require, exports, module) { 
  			module.exports = window.svp.PassportSC;
		});
    }
    
})(window);


