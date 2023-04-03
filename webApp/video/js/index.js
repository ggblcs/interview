$(function () {

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
    // 滚动
    let myScroll = new IScroll(".main-content",{
        mouseWheel: true,
        scrollbars:false,
        probeType:3
    })
    myScroll.on("scroll",function () {
        if(-this.y>staticHeight){
            loadData();
        }
    })
    // 每一个选项的数据
    class View{
        constructor($document,area,offset,limit,isFirst) {
            this.$document = $document;
            this.area = area;
            this.offset = offset;
            this.limit = limit;
            this.isFirst = isFirst;
        }
    }
    let allView = new View($(".video-all"),"全部",0,10,false);
    let ndView = new View($(".video-nd"),"内地",0,10,true);
    let gtView = new View($(".video-gt"),"港台",0,10,true);
    let omView = new View($(".video-om"),"欧美",0,10,true);
    let rbView = new View($(".video-rb"),"日美",0,10,true);
    let hgView = new View($(".video-hg"),"韩国",0,10,true);
    let allViewArr = [allView,ndView,gtView,omView,rbView,hgView];
    let currentView = allView;
    // 高度 判断是否需要加载数据
    let staticHeight = $(".main-content>div").height() - $(".main-content").height();
    // nav的点击
    $(".main-header>ul>li").click(function () {
        myScroll.scrollTo(0,0)
        // 选项nva的改变
        $(this).addClass("active").siblings().removeClass("active");
        // 内容列表的改变
        currentView.$document.removeClass("active");
        allViewArr[$(this).index()].$document.addClass("active");
        // 改变currentView
        currentView = allViewArr[$(this).index()];
        myScroll.refresh();
        // 如果是第一次进入，加载数据
        if(currentView.isFirst){
            loadData();
            currentView.isFirst =false;
            myScroll.refresh();
        }
    })


    /*
    各个板块
     */
    // 数据加载
    let isLoadData = false;
    loadData();
    function loadData() {
        if (isLoadData === true)return;
        isLoadData = true;
        console.log("正在加载数据");
        MVDetailApis.getAllMV(currentView.area,currentView.limit,currentView.offset)
            .then(function (data) {
                currentView.offset += currentView.limit;
                let html = template("infoData",data);
                currentView.$document.append(html);
                // 重新计算高度
                staticHeight = $(".main-content>div").height() - $(".main-content").height();
                liEvent();
                myScroll.refresh();
                isLoadData = false;
            })
            .catch(function (err) {
                console.log(err);
            })
    }
    // 点击事件
    function liEvent() {
        let $lis = $(".list>li");
        $lis.off();
        $lis.click(function () {
            window.location.href = "../mvPlayer/index.html?id=" + this.dataset.mvId;

        })
    }
})