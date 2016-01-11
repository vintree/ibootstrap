/*
    菜单
*/
var popover = {
    init: function() {
        var node;
        // $('[data-targetPopover]').on('touchend', function() {
        //     // node = $($(this).data('target'));
        //     alert('dasd');
        //
        // });
        // var timeid;
        // var node = document.querySelector('[data-targetPopover]');
        // node.addEventListener('touchend', function() {
        //     timeid = setTimeout(function() {
        //         this.longPress();
        //     }, 500);
        // });
        //
        // node.addEventListener('')

        // $('[data-targetPopover]').addEventListener('touchend', function() {
        //
        // })
        this.longPress();
        this.dismiss();
    },
    longPress: function() {
        var th = this;
        var timeOutEvent = 0;
        var node = document.querySelector('[data-targetPopover]');
        var targetName = node.getAttribute('data-targetPopover');
        node.addEventListener('touchstart', function(e) {
            timeOutEvent = setTimeout(function() {
                th.modal(node, targetName);
            }, 500);
            return false;
        });

        node.addEventListener('touchend', function() {
            clearTimeout(timeOutEvent);
            if(timeOutEvent !== 0) {
                // alert('no long');
            }
        });

        node.addEventListener('touchmove', function() {
            if(!!timeOutEvent) {
                clearTimeout(timeOutEvent);
                timeOutEvent = 0;
            }
        });
    },
    modal: function(node, targetName) {
        var popover = $(targetName);
        var top = node.offsetTop - window.scrollY - popover.height();
        console.log(top);
        $(targetName).css('top', top);
        // console.log(node.offsetTop);
    },
    dismiss: function() {
        var node;
        $('[data-closePopover]').on('click', function() {
            Events.touchmove();
            node = $(this).parents($(this).data('closePop'));
            if(node.hasClass('pop')) {
                node.addClass('fade').removeClass('fadeIn');
                setTimeout(function() {
                    node.removeClass('fade');
                }, 300);
            }
        });
    }
}

module.exports = popover;
