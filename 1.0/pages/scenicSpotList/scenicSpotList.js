var apiHelper = require('../../utils/api.js');
Page({
    data: {
        currentPageIndex:1,
        busy:false,
        imgUrls: [],
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        sort: {},
        listLoad:false,
        listLoadText:true
    }, 
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: options.name
        })
        this.setData({
            id: options.id,
            title: options.name,
            sort: {
                list: [
                    {
                        "id": "tips",
                        "name": "景区贴士",
                        "url": `../../pages/tip/tip?id=${options.id}`,
                        "image": "/image/tieshi.png"
                    },
                    {
                        "id": "comment",
                        "name": "景区点评",
                        "url": `../../pages/comment/comment?id=${options.id}`,
                        "image": "/image/dianping.png"
                    }
                ]
            }
        })
        this.initScenicList(this.data.currentPageIndex);
    },
    onShareAppMessage: function () {
        var title = this.data.title
        var id = this.data.id
        return {
            title: `${title}`,
            path: `pages/scenicSpotList/scenicSpotList?id=${id}&name=${title}`,
            success: function (res) {
                // 分享成功
            },
            fail: function (res) {
                // 分享失败
            }
        }
    },
    initScenicList: function (pageIndex) {
        var that = this;
        that.setData({ 
            busy: true,
            listLoad: true
        });
        // that.setData({ listLoad: true });

        apiHelper.paramData.cmd = "ScenicSunListByScenicId";
        apiHelper.paramData.param = {
            ScenicId: that.data.id,
            PageIndex: pageIndex || 1,
            PageSize: '10',
            Lon: '',
            Lat: ''
        };
        apiHelper.paramData.version = "";
        apiHelper.paramData.language = "";
        apiHelper.post(apiHelper.paramData, function (res) {
            if (res.state == 0) {
                var obj = JSON.parse(res.value);
                //故宫博物院 第一个景点图片地址不对 替换地址
                for(var i=0;i<obj.length;i++){
                    console.log(obj[i].PicImg)
                    var str = obj[i].PicImg.replace(/zy.lianjinglx.com/,"yjly.oss-cn-beijing.aliyuncs.com")
                    obj[i].PicImg = str;
                };

                if (apiHelper.paramData.param.PageIndex == 1) {
                    that.setData({ scenicSpotListData: [] });
                };
                var oldData = that.data.scenicSpotListData || [];
                that.setData({ scenicSpotListData: oldData.concat(obj) });
                that.setData({ imgUrls: that.data.scenicSpotListData[0].BigImg.split(',') });
                
                if(that.data.scenicSpotListData.length<=9){
                    that.setData({ listLoad: false });
                };
                if(obj && obj.length<10){
                    that.setData({ listLoadText:false });
                };       
                that.setData({ 
                    busy: false,
                });
            } else {
                that.setData({
                    listLoadText:false,
                    busy: true,
                    listLoad: true
                });
            };
        });
    },
    scrolltolowerEvent: function () {
        if (this.data.busy) return;
        this.setData({ 
            currentPageIndex: this.data.currentPageIndex + 1 
        });
        this.initScenicList(this.data.currentPageIndex);
    },
    toGoBack:function(){
        var pages = getCurrentPages();
        if( pages && pages.length <=1){
            var pid = this.data.pid;
            var pName = this.data.pName;
            wx.redirectTo({
                url:`../../pages/scenicList/scenicList`
            })
          return
        }else{
            wx.navigateBack({
                delta: 1
            });
        };
    },
});