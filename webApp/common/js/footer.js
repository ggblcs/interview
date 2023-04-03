$(function () {
    /**
     * 底部footer的点击与切换
     */
    let pageArray = ["home","video","music","djpage","account"];
/*
    $(".footer-in>ul>li").click(function () {
        //使被点击的li处于被激活状态
        $(this).addClass("active").siblings().removeClass("active");
        //切换背景图片
        let url = $(this).find("img").attr("src").replace("normal","selected");
        $(this).find("img").attr("src",url);
        //排他
        $(this).siblings().find("img").forEach(function (value,index) {
            let url = $(value).attr("src").replace("selected","normal");
            $(value).attr("src",url);
        })
        //    切换头部效果
        let currentName = pageArray[$(this).index()];
        $(".header-in").removeClass().addClass("header-in " + currentName);
        //切换界面
        // window.location.href = `./../${currentName}/index.html#${currentName}`;


    })
    let hashStr = window.location.hash.substr(1);
    if (hashStr.length === 0){
        $(".home").click();
    }else{
        $("."+hashStr).click();
    }

 */



    let hashStr = window.location.hash.substr(1);
    if (hashStr.length === 0){
        changeFAndH("home");
    }else{
        changeFAndH(hashStr);
    }

    function changeFAndH(str){
        let index = pageArray.findIndex(function (item) {
            return item === str;
        });
        //使被点击的li处于被激活状态
        $(".footer-in>ul>li").eq(index).addClass("active").siblings().removeClass("active");
        //切换背景图片
        let url = $(".footer-in>ul>li").eq(index).find("img").attr("src").replace("normal","selected");
        $(".footer-in>ul>li").eq(index).find("img").attr("src",url);
        //排他
        $(".footer-in>ul>li").eq(index).siblings().find("img").forEach(function (value,index) {
            let url = $(value).attr("src").replace("selected","normal");
            $(value).attr("src",url);
        })
        //    切换头部效果
        let currentName = pageArray[index];
        $(".header-in").removeClass().addClass("header-in " + currentName);
    }


})