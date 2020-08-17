!function () {

    var ready = false;

    var handleError = function (error, callback) {
        var errorInfo = null;
        if (typeof error == 'string') {
            errorInfo = {
                success: false,
                errorCode: 0,
                message: error
            };
        } else {
            errorInfo = error;
        }
        callback && (typeof callback === 'function') && callback(errorInfo);
    };

    var deviceready = function (callback) {
        document.addEventListener("deviceready", function () {
            ready = true;
            callback && callback();
        });
    }

    var render = function () {
        document.body.scrollTop = document.body.scrollTop + 1;
        document.body.scrollTop = document.body.scrollTop - 1;
    }

    deviceready(function () {
        ready = true;
    });

    window.reloadStyle = function () {
        var link = document.getElementById('defaultCss');
        link.href = link.href.replace(/\?.*|$/, '?r=' + new Date().getTime());
    }

    window.replaceImage = function (originalSrc, replaceSrc) {
        var img = document.querySelectorAll('img[data-src="' + originalSrc + '"]');
        for (var i = 0; i < img.length; i++) {
            img[i].src = replaceSrc;
            img[i].classList.remove('loading-image');
            img[i].removeAttribute('data-src');
        }
        render();
    }

    window.getDocumentHeight = function () {
        return document.body.offsetHeight;
    }


    window.replaceHtmlAndBodyBg = function(){
        document.getElementById('main').setAttribute('style', 'background:#fff');
        var objs = document.getElementsByTagName("div");
        for(var i=0;i<objs.length;i++) {
            objs.setAttribute('style','background:#fff');
        }
    }

}();