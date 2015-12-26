/** 
* zepto 1.1.6 all in - zepto event ajax form ie detect fx 
* fx_methods assets data deferred callbacks selector touch 
* gesture stack ios3 - zeptojs.com license
*/

window.svp = window.svp || {};

window.svp.$ =  window.svp.$ || window.Zepto;
var __version = "1.1.6" ;
var __modulelist = "zepto event ajax form ie detect fx  fx_methods assets data deferred callbacks selector touch gesture stack ios3 fx_fn seajs template" ;

// seajs || RequireJS 
if (typeof window.svp.define === 'function' ) {
    svp.define('zepto', function (require, exports, module) { 
  		module.exports = window.svp.$;
	}); 
};
