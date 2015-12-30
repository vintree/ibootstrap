(function () {
	//声明svp中debug变量
	window.svp = window.svp || {};
    window.svp.debug = {};
	var startTime = Date.now();
	svp.debug.playerLoadStartTime = startTime ||0;
	svp.debug.playerPlayStartTime=0;
	svp.debug.playerLoadDomStartTime=0;
	svp.debug.playerLoadAdDataStartTime=0;
	svp.debug.playerLoadMediaDataStartTime=0;
	svp.debug.isShowPlayerPlayStartTime = false;
})();
