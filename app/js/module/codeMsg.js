var codeMsg = {
    init: function() {
        $('[data-target-codemsg]').on('click', function() {
            const node = $($(this).attr('data-target-codemsg'));
            const msg = node.attr('data-codemsg');
            const re = /\{{([^}}]+)?}}/i;
            const baseMsg = node.text();
            var time = Number(re.exec(msg)[1]);
            if(!node.attr('data-state')) {
                node.attr('data-state', 'ing');
                node.text(msg.replace(re, time--));
                const tid = setInterval(function() {
                    if(time !== 0) {
                        node.text(msg.replace(re, time--));
                    } else {
                        clearInterval(tid);
                        node.text(baseMsg);
                        node.removeAttr('data-state');
                    }
                }, 1000);
            }
        });
    }
}
module.exports = codeMsg;
