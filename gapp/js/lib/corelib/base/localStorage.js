/**
 *
 *   @description: 该文件用于定义localStorage工具类
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-03-25
 *
 *   @update-log :
 *                 1.0.1 - localStorage工具类
 *
 **/
svp.define('base.store', function (require, exports, module) {
	  
  'use strict';
  
  /**
   * @module base.store
   * @namespace store
   * @property {function}  set                      - 设置存储项的键和相应的值
   * @property {function}  get                      - 根据键读取相应的键值
   * @property {function}  remove                   - 清除指定键值对
   * @property {function}  clearAll                 - 清除所有键值对
   * @property {function}  getAll                   - 返回由所有键值对组成的对象
   * @property {function}  forEach                  - 遍历所有键值对，以每个键和键值为参数执行传入的callback函数
   */
   
  var store = {},
      win = window,
      doc = document,
      localStorageName = 'localStorage',
      scriptTag = 'script',
      storage;

  try {
    storage = win[localStorageName];
  
  } catch (e) {}

  var noop = function () {};

  store.disabled = false;

  store.set = noop;

  store.get = noop;

  store.remove = noop;

  store.clear = noop;

  store.transact = function (key, defaultVal, transactionFn) {
    var val = store.get(key);
    
    if (transactionFn === null) {
      transactionFn = defaultVal;
      defaultVal = null;
    }

    if (typeof val === 'undefined') {
      val = defaultVal || {};
    }
    transactionFn(val);
    store.set(key, val);
  };

  store.getAll = function () {};

  store.forEach = function () {};

  store.serialize = function (value) {
    
    return JSON.stringify(value);
  };

  store.deserialize = function (value) {
    
    if (typeof value !== 'string') {
      return undefined;
    }

    try {

      return JSON.parse(value);

    } catch (e) {
      
      return value || undefined;
    }
  };

  // Functions to encapsulate questionable FireFox 3.6.13 behavior
  // when about.config::dom.storage.enabled === false
  // See https://github.com/marcuswestin/store.js/issues#issue/13
  var isLocalStorageNameSupported = function () {
    try {

      return (localStorageName in win && win[localStorageName]);
    
    } catch (err) {
      
      return false;
    }
  };

  if (isLocalStorageNameSupported()) {
    storage = win[localStorageName];

    /**
     * @memberof store
     * @summary 设置存储项的键和相应的值
     * @type {function}
     * @param {string} key                        - 键
     * @param {string} val                        - 值
     * @return {string}           				  - 返回设置的键值
     */
    store.set = function (key, val) {
      
      if (val === undefined) {
        
        return store.remove(key);
      }
      storage.setItem(key, store.serialize(val));
      
      return val;
    };

    /**
     * @memberof store
     * @summary 根据键读取相应的键值
     * @type {function}
     * @param {string} key                        - 键
     * @return {object|array|undefined}           - 返回键对应的键值，可能是已被解析过的对象、字符串或undefined
     */
    store.get = function (key) {

      return store.deserialize(storage.getItem(key));
    };

   /**
     * @memberof store
     * @summary 清除指定键值对
     * @type {function}
     * @param {string} key                        - 键
     */
    store.remove = function (key) {
      storage.removeItem(key);
    };

   	/**
     * @memberof store
     * @summary 清除所有键值对
     * @type {function}
     */
    store.clearAll = function () {
      storage.clear();
    };

   /**
   * @namespace store
   * @property {function} forEach                 - 遍历所有键值对，以每个键和键值为参数执行传入的callback函数
   * @param {string} callback                     - 将要以每个键和键值为参数执行的函数
   */
    store.forEach = function (callback) {
      
      for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        callback(key, store.get(key));
      }
    };
  
  } else if (doc.documentElement.addBehavior) {
    var storageOwner,
      storageContainer;

    try {
      storageContainer = new ActiveXObject('htmlfile');
      storageContainer.open();

      var writeStr = '<' + scriptTag + '>document.w=window</' + scriptTag + '>';
      writeStr += '<iframe src="/favicon.ico"></iframe>';
     
      storageContainer.write(writeStr);
      storageContainer.close();
      storageOwner = storageContainer.w.frames[0].document;
      storage = storageOwner.createElement('div');
    
    } catch (e) {
      // somehow ActiveXObject instantiation failed (perhaps some special
      // security settings or otherwse), fall back to per-path storage
      storage = doc.createElement('div');
      storageOwner = doc.body;
    }

    var withIEStorage = function (storeFunction) {
      
      var rst = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(storage);
        // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
        // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
        storageOwner.appendChild(storage);
        storage.addBehavior('#default#userData');
        storage.load(localStorageName);
        var result = storeFunction.apply(store, args);
        storageOwner.removeChild(storage);
        return result;
      };

      return rst;
    };

    // In IE7, keys cannot start with a digit or contain certain chars.
    // See https://github.com/marcuswestin/store.js/issues/40
    // See https://github.com/marcuswestin/store.js/issues/83
    var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
    
    var ieKeyFix = function (key) {
      
      return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
    };

    store.set = withIEStorage(function (storage, key, val) {
      key = ieKeyFix(key);
      
      if (val === undefined) {
        
        return store.remove(key);
      }
      storage.setAttribute(key, store.serialize(val));
      storage.save(localStorageName);
      
      return val;
    });

    store.get = withIEStorage(function (storage, key) {
      key = ieKeyFix(key);

      return store.deserialize(storage.getAttribute(key));
    });

    store.remove = withIEStorage(function (storage, key) {
      key = ieKeyFix(key);
      storage.removeAttribute(key);
      storage.save(localStorageName);
    });

    store.clear = withIEStorage(function (storage) {
      var attributes = storage.XMLDocument.documentElement.attributes;
      storage.load(localStorageName);

      for (var i = 0, l = attributes.length; i < l; i++) {
        var attr = attributes[i];
        storage.removeAttribute(attr.name);
      }
      storage.save(localStorageName);
    });

    store.forEach = withIEStorage(function (storage, callback) {
      var attributes = storage.XMLDocument.documentElement.attributes;
      
      for (var i = 0, l = attributes.length; i < l; i++) {
        var attr = attributes[i];
        callback(attr.name, store.deserialize(storage.getAttribute(attr.name)));
      }
    });
  }

	 /**
	* @memberof store
	* @summary 读取所有的键值对
	* @type {function}
	* @return {object}                           - 返回由所有键值对组成的对象
	*/
	store.getAll = function () {
	  var ret = {};
	  
	  store.forEach(function (key, val) {
	    ret[key] = val;
	  });

	  return ret;
	};

  try {
    var testKey = '__storejs__';
    store.set(testKey, testKey);

    if (store.get(testKey) !== testKey) {
      store.disabled = true;
    }
    store.remove(testKey);

  } catch (e) {
    store.disabled = true;
  }
  store.enabled = !store.disabled;

/*  if (typeof module !== 'undefined' && module.exports && this.module !== module) {
      module.exports = store;

    } else if (typeof define === 'function' && define.amd) {
      define(store);
    }*/

  //兼容老版本
  store.getStorage = function () {
    try {
      /* 在Android 4.0下，如果webview没有打开localStorage支持，在读取localStorage对象的时候会导致js运行出错，所以要放在try{}catch{}中 */
      storage = win[localStorageName];
    
    } catch (e) {
      console.log('localStorage is not supported');
    }
    
    return storage;
  };

  /**
  * 清除本地存贮数据
  * @param {String} prefix 可选，如果包含此参数，则只删除包含此前缀的项，否则清除全部缓存
  */
  store.clear = function (prefix) {
    var storage = store.getStorage();

    if (storage) {
      
      if (prefix) {
        
        for (var key in storage) {
          
          if (0 === key.indexOf(prefix)) {
            storage.removeItem(key);
          }
        }

      } else {
        storage.clear();
      }
    }
  };
  
  window.Store = store;
  module.exports = store;

});