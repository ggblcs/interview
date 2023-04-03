$(function () {


    let href = window.location.href;
    let userId = 374074446;
    userId = href.substr(href.indexOf("id=")+"id=".length);

    /*
    公共顶部
     */
    // 返回按钮
    $(".header-back").click(function () {
        window.history.back()
    })

    UserDetailApis.getUserDetail(userId)
        .then(function (data) {
            // 注册时间格式化
            data.profile.createTime = dateFormart("yyyy-MM-dd",new Date(data.profile.createTime));
            $(".bg>div>img").attr("src",data.profile.backgroundUrl)
            let html = template("userInfo",data);
            $(".main-in").html(html);
            userEvent();
        })
        .catch(function (err) {
            console.log(err);
        })

    function userEvent() {
        $(".attention").click(function () {
            $(this).toggleClass("active");
        })
    }
})