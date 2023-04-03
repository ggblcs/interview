$(function () {


    let myScroll = null; //主要内容的滚动
    let keyword = "江南"; //关键词
    let currentView = null; //当前正在看的界面,主要是为了设置偏移位
    let dataDeal = null;

    /*
    页面数据
    */
    class Views{
        constructor(offset,limit,type,jsonKey) {
            this.offset = offset;
            this.limit = limit;
            this.type = type;
            //调用DataDeal的方法，获取json数组中的count
            this.jsonKey = jsonKey;
        }
    }

    /**
     * 数据处理
     * 添加模板
     * 事件绑定
     */
    class DataDeal{
        constructor() {
            this.songEventBeforeData();
        }
        /*
        数据处理
        数据处理
        数据处理
         */
        compositeDataDeal(data){
            //1. 创建所有分区
            data.result.orders = {song:"单曲",playList:"歌单",video:"视频",
                sim_query:"相关搜索",artist:"歌手",album:"专辑",djRadio:"电台",user:"用户"}
            this.addTemplate("compositeItem",data.result,"composite",2);
            //2. 填充分区数据
            //2.1 填充单曲数据
            data.result.song.result = data.result.song;
            data.result.song.songs.forEach(function (item,i) {
                item.artists = item.ar;
                item.album = item.al;
            });
            this.addTemplate("singleItem",data.result.song,"song",1);
            //2.2 歌单数据填充
            let playListData = data.result.playList;
            playListData.playlists = playListData.playLists;
            playListData.playlists.forEach(function (obj) {
                obj.playCount = formartNum(obj.playCount);
            });
            this.addTemplate("playListItem",playListData,"playList",1);
            data.result.video.result = data.result.video;
            this.addTemplate("videoItem",data.result.video,"video",1);
            this.addTemplate("sim_queryItem",data.result.sim_query,"sim_query",1);
            this.addTemplate("artistItem",data.result.artist,"artist",1);
            this.addTemplate("albumItem",data.result.album,"album",1);
            this.addTemplate("djRadioItem",data.result.djRadio,"djRadio",1);
            data.result.user.userprofiles = data.result.user.users;
            this.addTemplate("userItem",data.result.user,"user",1);
            // 3.事件绑定
            this.compositeEventAfterData();
            this.compositeAndDjRadiosEvent();
            this.compositeAndSongEvent();//事件委托
            this.compositeAndAlbumEvent();
            this.compositeAndVideoEvent();
            this.compositeAndPlaylistEvent();
            this.compositeAndArtistEvent();
            this.compositeAndUserEvent();
        }
        songDataDeal(data){
            this.addTemplate("singleItem",data,"song");
        }
        videoDataDeal(data){
            data.result.videos.forEach(function (item,i) {
                item.playTime = formartNum(item.playTime);
                let res = formatTime(item.durationms);
                item.durationms = `${res.minute}:${res.second}`;
            })
            this.addTemplate("videoItem",data,"video");
            $(".video .video-right>.video-title").forEach(function (item) {
                $clamp(item,{clamp:2});
            })
            this.compositeAndVideoEvent();
        }
        artistDataDeal(data){
            this.addTemplate("artistItem",data.result,"artist");
            this.compositeAndArtistEvent();
        }
        playlistDataDeal(data){
            data.result.playlists.forEach(function (obj) {
                obj.playCount = formartNum(obj.playCount);
            });
            console.log(data);
            this.addTemplate("playListItem",data.result,"playList");
            this.compositeAndPlaylistEvent();
        }
        djRadiosDataDeal(data){
            this.addTemplate("djRadioItem",data.result,"djRadio");
            this.compositeAndDjRadiosEvent();
        }
        userprofileDataDeal(data){
            this.addTemplate("userItem",data.result,"user");
            this.compositeAndUserEvent();
        }
        albumDataDeal(data){
            data.result.albums.forEach(function (obj) {
                obj.formartTime = dateFormart("yyyy-MM-dd", new Date(obj.publishTime));
            });
            this.addTemplate("albumItem",data.result,"album");
            this.compositeAndAlbumEvent();
        }
        /*
        添加模板
        添加模板
        添加模板
         */
        addTemplate(templateId,data,className,isComposite=0){
            myScroll.refresh();
            let html = template(templateId,data);
            if (isComposite===0){
                $(".main-in>."+className+">.list").append(html);
            }else if (isComposite===1) {
                $(".composite>."+className+">.list").append(html);
            }else if (isComposite===2){
                $(".main-in>."+className).append(html);
            }
            myScroll.refresh();
        }
        /*
        事件绑定
        事件绑定
        事件绑定
        事件绑定往往发生在两种情况：一是有数据之前，二是数据添加模板之后
         */
        compositeEventAfterData(){
            //监听分区底部的点击(更多)，绑定一次
            $(".composite-bottom").click(function () {
                $(".nav>ul>."+this.dataset.name).click();
            });
        }
        songEventBeforeData(){
            //多选按钮的点击，进入能够多选的状态
            $(".multiple-selected").click(function () {
                $(".main-in>.song>.top").addClass("active");
                $(".main-in>.song>.list").addClass("active");
            })

            //完成按钮
            $(".complete-select").click(function () {
                $(".main-in>.song>.top").removeClass("active");
                $(".main-in>.song>.list").removeClass("active");
            })

            //全选按钮
            $(".check-all").click(function () {
                $(this).toggleClass("active");
                $(".main-in>.song>.list>li").toggleClass("active");
            })

            //播放全部按钮
            $(".main-in>.song>.top .play-all").click(function () {
                // let liLength = $(".main-in>.song>.list>li").length;
                let lis = null;
                let liActive = $(".main-in>.song>.list>li.active");
                // 没有选择歌曲，就点击了播放全部，则为默认情况，全部播放
                if (liActive.length === 0){
                    console.log("全部顺序播放");
                    lis = $(".main-in>.song>.list>li");
                }else {
                    console.log("选择的顺序播放");
                    lis = liActive;
                }
                // 加入播放列表
                lis.forEach(function (li) {
                    let songId = li.dataset.musicId;
                    let songName = $(li).find(".song-name").text();
                    let songSinger = $(li).find(".song-singer").get(0).dataset.singer;
                    setSongs(songId,songName,songSinger);
                })
                window.location.href = "../player/index.html";
            })

            // 处理单曲界面的头部
            myScroll.on("scroll",function () {
                // 固定主要内容的上半部分
                if (this.y < 0) {
                    $(".main-in>.song>.top").css("top", -this.y)
                } else {
                    $(".main-in>.song>.top").css("top", 0)
                }
            })
        }
        // 数据加载完就要绑定一次的事件
        compositeAndSongEvent(){
            // 由于使用了事件委托，不需要多次绑定
            // 点击音乐li || 复选框
            let $li = $(".song>.list");
            $li.off();
            $li.on("click",".song>.list>li",function (e) {
                // 复选框--多选--的点击
                if (e.target.nodeName.toLowerCase()==="i"){
                    $(this).toggleClass("active");
                    let liLength = $(".main-in>.song>.list>li").length;
                    let liActiveLength = $(".main-in>.song>.list>li.active").length;
                    let selectAllIsActive = $(".check-all").hasClass("active");
                    // 单个选，全选了，全选按钮得高亮
                    if (liLength === liActiveLength && !selectAllIsActive){
                        $(".check-all").addClass("active");
                    }else if (liLength !== liActiveLength){
                        $(".check-all").removeClass("active");
                    }
                    return;
                }

                // 点击的是li其它部分，则跳转播放
                let songId = this.dataset.musicId;
                let songName = $(this).find(".song-name").text();
                let songSinger = $(this).find(".song-singer").get(0).dataset.singer;
                setSongs(songId,songName,songSinger);
                window.location.href = "../player/index.html";
            })
        }
        compositeAndDjRadiosEvent(){
            // 在获取数据后调用
            let $lis = $(".djRadio>.list>li");
            $lis.off();
            $lis.click(function () {
                let djId = this.dataset.djId;
                window.location.href = "../djDetail/index.html?id=" + djId;
            })
        }
        compositeAndAlbumEvent(){
            let $lis = $(".album>.list>li");
            $lis.off();
            $lis.click(function () {
                window.location.href = "../albumDetail/index.html?id=" + this.dataset.albumId;
            })
        }
        compositeAndVideoEvent(){
            let $lis = $(".video>.list>li");
            $lis.off();
            $lis.click(function () {
                window.location.href = "../videoPlayer/index.html?id=" + this.dataset.videoId;
            })
        }
        compositeAndPlaylistEvent(){
            let $lis = $(".playList>.list>li");
            $lis.off();
            $lis.click(function () {
                window.location.href = "../playListDetail/index.html?id=" + this.dataset.playListId;
            })
        }
        compositeAndArtistEvent(){
            let $lis = $(".artist>.list>li");
            $lis.off();
            $lis.click(function () {
                window.location.href = "../artistDetail/index.html?id=" + this.dataset.artistId;
            })
        }
        compositeAndUserEvent(){
            let $lis = $(".user>.list>li");
            $lis.off();
            $lis.click(function () {
                window.location.href = "../userDetail/index.html?id=" + this.dataset.userId;
            })
        }
    }

    /*
    初始化公共头部
    */
    function initHeader() {
        // 获取传递过来的参数
        let href = window.location.href
        keyword = href.substr(href.lastIndexOf("keyword=")+"keyword=".length);
        keyword = decodeURIComponent(keyword).trim();
        $(".header>.header-in>.search-box>input").val(keyword);
        //监听返回按钮的点击
        $(".go-back").click(function () {
            window.history.back();
        })
        $(".clear-text").click(function () {
            window.history.back();
        })
    }

    /*
    创建公共底部
    */
    function createFooter() {
        $(".footer").load("./../common/footer.html",function () {
            //该函数是加载页面的回调函数，加载页面完成后才能加载js，否则会因为js找不到相应的html元素而报错
            //也就是说把js代码从footer.html中引入会报错
            let sc = document.createElement("script");
            sc.src = "./../common/js/footer.js";
            document.body.appendChild(sc);
        });
    }

    /*
    创建公共中间部分
    */
    //创建nav
    function createNav(){
        let compositeView = new Views(0,30,1018,null);
        let songView = new Views(0,30,1,"song");
        let videoView = new Views(0,30,1014,"video");
        let artistView = new Views(0,30,100, "artist");
        let playListView = new Views(0,30,1000,"playlist");
        let djRadiosView = new Views(0,30,1009,"djRadios")
        let userprofileView = new Views(0,30,1002,"userprofile")
        let albumView = new Views(0,30,10,"album")

        let oUlWidth = 0; // 获取li的宽度从而设置ul的宽度，给定ul的宽度可以实现滚动效果
        $(".nav>ul>li").forEach(function (item) {
            oUlWidth += item.offsetWidth;
        })
        //获取nav的右边padding
        let navPaddingRight = parseInt(getComputedStyle($(".nav").get(0)).paddingRight);
        //设置nav下ul的宽度
        $(".nav>ul").width(oUlWidth+navPaddingRight);
        var navScroll = new IScroll('.nav', {
            mouseWheel: true,
            scrollbars: false,
            scrollX: true
        });
        // nva点击效果
        $(".nav>ul>li").click(function () {
            myScroll.scrollTo(0,0,10);
            let offsetWidth = $(".nav").width()/2 - $(this).get(0).offsetLeft - $(this).width()/2;
            if (offsetWidth<0 && offsetWidth>navScroll.maxScrollX){
                navScroll.scrollTo(offsetWidth,0,1000);
            }
            // 被选中的字体颜色和下边框变为红色
            $(this).siblings().css({
                borderBottom: "3px solid transparent",
                color: "#333"
            })
            $(this).css({
                color:"#fd271b",
                borderBottom: "3px solid #fd271b"
            })
            // 主要内容的显示和隐藏
            $(".main-in>div").eq($(this).index()).addClass("active").siblings().removeClass("active");
            $(".pull-up").show();
            switch ($(this).index()) {
                //综合
                case 0:
                    $(".pull-up").hide();
                    currentView = compositeView;
                    break;
                case 1:
                    currentView = songView;
                    break;
                case 2:
                    currentView = videoView;
                    break;
                case 3:
                    currentView = artistView;
                    break;
                case 4:
                    currentView = albumView;
                    break;
                case 5:
                    currentView = playListView;
                    break;
                case 6:
                    currentView = djRadiosView;
                    break;
                case 7:
                    currentView = userprofileView;
                    break;
                default:
                    console.log("啥也不刷新");
            }
            myScroll.refresh();
        })
        return compositeView;
    }
    // 滚动--上拉加载更多
    function initScroll() {
        let isRefresh = false; //是否正在刷新
        let isPullUp = false;  //是否上拉
        //创建滚动
        myScroll = new IScroll(".main",{
            mouseWheel: true,
            scrollbars:false,
            probeType:3
        })

        //监听滚动
        myScroll.on("scroll",function () {
            // 综合选项，不需要监听滚动，不需要加载更多
            if (currentView.type === 1018) return;
            //实现下拉刷新
            if (this.y<=this.maxScrollY){
                $(".pull-up>p>span").html("松手加载更多");
                isPullUp = true;
            }
        })

        //停止滚动的监听
        myScroll.on("scrollEnd",function () {
            // 综合选项，不需要监听滚动，不需要加载更多
            if (currentView.type === 1018) return;
            //实现下拉刷新
            if(isPullUp && !isRefresh){
                isRefresh = true;
                $(".pull-up>p>span").html("加载中...");
                // 获取数据
                refreshDown();
            }
        })

        // 下拉加载更多获取数据
        function refreshDown() {
            //获取数据
            SearchApis.getSearch(keyword,currentView.offset,30,currentView.type)
                .then(function (data) {
                    //音乐
                    let _key = currentView.jsonKey + "Count";
                    if (data.result[_key] && data.result[_key]>=currentView.offset){
                        dataDeal[currentView.jsonKey+"DataDeal"](data);
                        // dataDeal.videoDataDeal(data);
                    }
                    else{
                        $(".pull-up").hide();
                    }

                    currentView.offset += currentView.limit;
                    // myScroll.scrollTo(0,myScroll.maxScrollY+$(".pull-up").height());

                    //复位标记
                    isRefresh = false;
                    isPullUp = false;
                    $(".pull-up>p>span").html("上拉加载更多");
                    myScroll.refresh();
                })
                .catch(function (err) {
                    console.log(err);
                })
        }
    }

    /*
    创建综合
    */
    function initComposite() {
        //获取数据
        SearchApis.getSearch(keyword,0,30,1018)
            .then(function (data) {
                dataDeal.compositeDataDeal(data);
            })
            .catch(function (err) {
                console.log(err);
            })
    }

    function main() {
        initHeader();//初始化头部
        createFooter(); //创建底部footer
        currentView = createNav(); //创建nav，1
        initScroll(); // 1
        dataDeal = new DataDeal();
        initComposite(); //初始化综合
        // initSong(); //创建单曲主要内容
    }


    main();
})