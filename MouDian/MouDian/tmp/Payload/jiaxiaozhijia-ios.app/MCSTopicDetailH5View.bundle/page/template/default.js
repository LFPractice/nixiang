!function () {

    var ready = false;

    var preDoms = document.querySelectorAll('.txt');

    [].forEach.call(preDoms, function (preEle) {
        var txt = preEle.innerHTML;
        txt = preEle.innerText.replace(/\r\n/g, '<span class="space"></span>');
        txt = preEle.innerText.replace(/\n/g, '<span class="space"></span>');
        preEle.innerHTML = txt;
    })

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


    window.replaceHtmlAndBodyBg = function () {
        document.getElementById('main').setAttribute('style', 'background:#fff');
        var objs = document.getElementsByTagName("div");
        for (var i = 0; i < objs.length; i++) {
            objs.setAttribute('style', 'background:#fff');
        }
    }

    var timeFormat = function (number) {
        var minute = parseInt(number / 60);
        var second = parseInt(number % 60);
        minute = minute >= 10 ? minute : "0" + minute;
        second = second >= 10 ? second : "0" + second;
        return minute + ":" + second;
    }

    /**
     * 添加话题音频控制
     * **/
    var audio = document.querySelector('#js-video');
    var showTimeEle = document.querySelector('#show-time');
    var durationEle = document.querySelector('#duration');
    var showLineEle = document.querySelector('#show-line');
    var controlBtn = document.querySelector('#js-play-pause');
    var bufferEle = document.querySelector('#buffer');



    if (audio) {
        audio.addEventListener('loadedmetadata', function () {
            durationEle.innerHTML = timeFormat(audio.duration);
        })

        audio.addEventListener('pause', function () {
            audioState = audio.paused;
            controlBtn.classList.remove('loading')
            controlBtn.classList.remove('playing')
        })

        audio.addEventListener('playing', function () {
            audioState = audio.paused;
            controlBtn.classList.remove('loading')
            controlBtn.classList.add('playing');
        })

        audio.addEventListener('timeupdate', function () {
            var playTime = timeFormat(audio.currentTime);
            showTimeEle.innerHTML = playTime;
            showLineEle.style.width = (audio.currentTime / audio.duration).toFixed(4) * 100 + "%";

        })

        document.addEventListener("visibilitychange", function () {
            var audioState = audio.paused;
            if (document.visibilityState == 'hidden') {
                audio.pause();
            } else {
                if(audioState){
                    audio.pause();
                }else{
                    audio.play();
                }
            }
        });

        controlBtn.addEventListener('click', function () {
            audio.addEventListener('play', function () {
                controlBtn.classList.add('loading')
                var bufferTime = setInterval(function () {
                    var butterIndex = audio.buffered.length;
                    if (butterIndex > 0 && audio.buffered != undefined) {
                        var bufferValue = audio.buffered.end(0) / audio.duration * 100 + "%";

                        bufferEle.style.width = bufferValue;
                        if (Math.abs(audio.duration - audio.buffered.end(butterIndex - 1)) < 1) {
                            bufferEle.style.width = '100%';
                            clearInterval(bufferTime);
                        }
                    }
                }, 100)
            })
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        })
    }


    // 添加视频控制
    var videoBtn = document.querySelector('#video-icon');
    var video = document.querySelector('#js-video-p');
    var vduration = document.querySelector('#v-duration');
    if (video) {
        videoBtn.addEventListener('click', function () {
            video.play();
            videoBtn.classList.add('hide');
        });

        video.addEventListener('loadedmetadata', function () {
            vduration.innerHTML = timeFormat(video.duration);

        })

        video.addEventListener('pause', function () {
            videoBtn.classList.remove('hide');
        })

        video.addEventListener('playing', function () {
            videoBtn.classList.add('hide');
        })

        video.addEventListener('click', function(){
            video.pause();
            videoBtn.classList.remove('hide').add('show');
        })

        video.addEventListener('timeupdate', function () {
            var playTime = timeFormat(video.currentTime);
            vduration.innerHTML = playTime;
        })

        document.addEventListener("visibilitychange", function () {
            var videoState = video.paused;
            if (document.visibilityState == 'hidden') {
                video.pause();
            } else {
                if(videoState){
                    video.pause();
                }else{
                    video.play();
                }

            }
        });

    }

}();