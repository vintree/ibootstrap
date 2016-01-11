require('../../sass/ibootstrap.scss');
import React from 'react';
import ReactDOM from 'react-dom';
import autoFont from '../common/autoFont.js';
import addScript from '../common/addScript.js';
import Header from './_header';
import List from './_list.js';
import Head from '../temp/head.js';

// ibootstrap 相关组件
import Tips from "../js/tips.js";
import Alert from "../js/alert.js";
import Confirm from "../js/confirm.js";
import Popup from "../js/popup.js";
import ViewvReveal from "../js/view-reveal.js";
import Popover from "../js/popover.js";
import Modal from "../js/util/modal.js";

autoFont.init();

Popup.init();
ViewvReveal.init();
Popover.init();
Tips.init();

// Modal.init();

window._alert = Alert;
window._confirm = Confirm;


// var headData = {
//   tit: '首页-知乎',
//   shareName: '首页-知乎',
//   shareUrl: 'http://fans.tv.sohu.com/h5/vstar/star_result.html',
//   shareImg: 'http://tv.sohu.com/upload/clientapp/vstar/img/default_share_logo.jpg',
//   shareDesc: '搜狐V星团是为粉丝精心打造的追星互动平台！只要你来，就有机会零距离接触明星！快为你最爱的明星点赞吧！',
//   keywords: '搜狐V星团',
//   desc: '搜狐V星团是为粉丝精心打造的追星互动平台！只要你来，就有机会零距离接触明星！快为你最爱的明星点赞吧！',
//   admins: '25250114746637056375',
//   favicon: '../img/favicon.ico',
// }


// Head.init(headData);

// class Index extends React.Component{
//     constructor() {
//         super();
//     }
//     render() {
//         return (
//             <div>
//                 <section>
//                     <Header name="Nate" />
//                 </section>
//                 <section>
//                     <List name="Nate" />
//                 </section>
//             </div>
//         )
//     }
// }
//
//
//
// ReactDOM.render(<Index name="Nate" />, document.getElementById('header'));
