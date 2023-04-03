$(function () {



    $(".footer").load("./../common/footer.html",function () {
        //该函数是加载页面的回调函数，加载页面完成后才能加载js，否则会因为js找不到相应的html元素而报错
        //也就是说把js代码从footer.html中引入会报错
        let sc = document.createElement("script");
        sc.src = "./../common/js/footer.js";
        document.body.appendChild(sc);
    });

    $(".header").load("./../common/header.html",function () {
        let sc = document.createElement("script");
        sc.src = "./../common/js/header.js";
        document.body.appendChild(sc);

        $(".header-switch>span").click(function () {
            myScroll.scrollTo(0,0);
            // 点击了 最新 按钮
            if ($(this).hasClass("new")){
                currentView.$document.removeClass("active");
                currentView = newView;
                currentView.$document.addClass("active");
            }else{
                currentView.$document.removeClass("active");
                currentView = hotView;
                currentView.$document.addClass("active");

            }
            if (currentView.isFirst){
                loadData();
                currentView.isFirst = false;
            }
            staticHeight = currentView.$document.height() + $(".load-more").height() - $(".main-in").height(); //更新高度，以便下拉加载更多
        })
    })


    class View{
        constructor($document,offset,limit,type,isFirst) {
            this.$document = $document;
            this.limit = limit;
            this.offset = offset;
            this.type = type;
            this.isFirst = isFirst;
        }
    }
    let newView = new View($(".new-dj"),0,30,"new",false);
    let hotView = new View($(".hot-dj"),0,30,"hot",true);
    let currentView = newView;
    /*
    滚动
     */
    let myScroll = new IScroll(".main-in",{    mouseWheel: true,    scrollbars:false,    probeType:3})
    // ul高度+下拉加载更多高度-视口高度 与 this.y比较
    let staticHeight = currentView.$document.height() + $(".load-more").height() - $(".main-in").height();
    // 监听滚动，加载更多
    myScroll.on("scroll",function () {
        if (-this.y > staticHeight){
            loadData();
        }
    })
    /*
    加载数据
     */
    let isLoadData = false;
    function loadData() {
        if(isLoadData) return;
        isLoadData = true;
        DetailApis.geTopList(currentView.type,currentView.limit,currentView.offset)
            .then(function (data) {
                data.toplist.forEach(function (item) {
                    item.playCount = formartNum(item.playCount);
                    if (currentView.type === "new"){
                        item.type = "最新榜"
                    }else if (currentView.type ==="hot"){
                        item.type = "最热榜"
                    }
                })
                let html = template("infoLi",data);
                currentView.$document.append(html);
                event();
                myScroll.refresh();
                staticHeight = currentView.$document.height() + $(".load-more").height() - $(".main-in").height(); //更新高度，以便下拉加载更多
                currentView.offset += currentView.limit;
                isLoadData = false;
            })
            .catch(function (err) {
                console.log(err);
            })
    }
    loadData();
    // 事件绑定
    function event() {
        let $lis = $(".list>li");
        $lis.off();
        $lis.click(function () {
            let djId = this.dataset.djId;
            window.location.href = "../djDetail/index.html?id="+djId;

        })
    }
})