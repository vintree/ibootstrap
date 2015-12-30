require('../../sass/ibootstrap.scss');


// ibootstrap 相关组件
import Tips from "../js/tips.js";
import Alert from "../js/alert.js";
import Confirm from "../js/confirm.js";
Tips.init();
// Alert.init();
Confirm.init();

window._confirm = Confirm;

var headData = {
  tit: '首页-知乎',
  shareName: '首页-知乎',
  shareUrl: 'http://fans.tv.sohu.com/h5/vstar/star_result.html',
  shareImg: 'http://tv.sohu.com/upload/clientapp/vstar/img/default_share_logo.jpg',
  shareDesc: '搜狐V星团是为粉丝精心打造的追星互动平台！只要你来，就有机会零距离接触明星！快为你最爱的明星点赞吧！',
  keywords: '搜狐V星团',
  desc: '搜狐V星团是为粉丝精心打造的追星互动平台！只要你来，就有机会零距离接触明星！快为你最爱的明星点赞吧！',
  admins: '25250114746637056375',
  favicon: '../img/favicon.ico',
}

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
