
/**
 * @file 声明ui命名空间
 * @namespace ui
 * @import zepto.js
 */

/**
 *  基于zepto的轻量级mobile UI组件库， 支持国内主流移动端浏览器，如safari, chrome, UC, qq等。
 */
var ui = ui || {
    version: '2.0.5',
    $: svp.$ || window.Zepto,

    /**
     * 调用此方法，可以减小重复实例化Zepto的开销。所有通过此方法调用的，都将公用一个Zepto实例，
     * 如果想减少Zepto实例创建的开销，就用此方法。
     * @method staticCall
     * @grammar ui.staticCall( dom, fnName, args... )
     * @param  {DOM} elem Dom对象
     * @param  {String} fn Zepto方法名。
     * @param {*} * zepto中对应的方法参数。
     * @example
     * // 复制dom的className给dom2, 调用的是zepto的方法，但是只会实例化一次Zepto类。
     * var dom = document.getElementById( '#test' );
     *
     * var className = ui.staticCall( dom, 'attr', 'class' );
     * console.log( className );
     *
     * var dom2 = document.getElementById( '#test2' );
     * ui.staticCall( dom, 'addClass', className );
     */
    staticCall: (function( $ ) {
        var proto = $.fn,
            slice = [].slice,

        // 公用此zepto实例
            instance = $();

        instance.length = 1;

        return function( item, fn ) {
            instance[ 0 ] = item;
            return proto[ fn ].apply( instance, slice.call( arguments, 2 ) );
        };
    })( svp.$ || Zepto )
};
window.ui = ui;