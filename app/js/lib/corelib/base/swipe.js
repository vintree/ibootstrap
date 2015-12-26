/**
 *
 *   @description: swipe
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015/4/20
 *
 *   @update-date: 2015/5/21
 *var Swipe = require('swipe');

 var Channel = {
        // 滚动条位置
        scrollTop: 0,
        init: function () {
            new Swipe('pgc_nav', 'nav_box');
            Channel.scroll();
        },
        scroll: function () {
            $(document).on('scroll', function () {
                var scrollTop = $(window).scrollTop();
                var target = $('#pgc_nav').offset().top - 45;

                if (scrollTop > target) {
                    $('#nav_box').css({
                        'position': 'fixed',
                        'top': '45px'
                    });
                } else {
                    $('#nav_box').css({
                        'position': 'relative',
                        'top': '0'
                    });
                }

                if (scrollTop - $('#pgc_nav').height() > target && scrollTop > Channel.scrollTop) {
                    $('#nav_box').addClass('hide');
                } else {
                    $('#nav_box').removeClass('hide');
                }
                Channel.scrollTop = scrollTop;
            });
        }
    };
 *   @update-log :
 *                 1.0.1 - 基于iscroll的横向滑动
 *                 1.0.2 - 容器计算出的宽度增加2px iPhone QQ&UC热点导航缺失一个tab
 *
 */
svp.define('swipe', function (require, exports, module) {
    /* hots_nav */
    var getElementPos = function(o){
        var point = {x:0, y:0};
        if (o.getBoundingClientRect) {
            var x=0, y=0;
            try{
                var box = o.getBoundingClientRect();
                var D = document.documentElement;
                x = box.left + Math.max(D.scrollLeft, document.body.scrollLeft) - D.clientLeft;
                y = box.top + Math.max(D.scrollTop, document.body.scrollTop) - D.clientTop;
            }catch(e){}
            point.x = x;
            point.y = y;
        }else{
            function pageX(o){ try {return o.offsetParent ? o.offsetLeft +  pageX(o.offsetParent) : o.offsetLeft; } catch(e){ return 0; } }
            function pageY(o){ try {return o.offsetParent ? o.offsetTop + pageY(o.offsetParent) : o.offsetTop; } catch(e){ return 0; } }
            point.x = pageX(o);
            point.y = pageY(o);
        }
        return point;
    };
    var addEvent = function(dom, eventname, func){
        if(window.addEventListener){
            if(eventname == 'mouseenter' || eventname == 'mouseleave'){
                function fn(e){
                    var a = e.currentTarget, b = e.relatedTarget;
                    if(!elContains(a, b) && a!=b){
                        func.call(e.currentTarget,e);
                    }
                }
                function elContains(a, b){
                    try{ return a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b) & 16); }catch(e){}
                }
                if(eventname == 'mouseenter'){
                    dom.addEventListener('mouseover', fn, false);
                }else{
                    dom.addEventListener('mouseout', fn, false);
                }
            }else{
                dom.addEventListener(eventname, func, false);
            }
        }else if(window.attachEvent){
            dom.attachEvent('on' + eventname, func);
        }
    };
    var getStyle = function(obj, attribute){
        return obj.currentStyle ? obj.currentStyle[attribute] : document.defaultView.getComputedStyle(obj, false)[attribute];
    };
    function Swipe(navId,navBoxId){
        this.scroller=null;
        this.nav=document.getElementById(navId);
        this.navBox=document.getElementById(navBoxId);
        this.init();
    }
    Swipe.prototype = {
        init:function(){
            if(!this.nav){return;}
            this.bind();
        },
        bind:function(){
            var _this = this;
            this.initScroller();

            this.resetPostion();
            var en = 'onorientationchange' in window ? 'orientationchange' : 'resize';
            addEvent(window, en, function(){
                if(_this.scroller){
                    var getWidth = function(){
                        var w = 0;
                        for(var i=0; i<lis.length; i++){
                            w += (lis[i].offsetWidth + parseInt(getStyle(lis[i], 'marginRight')));
                        }
                        return w;
                    }
                    var ul = _this.navBox.getElementsByTagName('ul')[0]
                        ,lis = ul.getElementsByTagName('li');
                    ul.style.width = getWidth() + 'px';
                    _this.scroller.refresh();
                }
            });
        },
        resetPostion: function(){
            var box = this.navBox
            var cur = this.findCurrent();
            var inview = true;
            if(cur){
                var posbox = getElementPos(box).x,
                    poscur = getElementPos(cur).x,
                    wbox = box.offsetWidth;

                if( poscur >= (posbox + wbox)  //整个溢出
                    || (poscur+cur.offsetWidth) > (posbox + wbox) //半截不可见
                    ){
                    inview = false;
                }
            }
            if(!inview){
                //居中
                var x = cur.offsetLeft + cur.offsetWidth/2 - box.offsetWidth/2;
                this.scroller.scrollTo(-x, 0, 0);
            }
            if(poscur < 0){
                var _left = getElementPos(this.nav.getElementsByTagName('ul')[0]).x;
                this.scroller.scrollTo(_left + (-poscur), 0, 0);
            }
        },
        findCurrent:function(){
            var box = this.navBox
                ,ul = box.getElementsByTagName('ul')[0]
                ,lis = ul.getElementsByTagName('li');
            var li = null;
            for(var i=0; i<lis.length; i++){
                var l = lis[i];
                if(l.className && l.className == 'active'){
                    li = l;
                    break;
                }
            }
            return li;
        },
        initScroller:function(){
            var box=this.navBox,
                mr=48,
                ul=box.getElementsByTagName('ul')[0],
                lis=ul.getElementsByTagName('li');
            //margin-right 定义不同
            var getWidth = function(){
                var w = 0;
                for(var i=0; i<lis.length; i++){
                    w += (lis[i].offsetWidth + parseInt(getStyle(lis[i], 'marginRight')));
                }
                return w;
            }
            //容器计算出的宽度增加2px iPhone QQ&UC热点导航缺失一个tab
            ul.style.width = (getWidth() + 2) + 'px';

            this.scroller = new iScroll(this.navBox.id, {
                bounce:true,
                vScroll:false,
                hScrollbar:false,
                vScrollbar:false
            });
        }
    };
    module.exports = Swipe;
//    new Swipe("series","page_box");
});