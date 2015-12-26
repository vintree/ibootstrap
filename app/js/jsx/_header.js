/*   AMD   */

//var React = require('react');
//var Hello = React.createClass ({
//    render() {
//        return (
//            <h1>Hello {this.props.name}!</h1>
//        );
//    }
//});
//module.exports = Hello;

/*   ES6   */
import React from 'react';
import $ from 'jquery';

class LoginUser extends React.Component{
    constructor() {
        super();
    }
    render() {
        return (
            <div id="header-userInfoBox" className="header-userInfoBox">
                <a id="header-user-1" className="header-user-1">
                    <div className="header-userImgBox">
                        <img id="header-userImg" className="header-userImg" src="../img/user.png" />
                    </div>
                    <div className="header-userNameBox">
                        <span>五谷子</span>
                    </div>
                    <ul className="header-extendBox">
                        <li>
                            <i className="afa-extend fa fa-envelope"></i>
                            <span>私信</span>
                        </li>
                        <li>
                            <i className="afa-extend fa fa-gear"></i>
                            <span>设置</span>
                        </li>
                        <li>
                            <i className="afa-extend fa fa-power-off"></i>
                            <span>退出</span>
                        </li>
                    </ul>
                </a>
                <div className="header-user-2">
                    <a className="afa-power-off fa fa-user"></a>
                </div>
            </div>
        );
    }
}


class UnLoginUser extends React.Component{
    constructor() {
        super();
    }
}


export default class Header extends React.Component {
    dataJson(val) {
        var dataTopic, dataUser, dataQ;
        dataTopic = {
            '知': ['知乎', '知乎社区', '知乎指南'],
            '知乎': ['知乎', '知乎社区', '知乎指南']
        };
        dataUser = {
            '知': ['知道', '知晓', '知知'],
            '知乎': ['知乎者也', '知乎果壳', '知乎小楠']
        };
        dataQ = {
            '知': ['知乎大牛有那些', '春知晓', '搜狗投资知乎的意义'],
            '知乎': ['知乎有哪些高质量问答', '知乎如何赢利', '知乎在bat的战略地位']
        }
        return [dataTopic[val], dataUser[val], dataQ[val]];
    }

    handleInput(e) {
        var val = this.refs.search.value.trim();
        console.log(this.dataJson(val));
    }

    handleFocus(e) {
        $('#header-rsBox').addClass('active');
    }

    handleBlur(e) {
        $('#header-rsBox').removeClass('active');
    }

    handleMouseDown(e) {
        // alert('dada');
        e.preventDefault();
        // e.stopPropagation();

        $('#zh-top-search-input').focus();
        // alert('dasd');
    }

    render() {
        return (
            <header id="header-container">
                <div id="header-box">
                    <a id="zh-top-link-logo" className="zh-top-link-logo" href=""></a>
                    <div id="zh-top-search-box" className="zh-top-search-box">
                    <form method="GET" action="/">
                        <input id="zh-top-search-input" className="zh-top-search-input" onBlur={e=>{this.handleBlur(e)}} onFocus={e=>{this.handleFocus(e)}} onInput={e=>{this.handleInput(e)}} type="text" ref="search" placeholder="搜索问题、话题或人" />
                        <i className="afa-search fa fa-search"></i>
                        <ul id="header-rsBox" className="header-rsBox" onMouseDown={e=>{this.handleMouseDown(e)}}>
                            <li className="header-rsTit">问题</li>
                            <li className="header-list header-questionList">
                                <div>知乎都有哪些值得推荐的专栏？</div>
                                <span>70 个回答</span>
                            </li>
                            <li className="header-rsTit">话题</li>
                            <li className="header-list header-topicList">
                                <span className="header-topicName">知乎</span>
                                <span className="header-topicNum">999个精华问题</span>
                            </li>
                            <li className="header-list header-topicList">
                                <span className="header-topicName">知乎社区</span>
                                <span className="header-topicNum">1000个精华问题</span>
                            </li>
                            <li className="header-rsTit">用户</li>
                            <li className="header-list header-userList">
                                <div className="header_userImgBox"><img src="../img/da8e974dc_s.jpg" /></div>
                                <div className="header-userName"><b>知乎</b><span>无介绍</span></div>
                                <div className="header_userInfo">
                                    <span>回答: 12 • </span>
                                    <span>赞: 20 • </span>
                                    <span>感谢: 2</span>
                                </div>
                            </li>
                            <li className="header-list header-userList">
                                <div className="header_userImgBox"><img src="../img/da8e974dc_s.jpg" /></div>
                                <div className="header-userName"><b>小张</b><span>初出茅庐，请多关照</span></div>
                                <div className="header_userInfo">
                                    <span>回答: 30 • </span>
                                    <span>赞: 12 • </span>
                                    <span>感谢: 21</span>
                                </div>
                            </li>
                        </ul>
                    </form>
                    </div>
                    <ul className="header-columnBox">
                        <li>首页</li>
                        <li>话题</li>
                        <li>发现</li>
                        <li>消息</li>
                    </ul>

                    <LoginUser />

                    <div className="header-questionBox">
                        <span>提问</span>
                    </div>
                </div>
            </header>
        );
    }
}
