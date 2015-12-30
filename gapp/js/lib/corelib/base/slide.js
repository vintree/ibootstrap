/**
 *
 *   @description: 该文件用于相关推荐滚动效果
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-03-25
 *
 *   @update-log :
 *                 1.0.1 - 相关推荐滚动效果
 *
 **/
svp.define('base.slide', function (require, exports, module) {

  'use strict';

  /**
   * @module base.slide
   * @namespace Slide
   * @property {function} init               -初始化配置参数、事件绑定等
   * @property {function} paramInit          -参数初始化
   *
   * @example
   *   var slide = require('base.slide');
   *   slide.Scroll({
   *     'scrollClass':'svp_recommend_videos',
   *     'moveSpeed':200,
   *     'loop':true,
   *     'auto':false
   *   });
   */

  var Slide = {
    //滚动容器class
    slideClass: '',
    //video lists
    videoListsClass: 'svp_video_list',
    //滚动图下方page point
    pagePoint: 'svp_page_point',
    //当前展示焦点图位置class
    showLocationClass: 'c',
    //当前展示焦点图class
    showClass: 'svp_focusShow',
    //itemClass
    itemClass: 'svp_video_list',
    //移动速度
    moveSpeed: 200,
    //当横向移动距离超过该距离时才进行滚动内容
    minMoveDist: 20,
    //是否移动标识
    moveFlag: true,
    //滚动锁
    isLock: false,
    //是否有图片底部焦点
    isHasPoint: false,
    //触摸起始点x坐标
    startX: 0,
    //触摸起始点y坐标
    startY: 0,
    //触摸移动点x坐标
    moveX: 0,
    //是否是移动设备
    isMobile: true,
    //当前videolists translateX
    listTranslate: 0,
    //是否处于拖拽状态，pc浏览器时才用
    pcDragFlag: false,
    //是否循环
    loop: false,
    firstClone: 'clone_first',
    lastClone: 'clone_last',
    //自动滚动时间间隔
    autoSpeedInterval: 3000,
    //是否自动滚动
    auto: false,
    //链接a class
    aLinkClass: 'svp_link',

    /**
     * @memberOf Slide
     * @summary Slide初始化,参数层检测、事件绑定等
     * @type {function}
     * @param  {object} settings -配置参数
     */
    init: function (settings) {
      var _self = Slide;
      
      if (_self.paramInit(settings)) {
        _self.modelInit();
        _self.initPagePoint();
        _self.eventInit();
      }
    },
    /**
     * @memberOf Slide
     * @summary 参数初始化
     * @type {function}
     * @param  {object} settings -配置参数
     * @return {boolean}
     */
    paramInit: function (settings) {
      
      if (settings) {
        this.slideClass = (settings && settings.scrollClass) || 'svp_recommend_videos';
        this.$slideWrap = $('.' + this.slideClass);
        this.loop = settings.loop || false;
        this.auto = settings.auto || false;
        this.moveSpeed = settings.moveSpeed || 200;
        this.autoSpeedInterval = settings.autoSpeedInterval || this.autoSpeedInterval;
      
      } else {
        this.slideClass = 'svp_recommend_videos';
      }
      
      if ($('.' + this.slideClass).length === 0) {
        
        return false;
      }
      
      return true;
    },

    /**
     * @memberOf Slide
     * @summary 判断是否是移动端
     * @type {function}
     * @return {boolean}
     */
    modelInit: function () {
      this.isMobile = ('createTouch' in document);
    },
    /**
     * @memberOf Slide
     * @summary 获取滚动单元宽度
     * @type {function}
     * @return {number}
     */
    getItemWidth: function () {
      
      return $('.' + this.slideClass).width();
    },

    /**
     * @memberOf Slide
     * @summary 判断是否有位置标签
     * @return {Boolean} [description]
     */
    isPagePoint: function () {
      var pagePoint = $('.' + this.pagePoint);
     
      return (pagePoint.length > 0);
    },

    /**
     * @memberOf Slide
     * @summary 初始化位置标签
     * @type {function}
     */
    initPagePoint: function () {
      //获取所有
      var liPoints = $('.' + this.itemClass);
      liPoints.removeClass(this.showClass);
      //获取第一个内容标签添加当前展示class
      liPoints.first().addClass(this.showClass);
      
      if (this.isPagePoint()) {
        this.isHasPoint = true;
        //移除所有page焦点位置  第一个添加当前展示class (底部nav point)
        $('.' + this.pagePoint).removeClass(this.showLocationClass).first().find('li:first').addClass(this.showLocationClass);
      }
      
      if (this.loop) {
        this.cloneDom();
      }
    },
    /**
     * @memberOf Slide
     * @summary 克隆第一个和最后一个dom 并改变其实位置
     * @type {function}
     */
    cloneDom: function () {
      
      if (this.loop) {
        var $firstCloneEle = $('.' + this.itemClass).first().clone().addClass(this.firstClone);
        var $lastCloneEle = $('.' + this.itemClass).last().clone().addClass(this.lastClone);
        this.$slideWrap.prepend($lastCloneEle);
        this.$slideWrap.append($firstCloneEle.removeClass(this.showClass));
        this.$slideWrap.css('-webkit-transform', 'translateX(-' + this.getItemWidth() + 'px)');
      }
    },

    /**
     * @memberOf Slide
     * @summary 事件初始化
     * @type {function}
     */
    eventInit: function () {
      var _self = this;
      var start, move, end;
      //根据浏览器判断对应的事件类型
      start = this.isMobile ? 'touchstart' : 'mousedown';
      move = this.isMobile ? 'touchmove' : 'mousemove';
      end = this.isMobile ? 'touchend' : 'mouseleave click';
      
      this.$slideWrap.on(start, function (event) {
        
        if (!_self.isLock) {
          _self.touchStart(event);
        }
      });
      
      this.$slideWrap.on(move, function (event) {
        
        if (!_self.isLock) {
          _self.touchMove(event);
        }
      });

      this.$slideWrap.on(end, function (event) {
        _self.touchEnd(event);
        
        return false;
      });

      if (this.auto) {
        this.autoScroll();
      }
    },

    /**
     * @memberOf Slide
     * @summary 根据索引滚动
     * @param  {number}   index -移动索引
     * @param  {Function} fn    -动画结束回调函数
     */
    moveByIndex: function (index, fn) {
      var _self = this;
      //移动距离
      var _width = -1 * index * this.getItemWidth();
      fn = fn || function () {};
      //移动时临时锁定
      $('.' + this.slideClass).animate({'-webkit-transform': 'translateX(' +  _width + 'px)'}, _self.moveSpeed, fn);
    },

    /**
     * @memberOf Slide
     * @summary 移动函数
     * @type {function}
     * @param  {string} type -滑动类型,向左(next)滑动还是向右(prev)滑动
     */
    scrollMove: function (type) {
      var _self = this;
      
      if (!this.isLock) {
        //当前元素
        var curTag = $('.' + this.showClass),
          locationTag = $('.' + this.pagePoint).find('li'),
          ulTag = $('.' + _self.itemClass),
        //目标元素
          destiTag = (type === 'prev') ? curTag.prev() : curTag.next(),
          index = destiTag.index();
        this.isLock = true;

        if (this.moveFlag) {
          
          if (this.loop) {
            //移动所需变量
            var focusIndex, _distance, locationIndex;
            //移除之前标识
            curTag.removeClass(this.showClass);
            //临界
            if (destiTag.hasClass(_self.firstClone) || destiTag.hasClass(_self.lastClone)) {
              
              if (type === 'next') {
                focusIndex = 1;
                locationIndex = 0;
                _distance = _self.getItemWidth() * (-1) + 'px';
              
              } else {
                focusIndex = ulTag.length - 2;
                locationIndex = locationTag.length - 1;
                _distance = _self.getItemWidth() * (-1) * focusIndex + 'px';
              }
              this.moveByIndex(index, function () {
                ulTag.eq(focusIndex).addClass(_self.showClass);
                _self.changePoint(locationIndex);
                _self.$slideWrap.css('-webkit-transform', 'translateX(' + _distance + ')');
                _self.isLock = false;
              });
            
            } else {
              this.moveByIndex(index, function () {
                destiTag.addClass(_self.showClass);
                _self.changePoint(index - 1);
                _self.isLock = false;
              });
            }

          } else {
            
            if (destiTag.length === 0) {
              
              this.moveByIndex(curTag.index(), function () {
                _self.isLock = false;
              });

            } else {
              //移除之前标识
              curTag.removeClass(this.showClass);
              
              this.moveByIndex(index, function () {
                destiTag.addClass(_self.showClass);
                _self.isLock = false;
                _self.changePoint(index);
              });
            }
          }
          
        } else {
          
          this.moveByIndex(curTag.index(), function () {
            _self.isLock = false;
          });
        }
      }
    },

    /**
     * @memberOf Slide
     * @summary 根据位置索引改变位置标签
     * @type {function}
     * @param  {number} index -位置标签索引
     */
    changePoint: function (index) {
      //变更底部焦点
      if (this.isHasPoint) {
        $('.' + this.pagePoint).find('li').removeClass(this.showLocationClass);
        $('.' + this.pagePoint).find('li').eq(index).addClass(this.showLocationClass);
      }
    },

    /**
     * @memberOf Sldie
     * @summary 自动滚动
     * @type {function}
     */
    autoScroll: function () {
      var _self = this;
      clearInterval(this.timer);
      
      this.timer = setInterval(function () {
        _self.scrollMove('next');
      }, this.autoSpeedInterval);
    },

    /**
     * @memberOf Slide
     * @summary 触摸start事件
     * @type {function}
     * @param  {object} e -事件对象
     */
    touchStart: function (e) {
      
      if (this.auto) {
        clearInterval(this.timer);
      }
      //记录触摸起始点的x y坐标
      this.startX = this.isMobile ? e.touches[0].pageX : e.clientX;
      this.startY = this.isMobile ? e.touches[0].pageY : e.clientY;
      //记录当前移动的 translateX
      this.listTranslate = $('.' + this.slideClass).offset().left;
      
      if (!this.isMobile) {
        this.pcDragFlag = true;
      }
    },

    /**
     * @memberOf Slide
     * @summary 触摸move事件
     * @type {function}
     * @param  {object} e -事件对象
     */
    touchMove: function (e) {
      //如果当前为鼠标操作
      if (!this.isMobile) {
        //为处于拖拽状态
        if (!this.pcDragFlag) {

          return;
        }
      }
      
      //记录触摸起始点的x y坐标
      var moveX = this.isMobile ? e.touches[0].pageX : e.clientX;
      var moveY = this.isMobile ? e.touches[0].pageY : e.clientY;
      var xDist, yDist;
      //水平移动距离
      xDist = moveX > this.startX ? (moveX - this.startX) : (this.startX - moveX);
      //纵向移动距离
      yDist = moveY > this.startY ? (moveY - this.startY) : (this.startY - moveY);
      //缓存移动点坐标
      this.moveX = moveX;
      //水平距离大于纵向距离才移动
      if (xDist > yDist) {
        e.preventDefault();
        e.stopPropagation();
        
        var changeDist = this.listTranslate + (moveX - this.startX);
        //横向同步移动
        $('.' + this.slideClass).css('-webkit-transform', 'translateX(' + changeDist + 'px)');
      }
    },

    /**
     * @memberOf Slide
     * @summary 触摸end事件
     * @type {function}
     * @param  {object} e -事件对象
     */
    touchEnd: function (e) {
      // alert();
      if (!this.isMobile) {
        this.moveX = e.clientX;
        
        if (this.pcDragFlag) {
          this.pcDragFlag = false;
        
        } else {
          
          return;
        }
      }
      //点击处理
      if ((this.isMobile && this.moveX === 0) || (!this.isMobile && this.startX === this.moveX)) {
        
        if (e.target.nodeName === 'A' || $(e.target).parent().hasClass(this.aLinkClass)) {
          window.location.href = e.target.href || $(e.target).parent().attr('href');
        }
        
        return;
      }
      
      if (Math.abs(this.moveX - this.startX) < this.minMoveDist) {
        this.moveFlag = false;
      }

      if (this.moveX > this.startX) {
        this.scrollMove('prev');
      
      } else {
        this.scrollMove('next');
      }
      
      //重置标识位
      this.moveFlag = true;
      this.moveX = 0;
      
      if (this.auto) {
        this.autoScroll();
      }
    }
  };
  //外部接口 type:object
  module.exports = {
    Scroll: Slide.init
  };
});