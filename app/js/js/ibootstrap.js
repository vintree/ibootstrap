require('../../sass/ibootstrap.scss');

// 基本组件
import autoFont from '../common/autoFont.js';

// 功能组件
import Popup from "../module/popup.js";
import Tips from "../module/tips.js";
import ViewvReveal from "../module/viewReveal.js";

// 初始化 功能组件
autoFont.init();

Popup.init();
ViewvReveal.init();
Tips.init();
