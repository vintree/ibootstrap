"use strict";

var _tips = require("../js/tips.js");

var _tips2 = _interopRequireDefault(_tips);

var _alert = require("../js/alert.js");

var _alert2 = _interopRequireDefault(_alert);

var _confirm = require("../js/confirm.js");

var _confirm2 = _interopRequireDefault(_confirm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('../../sass/ibootstrap.scss');

// ibootstrap 相关组件

_tips2.default.init();
// Alert.init();
_confirm2.default.init();

window._confirm = _confirm2.default;

var headData = {
  tit: '首页-知乎',
  shareName: '首页-知乎',
  shareUrl: 'http://fans.tv.sohu.com/h5/vstar/star_result.html',
  shareImg: 'http://tv.sohu.com/upload/clientapp/vstar/img/default_share_logo.jpg',
  shareDesc: '搜狐V星团是为粉丝精心打造的追星互动平台！只要你来，就有机会零距离接触明星！快为你最爱的明星点赞吧！',
  keywords: '搜狐V星团',
  desc: '搜狐V星团是为粉丝精心打造的追星互动平台！只要你来，就有机会零距离接触明星！快为你最爱的明星点赞吧！',
  admins: '25250114746637056375',
  favicon: '../img/favicon.ico'
};

autoFont.init();
Head.init(headData);

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
