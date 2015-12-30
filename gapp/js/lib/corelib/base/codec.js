/**
 *
 *   @description: 该文件用于base64加密解码、md5相关类
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-03-25
 *
 *   @update-log :
 *                 1.0.1 - base64加密解码、md5相关类
 *
 */
svp.define('base.codec', function(require, exports, module) {

    'use strict';

    var $ = svp.$; 

    /**
     * @module base.codec
     * @namespace BaseCodec
     * @property {string}   version                     - 文件版本号
     * @property {string}   base64encodechars           - base64加密key
     * @property {array}    base64decodechars           - base64解密数组
     * @property {function} encode                      - base64加密
     * @property {function} decode                      - base64解密
     * @property {function} utf16to8                    - utf16转换为utf8
     * @property {function} utf8to16                    - utf8转换为utf16
     * @property {function} utf8Encode                  - utf8编码
     * @property {function} binl2rstr                   - 把uinicode值转换为字符串
     * @property {function} rstr2binl                   - 把字符串值转换为unicode数组
     * @property {function} str2rstr_utf8               - 先用encodeURIComponent编码，再用unescape解码
     * @property {function} stringToHex                 - 将一个字符串转换为16进制
     * @property {function} hexToString                 - 将一个16进制字符串转换为普通字符串
     * @property {function} decodeUtf8to16Data64        - 将一个字符串用base64解密，并转换为utf16
     * @property {function} encodeUtf16to8Data64        - 将一个字符串转换为utf8，并用base64加密
     * @property {function} md5                         - md5加密
     *
     * @example
     *   var codec = require('base.codec');
     *   codec.md5('fjewaoicpwajg');
     */
 
    var version = '1.0.2';
    var base64encodechars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var base64decodechars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    var base64encode = function (str) {
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = '';
        
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            
            if (i == len) {
                out += base64encodechars.charAt(c1 >> 2);
                out += base64encodechars.charAt((c1 & 0x3) << 4);
                out += '==';
                
                break;
            }
            c2 = str.charCodeAt(i++);
            
            if (i == len) {
                out += base64encodechars.charAt(c1 >> 2);
                out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
                out += base64encodechars.charAt((c2 & 0xf) << 2);
                out += '=';
                
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64encodechars.charAt(c1 >> 2);
            out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
            out += base64encodechars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
            out += base64encodechars.charAt(c3 & 0x3f);
        }

        return out;
    };

    var base64decode = function (str) {
        var c1, c2, c3, c4;
        var i, len, out;
        len = str.length;
        i = 0;
        out = '';
        
        while (i < len) {

            do {
                c1 = base64decodechars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c1 == -1);
            
            if (c1 == -1)
                
                break;

            do {
                c2 = base64decodechars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c2 == -1);
            
            if (c2 == -1) {
                
                break;
            }
            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

            do {
                c3 = str.charCodeAt(i++) & 0xff;
                
                if (c3 == 61) {
                    
                    return out;
                }
                c3 = base64decodechars[c3];
            
            } while (i < len && c3 == -1);
            
            if (c3 == -1) {

                break;
            }
            out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));

            do {
                c4 = str.charCodeAt(i++) & 0xff;
                
                if (c4 == 61) {
                    
                    return out;
                }
                c4 = base64decodechars[c4];
            
            } while (i < len && c4 == -1);
            
            if (c4 == -1) {
                
                break;
            }
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }

        return out;
    };

    var utf16to8 = function (str) {
        var out, i, len, c;
        out = '';
        len = str.length;
        
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            
            if ((c >= 0x0001) && (c <= 0x007f)) {
                out += str.charAt(i);
            
            } else if (c > 0x07ff) {
                out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
            
            } else {
                out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
            }
        }
        
        return out;
    };

    var utf8to16 = function (str) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = str.length;
        i = 0;
        
        while (i < len) {
            c = str.charCodeAt(i++);
            
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += str.charAt(i - 1);
                    
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
                    
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = str.charCodeAt(i++);
                    char3 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x0f) << 12) |
                        ((char2 & 0x3f) << 6) |
                        ((char3 & 0x3f) << 0));
                    
                    break;
            }
        }
        
        return out;
    };

    // private method for UTF-8 encoding  
    var utf8Encode = function (string) {
        //string = string.replace(/\r\n/g,"\n");  
        var utftext = "";
        
        for (var n = 0; n < string.length; n++) {
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
    };

    // private method for UTF-8 decoding  
    var utf8Decode = function (utftext) {
        var string = '';
        var i = 0;
        var c = c1 = c2 = 0;
        
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
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        
        return string;
    };
    
    /**
    *解码
    */
    var decodeUtf8to16Data64 = function (sEncoded) {
        var Data2 = utf8to16(base64decode(sEncoded));
        
        return Data2;
    };

    /**
    *编码
    */
    var encodeUtf16to8Data64 = function (sDecoded) {
        var Data2 = base64encode(utf16to8(sDecoded));
        
        return Data2;
    };


    var stringToHex = function (s) {
        var r = "0x";
        var hexes = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
        
        for (var i = 0; i < s.length; i++) {
            r += hexes[s.charCodeAt(i) >> 4] + hexes[s.charCodeAt(i) & 0xf];
        }

        return r;
    };

    var hexToString = function (h) {
        var r = "";
        
        for (var i = (h.substr(0, 2) == "0x") ? 2 : 0; i < h.length; i += 2) {
            r += String.fromCharCode(parseInt(h.substr(i, 2), 16));
        }
        
        return r;
    };

    /*
     *  MD5 
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    var safe_add = function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        
        return (msw << 16) | (lsw & 0xFFFF);
    };

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    var bit_rol = function (num, cnt) {
        
        return (num << cnt) | (num >>> (32 - cnt));
    };

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    var md5_cmn = function (q, a, b, x, s, t) {
        
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    };

    var md5_ff = function (a, b, c, d, x, s, t) {
        
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    };

    var md5_gg = function (a, b, c, d, x, s, t) {
        
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    };

    var md5_hh = function (a, b, c, d, x, s, t) {
        
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    };

    var md5_ii = function (a, b, c, d, x, s, t) {
        
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    };

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    var binl_md5 = function (x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a = 1732584193,
            b = -271733879,
            c = -1732584194,
            d = 271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i], 7, -680876936);
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
            b = md5_gg(b, c, d, a, x[i], 20, -373897302);
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
            d = md5_hh(d, a, b, c, x[i], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i], 6, -198630844);
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
        
        return [a, b, c, d];
    };

    /*
     * Convert an array of little-endian words to a string
     */
    var binl2rstr = function (input) {
        var i,
            output = '';
        
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        
        return output;
    };

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    var rstr2binl = function (input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        
        return output;
    };

    /*
     * Calculate the MD5 of a raw string
     */
    var rstr_md5 = function (s) {
        
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    };

    /*
     * Calculate the HMAC-MD5, of a key and some data (raw strings)
     */
    var rstr_hmac_md5 = function (key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    };

    /*
     * Convert a raw string to a hex string
     */
    var rstr2hex = function (input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        
        return output;
    };

    /*
     * Encode a string as utf-8
     */
    var str2rstr_utf8 = function (input) {
        
        return unescape(encodeURIComponent(input));
    };

    /*
     * Take string arguments and return either raw or hex encoded strings
     */
    var raw_md5 = function (s) {
        
        return rstr_md5(str2rstr_utf8(s));
    };

    var hex_md5 = function (s) {
        
        return rstr2hex(raw_md5(s));
    };

    var raw_hmac_md5 = function (k, d) {
        
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    };

    var hex_hmac_md5 = function (k, d) {
        
        return rstr2hex(raw_hmac_md5(k, d));
    };

    var md5 = function (string, key, raw) {
        
        if (!key) {
            
            if (!raw) {
                
                return hex_md5(string);
            }
            
            return raw_md5(string);
        }
        
        if (!raw) {
            
            return hex_hmac_md5(key, string);
        }
        
        return raw_hmac_md5(key, string);
    };

    module.exports = {
        /**
         * @memberof BaseCodec
         * @summary 文件版本号
         * @type {string}
         */
        version: version,

        /**
         * @memberof BaseCodec
         * @summary base64加密key
         * @type {string}
         */
        base64encodechars: base64encodechars,

        /**
         * @memberof BaseCodec
         * @summary base64解密数组
         * @type {array}
         */
        base64decodechars: base64decodechars,

        /**
         * @memberof BaseCodec
         * @summary base64加密
         * @type {function}
         * @param  {string}  str                            - 要编码的字符串
         * @return {string}                                 - 编码后的字符串
         */
        encode: base64encode,

        /**
         * @memberof BaseCodec
         * @summary base64解密
         * @type {function}
         * @param  {string}  str                            - 要解码的字符串
         * @return {string}                                 - 解码后的字符串
         */
        decode: base64decode,

        /**
         * @memberof BaseCodec
         * @summary utf16转换为utf8
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        utf16to8: utf16to8,

        /**
         * @memberof BaseCodec
         * @summary utf8转换为utf16
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        utf8to16: utf8to16,

        /**
         * @memberof BaseCodec
         * @summary utf8编码
         * @type {function}
         * @param  {string}  str                            - 要编码的字符串
         * @return {string}                                 - 编码后的字符串
         */
        utf8Encode: utf8Encode,

        /**
         * @memberof BaseCodec
         * @summary utf8解码
         * @type {function}
         * @param  {string}  str                            - 要解码的字符串
         * @return {string}                                 - 解码后的字符串
         */
        utf8Decode: utf8Decode,

        /**
         * @memberof BaseCodec
         * @summary 把uinicode值转换为字符串
         * @type {function}
         * @param  {array}  arr                             - 要转换的unicode值数组
         * @return {string}                                 - 转换后的字符串
         */
        binl2rstr: binl2rstr,

        /**
         * @memberof BaseCodec
         * @summary 把字符串值转换为unicode数组
         * @type {function}
         * @param  {array}  arr                             - 要转换的字符串数组
         * @return {array}                                  - 转换后的字符串数组
         */
        rstr2binl: rstr2binl,

        /**
         * @memberof BaseCodec
         * @summary 先用encodeURIComponent编码，再用unescape解码
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        str2rstr_utf8: str2rstr_utf8,

        /**
         * @memberof BaseCodec
         * @summary 将一个字符串转换为16进制
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        stringToHex: stringToHex,

        /**
         * @memberof BaseCodec
         * @summary 将一个16进制字符串转换为普通字符串
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        hexToString: hexToString,

        /**
         * @memberof BaseCodec
         * @summary 将一个字符串用base64解密，并转换为utf16
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        decodeUtf8to16Data64: decodeUtf8to16Data64,

        /**
         * @memberof BaseCodec
         * @summary 将一个字符串转换为utf8，并用base64加密
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        encodeUtf16to8Data64: encodeUtf16to8Data64,

        /**
         * @memberof BaseCodec
         * @summary md5加密
         * @type {function}
         * @param  {string}  str                            - 要进行md5加密的字符串
         * @param  {string}  key                            - (可选参数) 指定秘钥
         * @param  {string}  raw                            - (可选参数) 16进制
         * @return {string}                                 - 加密后的字符串
         */
        md5: md5
    };
});