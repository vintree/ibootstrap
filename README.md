# ibootstrap

<!--![](http://photocdn.sohu.com/20150527/mp16641068_1432725337643_1_th.jpeg =100x80)
-->
### 分享
[Github 懒加载动画组件jpro](https://github.com/wuguzi/jpro)

[Github 「知乎PC、Head部分」react (0.1.4.2) + webpack + es6静态用法](https://github.com/wuguzi/reack-zhihu)

[GitHub google地图使用方法 + demo](https://github.com/wuguzi/googleMapApi)

[GitHub 移动端UI库ibootstrap](https://github.com/wuguzi/ibootstrap)

### 下面会说明适用方法,如果想看效果前往

> app/html/index.html里面有全部效果实现

### ibootstrap针对移动端开发的UI库；

#####看似相同，其实大有变化：

* 未采用媒体查询策略，减少了大量冗余代码。

* 针对不用屏幕尺寸做了精细调整，去除了大、中、小尺寸的额外样式。

* table在移动端使用非常少见，所以该版本未加入table样式。

* ibootstrap只针对移动端，减少了不必要的前缀兼容，可以看成jQuery和Zepto的关系。

* 直接引入 ibootstrap.all.min.js || ibootstrap.all.js 即可完成样式注入，其中包含了组件功能。

* 同时把ibootstrap.all.min.js 拆分成 iboostrap.min.css + ibootstrap.min.js。


##### 使用前请提前导入jquery或zepto

### 基本样式「多图，若没有请科学上网！」

##### checkbox-inline
<!--![](http://c.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=255a46349a16fdfadc6cc2ea84bfb725/dbb44aed2e738bd431a90f2ea68b87d6277ff921.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/checkbox-inline.png)

```
	<div class="checkbox-inline">
        <label class="checkbox-label">
            <input type="checkbox" id="inlineCheckbox1" value="option1">
            <span class="checkbox-describe">1</span>
        </label>
        <label class="checkbox-label">
            <input type="checkbox" id="inlineCheckbox2" value="option2">
            <span class="checkbox-describe">2</span>
        </label>
        <label class="checkbox-label">
            <input type="checkbox" id="inlineCheckbox3" value="option3">
            <span class="checkbox-describe">3</span>
        </label>
    </div>

```
##### checkbox-block

<!--![](http://e.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=a9d70d1ae2dde711e3d247f297dff56a/3812b31bb051f819faadbe55ddb44aed2e73e721.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/checkbox-block.png)


```
	<div class="checkbox-group checkbox-block">
        <label class="checkbox-label">
            <input type="checkbox" id="inlineCheckbox1" value="option1">
            <span class="checkbox-describe">1</span>
        </label>
        <label class="checkbox-label">
            <input type="checkbox" id="inlineCheckbox2" value="option2">
            <span class="checkbox-describe">2</span>
        </label>
        <label class="checkbox-label">
            <input type="checkbox" id="inlineCheckbox3" value="option3">
            <span class="checkbox-describe">3</span>
        </label>
    </div>

```
##### radio-inline

<!--![](http://d.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=1f8b391a34fa828bd52399e7cd2f7a45/a1ec08fa513d2697fa5bb54252fbb2fb4316d821.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/radio-inline.png)


```
	<div class="radio-inline">
        <label class="radio-label">
            <input type="radio" id="inlineCheckbox1" value="option1" name="radio1">
            <span class="radio-describe">1</span>
        </label>
        <label class="radio-label">
            <input type="radio" id="inlineCheckbox2" value="option2" name="radio1">
            <span class="radio-describe">2</span>
        </label>
        <label class="radio-label">
            <input type="radio" id="inlineCheckbox3" value="option3" name="radio1">
            <span class="radio-describe">3</span>
        </label>
    </div>

```
##### checkbox-block

<!--![](http://g.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=4fed44906b81800a6ae58d0a8105088b/8b13632762d0f7030f3a28c30ffa513d2697c521.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/radio-block.png)

```
	<div class="radio-group checkbox-block">
        <label class="radio-label">
            <input type="radio" id="inlineCheckbox1" value="option1" name="radio2">
            <span class="radio-describe">1</span>
        </label>
        <label class="radio-label">
            <input type="radio" id="inlineCheckbox2" value="option2" name="radio2">
            <span class="radio-describe">2</span>
        </label>
        <label class="radio-label">
            <input type="radio" id="inlineCheckbox3" value="option3" name="radio2">
            <span class="radio-describe">3</span>
        </label>
    </div>

```

##### button-inline

<!--![](http://g.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=bc0c2c204cfbfbedd859327b48c0cc47/30adcbef76094b364a0ca6f2a4cc7cd98d109d17.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/button-inline.png)


```
	<div class="btn-group btn-inline">
        <button class="btn btn-default btn-radius" >(默认样式)</button>
        <button class="btn btn-primary">(首选项) Primary</button>
        <button class="btn btn-success">(成功) Success</button>
        <button class="btn btn-info">(一般信息) Info</button>
        <button class="btn btn-warning">(警告) Warning</button>
        <button class="btn btn-danger">(警告) Danger</button>
    </div>

```


##### button-block

<!--![](http://b.picphotos.baidu.com/album/s%3D900%3Bq%3D90/sign=de5a46349a16fdfadc6ccaee84b4fd69/f703738da9773912caae387eff198618367ae221.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/button.png)


```
	<div class="btn-group">
        <button class="btn btn-default btn-radius">(默认样式)「alert」</button>
        <button class="btn btn-primary btn-unradius">(首选项) Primary「confirm」</button>
        <button class="btn btn-success">(成功) Success「多选」</button>
        <button class="btn btn-info">(一般信息) Info 「单选」</button>
        <button class="btn btn-warning">(警告) Warning 「tips-top」</button>
        <button class="btn btn-danger">(警告) Danger 「view」</button>
    </div>

```

* .btn 样式默认带有圆角样式,如果不需要可加上.btn-unradius
* 如果需要半圆角样式,可加上.btn-radius
* 背景颜色可参考 bootstrap

##### button-block 不可点击

<!--![](http://c.picphotos.baidu.com/album/s%3D900%3Bq%3D90/sign=4b8a30217cec54e745ec161e8903ea6d/79f0f736afc3793160e03b36ecc4b74543a91120.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/button-disabled.png)


```
	<div class="btn-group">
        <button class="btn btn-default btn-radius" disabled="disabled">(默认样式)</button>
        <button class="btn btn-primary" disabled="disabled">(首选项) Primary</button>
        <button class="btn btn-success" disabled="disabled">(成功) Success</button>
        <button class="btn btn-info" disabled="disabled">(一般信息) Info</button>
        <button class="btn btn-warning" disabled="disabled">(警告) Warning</button>
        <button class="btn btn-danger" disabled="disabled">(警告) Danger</button>
    </div>

```
* 在属性上添加 disabled="disabled" 即可添加不可点击样式

##### button-block 长度

<!--![](http://d.picphotos.baidu.com/album/s%3D900%3Bq%3D90/sign=d3bbf3c353e736d15c138008ab6b3eff/f636afc379310a55d8ac63ebb04543a982261020.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/button-col.png)

```
	<div class="btn-group">
        <div class="col-md-2">
            <button class="btn btn-default btn-radius" disabled="disabled">(默认样式)</button>
        </div>
        <div class="col-md-4">
            <button class="btn btn-primary" disabled="disabled">(首选项) Primary</button>
        </div>

        <div class="col-md-6">
            <button class="btn btn-success" disabled="disabled">(成功) Success</button>
        </div>

        <div class="col-md-8">
            <button class="btn btn-info" disabled="disabled">(一般信息) Info</button>
        </div>

        <div class="col-md-10">
            <button class="btn btn-warning" disabled="disabled">(警告) Warning</button>
        </div>

        <div class="col-md-12">
            <button class="btn btn-danger" disabled="disabled">(警告) Danger</button>
        </div>
    </div>

```
* 在该实例可以看到col-md-*的功能


##### form表单

<!--![](http://h.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=1690341e5b6034a82de2bc85fb237225/e824b899a9014c08e1b395ba0d7b02087bf4f421.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/form.png)


```
EQ1:
	<div class="form-group">
        <div class="inp-group">
            <input type="search" placeholder="邮箱、手机号">
        </div>
        <div class="inp-group inp-code">
            <input type="tel" placeholder="输入密码">
            <span class="inp-code-btn">获取验证码</span>
        </div>
        <div class="inp-group">
            <input type="password" placeholder="输入密码">
        </div>
    </div>

EQ2:
    <div class="form-group">
        <div class="inp-group">
            <label>账号:</label>
            <input type="search" placeholder="邮箱、手机号">
        </div>
        <div class="inp-group inp-code">
            <label>验证码:</label>
            <input type="tel" placeholder="验证码">
            <span id="codeMsg" class="inp-code-btn" data-target-codemsg="#codeMsg" data-codemsg="{{5}}s后再次获取">获取验证码</span>
        </div>
        <div class="inp-group">
            <label>密码:</label>
            <input type="password" placeholder="输入密码">
        </div>
    </div>

```

##### 虽然还没有到介绍组件环节，但这里用到组件功能，需要提前提一下
>
    data-target-codemsg="#codeMsg" 触发事件标识
    data-codemsg="{{5}}s后再次获取"  触发时，展示的文档内容
    * 这个属性表示点击后，需要展示的文本内容，{{5}}表示倒计时时间，时间结束后，回复初始文本,看下图

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/code.png)

------------------------------------
##### list 列表

<!--![](http://e.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=d363870b45a7d933bba8e0779d7bea62/64380cd7912397dd7d94251b5e82b2b7d1a287c4.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/list.png)


```
	<div class="flist-group">
        <ul class="flist-unit-group">
            <li class="flist-icon cl-success"><i class="fa fa-user"></i></li>
            <li class="flist-icon cl-info"><i class="fa fa-download"></i></li>
            <li class="flist-icon cl-primary"><i class="fa fa-cog"></i></li>
        </ul>
        <ul class="flist-unit-group">
            <li class="flist-tx">
                <div class="flist-tit">用户中心</div>
                <div class="flist-rightIcon"><i class="fa fa-angle-right"></i></div>
            </li>
            <li class="flist-tx">
                <div class="flist-tit">离线缓存</div>
                <div class="flist-rightIcon"><i class="fa fa-angle-right"></i></div>
            </li>
            <li class="flist-tx">
                <div class="flist-tit">设置</div>
                <div class="flist-rightIcon"><i class="fa fa-angle-right"></i></div>
            </li>
        </ul>
    </div>

```
* 该样式使用到了 icon, 该项目使用 [fontawesome](http://fontawesome.io/icons/) 第三方库


### 组件
##### 开关按钮

<!--![](http://f.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=d2f4ca88de33c895a27e9c7fe1234881/0dd7912397dda14470e4d1adb5b7d0a20df486c4.jpg )

![](http://b.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=30932564d61373f0f13f6b9b943f708a/ac345982b2b7d0a2ed24b982ccef76094a369ac4.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/paButton1.png)
![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/paButton2.png)


```
	<div class="paButton btn-primary">
        <div id="paButton" class="paButton-layout paButton-off" data-target-paButton='.paButton-layout' data-state="off">
            <div class="paButton-botton"></div>
        </div>
    </div>

```
* .paButton-on 初始为开
* .paButton-off 初始为关
* 颜色使用btn 中设置的颜色
* data-target-paButton=".paButton-layout" 该属性内容表示该属性所在 dom 的唯一识别(id, class均可)
* data-state="off"  该属性内容需要和初始样式名称部分一致,
	* EQ: data-state="on"和.paButton-on同时出现才有效
	* EQ: data-state="off"和.paButton-off同时出现才有效
* $('#paButton').onPaButton(); 主动打开,可联动
* $('#offPaButton').offPaButton(); 主动关闭


##### 确认弹窗
<!--![](http://b.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=670bda49d7160924d825a61fe4370e8b/3b87e950352ac65cc1cedb6cfcf2b21192138ae2.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/confirm.png)


```

	<button class="btn btn-primary btn-unradius" data-target-pop="#confirm">(首选项) Primary「confirm」</button>


	<div id="confirm" class="pop pop-modal">
        <div class="pop-confirm">
            <div class="pop-body">数据库更新错误！</div>
            <div class="pop-foot">
                <div role='dismiss' data-close-pop=".pop">取消</div>
                <div role='confirm'>确定</div>
            </div>
        </div>
    </div>

```

* 动画: 仿真ios 效果
* 触发显示事件来自 data-target-pop="#confirm" 该属性内容需唯一找到 组件DOM(html)
* 触发取消事件来自 data-close-pop=".pop" 即可
	* 该属性放置父容器内有效
* $('#confirm').showPop()  主动显示
* $('#confirm').hidePop()  主动取消

##### popup 提醒弹窗
<!--![](http://b.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=a25afe264c36acaf5de092f84ce9b661/024f78f0f736afc31084827ab419ebc4b7451220.jpg
)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/alert.png)


```

	<button class="btn btn-default btn-radius" data-target-pop="#alert">(默认样式)「alert」</button>

	<div id="alert" class="pop pop-modal">
        <div class="pop-alert">
            <div class="pop-body">数据库更新错误！</div>
            <div class="pop-foot">
                <div id="alert-confirm" role='confirm'>确定</div>
            </div>
        </div>
    </div>

```
使用方式和 [确认弹窗]类似, 提醒几点不同

* alert确定 和 confirm 取消 其实是一样的功能, 但含义不同, 可在要取消的 dom 上放置 data-close-pop=".pop"即可


##### popup 多选弹窗
<!--![](http://c.picphotos.baidu.com/album/s%3D900%3Bq%3D90/sign=04a0fba2ae773912c0268961c822f725/b90e7bec54e736d1dd8d31179c504fc2d5626917.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/checkbox-group.png)


```
	<button class="btn btn-success" data-target-pop="#selectCheckbox">(成功) Success「多选」</button>

	<div id="selectCheckbox" class="pop pop-modal" role="checked">
        <div class="pop-box">
            <form>
                <div class="pop-head">配送条件</div>
                <div class="pop-body">
                    <div class="pop-box-group">
                        <label>
                            <input type="checkbox" value="">
                            <span class="pop-box-tx">周一至周五均可配送</span>
                        </label>
                    </div>
                    <div class="pop-box-group">
                        <label>
                            <input type="checkbox" value="">
                            <span class="pop-box-tx">周六周日均可配送</span>
                        </label>
                    </div>
                    <div class="pop-box-group">
                        <label>
                            <input type="checkbox" value="">
                            <span class="pop-box-tx">配送前电话确认</span>
                        </label>
                    </div>
                    <div class="pop-box-group">
                        <label>
                            <input type="checkbox" value="">
                            <span class="pop-box-tx">配送时附带发票</span>
                        </label>
                    </div>
                </div>
                <div class="pop-foot">
                    <div role='dismiss' data-close-pop=".pop">取消</div>
                    <div role='confirm'>确认</div>
                </div>
            </form>
        </div>
    </div>

```

##### popup 单选弹窗
<!--![](http://a.picphotos.baidu.com/album/s%3D1400%3Bq%3D90/sign=a32b73c2ac64034f0bcdc6029ff34240/77094b36acaf2edd4b1cf4f68a1001e9380193c4.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/radio-group.png)


```
	<button class="btn btn-info" data-target-pop="#selectRadio">(一般信息) Info 「单选」</button>

	<div id="selectRadio" class="pop pop-modal">
        <div class="pop-box">
            <form>
                <div class="pop-head">充值会员选项</div>
                <div class="pop-body">
                    <div class="pop-box-group">
                        <label>
                            <input type="radio" value="" name="optionsRadios">
                            <span class="pop-box-tx">1天会员 / 1元</span>
                        </label>
                    </div>
                    <div class="pop-box-group">
                        <label>
                            <input type="radio" value="" name="optionsRadios">
                            <span class="pop-box-tx">30天会员 / 18元</span>
                        </label>
                    </div>
                </div>
                <div class="pop-foot">
                    <div role='dismiss' data-close-pop=".pop">取消</div>
                    <div role='confirm'>确认</div>
                </div>
            </form>
        </div>
    </div>
```

##### tips 提醒
<!--![](http://g.picphotos.baidu.com/album/s%3D900%3Bq%3D90/sign=f0c702adbe014a90853e4abd994c482f/8c1001e93901213f56def3c353e736d12e2e95c4.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/tips.png)


```
    <button class="btn btn-warning" data-target-tips="#tips-top">(警告) Warning 「tips-top」</button>


	<div id="tips-top" class="tips tips-top-group tips-primary">
        <div class="tips-describe">帐号和密码不匹配，请重新尝试</div>
        <div class="tips-cancel" role="cancel" data-close-tips=".tips" ><i class="fa fa-close"></i></div>
    </div>
```
* 动画: 仿真ios 效果
* 触发显示事件来自 data-target-tips="#tips-top" 该属性内容需唯一找到 组件DOM(html)
* 触发取消事件来自 data-close-tips=".tips" 即可
	* 该属性放置父容器内有效
* $('#tips-top').showTips(time)  主动显示
	* time: 取消间隔时间
* $('#tips-top').hideTips()  主动取消


注意:

* data-target-tips="#tips-top" 其实触发了 $('#tips-top').showTips() 方法,如果不加参数,默认3000秒自动触发取消事件


##### view 视口
<!--![](http://c.picphotos.baidu.com/album/s%3D900%3Bq%3D90/sign=04d3fba2ae773912c0268961c822f725/b90e7bec54e736d1ddfe31179c504fc2d46269c4.jpg)-->

![](https://raw.githubusercontent.com/wuguzi/ibootstrap/master/showImg/view.png)

```
	<button class="btn btn-danger" data-target-view="#view">(警告) Danger 「view」</button>

	<div id="view" class="view view-modal">
        <div class="views view-reveal">
            <div class="view-head">
                <div role='dismiss' data-close-view=".view">取消</div>
                <div class="view-tit">基围虾、商品详情</div>
                <div role='confirm'>确认</div>
            </div>
            <div class="view-body">
                <p>中文学名：刀额新对虾</p>
                <p>拉丁学名：metapenaeus ensis(De Hann)</p>
                <p>别称：麻虾、虎虾、花虎虾、泥虾、基围虾、砂虾、红爪虾</p>
                <p>界：动物界</p>
                <p>门：节肢动物门</p>
                <p>纲：甲壳纲</p>
                <p>目：十足目</p>
                <p>亚目：游泳亚目</p>
                <p>科：对虾科</p>
                <p>属：新对虾属</p>
                <p>分布区域：日本东海岸，中国东海与南海，菲律宾、马来西亚、印尼及澳大利亚</p>
                <p>成功育苗时间：1986年</p>
                <p>英文名：Metapenaeus ensis</p>
                <p>------</p>
                <p>中文学名：刀额新对虾</p>
                <p>拉丁学名：metapenaeus ensis(De Hann)</p>
                <p>别称：麻虾、虎虾、花虎虾、泥虾、基围虾、砂虾、红爪虾</p>
                <p>界：动物界</p>
                <p>门：节肢动物门</p>
                <p>纲：甲壳纲</p>
                <p>目：十足目</p>
                <p>亚目：游泳亚目</p>
                <p>科：对虾科</p>
                <p>属：新对虾属</p>
                <p>分布区域：日本东海岸，中国东海与南海，菲律宾、马来西亚、印尼及澳大利亚</p>
                <p>成功育苗时间：1986年</p>
                <p>英文名：Metapenaeus ensis</p>
            </div>
        </div>
    </div>
```
* 动画: 仿真ios 效果
* 触发显示事件来自 data-target-view="#view" 该属性内容需唯一找到 组件DOM(html)
* 触发取消事件来自 data-close-view=".tips" 即可
	* 该属性放置父容器内有效
