;(function (window) {
    class Player{
        constructor($audio, musicList) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
            this.musicList = musicList;
            this.defaultVolume = 0.5; //默认音量大小
            this.audio.volume = this.defaultVolume;
            this.currentIndex = -1; // 当前正在播放的音乐
            this.playMode = "loop";
        }
        // 歌曲加载完成后的事件
        musicCanPlay(callBack){
            let that = this;
            this.$audio.on("canplay",function () {
                // let currentTime = that.audio.currentTime;
                let duration = that.audio.duration;
                // let value = currentTime / duration;
                // 格式化后的时间
                let timeObj = formatTime(duration*1000);
                let totalTimeStr = timeObj.minute + ":" + timeObj.second;
                // 选中的时长，总时长，选中时长格式化后的格式：分：秒
                callBack(duration,totalTimeStr);
            })
        }
        // 是否播放完毕
        musicEnded(callback){
            let that = this;
            let index = -1;
            this.$audio.on("ended",function () {
                if (that.playMode === "loop"){
                    index = that.currentIndex + 1;
                    if (index>that.musicList.length -1){
                        index = 0;
                    }
                }else if (that.playMode === "one"){
                    index = that.currentIndex;
                }else if (that.playMode === "random"){
                   while (true){
                       index = getRandomIntInclusive(0,that.musicList.length-1);
                       if (index !== that.currentIndex){
                           break;
                       }
                   }
                }
                callback(index);
            })
        }
        // 返回歌曲进度
        musicTimeUpDate(callBack){
            let that = this;
            this.$audio.on("timeupdate",function () {
                let currentTime = that.audio.currentTime;
                let duration = that.audio.duration;
                // let value = currentTime / duration;
                // 格式化后的时间
                let timeObj = formatTime(currentTime*1000);
                let currentTimeStr = timeObj.minute + ":" + timeObj.second;
                // 选中的时长，总时长，选中时长格式化后的格式：分：秒
                callBack(currentTime,duration,currentTimeStr);
            })
        }
        // 设置歌曲进度，跳转到歌曲指定位置，传入百分比
        musicSeekTo(value){
            value = value * this.audio.duration;
            if (!value){return;}
            this.audio.currentTime = value;
        }
        // 获取音量大小
        musicGetVolume(){
            return this.audio.volume;
        }
        // 设置音量大小,传入值0~1
        musicSetVolume(value){
            if (value<0){
                this.audio.volume = 0
            }
            else if ( value>1){
                this.audio.volume = 1
            }
            else{
                this.audio.volume = value;
            }
            if (value !== 0){
                this.defaultVolume = value;
            }
        }

        playMusic(index){
            if (index === this.currentIndex){
                // 想要播放的歌曲与正在播放的歌曲是同一首歌曲
                if (this.audio.paused){
                    this.audio.play();
                }else{
                    this.audio.pause();
                }
            }else{
                // 想要播放的歌曲与正在播放的歌曲 不是 同一首歌曲
                // 不是同一首歌曲
                let song = this.musicList[index];
                let that = this;
                MusicApis.getSongURL(song.id)
                    .then(function (data) {
                        that.$audio.html("");
                        for(let i = 0; i < data.data.length; i++){
                            let $sc = $(`<source src="${data.data[i].url}" type="audio/${data.data[i].type}"/>`);
                            $("audio").append($sc);
                        }
                        // 注意点: 如果更换了需要播放歌曲的地址, 那么必须让audio重新加载才会播放更新之后的歌曲
                        that.audio.load();
                        // 播放歌曲
                        that.audio.play();
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
            this.currentIndex = index;
        }
    }

    window.Player = Player;
})(window)