$(function () {


    let href = window.location.href;
    let artistId = 3684;
    artistId = href.substr(href.indexOf("id=")+"id=".length);

    /*
    公共顶部
     */
    // 返回按钮
    $(".header-back").click(function () {
        window.history.back()
    })

    /*
    公共底部
     */

    /*
    公共中间
     */
    // 滚动
    let myScroll = new IScroll(".main",{
        mouseWheel: true,
        scrollbars:false,
        probeType:3
    })
    //只有第一次点击才加载数据，第一次点击歌曲就加载歌曲，节省资源
    let isFirstClick = [true,true,true,true];
    let funArr = [initHome,initSong,initAlbum,initMv]
    // 菜单选项的点击
    $(".main-center>ul>li").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        // span的left = li距离窗口的偏移位 - ul距离窗口的偏移位
        let liOffsetLeft = $(this).offset().left;
        let UlOffset =  $(".main-center>ul").offset().left;
        $(".main-center>span").css("left",liOffsetLeft-UlOffset);
        // 主要内容的切换
        $(".main-bottom>div").eq($(this).index()).addClass("active").siblings().removeClass("active");
        // 加载资源
        if (isFirstClick[$(this).index()]){
            isFirstClick[$(this).index()] = false;
            funArr[$(this).index()]();
        }
        myScroll.refresh();
    })
    $(".main-center>ul>li:nth-child(1)").click();
    // 关注
    $(".attention").click(function () {
        // 已经关注，取消关注
        $(this).toggleClass("active");
    })
    // 滚动
    let staticHeight = $(".bg>div>img").height() - $(".header").height()*2;
    myScroll.on("scroll",function () {
        // 向上滚动
        if (this.y<0){
            // 改变图片透明度
            let value = -this.y / staticHeight;
            if (value>=1){
                value = 1;
            }
            $(".bg>div").css({
                backgroundColor: `rgb(${238*value},${238*value},${238*value})`
            })
            $(".bg>div>img").css({
                opacity: 0.8 * (1-value),
                width: "100%"
            })
            // 改变header不透明度
            $(".header").css({
                backgroundColor: `rgba(150,150,150,${value})`
            })
        }else if (this.y>=0){
            // 下拉图片变大
            let val = this.y / (staticHeight + 200) * 100 + 100;
            $(".bg>div").css({
                backgroundColor: "rgb(0,0,0)"
            })
            $(".bg>div>img").css({
                opacity: 0.8 ,
                width: val + "%"
            })
            $(".header").css({
                backgroundColor: "rgba(150,150,150,0)"
            })
        }
    })


    /*
    四个板块
     */
    /*
    1. 主页数据
     */
    function initHome() {
        ArtistDetailApis.getArtistDetail(artistId)
            .then(function (data) {
                // 大背景图片
                $(".bg>div>img").attr("src",data.data.artist.cover);
                // 歌手名字
                $(".main-top>h3").text(data.data.artist.name)
                console.log();
                let html = template("mainHome",data);
                $(".main-home").html(html);
                myScroll.refresh();
            })
            .catch(function (e) {
                console.log(e);
            })

    }
    /*
    2. 歌曲
     */
    function initSong(){
        ArtistDetailApis.getArtistSong(artistId)
            .then(function (data) {
                let html = template("mainSong",data)
                $(".main-song>ul").html(html);
                songEvent();
                myScroll.refresh();
            })
            .catch(function (e) {
                console.log(e);
            })
    }
    // 选择歌曲的点击
    $(".song-select").click(function () {
        // 处于选择状态
        $(".main-song").addClass("select");
    })
    // 选择后确认的点击
    $(".song-OK").click(function () {
        // 取消选择状态
        $(".main-song").removeClass("select");
    })
    // 加载完数据才能绑定
    function songEvent() {
        // 播放全部按钮的点击
        $(".song-play").click(function () {
            let $lisActive = $(".main-song>ul>li.active");
            let $playList = null;
            if ($lisActive.length === 0){
                $playList = $(".main-song>ul>li");
            }else {
                $playList = $lisActive;
            }
            $playList.each(function (index,item) {
                let songMessage = JSON.parse(item.dataset.songMessage);
                songMessage.singer = $(item).find(".song-singer").html();
                setSongs(songMessage.id,songMessage.name,songMessage.singer);
                window.location.href = "../player/index.html"
            })
        })
        // 全选按钮的点击
        $(".song-select-all").click(function () {
            $(this).toggleClass("active");
            let $lis = $(".main-song>ul>li");
            if($(this).hasClass("active")){
                $lis.addClass("active");
            }else {
                $lis.removeClass("active");
            }
        })
        // 歌曲的选择
        $(".main-song>ul>li").click(function () {
            if ($(".main-song").hasClass("select")){
                $(this).toggleClass("active");
            }else {
                let songMessage = JSON.parse(this.dataset.songMessage);
                songMessage.singer = $(this).find(".song-singer").html();
                setSongs(songMessage.id,songMessage.name,songMessage.singer);
                window.location.href = "../player/index.html"
            }
        })
    }
    /*
    3. 专辑
     */
    function initAlbum() {
        ArtistDetailApis.getArtistAlbum(artistId)
            .then(function (data) {
                // 格式化出版时间
                data.hotAlbums.forEach(function (item,index) {
                    item.publishTime = dateFormart("yyyy-MM-dd",new Date(item.publishTime));
                })
                let html = template("mainAlbum",data);
                $(".main-album>ul").html(html);
                albumEvent();
                myScroll.refresh();
            })
            .catch(function (err) {
                console.log(err);
            })
    }
    // 加载完数据才能绑定
    function albumEvent() {
        $(".main-album>ul>li").click(function () {
            window.location.href = "../albumDetail/index.html?id=" + this.dataset.albumId;
        })
    }
    /*
    4. MV
     */
    function initMv() {
        ArtistDetailApis.getArtistMv(artistId)
            .then(function (data) {
                data.mvs.forEach(function (item,index) {
                    item.playCount = formartNum(item.playCount);
                })
                let html = template("mainVideo",data);
                $(".main-video>ul").html(html);
                mvEvent();
                myScroll.refresh();
            })
            .catch(function (err) {
                console.log(err);

            })
    }
    function mvEvent() {
        $(".main-video>ul>li").click(function () {
            window.location.href = "../mvPlayer/index.html?id=" + this.dataset.mvId;
        })
    }
})