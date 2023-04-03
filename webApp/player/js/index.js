$(function () {
    // let songId = 108914; //"108913,108914" 107912 这个id是纯音乐
    // songId = ids[0]; //songId才是能播放的
    // let oAudio = document.querySelector("audio");

    /*
流程
+
1. 获取songarray
2. 创建player传入$audio，同时获取url
3. [获取数据]遍历，将slider加入图片
4. 音频写入总时长 span
5. 初始化界面 歌手之类的
6. [获取歌词]
 */

    /*
    0.全局变量声明
    */
    let songArray = null;
    let ids = [];
    let index = 0; //第几首歌曲
    let mySwiper = null;
    let lyricScroll = null;
    let player = null; //播放器对象

    // 判断是否dj跳转过来的，dj跳转过来的则href中有#dj。
    let isDj = window.location.hash.substr(1) === "dj";

    /*
    1. 获取传递过来的歌曲
    */
    function initMessage(){
        if (isDj){
            songArray = getDj();
        }else {
            songArray = getSongs();
        }
        songArray.forEach(function (obj) {
            ids.push(obj.id);
        });
    }


    /*
     2. 加载音乐信息
     */
    function loadMusic(){
        if (isDj){
            for (let i=0;i<songArray.length;i++){
                let song = songArray[i];
                let html = $(`<div class="swiper-slide"><div class="disc-pic"><img src="${song.bg}" alt=""></div></div>`)
                $(".swiper-wrapper").append(html);
            }
            createSwiper();
        }else {
            MusicApis.getSongDetail(ids.join(","))
                .then(function (data) {
                    for (let i=0;i<data.songs.length;i++){
                        let song = data.songs[i];
                        songArray[i].bg = song.al.picUrl;
                        let html = $(`<div class="swiper-slide"><div class="disc-pic"><img src="${song.al.picUrl}" alt=""></div></div>`)
                        $(".swiper-wrapper").append(html);
                    }
                    createSwiper();
                })
                .catch(function (err) {
                    console.log(err);
                })
        }

        function createSwiper(){
            mySwiper = new Swiper ('.swiper-container', {
                // direction: 'vertical', // 垂直切换选项
                loop: true, // 循环模式选项
                observer: true,
                observeParents: true,
                observeSlideChildren: true,
                on:{
                    slideChangeTransitionEnd: function () {
                        index = this.realIndex;
                        initDefaultInfo(index,this.swipeDirection);
                    }
                }
            })
        }

        // 音频加载完成
        player.musicCanPlay(function (duration,totalTimeStr) {
            $(".total-time").text(totalTimeStr); // 总时长写入界面
            // $play.off("click");//先移除
        })

        player.musicEnded(function (nextIndex) {
            mySwiper.swipeDirection = "next"; // 有next才能加载歌词
            mySwiper.slideToLoop(nextIndex);
        })
    }

    /*
    3.公共头部处理
    */
    function initHeaderEvent() {
        //返回上一页
        $(".go-back").click(function () {
            window.history.back();
        })
    }

    /*
    4.公共底部处理
    */
    function initFooterEvent(){
        //打开播放列表
        $(".footer-bottom .list").click(function () {
            $(".modal-top>p>span").text(`列表循环(${songArray.length})`);
            $(".modal").css("display","block");
            // 按理说应该把事件绑定放在外面，否则会多次绑定，但是8是这样写的，-----
            $(".modal-top .clear-all").click(function () {
                clearSongs();
                window.location.href = "../home/index.html";
            })

            //点击播放列表后才填充数据，以免不适用就填充，浪费资源
            if ($(".modal-middle>li").length !== songArray.length){
                $(".modal-middle>li").html("");
                songArray.forEach(function (obj) {
                    let $li = $(`<li><p>${obj.name}-${obj.singer}</p><img class="delete-song" src="images/player-x-close.png" alt=""></li>`);
                    $(".modal-middle").append($li);
                });
                $(".delete-song").click(function () {
                    let delIndex = $(this).parent().index();
                    // 1. 从session数组中删除
                    let len = deleteSongByIndex(delIndex);
                    // 2. 如果删完了，就返回首页
                    if (len === 0){
                        window.location.href = "../home/index.html";
                    }
                    // 3. 列表UI也删除
                    $(this).parent().remove();
                    // 4. 修改歌曲数目
                    $(".modal-top>p>span").text(`列表循环(${len})`)
                    // 5. 从Swiper中的UI删除
                    mySwiper.removeSlide(delIndex);
                    // 6. 当前界面保存的数组数据也删除
                    songArray.splice(delIndex,1);
                })
            }
        })
        //关闭播放列表
        $(".modal-bottom").click(function () {
            $(".modal").css("display","none");
        })
        // 上一首
        $(".footer-bottom .prev").click(function () {
            index --;
            mySwiper.slideToLoop(index);
            // 点击上一首，默认不会赋值该属性，手动赋值
            mySwiper.swipeDirection = "pre";
        })
        // 下一首
        $(".footer-bottom .next").click(function () {
            index ++;
            mySwiper.slideToLoop(index);
            // 点击上一首，默认不会赋值该属性，手动赋值
            mySwiper.swipeDirection = "next";
        })
        // 播放模式
        $(".footer-bottom .play-mode").click(function () {
            if (player.playMode === "loop"){
                // 切换为单曲循环
                player.playMode = "one";
                $(".footer-bottom .play-mode>img").attr("src","images/player-x-one.png");
            }else if (player.playMode === "one"){
                // 随机播放
                player.playMode = "random";
                $(".footer-bottom .play-mode>img").attr("src","images/player-x-random.png");


            }else if (player.playMode === "random"){
                // 顺序循环
                player.playMode = "loop";
                $(".footer-bottom .play-mode>img").attr("src","images/player-x-loop.png");

            }
        })
        // 开始暂停按钮的点击，防止多次绑定
        $(".footer-bottom>.play").click(function () {
            // 控制指针和播放按钮的样式
            $(this).toggleClass("active");
            let isActive = $(this).attr("class").includes("active");
            if (isActive) {
                //播放状态
                $(".default-top>img").css({transform: "rotate(0deg)"})
                $(".disc-pic").css({"animation-play-state": "running"})
            } else {
                //暂停状态
                $(".default-top>img").css({transform: "rotate(-30deg)"})
                $(".disc-pic").css({"animation-play-state": "paused"})
            }
            player.playMusic(index);
        })
    }

    /*
    5.处理公共的内容区域
    */
    function initMainCommenEvent(){
        $(".main-in").click(function () {
            $(".main-in").toggleClass("active");
            // 如果当前界面是歌词界面，则加载歌词
            if ($(this).hasClass("active")){
                getLyric(songArray[index].id);
                console.log("在第一处获取歌词，不能重复");
            }

        })
    }

    /*
    6.歌词滚动处理
    */
    function initLyricScroll(){
        lyricScroll = new IScroll(".lyric-bottom",{
            mouseWheel: true,
            scrollbars:false,
            probeType: 3
        })
        lyricScroll.on("scroll",function () {
            $(".lyric-list")[0].isDrag = true; // 正在拖拽
            // 显示刻度线
            $(".lyric-time-line").css({display:"flex"});
            let $lis = $(".lyric-list>li");
            let index = Math.round(-(this.y / $lis.eq(0).height()));
            if (!$lis.get(index)){return;}
            // 歌词高亮
            $lis.eq(index).addClass("hover").siblings().removeClass("hover");
            $(".lyric-time-line>span").text($lis.get(index).lrc.timeStr);
        })
        lyricScroll.on("scrollEnd",function () {
            // 隐藏刻度线
            $(".lyric-list")[0].isDrag = false; // 没在拖拽
            $(".lyric-time-line").css({display:"none"});
        })

    }

    /*
    8.歌曲进度控制
    */
    function progressControl(){
        //通过进度条控制歌曲
        let musicProgress = new HYProgress($(".progress-bar"),$(".progress-line"),$(".progress-dot"));
        musicProgress.progressClick(function (value) {
            player.musicSeekTo(value);
        });
        musicProgress.progressMove(false,function (value) {
            player.musicSeekTo(value);
        })

        // 歌曲播放过程中
        player.musicTimeUpDate(function (currentTime,duration,currentTimeStr) {
            //同步当前播放时间span值
            $(".cur-time").text(currentTimeStr);
            // 处理进度条同步
            let value = currentTime / duration * 100;
            musicProgress.setProgress(value);
            //歌词同步
            let curr$li = $(`#hy_${parseInt(currentTime)}`);
            if (!curr$li[0]){return}
            curr$li.addClass("active").siblings().removeClass("active");
            if ($(".lyric-list")[0].isDrag) return; //正在拖拽
            lyricScroll.scrollTo(0,curr$li.get(0).lrc.offset);
        })
    }

    /*
    9.音量控制
    */
    function voiceControl() {
        // 通过进度条控制歌曲音量
        let voiceProgress = new HYProgress($(".voice-progress-bar"), $(".voice-progress-line"), $(".voice-progress-dot"));
        voiceProgress.progressClick(function (value) {
            player.musicSetVolume(value);
        });
        voiceProgress.progressMove(false ,function (value) {
            player.musicSetVolume(value)
        });
        // 静音
        $(".lyric-top>img").click(function (event) {
            let volume = player.musicGetVolume();

            if(volume === 0){
                player.musicSetVolume(player.defaultVolume)
                voiceProgress.setProgress(player.musicGetVolume() * 100);
            }else{
                player.musicSetVolume(0);
                voiceProgress.setProgress(0);
            }
            return event.stopPropagation();
        });
    }

    /*
    初始化界面
    */
    function initDefaultInfo(index,swipeDirection){
        // 1. 拿到当前的slider对应的歌曲详情信息
        let song = songArray[index];
        // 2. 初始化歌曲信息
        $(".header-title").text(song.name);
        $(".header-singer").text(song.singer);
        // 2. 初始化对应的歌曲
        // 3. 设置背景图片
        $(".main>.bg").css("background",`url("${song.bg}") no-repeat center top`)
        // 4. 在swiper滑动方向有值情况下修改指针状态，有值说明不是第一次打开这个界面
        if(swipeDirection){
            $(".default-top>img").css({transform: "rotate(0deg)"})
            $(".disc-pic").css({"animation-play-state":"running"})
            if (!$(".play").hasClass("active")){
                $(".play").toggleClass("active");
            }
            player.playMusic(index);
            getLyric(songArray[index].id);
            console.log("在第二处获取歌词，不能重复");
        }

    }

    /*
    获取歌词
    */
    function getLyric(songId) {
        // 获取歌词
        MusicApis.getSongLyric(songId)
            .then(function (data) {
                let index = 0;
                //没有歌词就不再执行
                if (!data.lrc){return};
                let lyricObj = parseLyric(data.lrc.lyric);
                let $ul = $(".lyric-list");
                $ul.html("");
                // 设置id为时间可以高亮
                // 设置属性可以同步
                for (let key in lyricObj){
                    let $li = $(`<li id="hy_${key}">${lyricObj[key]}</li>`);
                    $ul.append($li);
                    let timeObj = formatTime(key * 1000);
                    $li.get(0).lrc = {
                        offset : - ($li.height() * index),
                        timeStr : timeObj.minute + ":" + timeObj.second,
                    }
                    index ++;
                }
                //歌词加载完后让第一条歌词高亮
                $ul.find("li:nth-child(1)").addClass("active");
                lyricScroll.refresh();
                //设置最大可滚动高度，得加一段
                lyricScroll.maxScrollY -= $(".lyric-bottom").height();
            })
            .catch(function (err) {
                console.log(err);
            })
    }

    /*
    格式化歌词
    */
    function parseLyric(lyric){
        let reg1 = /\[\d*:\d*\.\d*\]/g;
        let reg2 = /\[\d*/i;
        let reg3 = /\:\d*/i;
        let arr = lyric.split("\n");
        let lyricObj = {};
        arr.forEach(function (lyc) {
            // 获取时间
            let timeStr = lyc.match(reg1);
            if (!timeStr) return;
            timeStr = timeStr[0];
            // 获取分钟
            let minStr = timeStr.match(reg2)[0].slice(1);
            // 获取秒钟
            let secStr = timeStr.match(reg3)[0].slice(1);
            // 合并分钟与秒钟
            let time = parseInt(minStr)*60 + parseInt(secStr);
            //处理歌词
            let lrc = lyc.replace(reg1,"").trim();
            lyricObj[time] = lrc;
        })
        return lyricObj;
    }

    function main() {
        initMessage(); //1. 处理传递过来的歌曲信息
        player = new Player($("audio"), songArray);        // 创建播放器
        loadMusic(); //2. 加载音乐详情
        initHeaderEvent(); //3. 处理公共头部，主要是绑定一些事件
        initFooterEvent(); // 4. 处理公共底部，主要是绑定一些事件
        initMainCommenEvent(); //5. 公共内容区域的事件绑定
        initLyricScroll(); //6. 歌词滚动的处理
        progressControl(); //7. 进图条处理
        voiceControl(); // 8. 音量控制处理
    }
    main();
})

