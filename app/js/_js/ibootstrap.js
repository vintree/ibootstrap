require('../../sass/ibootstrap.scss');

// 基本组件
import autoFont from '../common/autoFont.js';

// 功能组件
import Popup from "../js/popup.js";
import Tips from "../js/tips.js";
import ViewvReveal from "../js/viewReveal.js";

// 初始化 功能组件
autoFont.init();

Popup.init();
ViewvReveal.init();
Tips.init();
