(function () {
    function getScreen() {
        let width, height;
        if(window.innerWidth){
            width = window.innerWidth;
            height = window.innerHeight;
        }else if(document.compatMode === "BackCompat"){
            width = document.body.clientWidth;
            height = document.body.clientHeight;
        }else{
            width = document.documentElement.clientWidth;
            height = document.documentElement.clientHeight;
        }
        return {
            width: width,
            height: height
        }
    }
    function getPageScroll() {
        let x, y;
        if(window.pageXOffset){
            x = window.pageXOffset;
            y = window.pageYOffset;
        }else if(document.compatMode === "BackCompat"){
            x = document.body.scrollLeft;
            y = document.body.scrollTop;
        }else{
            x = document.documentElement.scrollLeft;
            y = document.documentElement.scrollTop;
        }
        return {
            x: x,
            y: y
        }
    }
    function addEvent(ele, name, fn) {
        if(ele.attachEvent){
            ele.attachEvent("on"+name, fn);
        }else{
            ele.addEventListener(name, fn);
        }
    }
    function getStyleAttr(obj, name) {
        if(obj.currentStyle){
            return obj.currentStyle[name];
        }else{
            return getComputedStyle(obj)[name];
        }
    }
    function debounce(fn, delay) { // fn = test
        let timerId = null;
        return function () {
            let self = this;
            let args = arguments;
            timerId && clearTimeout(timerId);
            timerId = setTimeout(function () {
                fn.apply(self, args);
            }, delay || 1000);
        }
    }
    function throttle(fn, delay) { // fn = test
        let timerId = null;
        let flag = true;
        return function () {
            if(!flag) return;
            flag = false;
            let self = this;
            let args = arguments;
            timerId && clearTimeout(timerId);
            timerId = setTimeout(function () {
                flag = true;
                fn.apply(self, args);
            }, delay || 1000);
        }
    }
    /* 格式化播放量数据 */
    function formatNum(num) {
        let res = 0;
        if (num/100000000>1){
            let temp = num / 100000000 + "";
            if (temp.indexOf(".") === -1){
                res = num / 100000000 + "亿"
            }else {
                res = (num / 100000000).toFixed(1) + "亿";
            }
        }else if (num / 10000 > 1){
            let temp = num / 10000 + "";
            if (temp.indexOf(".") === -1){
                res = num / 10000 + "万";
            }else{
                res = (num / 10000).toFixed(1) + "万";
            }
        }else{
            res = num;
        }
        return res;
    }
    function formartTime(time) {
        // 2.得到两个时间之间的差值(秒)
        let differSecond = time / 1000;
        // 3.利用相差的总秒数 / 每一天的秒数 = 相差的天数
        let day = Math.floor(differSecond / (60 * 60 * 24));
        day = day >= 10 ? day : "0" + day;
        // 4.利用相差的总秒数 / 小时 % 24;
        let hour = Math.floor(differSecond / (60 * 60) % 24);
        hour = hour >= 10 ? hour : "0" + hour;
        // 5.利用相差的总秒数 / 分钟 % 60;
        let minute = Math.floor(differSecond / 60 % 60);
        minute = minute >= 10 ? minute : "0" + minute;
        // 6.利用相差的总秒数 % 秒数
        let second = Math.floor(differSecond % 60);
        second = second >= 10 ? second : "0" + second;
        return {
            day: day,
            hour: hour,
            minute: minute,
            second: second,
        }
    }
    function dateFormart(fmt, date) {
        // 1.处理年
        // 1.1找到yyyy
        // +在正则表达式中表示匹配1个或多个连续的指定字符
        // let reg = /y+/;
        let yearStr = fmt.match(/y+/);
        if(yearStr){
            yearStr = yearStr[0];
            // 1.2获取到当前的年
            let yearNum = date.getFullYear() + ""; // 2019
            yearNum = yearNum.substr(4 - yearStr.length)
            // 1.3利用当前的年替换掉yyyy
            fmt = fmt.replace(yearStr, yearNum);
        }
        // 2.处理其他的时间
        let obj = {
            "M+" : date.getMonth() + 1,
            "d+" : date.getDate(),
            "h+" : date.getHours(),
            "m+" : date.getMinutes(),
            "s+" : date.getSeconds()
        };
        // 2.1遍历取出所有的时间
        for(let key in obj){
            // let reg = new RegExp("M+");
            let reg = new RegExp(`${key}`);
            // 取出格式化字符串中对应的格式字符 MM dd hh mm ss
            let fmtStr = fmt.match(reg);
            if(fmtStr){
                fmtStr = fmtStr[0];
                // 单独处理一位或者两位的时间
                if(fmtStr.length === 1){
                    // 一位
                    fmt = fmt.replace(fmtStr, obj[key]);
                }else{
                    // 两位
                    let numStr = "00" + obj[key];
                    //"00" + 4 = "004"
                    //"00" + 23 = "0023"
                    numStr = numStr.substr((obj[key] + "").length);
                    fmt = fmt.replace(fmtStr, numStr);
                }
            }
        }
        // 3.将格式化之后的字符串返回
        return fmt;
    }
    function getSongs(){
        let songArray = sessionStorage.getItem("song");
        if(!songArray){
            songArray = [];
        }else{
            songArray = JSON.parse(songArray);
        }
        return songArray;
    }
    function setSongs(id,name,singer) {
        let songArray = getSongs();
        // 判断是否有重复的，有就return
        for (let i = 0;i<songArray.length;i++){
            if (songArray[i].id === id){
                // 将这首歌曲移到第一个
                let obj = songArray.splice(i,1);
                songArray.unshift(obj[0]);
                sessionStorage.setItem("song", JSON.stringify(songArray));
                return;
            }
        }

        songArray.unshift({id:id,name:name,singer:singer});
        sessionStorage.setItem("song", JSON.stringify(songArray));
    }
    function getDj(){
        let songArray = sessionStorage.getItem("dj");
        if(!songArray){
            songArray = [];
        }else{
            songArray = JSON.parse(songArray);
        }
        return songArray;
    }
    function setDj(id,name,singer,bg) {
        let songArray = getDj();
        // 判断是否有重复的，有就return
        for (let i = 0;i<songArray.length;i++){
            if (songArray[i].id === id){
                // 将这首歌曲移到第一个
                let obj = songArray.splice(i,1);
                songArray.unshift(obj[0]);
                sessionStorage.setItem("dj", JSON.stringify(songArray));
                return;
            }
        }

        songArray.unshift({id:id,name:name,singer:singer,bg:bg});
        sessionStorage.setItem("dj", JSON.stringify(songArray));
    }
    function clearSongs(){
        sessionStorage.removeItem("song");
    }

    function deleteSongByIndex(index){
        let songArray = getSongs();
        songArray.splice(index,1);
        sessionStorage.setItem("song", JSON.stringify(songArray));
        return songArray.length;
    }
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值
    }
    window.deleteSongByIndex = deleteSongByIndex;
    window.clearSongs = clearSongs;
    window.getSongs = getSongs;
    window.setSongs = setSongs;
    window.getScreen = getScreen;
    window.getPageScroll = getPageScroll;
    window.addEvent = addEvent;
    window.getStyleAttr = getStyleAttr;
    window.debounce = debounce;
    window.throttle = throttle;
    window.formatTime = formartTime;
    window.formartNum = formatNum;
    window.dateFormart = dateFormart;
    window.getRandomIntInclusive = getRandomIntInclusive;
    window.setDj = setDj;
    window.getDj = getDj;
})();