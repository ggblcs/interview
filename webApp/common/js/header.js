$(function () {
    /**
     * 头部header的点击与切换
     */
    //头部中间输入框获取焦点
    $(".header-center-box>input").focus(function () {
        //让header处于激活状态
        $(".header-in").addClass("active");
        //显示历史和热搜榜
        $(".header-container").show();
        //2. 搜索历史 输入框失去焦点获取输入数据作为搜索历史
        $(".history-bottom>li").remove();
        let historyArray = getHistory();
        if (historyArray.length === 0){
            $(".search-history").hide();
        }else{
            $(".search-history").show();
            historyArray.forEach(function (item) {
                let oLi = $("<li></li>");
                oLi.text(item);
                $(".history-bottom").append(oLi);
            })
            $(".history-bottom>li").click(function () {
                window.location.href = "./../searchDetail/index.html?keyword=" + $(this).text();
            })
        }
        searchScroll.refresh();
    })

    //点击取消按钮
    $(".header-cancel").click(function () {
        //让header不再处于激活状态
        $(".header-in").removeClass("active");
        //隐藏热搜榜和历史
        $(".header-container").hide();
        //还原搜索的ajax数据，不然下次进入界面显示上次搜索结果
        $(".header-center-box>input").get(0).oninput();
    })

    //朋友界面 动态和附近按钮切换
    $(".header-switch>span").click(function () {
        //移动红色背景
        $(".header-switch>i").animate({
            left: this.offsetLeft,
        },200)
        //修改字体颜色
        $(this).addClass("active").siblings().removeClass("active");
    })
    //-----------------------------
    // 初始化搜索栏目
    //1. 关闭广告
    $(".search-ad>span").click(function () {
        $(".search-ad").remove();
    })
    $(".header-center-box>input").blur(function () {
        if (this.value.length === 0){
            return;
        }
        setHistory(this.value);
        this.value = "";
    })
    // 点击清空按钮
    $(".history-top>img").click(function (){
        localStorage.removeItem("history");
        $(".search-history").hide();
    })

    // 3. 热搜榜
    HomeApis.getHomeHotDetail().
    then(function (data) {
        let html = template("hotDetail",data);
        $(".hot-bottom").append(html);
        searchScroll.refresh();
    }).
    catch(function (err) {
        // console.log(err);
    })
    var searchScroll = new IScroll('.header-container',{
        mouseWheel: false,
        scrollbars: false,
        /*
       需要使用iscroll-probe.js才能生效probeType：
       1  滚动不繁忙的时候触发
       2  滚动时每隔一定时间触发
       3  每滚动一像素触发一次
       * */
        // probeType: 3,
    });
    //4. 相关搜索
    $(".header-center-box>input").get(0).oninput=throttle(function () {
        if (this.value.length === 0){
            $(".search-ad").show();
            // $(".search-history").show();
            $(".search-hot").show();
            $(".search-current").hide();
        }else{
            $(".search-ad").hide();
            $(".search-history").hide();
            $(".search-hot").hide();
            $(".search-current").show();
            $(".current-bottom>li").remove();

            HomeApis.getHOmeSearchSuggest(this.value).
            then(function (data) {
                data.result.allMatch.forEach(function (item) {
                    let oLi = $(`<li><img src=\"../common/images/topbar-it666-search.png\" alt=\"\"><p>${item.keyword}</p></li>`);
                    $(".current-bottom").append(oLi);
                })
                $(".current-bottom>li").click(function () {
                    setHistory($(this).text());
                    window.location.href = "./../searchDetail/index.html?keyword=" + $(this).text();
                });
                searchScroll.refresh();
            }).catch(function (err) {
                console.log(err);
            })
        }
        searchScroll.refresh();
        $(".current-top").html(`搜索"<span>${this.value}</span>"`);
    },1000)

    // 搜索“林俊杰” 的点击
    $(".current-top").click(function () {
        let text = $(".current-top>span").text();
        window.location.href = "./../searchDetail/index.html?keyword=" + text;
    })
    // 获取搜索历史数据
    function getHistory(){
        let historyArray = localStorage.getItem("history");
        if(!historyArray){
            historyArray = [];
        }else{
            historyArray = JSON.parse(historyArray);
        }
        return historyArray;
    }
    function setHistory(value) {
        let historyArray = getHistory();
        if(!historyArray.includes(value)){
            historyArray.unshift(value);
            localStorage.setItem("history", JSON.stringify(historyArray));
        }
    }
})