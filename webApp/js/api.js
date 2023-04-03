;(function () {
    axios.defaults.baseURL = 'http://127.0.0.1:3000';

    axios.defaults.timeout = 3000;

    class HYHttp {
        static get(url="",data={}){
            return new Promise(function (resolve, reject) {
                axios.get(url, {
                    params: data
                })
                    .then(function (response) {
                        resolve(response.data);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            })
        }
        static post(url="",data={}){
            return new Promise(function (resolve, reject) {
                axios.post(url, {
                    params: data
                })
                    .then(function (response) {
                        resolve(response.data);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            })
        }
    }
    class HomeApis{
        //轮播图数据
        static getHomeBanner(){
            return HYHttp.get("/banner",{
                type:2
            })
        }
        //推荐歌单数据
        static getHomeRecommend(){
            return HYHttp.get("/personalized")
        }
        //独家放送数据
        static getHomeExclusive(){
            return HYHttp.get("/personalized/privatecontent")
        }
        //新碟推荐
        static getHomeAlbum(){
            return HYHttp.get("/top/album", {offset: 0, limit:6});
        }
        static getHomeMV(){
            return HYHttp.get("/personalized/mv");
        }
        static getHomeDJ(){
            return HYHttp.get("/personalized/djprogram");
        }
        //热搜榜
        static getHomeHotDetail(){
            return HYHttp.get("/search/hot/detail");
        }
        //推荐搜索
        static getHOmeSearchSuggest(key){
            return HYHttp.get("/search/suggest",{keywords:key,type:"mobile"})
        }
    }
    class SearchApis{
        /*
        keywords: 需要搜索的内容
        offset: 从什么地方开始获取数据
        [1, 2, 3, 4, 5, 6, 7, 8 ,9, 10]
        limit: 从指定的位置开始取多少条数据
        type:
        // 1: 单曲,
        // 10: 专辑,
        // 100: 歌手,
        // 1000: 歌单,
        // 1002: 用户,
        // 1004: MV,
        // 1006: 歌词,
        // 1009: 电台,
        // 1014: 视频,
        // 1018:综合
        * */
        static getSearch(keywords="", offset=0, limit=30, type=1){
            return HYHttp.get("/search", {
                keywords: keywords,
                offset: offset,
                limit: limit,
                type: type
            });
        }
    }
    class MusicApis{
        static getSongDetail(ids){
            return HYHttp.get("/song/detail",{
                ids: ids
            })
        }
        static getSongURL(id){
            return HYHttp.get("/song/url",{
                id:id
            })
        }
        static getSongLyric(id){
            return HYHttp.get("/lyric",{
                id:id
            })
        }
        // 网易出品api home旁的music用到
        static getExclusive(limit,offset){
            return HYHttp.get("/mv/exclusive/rcmd",{
                limit: limit,
                offset: offset
            })
        }
    }
    class DjDetailApis{
        static  getDjDetail(rid){
            return HYHttp.get("/dj/detail",{
                rid: rid,
            })
        }
        // false: 排序-时从新到旧
        static getProgram(rid,asc=false){
            return HYHttp.get("/dj/program",{
                rid:rid,
                asc: asc
            })
        }
        static getUrl(id){
            return HYHttp.get("/song/url",{
                id:id
            })
        }
        // home旁电台界面 电台榜单
        /*
        type: new 最新 hot 最热
         */
        static geTopList(type,limit,offset){
            return HYHttp.get("/dj/toplist",{
                type:type,
                limit:limit,
                offset:offset
            })
        }
    }
    class AlbumApis{
        //获取专辑内容
        static getAlbumContent(id){
            return HYHttp.get("/album",{
                id: id,
            })
        }
        // 专辑动态信息 ×
        static getAlbumDynamic(id){
            return HYHttp.get("/album/detail/dynamic",{
                id:id,
            })
        }
        /*
        收藏/取消收藏专辑
        t=1 收藏
        t=0 取消收藏
         */
        // ×
        static collectAlbum(t){
            return HYHttp.get("album/sub",{
                t:t,
            })
        }
        // 已收藏专辑列表 ×
        static getCollectList(){
            return HYHttp.get("/album/sublist");
        }
    }
    class VideoDetailApis{
        // 获取相关视频
        static getRelatedVideo(id){
            return HYHttp.get("/related/allvideo",{
                id:id
            })
        }
        // 获取视频详情
        static getVideoDetail(id){
            return HYHttp.get("/video/detail",{
                id:id
            })
        }
        // 获取点赞转发评论数据
        static getVideoInfo(id){
            return HYHttp.get("/video/detail/info",{
                vid:id
            })
        }
        // 获取视频播放地址
        static getVideoUrl(id){
            return HYHttp.get("/video/url",{
                id:id
            })
        }
        // 获取评论
        static getComment(id){
            return HYHttp.get("/comment/video",{
                id:id
            })
        }
    }
    class PlayListApis{
        // 获取歌单详情
        static getPlaylistDetail(id){
            return HYHttp.get("/playlist/detail",{
                id:id
            })
        }
        // 获取歌单列表 主页旁音乐栏用到
        static getPlaylistTop(limit,offset,order="new"){
            /*
            order: new 最新 hot 最热
            cat: "华语" 古风 欧美 流行 全部
             */
            return HYHttp.get("/top/playlist",{
                offset:offset,
                limit:limit,
                order:order
            })
        }
    }
    class ArtistDetailApis{
        // http://127.0.0.1:3000/artist/detail?id=3684
        // 获取艺术家信息
        static getArtistDetail(id){
            return HYHttp.get("/artist/detail",{
                id:id
            })
        }
        // http://127.0.0.1:3000/artists?id=34205447
        // 获取艺术家单曲
        static getArtistSong(id){
            return HYHttp.get("/artists",{
                id:id
            })
        }
        // 获取艺术家专辑
        static getArtistAlbum(id){
            // http://127.0.0.1:3000/artist/album?id=34205447
            return HYHttp.get("/artist/album",{
                id:id
            })
        }
        // 获取艺术家视频
        // http://127.0.0.1:3000/artist/mv?id=3684
        static getArtistMv(id){
            return HYHttp.get("/artist/mv",{
                id:id
            })
        }
    }
    class UserDetailApis{
        // 获取用户详情
        static getUserDetail(id){
            return HYHttp.get("/user/detail",{
                uid:id
            })
        }
    }
    class MVDetailApis{
        // 全部MV
        /*
        area 全部 内地 港台 欧美 日本 韩国
        type 全部 官方版 原生 现场版 网易出品
        order 上升最快 最热 最新
         */
        static getAllMV(area,limit,offset){
            return HYHttp.get("/mv/all",{
                area: area,
                limit:limit,
                offset:offset,
            })
        }
        // mv排行
        static getMVTop(limit,offset){
            return HYHttp.get("/top/mv",{
                limit:limit,
                offset:offset,
            })
        }
        // 获取mv数据
        static getMVDetail(mvId){
            return HYHttp.get("/mv/detail",{
                mvid:mvId,
            })
        }
        // 获取mv地址
        static getMVUrl(id){
            return HYHttp.get("/mv/url",{
                id:id
            })
        }
        // 获取mv评论
        static getMVComment(id){
            return HYHttp.get("/comment/mv",{
                id:id
            })
        }
        // 获取相似mv
        static getSimiMV(mvid){
            return HYHttp.get("/simi/mv",{
                mvid:mvid
            })
        }
        // 获取mv点赞数 评论数
        static getMVInfo(mvId){
            return HYHttp.get("/mv/detail/info",{
                mvid: mvId,
            })
        }
    }
    class LoginApis{
        // 获取是否登录===不好用，废弃
        static getIsLogin(){
            return HYHttp.get("/login/status");
        }
        // 获取登录状态和登录信息
        static getLoginInfo(){
            return HYHttp.get("/user/account");
        };
        // 登录
        static login(phone,password){
            return HYHttp.get("/login/cellphone",{
                phone:phone,
                password:password
            })
        }
        // 退出登录
        static logout(){
            return HYHttp.get("/logout")
        }
        // 获取点过赞的视频
        static getLikeMv(){
            return HYHttp.get("/playlist/mylike")
        }
        // 获取已收藏过的专辑列表
        static getLikeAlbum(){
            return HYHttp.get("/alubm/sublist")
        }
        // 获取喜欢的音乐id列表
        static getLikeSongID(id){
            return HYHttp.get("likelist",{
                uid:id
            })
        }
    }

    window.HYHttp = HYHttp;
    window.HomeApis = HomeApis;
    window.SearchApis = SearchApis;
    window.MusicApis = MusicApis;
    window.DetailApis = DjDetailApis;
    window.AlbumApis = AlbumApis;
    window.VideoDetailApis = VideoDetailApis;
    window.PlayListApis = PlayListApis;
    window.ArtistDetailApis = ArtistDetailApis;
    window.UserDetailApis = UserDetailApis;
    window.MVDetailApis = MVDetailApis;
    window.LoginApis = LoginApis;
})()