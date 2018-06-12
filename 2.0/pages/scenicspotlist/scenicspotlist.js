var apiHelper = require('../../utils/api.js');
var app = getApp();
Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    imgUrls: [],
    scenicList: [],
    PageIndex: 1,
    PageSize: 10,
    updateOff: true,
    noData: false
  },
  //下拉到底事件
  lower: function(e) {
    console.log(1111)
    if (!this.data.updateOff) {
      return;
    };
    this.setData({
      updateOff: false,
      PageIndex: this.data.PageIndex + 1
    });
    this.getPageData();
  },
  //分享
  onShareAppMessage: function() {
    return {
      title: this.data.pageTitle,
      path: '/pages/scenicspotlist/scenicspotlist?title='+this.data.pageTitle,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  //跳转详情页
  goToNextPage: function(event) {
    console.log(event)
    var item = event.currentTarget.dataset.pagedata;
    app.globalData.currentAudio = item;
    wx.navigateTo({
      url: '/pages/scenicspotinfo/scenicspotinfo',
    });
    this.setData({
      currentIndex: event.currentTarget.dataset.index
    });
  },
  //获取数据
  getPageData: function() {
    var that = this;
    apiHelper.paramData.cmd = "FrH5ScenicSpotCoordList"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "PageIndex": that.data.PageIndex,
      "PageSize": that.data.PageSize,
      "Sid": apiHelper.paramData.sid,
      "ID": ""
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        that.setData({
          scenicList: that.data.scenicList.concat(data),
          updateOff: true
        });
        console.log(that.data);
        //小于请求条数 证明已经没有更多数据了
        if (data.length < that.data.PageSize) {
          this.setData({
            updateOff: false,
            noData: true
          });
        };
      } else {
        console.log(res);
        this.setData({
          updateOff: false,
          noData: true
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
          pageTitle: app.globalData.scenicName,
          imgUrls: app.globalData.imgUrls,
          scrollHeight: e.windowHeight
        });
      }
    });
    wx.setNavigationBarTitle({
      title: titles
    });
  },
  //初始化 重置反复使用
  initReset: function() {
    this.getPageData();
  },
  onLoad: function(option) {
    console.log('onLoad');

    this.initNew(option.title);
    this.initReset();
  }
});