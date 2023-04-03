$(function () {


    let hrefId = window.location.href;
    hrefId = hrefId.substr(hrefId.indexOf("id=")+"id=".length);
    // let ids = ["2F03228C3AE67B7E0293FDA1A3ECA1B9"];

    let ids = [];
    ids.push(hrefId);
    let bgPic = ["./images/loding.gif"];
    let index = 0;
    let $video = $("<video type=\"video/mp4\"></video>");

    /*
    获取数据
     */
    // 关于视频标题
    function getVideoDetail() {
        VideoDetailApis.getVideoDetail(ids[index])
            .then(function (data) {
                // 发行时间
                data.data.playTime = formartNum(data.data.playTime);
                let html = template("slideInfo",data);
                $(".slide-info").html(html);

            })
            .catch(function (e) {
                console.log(e);
            })
    }
    // 视频链接
    function getVideoUrl(){
        VideoDetailApis.getVideoUrl(ids[index])
            .then(function (data) {
                // $video.remove();
                $(".swiper-slide-active>figure").prepend($video);

                $video.attr("src",data.urls[0].url);
                $video.get(0).load();
                //
                // $video.get(0).load();
            })
            .catch(function (e) {
                console.log(e);
            })
    }
    // 获取视频动态数据--点赞
    function getVideoInfo() {
        VideoDetailApis.getVideoInfo(ids[index])
            .then(function (data) {
                // 点赞数的数值处理
                data.commentCount = formartNum(data.commentCount);
                data.likedCount = formartNum(data.likedCount);
                data.shareCount = formartNum(data.shareCount);
                // 评论详情的评论数
                $(".commit-title>span").html(data.commentCount)
                // 加入模板
                let html = template("slideRight",data);
                $(".slide-right").html(html);
                // 事件绑定
                interactEvent();
            })
            .catch(function (e) {
                console.log(e);
            })
    }
    // 获取评论详情
    function getComment(){
        VideoDetailApis.getComment(ids[index])
            .then(function (data) {
                // 所有评论的数组名
                data.huan = ["topComments","hotComments","comments"];
                // 处理发表评论的时间
                for(let i=0;i<3;i++){
                    for(let j=0;j<data[data.huan[i]].length;j++){
                        data[data.huan[i]][j].time = dateFormart("yyyy-MM-dd",new Date(data[data.huan[i]][j].time));
                    }
                }
                // 加入模板
                let html = template("comment",data);
                $(".commit-list").html(html);
            })
            .catch(function (e) {
                console.log(e);
            })
    }
    // 获取相关视频
    function getRelatedVideo(fn){
        VideoDetailApis.getRelatedVideo(ids[index])
            .then(function (data) {

                for (let i = 0;i<data.data.length;i++){
                    ids.push(data.data[i].vid);
                    bgPic.push(data.data[i].coverUrl);
                }
                fn();
            })
            .catch(function (e) {
                console.log(e);
            })
    }
    // 初始化一条新视频
    function getNewVideo(){
        getVideoUrl();
        getVideoDetail();
        getVideoInfo();
        getComment();
    }
    getRelatedVideo(()=>{});


    /*
    公共头部
     */
    // 返回按钮
    $(".go-back").click(function () {
        window.history.back();
    })
    /*
    公共中间
     */
    let moving = false;
    new Swiper ('.swiper-container', {
        direction: 'vertical', // 垂直切换选项
        loop: true, // 循环模式选项
        observer: true, // 监听1
        observeParents: true, //监听2
        observeSlideChildren: true, // 监听3
        on: {

            touchMove:function () {
                if (!moving){
                    moving = true;
                    // 视频暂停，但不显示暂停
                    $video.get(0).pause();
                    // 换背景
                    if (index===0)return;
                    $(".swiper-slide figure").css({
                        backgroundImage: `url('${bgPic[index+1]}')`,
                    })
                }
            },
            touchEnd:function(){
                // 刚刚移动了，并且可能是个假动作或者切换了，但绝对不是点了暂停
                if (moving){
                    moving = false;
                    $video.get(0).play();
                    $(".slider-center").removeClass("active");
                    // 重新添加视频，防止假动作
                    $video.remove();
                    $(".swiper-slide-active>figure").prepend($video);
                }
            },
            slideChangeTransitionEnd: function () {
                moving = false;
                $video.remove();
                /*
                Swiper.swipeDirection属性用于获取Swiper当前滚动的方向
                如果是第一次执行, 那么拿到的是: undefined
                如果是切换到下一屏: 返回的是next
                如果是切换到上一屏: 返回的是prev
                console.log("执行了", this.swipeDirection);
                * */
                // 下一屏
                if (this.swipeDirection === "next"){
                    // 数组中没视频了，加视频
                    if (index>=ids.length-2){
                        // 加载相关视频
                        getRelatedVideo(function () {
                            // 数组中有视频，播放下一个
                            index ++;
                            getNewVideo();
                        });
                    }else{
                        // 数组中有视频，播放下一个
                        index ++;
                        getNewVideo();
                    }
                    // 上一瓶
                }else if (this.swipeDirection === "prev"){
                    // 数组中没视频了，加视频
                    if (index===0){
                        $(".swiper-slide-active>figure").prepend($video);
                    }else{
                        // 数组中有视频，播放上一个
                        index --;
                        getNewVideo();
                    }
                }else{
                    getNewVideo();
                }
                // 更换背景
                if (index===0)return;
                $(".swiper-slide figure").css({
                    backgroundImage: `url('${bgPic[index+1]}')`,
                })
            },
        }
    })
    // 中间屏幕任意位置的点击
    $("figure").click(function () {
        // 关闭评论，分享之类的
        let $Commit = $(".mask-commit");
        if ($Commit.hasClass("active")){
            $Commit.removeClass("active");
            return;
        }
        // 关闭分享
        let $share = $(".mask-share");
        if ($share.hasClass("active")){
            $share.removeClass("active");
            return;
        }
        // 进度条小圆点高亮
        progressDotHigh();
        // 播放与暂停图标
        // 视频暂停
        if(oVideo.paused){
            oVideo.play();
            $(".slider-center").removeClass("active");
        }else if (!oVideo.paused){
            oVideo.pause();
            $(".slider-center").addClass("active");
        }


    })
    // 互动按钮的点击---点赞
    function interactEvent(){
        // 喜欢按钮的点击
        let $favorite = $(".favorite");
        $favorite.off();
        $favorite.click(function (e) {
            $(this).toggleClass("active");
            e.stopPropagation();
        })
        // 评论按钮
        let $commit = $(".commit");
        $commit.off();
        $commit.click(function (e) {
            $(".mask-commit").addClass("active");
            e.stopPropagation();
        })
        // 分享按钮
        let $share = $(".share");
        $share.off();
        $share.click(function (e) {
            $(".mask-share").addClass("active");
            e.stopPropagation();
        })
    }
    // 底部标题以及进度条的点击，阻止点击为figure
    $(".slide-bottom").click(function (e) {
        e.stopPropagation();
    })
    // 进度条小圆点高亮
    let timer = null;
    let progressDotHihht = false
    function progressDotHigh(){
        let $progressBar = $(".progress-bar");
        if (!progressDotHihht){
            progressDotHihht = true;
            $progressBar.addClass("active");
            clearTimeout(timer);
            timer = setTimeout(function () {
                $progressBar.removeClass("active");
                progressDotHihht = false;
            },5000)
        }
    }
    /*
    评论蒙版
     */
    $(".commit-top").click(function () {
        $(".mask-commit").removeClass("active");
    })


    /*
    视频处理
     */
    let oVideo = $video.get(0);
    let totalTime = 0;
    let progress = new HYProgress($(".progress-bar"),$(".progress-line"),$(".progress-dot"));
    $video.on("canplay",function () {
        totalTime = oVideo.duration;
        // 移除暂停按钮
        $(".slider-center").removeClass("active");
        oVideo.play();
    })
    $video.on("timeupdate",function () {
        progress.setProgress((oVideo.currentTime / totalTime)*100) ;
    })
    $video.on("ended",function () {
        progress.setProgress(0);
        oVideo.currentTime = 0;
        oVideo.play();
    })
    /*
    进度条处理
     */
    progress.progressMove(false,function (value) {
        progressDotHigh();
        oVideo.currentTime = totalTime * value;
    })
    progress.progressClick(function (value) {
        progressDotHigh();
        oVideo.currentTime = totalTime * value;
    })





})

