/****
 * 暴露接口
 *
 * 最近修改 2016.09.19 16:21
 *
 *
 * ****/
var __TEST_ENVIROMENT = location.host.match(/192|localhost/);

var __isIOS = !!window.navigator.userAgent.match(/iPhone|iPad|iPod/i);

var APPNameMap = {
    jkbd: '驾考宝典',
    mcbd: '买车宝典',
    qctt: '车友头条',
    qcwz: '违章查询'
};

Date.prototype.format = function (format) {

    var k;
    var week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    var o = {
        'M+': this.getMonth() + 1,
        'd+': this.getDate(),
        'h+': this.getHours() % 12,
        'H+': this.getHours(),
        'm+': this.getMinutes(),
        's+': this.getSeconds(),
        'q+': Math.floor((this.getMonth() + 3) / 3),
        'S+': this.getMilliseconds(),
        'W+': week[this.getDay()]
    };

    format = format || 'yyyy-MM-dd';

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    for (k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }

    return format;

};

//改变页面元素属性后，需要调用
window.render = function () {
    if (__isIOS) return;
    document.body.scrollTop = document.body.scrollTop + 1;
    document.body.scrollTop = document.body.scrollTop - 1;
};


//获取文章内容图片列表
window.getImgList = function () {
    return document.querySelectorAll('[data-imgindex]');
};

//替换页面图片地址
window.replaceImage = function (imgIndex, replaceSrc, blurFilter) {
    blurFilter = blurFilter === undefined ? false : !!blurFilter;
    var img = document.querySelector('[data-imgindex="' + imgIndex + '"]');
    if (img) {
        if (blurFilter) {
            img.classList.add("blurFilterIng");
            setTimeout(function (img) {
                return function () {
                    img && img.classList.remove("blurFilterIng");
                }
            }(img), 500);
        }
        img.src = replaceSrc;
        render();
    }
};

//设置图片样式 loading waiting
window.setMediaClass = function (imgIndex, className) {
    PageReady(function () {
        var img = document.querySelector('[data-imgindex="' + imgIndex + '"]');
        var $target;
        if (img) {
            $target = img.parentNode.parentNode;

            if (!$target.classList.contains('img-div')) {
                $target = $target.parentNode;
            }

            $target.className = "img-div " + className;

            render();
        }
    });
};

//获取一个图片在页面中的位置
window.getImgRect = function (imgIndex, isToString) {
    var img;
    if (typeof imgIndex === 'object') {
        img = imgIndex;
    } else {
        img = document.querySelector('[data-imgindex="' + imgIndex + '"]');
    }
    if (img) {
        var obj = img.getBoundingClientRect();
        var ret = {
            left: obj.left + window.pageXOffset,
            top: obj.top + window.pageYOffset,
            width: obj.width,
            height: obj.height
        };

        return isToString ? JSON.stringify(ret) : ret;
    }
};

 window.isImgLink = function (imgIndex) {
     var img = document.querySelector('[data-imgindex="' + imgIndex + '"]');
     if (!img) return '';
     if(img.parentNode.tagName.toUpperCase() === 'A'){
         return 'TRUE';
     }
     if(img.parentNode.parentNode.tagName.toUpperCase() === 'A'){
         return 'TRUE';
     }
     if(img.parentNode.parentNode.parentNode.tagName.toUpperCase() === 'A'){
         return 'TRUE';
     }
     return '';
 };

 
//获取一个图片的相关属性、data-type|data-lock|data-article|data-article-link|data-from
window.getImgAttr = function (imgIndex) {
    var img = document.querySelector('[data-imgindex="' + imgIndex + '"]');
    if (!img) return '';

    var ret = {
        src: attr(img, "data-src"),
        dataType: attr(img, "data-type"),
        dataLock: !!attr(img, "data-lock"),
        dataArticle: attr(img, "data-article"),
        ignoreClick: !!(attr(img, "data-article-link") || attr(img, "data-extra-link")),
        dataFrom: attr(img, 'data-from') === 'yongche' ? 'yongche' : 'xueche' // 产品说不是yongche就是xueche
    };

    return JSON.stringify(ret);
};


// 页面中所有图片的路径信息
var ImageAttrList = [];

// 获取页面中所有图片的信息
window.GetImageAttrList = function () {
    return JSON.stringify({imageList: ImageAttrList});
};


//更改文章字体大小 0-3
window.setFontSize = function (type) {
    type = Math.max(0, Math.min(3, parseInt(type)));
    var wapper = document.querySelector(".article-detail");
    var oldClassList = wapper.className.split(/\s+/);
    oldClassList = oldClassList.filter(function (e) {
        return !e.match(/^font/);
    });
    oldClassList.push("font-size" + type);

    wapper.className = oldClassList.join(" ");
    render();
};


//更新页面组件
window.refreshItem = function (itemType, itemId, refreshData, extraData) {
    PageReady(function () {
        if (itemType in window.refreshItem) {
            window.refreshItem[itemType](itemId, refreshData, extraData);
        }
    });
};


//给页面添加下载引导 图集、视频、文章底部
window.addDownloadGuide = function () {
    PageReady(function () {

        var albumList = document.querySelectorAll("[data-type=album]");
        var videoList = document.querySelectorAll("[data-type=video]");

        for (var i = 0; i < albumList.length; i++) {
            window.addDownloadGuide.item(albumList[i]);
        }
        for (var i = 0; i < videoList.length; i++) {
            window.addDownloadGuide.item(videoList[i]);
        }

        render();
    });
};

window.addDownloadGuide.item = function (item, noLink) {
    var tipText;
    var appInstallStatus = window.MC__EXTRADATA.kunbangAppInstallStatus || 1;

    // 0：头条客户端， 1:未下载 2：未安装 3：已安装
    var frag = document.createElement("div");
    var dataLock = item.getAttribute('data-lock');
    var dataArticle = item.getAttribute('data-article');
    var dataArticleTitle = item.getAttribute('data-article-title');
    var dataDGuide = item.getAttribute('data-dguide');
    var href = 'mc-opentt://qichetoutiao';
    var hrefAttr = [];

    tipText = dataArticleTitle || dataLock || dataDGuide || ((appInstallStatus == 2 ? '安装' : '下载') + window.MC__EXTRADATA.kunBangAppName + '，查看更多精彩内容');

    tipText += ' &gt;';


    frag.className = "down-load-guide";

    if (dataArticle) {
        hrefAttr.push("articleId=" + dataArticle);
    }

    hrefAttr.push("dataType=" + item.getAttribute('data-type'));
    hrefAttr.push("dataFrom=" + (item.getAttribute('data-from') === 'yongche' ? 'yongche' : 'xueche'));

    if (hrefAttr.length) {
        href += '?' + hrefAttr.join('&');
    }

    if (noLink === true) {
        frag.style.textAlign = 'center';
        frag.innerHTML = tipText.replace(' &gt;', '');
    }
    else {
        frag.innerHTML = "<a class='status-" + appInstallStatus + "' href='" + href + "'><p>" + tipText + "</p><span>打开车友头条</span></a>";
    }


    item.parentNode.parentNode.appendChild(frag);
};

window.addDownloadGuide.extraLink = function (item, articleData) {
    var tipText = '';
    var $link;
    var linkHref;
    var appInstallStatus = window.MC__EXTRADATA.kunbangAppInstallStatus || 0;
    var linkType = articleData.linkType || 'article';
    var appTitle = window.MC__EXTRADATA.kunBangAppName || '车友头条';
    var mcCurrentAppName;
    var isBreak;

    if (linkType === 'article') {
        // newsLinkType => 方便客户端统计
        linkHref = 'mc-opentt://qichetoutiao?articleId=';
        linkHref += articleData.id + '&dataType=' + item.getAttribute('data-type') + '&newsLinkType=3imgUnit';
        linkHref += '&dataFrom=' + (item.getAttribute('data-from') === 'yongche' ? 'yongche' : 'xueche');
    }
    // 车系捆绑安装只在 驾考/违章中出现
    else if (linkType === 'serial') {
        isBreak = (function () {
            var yingyongbao = encodeURIComponent('http://a.app.qq.com/o/simple.jsp?pkgname=com.baojiazhijia.qichebaojia&ckey=CK1348769772526');
            var protocolUrl = encodeURIComponent(Utils.stringFormat('http://car.nav.mucang.cn/car-serial/view?serialId={0}&serialName={1}', articleData.serialId, encodeURIComponent(articleData.serialName)));
            var baseUrl = 'mc-moon://moon/install?appId=5&pkg=com.baojiazhijia.qichebaojia&url={0}&protocol={1}&ruleId={2}&iosUrlSchem=mucang-maichebaodian&iosClientVersion=1.0';

            mcCurrentAppName = window.MC__EXTRADATA.mcCurrentAppName;
            appTitle = '买车宝典';

            if ((mcCurrentAppName !== 'jkbd' && mcCurrentAppName !== 'qcwz') || !appTitle) {
                return false;
            }

            if (!articleData.desc) {
                articleData.desc = '查看更多' + articleData.serialName + '高清大图';
            }

            linkHref = Utils.stringFormat(baseUrl, yingyongbao, protocolUrl, Utils.getByLevelKey(window.MC__EXTRADATA, 'mcAppInfo.mcbd.ruleId'));

            appInstallStatus = 1;
        })();

        if (isBreak === false) return;
    }
    else {
        return;
    }


    // 0：头条客户端， 1:未下载 2：未安装 3：已安装
    if (linkType === 'serial') {
        tipText = '打开' + appTitle + '，';
    }
    else if (appInstallStatus == 1) {
        tipText = '下载' + appTitle + '，';
    }
    else if (appInstallStatus == 2) {
        tipText = '安装' + appTitle + '，';
    }

    tipText += (articleData.desc || articleData.title) + ' &gt;';

    $link = Utils.createDom('a', 'article-link', undefined, {href: linkHref});

    item.parentNode.parentNode.appendChild($link);
    $link.appendChild(item.parentNode);

    // 显示小尾巴
    $link.appendChild(Utils.createDom('div', 'down-load-guide status-' + appInstallStatus, "<p>" + tipText + "</p><span>打开" + appTitle + "</span>"));
};


//给页面添加总体样式
window.setMainClass = function (className) {
    document.getElementsByClassName("article-detail")[0].classList.add(className);
};


//头部添加‘订阅’功能
window.setRSSButton = function (status, text, href) {
    var $addTemp = document.querySelectorAll('address');
    var $address;
    for (var i = 0, len = $addTemp.length; i < len; i++) {
        if ($addTemp[i].classList.contains('v2')) {
            $address = $addTemp[i];
            break;
        }
    }

    if (!$address) return;

    if (status == 1) text = '订阅';

    var $rss = $address.querySelector('.dingyu');
    if ($rss) $address.removeChild($rss);

    $rss = document.createElement('a');
    $rss.setAttribute('class', 'dingyu status' + status);
    $rss.setAttribute('href', href);
    $rss.innerHTML = text;

    $address.appendChild($rss);
};


//关闭页面所有的语音
window.StopAudio = function () {
    if (!window.__AudioList.length) return;
    for (var i = 0, len = window.__AudioList.length; i < len; i++) {
        window.__AudioList[i].pause();
    }
};


var TryAction = function (fun) {
    var ret;

    try {
        ret = fun();
    } catch (e) {
        console.warn(e);
    }

    return ret;
};


var attr = function (dom, name, v) {
    if (v === undefined) {
        return dom.getAttribute(name) || "";
    }
    dom.setAttribute(name, v);
};

//页面结构是否更新完
var PageReady = function (callback) {
    if (callback) PageReady.list.push(callback);
    if (!PageReady.ready) {

    } else {
        while (PageReady.list.length > 0) {
            var fun = PageReady.list.shift();
            fun();
        }
    }
};
PageReady.ready = false;
PageReady.list = [];


var ArticleTitle = "车友头条";


//工具函数
var Utils = {
    formatDate: function (timestamp, fmt) {
        if (typeof timestamp !== "object") timestamp = new Date(timestamp);
        fmt = fmt || "yyyy-MM-dd";

        var o = {
            "M+": timestamp.getMonth() + 1,
            "d+": timestamp.getDate(),
            "h+": timestamp.getHours() % 12,
            "H+": timestamp.getHours(),
            "m+": timestamp.getMinutes(),
            "s+": timestamp.getSeconds(),
            "q+": Math.floor((timestamp.getMonth() + 3) / 3),
            "S": timestamp.getMilliseconds()
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (timestamp.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    },

    parseWan: function (n, unit) {
        if (!n) return '暂无数据';
        unit = unit === undefined ? "元" : unit;
        n = parseInt(n);
        n = n > 10000 ? parseInt(n * 100 / 10000) / 100 + "万" : n + unit;
        return n;
    },

    parseDuration: function (during) {
        during = parseInt(during);
        if (!during) return '';
        var min = parseInt(during / 60);
        var sec = parseInt(during - min * 60);
        min = min ? min + "\'" : "";
        sec = sec ? sec + "\"" : "";
        return min + sec;
    },

    toCamelCase: function (str) {
        str = (str || "") + "";
        var re = /-(\w)/g;
        return str.replace(re, function () {
            var args = arguments;
            return args[1].toUpperCase();
        });
    },

    checkVar: function (xx, callback) {
        if (window[xx]) return callback();
        setTimeout(function () {
            Utils.checkVar(xx, callback)
        }, 50);
    },

    UUID: {
        Map: {},
        get: function (type) {
            if (!Utils.UUID.Map.hasOwnProperty(type)) Utils.UUID.Map[type] = 0;
            Utils.UUID.Map[type] += 1;
            return Utils.UUID.Map[type];
        }
    },

    loadScript: function (src, checkVal, callback) {
        var tag = document.createElement('script');
        tag.setAttribute('src', src);
        document.head.appendChild(tag);

        if (!callback) return;

        checkVal = checkVal || 'document';
        tag.onload = function () {
            Utils.checkVar(checkVal, callback);
        };
    },

    createDom: function (tagName, className, innerHtml, attrObj) {
        var dom = document.createElement(tagName);

        dom.setAttribute('class', className);
        if (className) dom.className = className;

        if (innerHtml) dom.innerHTML = innerHtml;

        if (attrObj) {
            for (var attr in attrObj) {
                dom.setAttribute(attr, attrObj[attr]);
            }
        }

        return dom;
    },

    stringFormat: function () {
        var str;
        var i;
        var re;
        var len = arguments.length;

        if (len === 0) {
            return null;
        }

        str = arguments[0];

        for (i = 1; i < len; i++) {
            re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            str = str.replace(re, arguments[i]);
        }

        return str;
    },

    getByLevelKey: function (target, key) {
        var keyList, len, i;

        if (!target || typeof target !== 'object') {
            return undefined;
        }

        keyList = key.toString().split('.');

        for (i = 0, len = keyList.length; i < len; i++) {
            target = target[keyList[i]];

            if (i < len - 1 && (typeof target !== 'object' || !target)) {
                return undefined;
            }
        }

        return target;
    }
};


//语音控制类
var Audio = function (dom) {

    var me = this;
    var audio = dom.getElementsByTagName("audio")[0];
    var hiddenPause;

    var updateInfo = function () {
        var during = audio.duration;
        if (!during) return;
        dom.getElementsByTagName("span")[0].innerHTML = Utils.parseDuration(during);

        var width = (during > 180 ? 100 : during * 100 / 180 ) * .75;
        dom.getElementsByClassName('video-btn')[0].style.width = width + '%';
    };


    this.tap = function () {
        if (audio.paused) {
            me.play();
        } else {
            me.pause();
        }
    };

    this.play = function () {
        dom.classList.add("playing");
        try {
            audio.play();
        } catch (e) {
        }
    };

    this.pause = function () {
        dom.classList.remove("playing");
        try {
            audio.pause();
        } catch (e) {
        }
    };


    //元数据加载完，更新播放时长
    audio.addEventListener("loadedmetadata", updateInfo, false);
    audio.addEventListener("readystatechange", updateInfo, false);
    audio.addEventListener("durationchange", updateInfo, false);


    //播放完毕
    audio.addEventListener("ended", function () {
        dom.classList.remove("playing");
    }, false);

    //点击事件
    dom.getElementsByClassName("video-btn")[0].addEventListener("click", function () {
        me.tap();
        return false;
    }, false);


    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            if (hiddenPause) {
                me.play();
                hiddenPause = false;
            }
        } else {
            if (!audio.paused) hiddenPause = true;
            me.pause();
        }
    });

};


// 格式化external数据
(function () {

    if (!window.MC__EXTRADATA) {
        window.MC__EXTRADATA = {};
    }

    // 投票
    if (window.MC__EXTRADATA.vote) {

        TryAction(function () {
            var voteMaps = {};
            var i;

            for (i = 0; i < MC__EXTRADATA.vote.length; i++) {
                voteMaps[MC__EXTRADATA.vote[i]['id']] = MC__EXTRADATA.vote[i];
            }

            window.MC__EXTRADATA.vote = voteMaps;
        });

        // 投票结果
        if (!window.MC__EXTRADATA.voteResults) window.MC__EXTRADATA.voteResults = {};

    }

    // 是否给图片加小尾巴
    window.MC__EXTRADATA.showDownLoadGuide = !!window.MC__EXTRADATA.showDownLoadGuide;

    // 订阅按钮
    // window.MC__EXTRADATA.RSSButton

    // 捆绑app中文名
    window.MC__EXTRADATA.kunBangAppName = window.MC__EXTRADATA.kunBangAppName || '车友头条';

    if (__TEST_ENVIROMENT) {
        // 头条app安装状态 0:当前就是头条，1:未下载 2：未安装 3：已安装
        window.MC__EXTRADATA.kunbangAppInstallStatus = 1;

        // 当前木仓app包名:qctt mcbd jkbd qcwz
        window.MC__EXTRADATA.mcCurrentAppName = 'jkbd';

        // 木仓app 信息
        window.MC__EXTRADATA.mcAppInfo = {
            mcbd: {installStatus: 1, ruleId: 2}
        };
    }

})();


(function () {

    var wapper = function (targetDom, wapperDom) {
        targetDom.parentNode.insertBefore(wapperDom, targetDom);
        wapperDom.appendChild(targetDom);
    };

    var parseDuring = function (during) {
        var min = Math.floor(during / 60);
        var sec = during - 60 * min;

        min = min > 9 ? min : ('0' + min);
        sec = sec > 9 ? sec : ('0' + sec);

        return min + ':' + sec;
    };


    var _h1 = document.getElementsByTagName("h1");
    if (_h1 && _h1[0]) {
        ArticleTitle = _h1[0].innerHTML.trim();
    } else {
        ArticleTitle = "车友头条";
    }


    var SCREEN = {
        width: window.clientWidthCFQ || document.documentElement.clientWidth
    };
    //SCREEN.contentWidth = SCREEN.width - (30 * (SCREEN.width / 720)) * 2 * 23/30;
    SCREEN.contentWidth = SCREEN.width - 2 * 23 * SCREEN.width / 720;


    //重置图片类样式
    var resetImgStyle = function (item) {
        var dataArticleLink;
        var data360Link;
        var title = attr(item, "title");
        var dataType = attr(item, "data-type");

        var wid = parseInt(attr(item, "width"));
        var hei = parseInt(attr(item, "height"));

        // 如果它父节点有data-from属性,设置到它上面
        var dataFrom = attr(item.parentNode, "data-from");

        if (dataFrom) {
            attr(item, "data-from", dataFrom === 'yongche' ? 'yongche' : 'xueche');
        }


        attr(item, "class", "");

        item.removeAttribute("alt");
        item.removeAttribute("title");
        item.removeAttribute("onclick");
        if (attr(item, "src").match(/error\.png$/)) {
            attr(item, "src", "");
        }

        //设置高度
        //大于屏幕尺寸
        if (wid > SCREEN.contentWidth) {
            item.style.height = ( SCREEN.contentWidth / wid * hei ) + "px";
        }
        //大于.333屏幕尺寸
        else if (wid > SCREEN.contentWidth * .333) {
            item.style.width = SCREEN.contentWidth + "px";
            item.style.height = ( SCREEN.contentWidth / wid * hei ) + "px";
        }
        //小尺寸图片
        else {
            item.style.width = wid + "px";
            item.style.height = hei + "px";
        }

        // 判断全景图
        data360Link = attr(item, 'data-360-link');

        dataArticleLink = TryAction(function () {
            var attrLink = decodeURIComponent(attr(item, 'data-extra-link') || attr(item, 'data-article-link') || '');
            return attrLink ? JSON.parse(attrLink) : undefined;
        });


        if (item.parentNode.className != "img-div") {
            var wapperDiv = Utils.createDom('div', 'img-div');
            var span = Utils.createDom("span", dataType);
            var imgWapper;

            if (data360Link) {
                //tagName, className, innerHtml, attrObj
                imgWapper = Utils.createDom("a", 'imgWapper panorama-image', null, {href: data360Link});
            } else {
                imgWapper = Utils.createDom("div", 'imgWapper');
            }

            //图集给出文案
            if (dataType === "album") {
                span.innerHTML = "相关图集";
            }

            wapperDiv.appendChild(imgWapper);
            imgWapper.appendChild(span);

            // 视频需要标题、时长
            if (dataType === 'video') {
                if (dataArticleLink) {
                    imgWapper.appendChild(Utils.createDom('p', 'v-title', dataArticleLink.title));
                }

                if (attr(item, 'duration')) {
                    imgWapper.appendChild(Utils.createDom('i', 'v-during', parseDuring(attr(item, 'duration'))));
                }
            }

            wapper(item, wapperDiv);
            imgWapper.appendChild(item);
        }


        //链接其它文章
        if (dataArticleLink) {
            window.addDownloadGuide.extraLink(item, dataArticleLink);
        }
        //下载小尾巴
        else if (window.MC__EXTRADATA.showDownLoadGuide) {
            if (item.getAttribute("data-dguide") !== null) {
                window.addDownloadGuide.item(item);
            } else if (item.getAttribute("data-lock") !== null) {
                window.addDownloadGuide.item(item);
            }
        }
        // 视频加锁 头条里需要显示底部文案
        else if (item.getAttribute("data-lock") !== null) {
            window.addDownloadGuide.item(item, true);
        }

        //图片车系
        if (attr(item, "data-car")) {
            resetImgStyle.addImageChexi(item);
        }

        // 本地 => 显示图片
        if (__TEST_ENVIROMENT) {
            attr(item, "src", attr(item, "data-src"));
        }

    };

    resetImgStyle.addImageChexi = function (item) {
        var car;
        try {
            car = JSON.parse(attr(item, "data-car"));
        } catch (e) {
        }

        if (!car) return;

        var carData;
        if (car.type == 'car') {
            carData = {
                homeUrl: car.carUrl,
                name: car.carName,
                price: Utils.parseWan(car.carPrice),
                priceUrl: car.carPriceUrl
            };
        } else {
            carData = {
                homeUrl: car.serialUrl,
                name: car.brandName,
                price: Utils.parseWan(car.serialMinPrice) + '起',
                priceUrl: car.serialPriceUrl
            };
        }


        var html,
            tem = document.createElement('div');

        html = "<div class='fun-img-car'>" +
            "<span class='name el'><a href='" + carData.homeUrl + "'>" + carData.name + "</a></span>" +
            "<div class='btns cl'>" +
            "<a href='" + carData.priceUrl + "'>" +
            "<span class='a1'>指导价: <b>" + carData.price + "</b></span>" +
            "<span class='a2'>询底价</span>" +
            "</a>" +
            "</div>" +
            "</div>";

        tem.innerHTML = html;

        item.parentNode.parentNode.appendChild(tem.childNodes[0]);

        tem = null;

    };


    //功能组件
    var handleFunList = {};

    //静态图片  开始显示为静默图
    handleFunList.image = function (item) {
        resetImgStyle(item);
        //item.src = attr(item, "data-src" );
    };

    //gif
    handleFunList.gif = function (item) {
        resetImgStyle(item);
    };

    //视频
    handleFunList.video = function (item) {
        resetImgStyle(item);
    };

    //图集
    handleFunList.album = function (item) {
        resetImgStyle(item);
    };


    //语音
    window.__AudioList = [];
    handleFunList.audio = function (item) {
        item.removeAttribute("controls");

        var src = attr(item, "src") || attr(item, "data-src");
        var duration = parseInt(attr(item, "data-duration") || attr(item, "duration")) || 10;
        var width = (duration > 180 ? 100 : duration * 100 / 180 ) * .75;

        duration = Utils.parseDuration(duration);


        //var funStr = "<div class='xiaobian'></div>";
        var funStr = "";
        funStr += "<div class='video-btn' style='width:" + width + "%'>";
        //funStr += "<i></i>";
        funStr += "<div class='voice'><div></div></div>";
        funStr += "<span>" + duration + "</span>";
        funStr += "</div>";

        var wapperDiv = document.createElement("div");
        wapperDiv.className = "fun-audio";
        wapperDiv.innerHTML = funStr;

        if (item.tagName.toUpperCase() !== 'AUDIO') {
            var item2 = document.createElement("audio");
            item2.setAttribute('data-type', 'audio');
            item2.setAttribute('src', attr(item, 'url_m'));
            item2.setAttribute('data-duration', duration);

            item.parentNode.insertBefore(item2, item);

            item.parentNode.removeChild(item);

            item = item2;

        }

        wapper(item, wapperDiv);
        window.__AudioList.push(new Audio(wapperDiv));
    };


    //车系询价
    handleFunList.chexixunjia = function (item) {

        var data;
        try {
            data = item.innerHTML.trim();
            data = JSON.parse(data);
            if (typeof data === "string") data = JSON.parse(data);
        } catch (e) {
        }

        if (!data || (typeof data === "string")) {
            item.style.display = "none";
            console.warn("数据格式化错误");
            return;
        }

        var id = data.id;
        /*var aChexi = "mc-bitauto://car-serial-activity?csid="+id+"&fromid=qichetoutiao&from=toutiao&isMcId=true";
         var aDatu =  "mc-bitauto://car-image-list-activity?csid=" +id+ "&fromid=qichetoutiao&from=toutiao&isMcId=true";
         var aXunjia =  "mc-bitauto://get-car-serial-price-activity?csid=" +id+ "&fromid=qichetoutiao&from=toutiao&isMcId=true";*/
        var aChexi = data.carSerialUrl;
        var aDatu = data.carSerialPicUrl;
        var aXunjia = data.carSerialPriceUrl;

        var pricesText;
        var prices = [data.minPrice, data.maxPrice];
        for (var i = 0; i < prices.length; i++) {
            prices[i] = Utils.parseWan(prices[i]);
        }
        if (data.minPrice == 0 && data.maxPrice == 0) {
            pricesText = "暂无报价";
        } else {
            pricesText = prices.join(" - ");
        }

        var funStr = "<a href='" + aChexi + "' class='info'>";
        funStr += "<div class='wapper'>";
        funStr += "<img src='" + data.imgUrl + "' />";
        funStr += "</div>";
        funStr += "<em>" + data.name + "</em>";
        funStr += "<strong>" + pricesText + "</strong>";
        funStr += "</a>";
        funStr += "<div class='btns'>";
        funStr += "<a href='" + aDatu + "'>看大图</a>";
        funStr += "<a href='" + aXunjia + "'>询底价</a>";
        funStr += "</div>";

        item.innerHTML = funStr;
        item.className = "fun-chexixunjia";

    };


    //警告灯里的图片
    handleFunList.gzImg = function (item) {
        item.removeAttribute("onclick");
        item.src = attr(item, "data-src");
    };
    handleFunList.ignore = function (item) {
    };


    //投票
    handleFunList.vote = function (item) {

        /*var voteTypeMaps = {
         "1" : "普通投票",
         "2" : "车系投票",
         "4" : "主题车系(会在列表中显示)"
         };*/

        var voteId = attr(item, "data-id");
        var voteData = MC__EXTRADATA && MC__EXTRADATA.vote && MC__EXTRADATA.vote[voteId] || null;
        if (!voteData) {
            item.style.display = "none";
            return;
        }

        if (typeof voteData.extraData === "string") {
            voteData.extraData = JSON.parse(voteData.extraData);
        }
        voteData.extraData = voteData.extraData || {};

        var options = voteData.options;


        var myVoteOptionID; //我投了哪个？
        var totalVoteNums = 0; //当前投票人数
        for (var i = 0; i < options.length; i++) {
            if (options[i].voted) {
                myVoteOptionID = options[i].id;
            }
            totalVoteNums += options[i].voteCount;

            if (typeof options[i].extraData === "string") {
                options[i].extraData = JSON.parse(options[i].extraData);
            }
            options[i].extraData = options[i].extraData || {};
        }
        myVoteOptionID = MC__EXTRADATA.voteResults[voteId];

        //计算选项百分比
        for (var i = 0; i < options.length; i++) {
            if (totalVoteNums == 0) {
                options[i].votePercent = 0;
            } else {
                options[i].votePercent = parseInt(options[i].voteCount * 1000 / totalVoteNums) / 10;
            }
        }
        //防止投票总和不等100
        if (totalVoteNums > 0) {
            var tt = 0;
            var ti;
            for (var i = 0; i < options.length; i++) {
                if (ti === undefined && options[i].voteCount > 0) {
                    ti = i;
                } else {
                    tt = tt + options[i].votePercent * 10;
                }
            }
            options[ti].votePercent = (1000 - tt ) / 10;
        }


        //进行状态
        var today = +new Date();
        var statusStr = myVoteOptionID ? "您已投票" : (voteData.endTime <= today ? "已结束" : "投票进行中");
        var voteOver = !!(myVoteOptionID || voteData.endTime <= today);


        //获取点击选项链接
        var getVoteAttr = function (optionIndex) {
            return voteOver ? "" : (" href=\'mc-vote://qichetoutiao?voteId=" + voteId + "&optionId=" + options[optionIndex].id + "\'");
        };
        //获取每个选项的classNam
        var getVoteClass = function (optionIndex) {
            var className = "vbt" + (optionIndex + 1);

            if (myVoteOptionID) {
                className += " " + ( myVoteOptionID == options[optionIndex].id ? "ac" : "di" );
            }

            if (optionIndex === 0 && options.length === 2 && options[0].extraData.series) {
                className += " rotatey180";
            }

            return className;
        };
        //取点击车系链接
        var getMaicheUrl = function (optionIndex) {
            if (options[optionIndex].extraData.series) {
                var href = "http://partner.kakamobi.com/simple-mc/carSerial.html?serialId=" + options[optionIndex].extraData.series.split("-")[1] + "&serialName=" + options[optionIndex].name;
                return " href=\'" + href + "\'";
            }
            return "";
        };

        var _htmls = "";

        //两个选项
        if (options.length === 2) {
            //_htmls =    '<div class="fun-vote imgvs2">';
            item.className = "fun-vote imgvs2";

            //车系投票 而且 每个选项都有配图
            if (options[0].image && options[1].image) {
                var rotateClass = options[0].extraData.series ? "rotatey180" : "";
                _htmls += '<div class="vs cl">';
                _htmls += '<span><b class="v">V</b><b class="s">S</b></span>';
                _htmls += '<a ' + getMaicheUrl(0) + ' class="v1 fl ' + rotateClass + '" style="background-image:url(' + options[0].image + ');"></a>';
                _htmls += '<a ' + getMaicheUrl(1) + ' class="v2 fr" style="background-image:url(' + options[1].image + ');"></a>';
                _htmls += '</div>';
            }
            _htmls += '<div class="t-content">';
            _htmls += '<div class="up"><span class="fl">' + Utils.formatDate(voteData.startTime) + ' ' + statusStr + '</span><span class="fr">' + Utils.parseWan(totalVoteNums, '人') + '参与</span></div>';
            _htmls += '<div class="down">';

            //没有图片的投票
            if (!options[0].image || !options[1].image) {
                _htmls += '<div class="colorvs">';
                _htmls += '<span class="vred">红方观点</span>';
                _htmls += '<span class="vblue">蓝方观点<s></s></span>';
                _htmls += '<span class="vs2"><b class="v">V</b><b class="s">S</b></span>';
                _htmls += '</div>';
            }

            _htmls += '<div class="ops">';
            _htmls += '<span class="fl">' + options[0].name + '</span>';
            _htmls += '<span class="fr">' + options[1].name + '</span>';
            _htmls += '</div>';
            _htmls += '<div class="bts">';
            _htmls += '<a' + getVoteAttr(0) + ' class="' + getVoteClass(0) + '"></a>';
            _htmls += '<a' + getVoteAttr(1) + ' class="' + getVoteClass(1) + '"></a>';
            _htmls += '<div class="line">';
            _htmls += '<s class="b1" style="width:' + (voteOver ? options[0].votePercent : 50) + '%"></s>';
            _htmls += '<s class="b2" style="width:' + (voteOver ? options[1].votePercent : 50) + '%"></s>';
            _htmls += '</div>';
            if (voteOver) {
                _htmls += '<i class="t1">' + options[0].votePercent + '%</i>';
                _htmls += '<i class="t2">' + options[1].votePercent + '%</i>';
            } else {
                _htmls += '<i class="t1" style="display: none;">0%</i>';
                _htmls += '<i class="t2" style="display: none;">0%</i>';
            }
            _htmls += '</div>';
            _htmls += '</div>';
            _htmls += '</div>';
            //_htmls +=    '</div>';
        }
        //多选项
        else {

            //我已经投票 或者投票已经结束
            if (voteOver) {
                item.className = "fun-vote imgvsmore";
                //_htmls =    '<div class="fun-vote imgvsmore">';
                _htmls = '<div class="ttitle">投票</div>';
                _htmls += '<div class="t-content">';
                _htmls += '<div class="title">' + voteData.title + '</div>';
                _htmls += '<div class="up"><span class="fl">' + Utils.formatDate(voteData.startTime) + ' ' + statusStr + '</span><span class="fr">' + Utils.parseWan(totalVoteNums, '人') + '参与</span></div>';
                _htmls += '<ul class="voteed-ul">';
                for (var i = 0; i < options.length; i++) {
                    var optionItem = options[i];
                    var wPercent = optionItem.votePercent * .85;
                    _htmls += '<li class="li' + (i % 4) + (myVoteOptionID == optionItem.id ? ' select' : '') + ' ">';
                    _htmls += '<p>' + (i + 1) + ' .' + optionItem.name + '</p>';
                    _htmls += '<div><i style="width:' + wPercent + '%" class="bar"></i><i class="num">' + optionItem.votePercent + '%</i></div>';
                    _htmls += '</li>';
                }
                _htmls += '</ul>';
                _htmls += '</div>';
            }
            //我还没有投票
            else {
                item.className = "fun-vote imgvsmore";
                //_htmls =    '<div class="fun-vote imgvsmore">';
                _htmls = '<div class="ttitle">投票</div>';
                _htmls += '<div class="t-content">';
                _htmls += '<div class="title">' + voteData.title + '</div>';
                _htmls += '<div class="up"><span class="fl">' + Utils.formatDate(voteData.startTime) + ' ' + statusStr + '</span><span class="fr">' + Utils.parseWan(totalVoteNums, '人') + '参与</span></div>';
                for (var i = 0; i < options.length; i++) {
                    var optionItem = options[i];
                    _htmls += '<a' + getVoteAttr(i) + ' class="voption">' + (i + 1) + '.' + optionItem.name + '</a>';
                }
                _htmls += '</div>';
            }

        }

        item.innerHTML = _htmls;

    };

    //刷新投票
    window.refreshItem.vote = function (itemId, refreshData, extraData) {
        var voteList = document.querySelectorAll("[data-type=vote]");
        var voteItem;
        for (var i = 0; i < voteList.length; i++) {
            if (attr(voteList[i], "data-id") == itemId) {
                voteItem = voteList[i];
                break;
            }
        }
        if (!voteItem) return;

        MC__EXTRADATA.vote[itemId] = refreshData;
        MC__EXTRADATA.voteResults[itemId] = extraData;

        handleFunList.vote(voteItem);
    };


    //车友圈
    handleFunList.cheyouquanClub = function (item) {

        var name = attr(item, "data-name");
        var desc = attr(item, "data-desc");
        var avatar = attr(item, "data-avatar");
        var id = attr(item, "data-id");

        var href = "http://saturn.nav.mucang.cn/club/detail?id=" + id;

        var funStr = "<a class='fun-cheyouquan-club' href='" + href + "'>";
        funStr += "<span style='background-image:url(" + avatar + ");'></span>";
        funStr += "<h2>" + name + "</h2>"
        funStr += "<p>" + desc + "</p>"
        funStr += "<i></i>"
        funStr += "</a>";

        item.innerHTML = funStr;

    };


    //优酷视频
    handleFunList.youku = function (item) {

        var iframeSrc = attr(item, "data-src");
        //item.innerHTML = "<iframe src='" +iframeSrc+ "' frameborder=0 allowfullscreen></iframe>";

        var videoId = iframeSrc.split('/');
        videoId = videoId[videoId.length - 1];
        var uuid = 'youku_video_' + Utils.UUID.get('youku');
        attr(item, "id", uuid);
        item.style.height = '10rem';

        Utils.loadScript('http://player.youku.com/jsapi', 'YKU', function () {
            try {
                new YKU.Player(uuid, {
                    styleid: '0',
                    client_id: '51b7c8a4eb2e63ef',
                    vid: videoId,
                    newPlayer: true
                });
            } catch (e) {
            }
        });

    };


    //新文字下车系样式
    handleFunList.car_inquiry = function (item) {

        var car = item.innerHTML, html;
        var serialName;

        try {
            car = JSON.parse(item.innerHTML);
        } catch (e) {
            car = null;
        }

        if (!car) {
            item.parentNode.removeChild(item);
            return;
        }

        var carData;
        if (car.type == 'car' && 0) {
            carData = {
                homeUrl: car.carUrl,
                logo: car.carLogo,
                name: car.carName,
                price: Utils.parseWan(car.carPrice),
                priceUrl: car.carPriceUrl
            };
        } else {
            serialName = car.serialName;

            if (!serialName) {
                return item.parentNode.removeChild(item);
            }

            if (serialName.indexOf(car.brandName) === -1) {
                serialName = car.brandName + ' ' + serialName;
            }

            carData = {
                homeUrl: car.serialUrl,
                logo: car.serialLogo,
                name: serialName || car.brandName,
                price: Utils.parseWan(car.serialMinPrice).replace("万", '') + "-" + Utils.parseWan(car.serialMaxPrice),
                priceUrl: car.serialPriceUrl
            };
        }


        html = "<div class='fun-car_inquiry'>" +
            "<a href='" + carData.homeUrl + "' class='detail cl'>" +
            "<div class='img-w fl'><img src='" + carData.logo + "'></div>" +
            "<div class='info-w fl'>" +
            "<span class='p1 el'>" + carData.name + "</span>" +
            "<span class='p3 el'>" + car.levelName + "</span>" +
            "<span class='p2 el'>" + carData.price + "</span>" +
            "</div>" +
            "</a>" +
            "<a class='xunjia' href='" + carData.priceUrl + "'>询底价</a>" +
            "</div>";

        item.innerHTML = html;

    };


    //格式化页面中的特殊组件<p><strong>###投票(2)：前端测试哪个车子好###</strong></p>
    var votelist = document.querySelectorAll("[data-voteid]");
    for (var i = votelist.length - 1; i >= 0; i--) {
        var voteId = attr(votelist[i], "data-voteid");
        var voteDom = document.createElement("div");
        voteDom.setAttribute("data-type", "vote");
        voteDom.setAttribute("data-id", voteId);
        votelist[i].parentNode.insertBefore(voteDom, votelist[i]);
        votelist[i].parentNode.removeChild(votelist[i]);
    }


    //格式化页面table
    var tableList = document.getElementsByTagName("table");
    for (var i = 0; i < tableList.length; i++) {
        var item = tableList[i];
        if (!item.parentNode.classList.contains("table-div")) {
            var trs = item.getElementsByTagName("tr");
            if (trs.length > 0) {
                var maxTdLen = 1;
                for (var k = 0; k < trs.length; k++) {
                    var tdLen = trs[k].getElementsByTagName("td").length + trs[k].getElementsByTagName("th").length;
                    maxTdLen = Math.max(maxTdLen, tdLen);
                }
                var wapperDiv = document.createElement("div");
                wapperDiv.className = "table-div";
                wapperDiv.className = tdLen > 4 ? "table-div x-scroll" : "table-div x-scroll";
                wapper(item, wapperDiv);
            } else {
                item.style.display = "none";
            }
        }
    }


    //格式化图片
    var imgList = document.getElementsByTagName("img");
    for (var i = imgList.length - 1; i >= 0; i--) {
        var img = imgList[i];

        if (!attr(img, "width") || !attr(img, "height")) {
            img.parentNode.removeChild(img);
            continue;
        }

        img.removeAttribute('src');
        img.removeAttribute('alt');
        img.removeAttribute('title');

        if (!attr(img, "data-type")) {
            var dataSrc = attr(img, "data-src");

            if (dataSrc.match(/gif$/)) {
                attr(img, "data-type", "gif")
            } else {
                attr(img, "data-type", "image")
            }
        }

        // 兼容下audio
        if (attr(img, "data-type") !== 'audio') {
            ImageAttrList.push(attr(img, 'data-src'));
        }
    }


    //格式化语音
    var audioList = document.getElementsByTagName("audio");
    for (var i = 0; i < audioList.length; i++) {
        attr(audioList[i], "data-type", "audio");
    }


    //初始化页面组件
    var itemList = document.querySelectorAll("[data-type]");
    var imgIndex = 0;
    for (var i = 0; i < itemList.length; i++) {
        var item = itemList[i];
        var dataType = Utils.toCamelCase(attr(item, "data-type"));

        if (["image", "gif", "video", "album"].indexOf(dataType) > -1) {
            if (attr(img, "width") && attr(img, "height")) {
                attr(item, "data-imgindex", imgIndex++);
            } else {
                item.style.display = "none";
                continue;
            }
        }

        if (dataType in handleFunList) {
            handleFunList[dataType](item);
        } else {
            item.style.display = "none";
        }
    }


    //data-class还原到tag去
    var $dataClass = document.querySelectorAll("[data-class]"), classNames;
    for (var i = 0, len = $dataClass.length; i < len; i++) {
        classNames = attr($dataClass[i], 'data-class') || '';
        if (!classNames) continue;
        classNames = classNames.split(" ");
        $dataClass[i].classList.add.apply($dataClass[i].classList, classNames);
    }


    //订阅按钮
    if (window.MC__EXTRADATA.RSSButton) {
        window.setRSSButton(window.MC__EXTRADATA.RSSButton.status, window.MC__EXTRADATA.RSSButton.text, window.MC__EXTRADATA.RSSButton.href);
    }


    //重新渲染
    render();

    PageReady.ready = true;


    //保证异步执行，获取所有图片的位置
    setTimeout(function () {
        var $imageIndex = window.getImgList();
        var ret = [];

        for (var i = 0, len = $imageIndex.length; i < len; i++) {
            var index = $imageIndex[i].getAttribute('data-imgindex');
            ret.push(window.getImgRect(index));
        }
        //console.log(ret)
        if (__isIOS) {
            try {
                initImageDimensions(JSON.stringify(ret));
            } catch (e) {
            }
        } else {
            if (window.IMAGE && window.IMAGE.initImageDimensions && (typeof window.IMAGE.initImageDimensions === "function")) {
                window.IMAGE.initImageDimensions(JSON.stringify(ret));
            }
        }

    }, 20);

    // 本地测试
    if (__TEST_ENVIROMENT) {
        for (var i = 0; i < imgIndex; i++) {
            setMediaClass(i, 'waiting');
        }

        window.setRSSButton(1, '订阅')
    }


})();
