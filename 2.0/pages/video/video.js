//video.js
var apiHelper = require('../../utils/api.js');
var app = getApp();
Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    wifiList:[],
    PageIndex: 1,
    PageSize: 10,
    updateOff: true,
    noData: false,
    noingData: false,
    currentIndex: null
  },
  //下拉到底事件
  lower: function (e) {
    if( !this.data.updateOff ){
      return;
    };
    this.setData({
      updateOff: false,
      PageIndex: this.data.PageIndex+1
    });
    this.getPageData();
  },
  //返回
  goback: function() {
    var page = getCurrentPages();
    console.log(page)
    if (page.length == 1) {
      wx.redirectTo({
        url: '/pages/index/index'
      });
    } else {
      wx.navigateBack();
    };
  },
  //跳转详情页
  goToNextPage: function(event){
    console.log(event)
    var item = event.currentTarget.dataset.pagedata;
    app.globalData.currentVideo = item;
    wx.navigateTo({
      url: '/pages/videoinfo/videoinfo',
    });
    this.setData({
      currentIndex: event.currentTarget.dataset.index
    });
  },
  //详情页点赞后 本页面也增加点赞量
  updatePageFabulous: function(){
    var item = this.data.wifiList[this.data.currentIndex];
    item.Fabulous = Number(item.Fabulous) + 1;
    this.setData({
      wifiList: this.data.wifiList
    });
  },
  //进入详情页之后 本页增加浏览量
  updatePageBrowseVolume: function(){
    var item = this.data.wifiList[this.data.currentIndex];
    item.BrowseVolume = Number(item.BrowseVolume) + 1;
    this.setData({
      wifiList: this.data.wifiList
    });
  },
  //下拉状态的判断
  updateStatus: function(){
    this.setData({
      updateOff: !this.data.updateOff
    });
    return this.data.updateOff
  },
  //获取数据
  getPageData:function(){
    var that = this;
    apiHelper.paramData.cmd = "FrH5VideoList";//cmd
    apiHelper.paramData.function = "FrIntegratedH5";//language
    apiHelper.paramData.param = {
      "PageIndex": that.data.PageIndex,
      "PageSize": that.data.PageSize,
      "Sid": apiHelper.paramData.sid,
      "ID": ""
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      if( res.State == 0){
        var data = JSON.parse(res.Value);
        console.log(data)
        that.setData({
          wifiList: that.data.wifiList.concat(data),
          updateOff: true
        });
        //小于请求条数 证明已经没有更多数据了
        if( data.length < that.data.PageSize ){
          this.setData({
            updateOff: false,
            noData: true
          });
        };
      }else{
        console.log(res);
        this.setData({
          updateOff: false,
          noData: true
        });
      };
      //判断数据是否为零
      if (that.data.wifiList.length == 0) {
        that.setData({
          noingData: true
        });
      };
    });    
  },
  //初始化 常量
  initNew: function(titles) {
    var that = this;
    // 获取系统信息
    wx.getSystemInfo({
      success: function(e) {
        console.log(e)
        that.setData({
          scrollHeight: e.windowHeight
        });
      }
    });
    wx.setNavigationBarTitle({
      title:titles
    });
  },
  //初始化 重置反复使用
  initReset: function() {
    this.getPageData();
  },
  onLoad: function(option) {
    console.log('onLoad')

    this.initNew(option.title);
    this.initReset();
  }
});

