/*
var headData = {
  //页面title
  tit: '首页-知乎',
  //分享出去的title
  shareName: '首页-知乎',
  //分享出去的url
  shareUrl: 'http://fans.tv.sohu.com/h5/vstar/star_result.html',
  //分享出去的图片
  shareImg: 'http://tv.sohu.com/upload/clientapp/vstar/img/default_share_logo.jpg',
  //分享出去的描述
  shareDesc: '搜狐V星团是为粉丝精心打造的追星互动平台！只要你来，就有机会零距离接触明星！快为你最爱的明星点赞吧！',
  //SEO关键字
  keywords: '搜狐V星团',
  //SEO描述
  desc: '搜狐V星团是为粉丝精心打造的追星互动平台！只要你来，就有机会零距离接触明星！快为你最爱的明星点赞吧！'
  //第二代微信配置
  admins: '25250114746637056375',
  //页面ico
  favicon: 'http://m.tv.sohu.com/favicon.ico',
  //自己的扩展配置，支持List，String
  // extend: ''
}
*/
var Head = function() {};
Head.init  = function(data) {
    var head = '', i, l, extend;
    extend = data.extend;
    // head += '<meta charset="utf-8" />';
    head += '<meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, width=device-width" />';
    head += '<meta name="format-detection" content="telephone=no" />';
    head += '<meta name="og:url" property="og:url" content="'+data.shareUrl+'" />';
    head += '<meta name="og:site_name" property="og:site_name" content="'+(data.shareName || data.tit)+'" />';
    head += '<meta name="og:title" property="og:title" content="'+(data.shareName || data.tit)+'" />';
    head += '<meta name="og:image" property="og:image" content="'+(data.shareImg || data.defaultImg)+'" />';
    head += '<meta name="og:desc" property="og:desc" content="'+data.shareDesc+'" />';
    head += '<meta name="keywords" property="keywords" content="'+data.keywords+'" />';
    head += '<meta name="description" property="description" content="'+data.desc+'" />';
    head += '<meta property="qc:admins" content="'+data.admins+'"/>';
    head += '<title>'+ data.tit +'</title>';
    head += '<link rel="shortcut icon" type="image/x-icon" href="'+data.favicon+'"/>';
    head += '<link type="text/css" rel="stylesheet" href="../font/css/font-awesome.min.css">';
    if(!!extend) {
        if(Object.prototype.toString.call(extend) === '[object Array]') {
            data.extend.map((v, i) => {head += v});
        } else if(Object.prototype.toString.call(extend) === '[object String]') {
            head += extend;
        }
    }
    document.head.innerHTML = document.head.innerHTML + head;
}
module.exports = Head;
