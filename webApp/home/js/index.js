$(function () {

    /*
    1. 头部header开始
    * */
    $(".header").load("./../common/header.html",function () {
        let sc = document.createElement("script");
        sc.src = "./../common/js/header.js";
        document.body.appendChild(sc);
    })
    /*
    头部header结束
    */

    /*
    2. 底部footer开始
     */
    $(".footer").load("./../common/footer.html",function () {
        //该函数是加载页面的回调函数，加载页面完成后才能加载js，否则会因为js找不到相应的html元素而报错
        //也就是说把js代码从footer.html中引入会报错
        let sc = document.createElement("script");
        sc.src = "./../common/js/footer.js";
        document.body.appendChild(sc);
    });
    /*
    底部footer结束*
     */

    /*
    3. 公共main开始 滚动插件，回弹效果
     */
    var myScroll = new IScroll('.main',{
        mouseWheel: false,
        scrollbars: false,
        /*
       需要使用iscroll-probe.js才能生效probeType：
       1  滚动不繁忙的时候触发
       2  滚动时每隔一定时间触发
       3  每滚动一像素触发一次
       * */
        probeType: 3,
    });
    //获取路径总长度
    let length = $("#refreshLogo")[0].getTotalLength();
    // 默认隐藏路径
    $("#refreshLogo").css({"stroke-dasharray": length});
    $("#refreshLogo").css({strokeDashoffset: length});
    //---上拉一套---拿到logo的高度，当下拉长度大于高度开始画
    let logoHeight = $(".pull-down").height();
    let isPullDown = false;//是否需要刷新
    let isRefresh = false; //现在是否正在刷新，如果是，再拉也不请求数据
    //---下拉一套--
    let bottomHeight = $(".pull-up").height();
    let maxOffsetY = myScroll.maxScrollY-bottomHeight;
    let isPullUp = false;//是否需要刷新
    //监听滚动
    myScroll.on("scroll",function () {
        // this.y滚动的偏移位
        //如果下拉高度大于图片高度了，就开始画
        if (this.y>=logoHeight){
            //当画的长度小于总长度时才画，否则就停止画
            if (3*(this.y-logoHeight)<=length){
                $("#refreshLogo").css({strokeDashoffset: length-3*(this.y-logoHeight)});
            }else{
                // 已经画完了，画完了才能加载数据,并且需要松手才能加载数据
                isPullDown = true;
                //回弹到170，停止回弹
                this.minScrollY = 170;
                //显示画完状态，防止速度过快的bug
                $("#refreshLogo").css({strokeDashoffset: 0});
            }
        }
        //上拉刷新
        else if (this.y<maxOffsetY){
            this.maxScrollY = maxOffsetY;
            $(".pull-up>p>span").text("松手加载更多");
            isPullUp = true;
        }
    })
    // 停止滚动，松手了
    myScroll.on("scrollEnd",function () {
        //下拉刷新
        //此时松手了，前方给出指示需要请求数据 && 此时不处于刷新状态，此时请求数据
        if (isPullDown && !isRefresh){
            // 现在正在刷新
            isRefresh = true;
            //刷新，请求数据
            refreshDown();
        }
        //上拉刷新
        else if (isPullUp && !isRefresh){
            // 现在正在刷新
            $(".pull-up>p>span").text("加载中...");
            isRefresh = true;
            //刷新，请求数据
            refreshUp();
        }
    })
    // 下拉刷新
    function refreshDown() {
        setTimeout(function () {

            //刷新完成后
            //是否需要刷新：否
            isPullDown = false;
            // 是否处于刷新状态：否
            isRefresh = false;
            // 数据还原
            myScroll.minScrollY = 0;
            // 重新回弹定位到顶部
            myScroll.scrollTo(0,0);
            // 画的东西清空
            $("#refreshLogo").css({strokeDashoffset: length});
            console.log("下拉刷新已经拿到了数据");
        })
    }
    // 上拉刷新
    function refreshUp() {
        setTimeout(function () {
            //刷新完成后
            //是否需要刷新：否
            isPullUp = false;
            // 是否处于刷新状态：否
            isRefresh = false;
            // 数据还原
            myScroll.maxScrollY = maxOffsetY + bottomHeight;
            // 重新回弹定位到顶部
            myScroll.scrollTo(0,myScroll.maxScrollY);
            // 内容还原
            $(".pull-up>p>span").text("上拉加载更多");
            console.log("上拉加载更多已经拿到了数据");
        },3000)
    }
    /*
    公共main结束
     */

    //=======================================================================

    /*
    nav开始
     */
    $(".nav>ul>li").click(function () {
        if ($(this).index()===0){
            // 每日推荐
            alert("'每日推荐'正在建设中，敬请期待！")
        }
        else  if ($(this).index()===1){
            // 歌单
            $(".footer .music a").click();
        }
        else  if ($(this).index()===2){
            // 排行榜
            alert("'排行榜'正在建设中，敬请期待！")
        }
        else  if ($(this).index()===3){
            // 电台
            $(".footer .djpage a").click()
        }
        else  if ($(this).index()===4){
            // 直播
            alert("'直播'正在建设中，敬请期待！")
        }
    })
    /*
    nav结束
     */

    /*
    banner开始
     */
    HomeApis.getHomeBanner()
        .then(function (data) {
            data.banners.forEach(function (item,index) {
                // 单曲
                if(item.targetType === 1){
                    item.message = `{"targetType":"${item.targetType}","name":"${item.song.name}","id":"${item.song.id}","singer":"${item.song.ar[0].name}"}`;
                }
                // 专辑
                else if (item.targetType === 10){
                    item.message = `{"targetType":"${item.targetType}","id":"${item.encodeId}"}`;
                }
                // 链接
                else if(item.targetType === 3000){
                    item.message = `{"targetType":"${item.targetType}","url":"${item.url}"}`;
                }
                // 歌单
                else if (item.targetType === 1000){
                    item.message = `{"targetType":"${item.targetType}","id":"${item.encodeId}"}`;
                }
                else {
                    item.message = `{"targetType":"${item.targetType}","id":"null"}`;
                }
                // 1: 单曲,
                // 10: 专辑,
                // 100: 歌手,
                // 1000: 歌单,
                // 1002: 用户,
                // 1004: MV,
                // 1006: 歌词,
                // 1009: 电台,
                // 1014: 视频,
                // 1018:综合
            })
            let html = template("bannerSlide",data);
        $(".swiper-wrapper").html(html);
        //创建首页banner轮播
        var mySwiper = new Swiper ('.swiper-container', {
            //监视器
            observer: true,
            observeParents:true,
            observeSlideChildren:true,
            // direction: 'vertical', // 垂直切换选项
            loop: true, // 循环模式选项
            autoplay:{
                delay: 1000,
                disableOnInteraction: false,//交互后是否停止自动轮播
            },
            // 如果需要分页器
            pagination: {
                el: '.swiper-pagination',
                bulletClass: 'my-bullet',
                bulletActiveClass: 'my-bullet-active',
            },

        })
        bannerClick();
        // 刷新myscoll，让他重新计算高度
        myScroll.refresh();
    })
        .catch(function (err) {
        console.log(err);
    })
    // 绑定banner的点击
    function bannerClick(){

        $(".swiper-slide>img").click(function () {
            let obj = JSON.parse(this.dataset.message);
            // 如果是单曲
            if (obj.targetType == 1){
                let name = obj.name;
                let id = obj.id;
                let singer = obj.singer;
                setSongs(id,name,singer);
                window.location.href = "../player/index.html";
                // 如果是专辑
            }else if (obj.targetType == 10){
                window.location.href = "../albumDetail/index.html?id=" + obj.id;
                // 如果是链接
            }else if (obj.targetType == 3000){
                window.location.href = obj.url;
                // 如果是歌单
            }else if(obj.targetType === 1000){
                alert("即将跳转到歌单，test！")
                window.location.href = "../playListDetail/index.html?id=" + obj.id;
            }
            // 如果既不是专辑也不是链接
            else {
                alert("还没有哦！换一下吧~"+obj.targetType);
            }
        })
    }
    // 创建首页导航，日期同步
    $(".nav i").html(new Date().getDate());
    /*
    banner结束
     */

    /*
    创建推荐歌单
    */
    HomeApis.getHomeRecommend()
        .then(function (data) {
        data.title = "推荐歌单";
        data.subTitle = "歌单广场";
        data.result.length = 6;
        data.result.forEach(function (ele) {
            ele.width = 216/100;
            ele.playCount = formartNum(ele.playCount);
            ele.message = ele.id;
        })
        let html = template("category",data);
        $(".recommend").html(html);
        $(".recommend .category-title").forEach(function (ele) {
            $clamp(ele,{clamp:2})
        })
        $(".recommend>.category>.category-top>span").click(function () {
            $(".footer .music a").click();
        })
        $(".recommend>.category>.category-bottom>ul>li").click(function () {
            window.location.href = "../playListDetail/index.html?id="+ this.dataset.message;
        })
        myScroll.refresh();
    })
        .catch(function (err) {
        console.log(err);
    })

    /*
    创建独家放送，
    */
    HomeApis.getHomeExclusive().
    then(function (data) {
        data.title = "独家放送";
        data.subTitle = "原创出品";
        data.result.forEach(function (obj,index) {
            obj.width = 334/100;
            if (index === 2){
                obj.width = 690/100;
            }
            obj.message = obj.id
        })
        let html = template("category",data);
        $(".exclusive").html(html);
        $(".exclusive .category-title").forEach(function (ele) {
            $clamp(ele,{clamp:2})
        })
        $(".exclusive>.category>.category-top>span").click(function () {
            $(".footer .music a").click();
        })
        $(".exclusive>.category>.category-bottom>ul>li").click(function () {
            window.location.href = "../mvPlayer/index.html?id="+ this.dataset.message;
        })
        myScroll.refresh();
    }).
    catch(function (err) {
        console.log(err);
    })

    /*
    创建新歌新碟
    */
    HomeApis.getHomeAlbum().
    then(function (data) {
        data.title = "新碟新歌";
        data.subTitle = "更多新碟";
        data.result = data.weekData;
        data.result.length = 6;

        data.result.forEach(function (ele) {
            ele.artistName = ele.artist.name;
            ele.width = 216/100;
            ele.message = ele.id;
        })
        let html = template("category",data);
        $(".album").html(html);
        $(".album .category-title").forEach(function (ele) {
            $clamp(ele,{clamp:2})
        })
        $(".album .category-singer").forEach(function (ele) {
            $clamp(ele,{clamp:1})
        })
        $(".album>.category>.category-top>span").click(function () {
            $(".footer .music a").click();
        })
        $(".album>.category>.category-bottom>ul>li").click(function () {
            window.location.href = "../albumDetail/index.html?id="+ this.dataset.message;
        })
        myScroll.refresh();
    }).
    catch(function (err) {
        console.log(err);
    })

    /*
    创建推荐MV
    */
    HomeApis.getHomeMV().
    then(function (data) {
        data.title = "推荐MV";
        data.subTitle = "更多MV";
        data.result.forEach(function (obj,index) {
            obj.width = 334/100;
            obj.message = obj.id;
        })
        let html = template("category",data);
        $(".mv").html(html);
        $(".mv .category-title").forEach(function (ele) {
            $clamp(ele,{clamp:1})
        })
        $(".mv>.category>.category-top>span").click(function () {
            $(".footer .video a").click();
        })
        $(".mv>.category>.category-bottom>ul>li").click(function () {
            window.location.href = "../mvPlayer/index.html?id="+ this.dataset.message;
        })
        myScroll.refresh();
    }).
    catch(function (err) {
        console.log(err);
    })

    /*
    创建主播电台
    */
    HomeApis.getHomeDJ().
    then(function (data) {
        data.title = "主播电台";
        data.subTitle = "更多主播";
        data.result.forEach(function (obj,index) {
            obj.width = 216/100;
            obj.message = obj.program.radio.id;
        })
        let html = template("category",data);
        $(".dj").html(html);
        $(".dj .category-title").forEach(function (ele) {
            $clamp(ele,{clamp:2})
        })
        $(".dj>.category>.category-top>span").click(function () {
            $(".footer .djpage a").click();
        })
        $(".dj>.category>.category-bottom>ul>li").click(function () {
            window.location.href = "../djDetail/index.html?id="+ this.dataset.message;
        })
        myScroll.refresh();
    }).
    catch(function (err) {
        console.log(err);
    })


    // ================================================
    /*
    1.5s刷新一次高度，刷新5次
    */
    let refreshFrequency = 6;//刷新5次
    let reTimer = setInterval(function () {
        if (refreshFrequency === 0){
            // console.log("最后一次刷新");
            clearInterval(reTimer);
            return;
        }
        myScroll.refresh();
        maxOffsetY = myScroll.maxScrollY-bottomHeight;
        refreshFrequency --;
    },500);


})
