$(function () {


    // 获取programId
    let programId = 2937703483;
    let wHref = window.location.href;
    programId = wHref.substr(wHref.indexOf("id=")+"id=".length);

    $(".footer").load("./../common/footer.html",function () {
        //该函数是加载页面的回调函数，加载页面完成后才能加载js，否则会因为js找不到相应的html元素而报错
        //也就是说把js代码从footer.html中引入会报错
        let sc = document.createElement("script");
        sc.src = "./../common/js/footer.js";
        document.body.appendChild(sc);
    });

    /*
    处理公共内容
     */

    PlayListApis.getPlaylistDetail(programId)
        .then(function (data) {
            // 发行时间
            data.playlist.publishTime = dateFormart("yyyy-MM-dd",new Date(data.playlist.publishTime));
            // 背景图片
            $(".main-bg>img").attr("src",data.playlist.coverImgUrl);
            //共xx首
            $(".header-select>span").html("(共"+data.playlist.tracks.length+"首)");
            // 专辑信息模板
            let topInfo = template("topInfo",data);
            $(".main-top").html(topInfo);
            // 歌曲模板
            let bottomList = template("bottomList",data);
            $(".list-main").html(bottomList);
            songClick();
            myScroll.refresh()
        })
        .catch(function (err) {
            console.log(err);
        })
    //创建内容滚动区域
    let myScroll = new IScroll(".main",{
        mouseWheel: true,
        scrollbars:false,
        probeType:3
    })
    let mainTopHeight = $(".main-top").height();
    let headerHeight = $(".header").height();
    let staticHeight = mainTopHeight - headerHeight;
    myScroll.on("scroll",function () {
        // 设置header的背景色随着滚动而改变
        let headerOpacity = 0;
        if (this.y<0 && this.y>-staticHeight){
            headerOpacity = Math.abs(this.y / staticHeight);
        }else if (this.y<=-staticHeight){
            headerOpacity = 1
        }else {
            headerOpacity = 0;
        }
        $(".header").css({
            backgroundColor: `rgba(85, 85, 85, ${headerOpacity})`
        })
        // 随着滚动，固定播放与选择
        if (this.y<=(-staticHeight)){
            $(".bottom-header").css({
                position: "relative",
                top: Math.abs(this.y)-staticHeight
            })
        }else {
            $(".bottom-header").css({
                position: "static"
            })
        }
    })


    // 选择歌曲的点击
    $(".header-select").click(function () {
        $(".main-bottom").addClass("active");
    })
    // 确定按钮的点击
    $(".header-OK").click(function () {
        $(".main-bottom").removeClass("active");
    })
    // 加载完数据绑定的事件
    function songClick(){
        // 歌曲的复选框的点击，应在加载完数据后绑定
        $(".list-main>li").click(function (e) {
            let isSelect = $(".main-bottom").hasClass("active");
            if (isSelect){
                $(this).toggleClass("active");
                return;
            }else{
                let songMessage = JSON.parse(this.dataset.songMessage);
                setSongs(songMessage.id,songMessage.name,songMessage.singer);
                window.location.href = "../player/index.html"
            }
        })
        // 播放全部
        $(".header-playAll").click(function () {
            // 播放选中的
            let $selectSong = $(".list-main>li.active");
            if ($selectSong.length ===0){
                // 全部播放
                $selectSong = $(".list-main>li")
            }
            for (let i=$selectSong.length-1;i>=0;i--){
                let song = JSON.parse($selectSong.get(i).dataset.songMessage);
                setSongs(song.id,song.name,song.singer);
            }
            window.location.href = "../player/index.html"
        })

    }





    // 返回按钮
    $(".header-back").click(function () {
        window.history.back()
    })

    /*处理公共的内容区域*/
    /*
    // 获取详情界面数据
    DetailApis.getDjDetail(programId)
        .then(function (data) {
            // 设置背景
            $(".main-bg>img").attr("src",data.data.picUrl)
            let html = template("topInfo",data.data); //封面数据
            $(".main-top").html(html);

            let detailHtml = template("bottomInfo",data.data);// 详情数据
            $(".main-bottom>.bottom-content>.content-default").html(detailHtml)
            myScroll.refresh();
        })
        .catch(function (error) {
            console.log(error);
        })
    //创建内容滚动区域---最难
    let myScroll = new IScroll(".main",{
        mouseWheel: true,
        scrollbars:false,
        probeType:3
    })
    let mainTopHeight = $(".main-top").height();
    let headerHeight = $(".header").height();
    let staticOffsetY = mainTopHeight-headerHeight;
    myScroll.on("scroll",function () {
        // 固定滚动
        if (Math.abs(this.y)>staticOffsetY){
            $(".main-bottom").css({
                position: "fixed",
                left :0,
                top: Math.abs(this.y) + headerHeight
            })
            let subContentOffsetY = Math.abs(this.y) - staticOffsetY;
            $(".main-bottom .bottom-content").css({
                transform: `translateY(${-subContentOffsetY}px)`,
            })
        }else if (this.y>=0){
            $(".main-bottom").css({
                position: "static"
            })
            $(".main-bottom .bottom-content").css({
                transform: `translateY(0px)`,
            })
        }

        // 背景特效, 如果向下滚动
        if (this.y>0){
            let mainHeight = $(".main").height();
            let scale = (mainHeight + this.y) / mainHeight;
            scale *= 100;
            $(".main-bg img").css({
                width: scale + "%"
            })
        }else {
            $(".main-bg img").css({
                width: "100%"
            })
        }
    })

    // 监听底部内容--选项卡--的点击
    let $span = $(".bottom-header>p>span");
    let spanWidth = $span.width();
    let spanLeft = $span.offset().left;
    $(".bottom-header>.line").css({
        width: spanWidth+"px",
        left:spanLeft
    })
    $(".bottom-header>p").click(function () {

        //切换字体颜色
        $(this).addClass("active").siblings().removeClass("active");
        //下划线的移动
        let $span = $(this).find("span");
        let spanWidth = $span.width();
        let spanLeft = $span.offset().left;
        $(".bottom-header>.line").animate({
            width: spanWidth+"px",
            left:spanLeft
        }, 300)
        //内容的显示隐藏切换
        $(".bottom-content>div").eq($(this).index()).addClass("active").siblings().removeClass("active");

        // 如果点击的是--节目-- && 节目列表为空，就加载数据

        let isProgram = $(".bottom-header>p:nth-child(2)").hasClass("active");
        let isFirst = $(".content-list>.list-main>li").length === 0;
        if (isProgram && isFirst){
            initBottomList();
        }
        // 归零重置
        $(".main-bottom .bottom-content").css({
            transform: `translateY(0px)`,
        })
        $(".main-bottom").css({
            position: "static"
        })
        myScroll.refresh();
        myScroll.scrollTo(0,0,0);
    })
    function initBottomList(ascBoolean){
        DetailApis.getProgram(programId,ascBoolean)
            .then(function (data) {
                data.programs.forEach(function (value) {
                    value.createTime =  dateFormart("yyyy-MM-dd",new Date(value.createTime)); //创建时间
                    value.listenerCount = formartNum(value.listenerCount); //播放量
                    let timeObj = formatTime(value.duration);
                    value.duration = timeObj.minute + ":" + timeObj.second;//时长
                })
                $(".main-bottom>.bottom-header>p:nth-child(2)>b").html(data.count);
                $(".header-periodical").text("共"+data.count+"期")
                let html = template("bottomList",data);
                $(".main-bottom>.bottom-content>.content-list>.list-main").html(html);
                myScroll.refresh();
            })
            .catch(function (err) {
                console.log(err);
            })
    }
    // 监听多选按钮的点击---节目选项卡中的多选
    $(".header-multiple").click(function () {
        $(".content-list>.list-header").addClass("active"); // 换标题样式
        $(".list-main").addClass("active"); // 换li的样式
    })
    // 监听多选完成按钮的点击---节目选项卡中的多选完成
    $(".header-ok").click(function () {
        $(".content-list>.list-header").removeClass("active");
        $(".list-main").removeClass("active"); // 换li的样式
    })
    // 全选按钮的点击
    $(".check-all").click(function () {
        // $(".check-all>i").css({
        //     background: 'url("./images/detail-x-checked.png") no-repeat',
        //     backgroundSize: '100% 100%'
        // })
        $(".check-all>i").toggleClass("active");
    })
    // 排序按钮的点击
    let asc = false; //默认排序从新到旧
    $(".header-sort").click(function () {
        asc = !asc;
        initBottomList(asc);
        //旋转排序图片
        $(".header-sort>img").css({
            transform: 'rotate('+(180*asc)+'deg)'
        })
    })
    */

})