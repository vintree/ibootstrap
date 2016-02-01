// require('../../sass/ibootstrap.scss');

// 基本组件
import autoFont from '../common/autoFont.js';

// 功能组件
import Popup from "../module/popup.js";
import Tips from "../module/tips.js";
import ViewReveal from "../module/viewReveal.js";
import PaButton from "../module/paButton.js";
import CodeMsg from "../module/codeMsg";
// 初始化 功能组件
autoFont.init();

Popup.init();
Tips.init();
PaButton.init();
CodeMsg.init();

ViewReveal.init();
