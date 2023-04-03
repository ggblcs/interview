$(function () {

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

    let isLogin = false;
    let userId = 0;
    // 判断是否登录
    isLoginFun();
    function isLoginFun(){
        LoginApis.getIsLogin()
            .then(function (data) {
                if (data.data.account == null){
                    isLogin = false;
                    $(".login-before").addClass("show");
                    $(".login-after").removeClass("show");
                }else {
                    isLogin = true;
                    userId = data.data.account.id;
                    getLikeSongID();
                    $(".login-before").removeClass("show");
                    $(".login-after").addClass("show");
                }
            })
            .catch(function (err) {
                console.log(err);
            })
        LoginApis.getLoginInfo()
            .then(function (data) {
                if (data.account == null){
                    isLogin = false;
                    $(".login-before").addClass("show");
                    $(".login-after").removeClass("show");
                }else {
                    isLogin = true;
                    userId = data.data.account.id;
                    getLikeSongID();
                    $(".login-before").removeClass("show");
                    $(".login-after").addClass("show");
                }
            })
            .catch(function (err) {
                console.log(err);
            })
    }

    // 点击登录
    $(".before-in input[value='登录']").click(function () {
        $(".login-before").hide();
        $(".login-after").show();
        // let phone = $(".before-in input[name=phone]").val().trim();
        // let password = $(".before-in input[name=password]").val().trim();
        // if (!(phone && password)){
        //     alert("请输入内容");
        //     return;
        // }
        // login(phone,password);
    })
    // 登录
    function login(phone,password){
        LoginApis.login(phone,password)
            .then(function (data) {
                // window.location.reload();
            })
            .catch(function (err) {
                console.log(err);
            })
    }

    // 获取喜欢的音乐
    function getLikeSongID(){
        if (!isLogin) return;
        LoginApis.getLikeSongID(userId)
            .then(function (data) {
            })
            .catch(function (err) {
                console.log(err);
            })
    }


})