var apiHelper = require('../../utils/api.js');
var amapFile = require('../../lib/amap-wx.js');
var config = require('../../config.js');
Page({
    data: {
        sortbtn: [
            {
                id: 'hot',
                name: '热门推荐',
                state: '1'
            },
            {
                id: 'level',
                name: '星级排序',
                state: '0'
            },
            {
                id: 'range',
                name: '距离最近',
                state: '0'
            }
        ],
        currentPageIndex: 1,
        busy: false,//防止请求未完成再次请求
        longitude: "",
        latitude: "",
        city: "",
        tempCity: "",//备份城市
        keyword: "",
        tempKeyword: "",//输入框显示的临时文字，点击搜索后转入正式的keyword
        scrollTop: 0,
        listLoad: true,//列表底部正在加载的显示
        loadResult: true,//请求结果状态 0正常加载 1加载数量不够最后已到最后一页 2没有数据
        dataNothing: false,//是否什么数据都没有
        requestParam: {//发送请求的参数

        }
    },
    onLoad: function (options) {
        //调用应用实例的方法获取全局数据
        try {
            var value = wx.getStorageSync('location')
            if (value) {
                this.setData(value);
                // this.initScenicList(1,'sort');
                this.getSort('hot');
            } else {
                this.getLocation();
            }
        } catch (e) {
            // Do something when catch error
        }
    },
    onHide: function () {
        console.log('页面隐藏')
        this.autoClearInput();
    },
    //3个标签排序请求  
    getSort: function (e) {
        if (typeof e == 'object') {
            var eId = e.currentTarget.id;
        } else {
            var eId = e
        };
        this.getSortStyle(eId);
        if (eId == 'range' || !this.data.keyword) {
            this.setData({
                scenicListData: [],
                currentPageIndex: 1,
                scrollTop: 0,
                busy: false,
                loadResult: true,
                requestParam: {
                    AreaID: this.data.city,
                    keyword: this.data.keyword,
                    IsHotCount: this.data.sortbtn[0].state,
                    IsGrade: this.data.sortbtn[1].state,
                    IsDistance: this.data.sortbtn[2].state
                }
            });
        } else {
            this.setData({
                scenicListData: [],
                currentPageIndex: 1,
                scrollTop: 0,
                busy: false,
                loadResult: true,
                requestParam: {
                    AreaID: '',
                    keyword: this.data.keyword,
                    IsHotCount: this.data.sortbtn[0].state,
                    IsGrade: this.data.sortbtn[1].state,
                    IsDistance: this.data.sortbtn[2].state
                }
            });
        };
        this.initScenicList(1, 'sort');
    },
    //输入框搜索请求
    searchList: function () {
        this.getSortStyle('hot');
        this.setData({
            scenicListData: [],
            keyword: this.data.tempKeyword,
            currentPageIndex: 1,
            scrollTop: 0,
            busy: false,
            loadResult: true,
            requestParam: {
                AreaID: this.data.tempKeyword ? '' : this.data.city,
                keyword: this.data.tempKeyword,
                IsHotCount: '1',
                IsGrade: '0',
                IsDistance: '0',
            }
        });
        this.initScenicList(1, 'search');
        var pages = getCurrentPages();
        console.log(pages, pages.length)
    },
    //下拉继续请求
    scrolltolowerEvent: function () {
        if (this.data.busy) { return };
        this.setData({
            currentPageIndex: this.data.currentPageIndex + 1
        })
        this.initScenicList(this.data.currentPageIndex, 'scroll');
    },
    //请求主体
    initScenicList: function (pageIndex, city) {
        var that = this;
        //防止反复请求  
        if (this.data.busy) {
            console.log('正在加载中');
            return;
        } else {
            that.setData({ busy: true });
        };

        apiHelper.paramData.cmd = "ScenicList";
        apiHelper.paramData.param = {
            Lon: `${that.data.longitude}`,
            Lat: `${that.data.latitude}`,
            AreaID: that.data.requestParam.AreaID,
            keyword: that.data.requestParam.keyword,
            PageIndex: that.data.currentPageIndex || 1,
            PageSize: '10',
            IsHotCount: that.data.requestParam.IsHotCount,
            IsGrade: that.data.requestParam.IsGrade,
            IsDistance: that.data.requestParam.IsDistance,
        };
        apiHelper.paramData.version = "";
        apiHelper.paramData.language = "";
        console.log(apiHelper.paramData.param)

        that.setData({ dataNothing: false });
        var oldData = that.data.scenicListData;
        that.controlPrompt(false);

        apiHelper.post(apiHelper.paramData, function (res) {
            var resDataStatus = null;
            if (res.state == 0) {
                var obj = JSON.parse(res.value);
                for (var item in obj) {
                    obj[item].BigImg = obj[item].BigImg.split(',')[0];
                    obj[item].ListenCount = obj[item].ListenCount > 10000 ? (obj[item].ListenCount / 10000).toFixed(2) + '万' : obj[item].ListenCount;
                    obj[item].BigImg = obj[item].BigImg.split(',')[0];

                    if (obj[item].Distance > 0) {
                        if (obj[item].Distance > 900000) {
                            obj[item].Distance = obj[item].CAName;
                        }
                        else if (obj[item].Distance > 1000 && obj[item].Distance < 900000) {
                            obj[item].Distance = (obj[item].Distance / 1000).toFixed(2) + 'km';
                        }
                        else {
                            obj[item].Distance = obj[item].Distance.toFixed(0) + 'm';
                        }
                    }
                };
                console.log(obj)
                //返回数据是否过多的判断，过多则分次加入页面
                if(obj.length>50){
                    var allList = oldData.concat(obj);
                    that.setData({scenicListData:allList.slice(0,21)});
                    setTimeout(function(){
                        that.setData({scenicListData:allList});
                    }, 100);
                }else{
                    that.setData({ scenicListData: oldData.concat(obj) });
                };

                if (obj.length == 10) {
                    that.setData({ busy: false });
                    resDataStatus = true;
                } else {
                    that.setData({ busy: true });
                    resDataStatus = false;
                };
            } else {
                that.setData({
                    scenicListData: oldData,
                    busy: true
                });
                resDataStatus = false;
            };
            that.controlPrompt(true, resDataStatus);
        });
    },
    //分享
    onShareAppMessage: function () {
        return {
            title: "免费听全球景点讲解",
            path: "pages/scenicList/scenicList",
            success: function (res) {
            },
            fail: function (res) {
            }
        }
    },
    //城市选择跳转
    choiceCity: function () {
        wx.navigateTo({
            url: `../city/city`
        })
    },
    //所在定位
    getLocation: function () {
        var that = this
        var myAmapFun = new amapFile.AMapWX({ key: config.amapKey });
        myAmapFun.getWeather({
            success: function (res) {
                //成功回调
                that.setData({
                    city: res.city.data
                })
                //that.initScenicList(1,'sort');
                that.getSort('hot');


                myAmapFun.getRegeo({
                    success: function (res) {
                        res = res[0];
                        var cityStr = res.regeocodeData.addressComponent.province;
                        var index = res.regeocodeData.addressComponent.province.indexOf('市');
                        if (index == -1) {
                            cityStr = res.regeocodeData.addressComponent.city;
                            index = res.regeocodeData.addressComponent.city.indexOf('市');
                        }
                        if (cityStr) {
                            var city = cityStr.substring(0, index);
                            wx.setStorageSync('location', {
                                longitude: res.longitude,
                                latitude: res.latitude,
                                city: city
                            })
                            that.setData(wx.getStorageSync('location'));
                        } else {
                            that.setData({
                                longitude: 116.46037,
                                latitude: 39.89668,
                                city: '北京'
                            })
                        }
                        //that.initScenicList(1,'sort');
                        that.getSort('hot');
                    },
                    fail: function (info) {
                        //失败回调
                        console.log(info)
                        that.setData({
                            longitude: 116.46037,
                            latitude: 39.89668,
                            city: '北京'
                        })
                        //that.initScenicList(1,'sort');
                        that.getSort('hot');
                    }
                })
            },
            fail: function (info) {
                //失败回调
                console.log(info)
                that.setData({
                    longitude: 116.46037,
                    latitude: 39.89668,
                    city: '北京'
                })
                //that.initScenicList(1,'sort');
                that.getSort('hot');
            }
        })
        wx.getLocation({
            type: 'wgs84',
            success: function (res) {
                var latitude = res.latitude
                var longitude = res.longitude
                var speed = res.speed
                var accuracy = res.accuracy
                console.log(res);
                that.setData({
                    longitude: longitude,
                    latitude: latitude,
                })
            }
        })


    },
    //输入框的绑定和清除
    bindKeyInput: function (e) {
        console.log(e)
        this.setData({
            tempKeyword: e.detail.value
        })
    },
    autoClearInput: function () {
        if (this.data.keyword == this.data.tempKeyword) {
            return;
        };
        this.setData({
            tempKeyword: ''
        });
    },
    clearInput: function () {
        this.setData({
            tempKeyword: '',
            keyword: ''
        });
    },
    //排序样式修改
    getSortStyle: function (key) {
        var id = key,
            list = this.data.sortbtn;
        for (var i = 0, len = list.length; i < len; ++i) {
            if (list[i].id == id) {
                list[i].state = '1'
            } else {
                list[i].state = '0'
            };
        };
        this.setData({
            sortbtn: list,
        });
    },
    controlPrompt: function (bool, dataStatus) {
        //bool  false 请求之前 true 请求完成 
        //dataStatus fasle 返回 最后的或没有数据 true 正常返回数据
        if (bool) {
            if (this.data.scenicListData.length < 1) {
                //当前页面没有任何数据
                this.setData({ dataNothing: true });
                this.setData({ listLoad: false });
            } else {
                this.setData({ dataNothing: false });
                this.setData({ listLoad: true });
            };
            if (dataStatus && dataStatus != undefined) {
                this.setData({ loadResult: true });
            } else {
                this.setData({ loadResult: false });
            };
        } else {
            this.setData({ dataNothing: false });
            this.setData({ listLoad: true });
            this.setData({ loadResult: true });
        };
    }
})