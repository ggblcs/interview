$(function () {

    class View{
        constructor($document,limit=10,offset=0,isFirst=true) {
            this.$document = $document;
            this.limit = limit;
            this.offset = offset;
            this.isFirst = isFirst;
        }
    }
    let playlistView = new View($(".new-playlist"));
    let topList = new View($(".top-list-null"));
    let exclusiveView = new View($(".exclusive"));
    let viewArray = [playlistView,topList,exclusiveView]
    playlistView.isFirst = false;
    playlistView.limit = 20;
    let currentView = playlistView;


    /*
    公共头部和公共底部
     */
    $(".header").load("./../common/header.html",function () {
        let sc = document.createElement("script");
        sc.src = "./../common/js/header.js";
        document.body.appendChild(sc);
    })
    $(".footer").load("./../common/footer.html",function () {
        //该函数是加载页面的回调函数，加载页面完成后才能加载js，否则会因为js找不到相应的html元素而报错
        //也就是说把js代码从footer.html中引入会报错
        let sc = document.createElement("script");
        sc.src = "./../common/js/footer.js";
        document.body.appendChild(sc);
    });

    /*
        公共中间
     */
    // 创建滚动
    let myScroll = new IScroll(".main-in",{
        mouseWheel: true,
        scrollbars:false,
        probeType:3
    })
    let isLoadData = false;
    let staticHeight = currentView.$document.height() + $(".main-more").height()/2 - $(".main-in").height();
    // 监听滚动
    myScroll.on("scroll",function () {
        if (-this.y>staticHeight){
            loadPlaylist();
            loadExclusive();
        }
    })
    // nav事件
    $(".nav>ul>li").click(function () {
        // 菜单的切换
        $(this).addClass("active").siblings().removeClass("active");
        // 内容的切换
        currentView.$document.removeClass("active");
        currentView = viewArray[$(this).index()];
        currentView.$document.addClass("active");
        // 重新计算
        staticHeight = currentView.$document.height() + $(".main-more").height()/2 - $(".main-in").height();
        myScroll.scrollTo(0,0)
        myScroll.refresh();
        // 数据加载
        if (currentView.isFirst){
            loadPlaylist();
            loadExclusive();
            currentView.isFirst = false;
        }
    })

    /*
    各个部分
     */
    // 歌单数据
    loadPlaylist();
    function loadPlaylist() {
        // 选中的不是歌单，就不需要加载歌单数据
        if(currentView!==playlistView) return;
        // 正在加载数据，不能再加载
        if (isLoadData) return;
        isLoadData = true;
        PlayListApis.getPlaylistTop(playlistView.limit,playlistView.offset)
            .then(function (data) {
                // 播放次数处理
                data.playlists.forEach(function (item) {
                    item.playCount = formartNum(item.playCount);
                })
                let html = template("playlist",data);
                playlistView.$document.append(html);
                playlistEvent();
                // 重新计算
                staticHeight = currentView.$document.height() + $(".main-more").height()/2 - $(".main-in").height();
                isLoadData = false;
                currentView.offset += currentView.limit;
                myScroll.refresh();
            })
    }
    function playlistEvent() {
        let $lis = $(".new-playlist>li");
        $lis.off();
        $lis.click(function () {
            window.location.href = "../playListDetail/index.html?id=" + this.dataset.playlistId;
        })
    }
    // 网易出品数据
    function loadExclusive() {
        if (currentView !== exclusiveView) return;
        if (isLoadData) return;
        isLoadData = true;
        MusicApis.getExclusive(currentView.limit,currentView.offset)
            .then(function (data) {
                let html = template("exclusiveInfo",data);
                $(".exclusive").append(html);
                isLoadData = false;
                exclusiveEvent();
                staticHeight = currentView.$document.height() + $(".main-more").height()/2 - $(".main-in").height();
                currentView.offset += currentView.limit;
                myScroll.refresh();
            })
            .catch(function (err) {
                console.log(err);
            })
    }
    function exclusiveEvent() {
        let $lis = $(".exclusive>li");
        $lis.off();
        $lis.click(function () {
            window.location.href = "../mvPlayer/index.html?id=" + this.dataset.mvId;
        })
    }
})