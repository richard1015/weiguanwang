//active.js
var apiHelper = require('../../utils/api.js');
var app = getApp();
Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    listData: [],
    PageIndex: 1,
    PageSize: 10,
    updateOff: true,
    noData: false,
    noingData: false,
    currentIndex: null
  },
  //下拉到底事件
  lower: function(e) {
    if (!this.data.updateOff) {
      return;
    };
    this.setData({
      updateOff: false,
      PageIndex: this.data.PageIndex + 1
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
  goToNextPage: function(event) {
    var item = event.currentTarget.dataset.pagedata;
    app.globalData.currentActive = item;
    wx.navigateTo({
      url: '/pages/activeinfo/activeinfo',
    });
    this.setData({
      currentIndex: event.currentTarget.dataset.index
    });
  },
  //详情页点赞后 本页面也增加点赞量
  updatePageFabulous: function() {
    var item = this.data.listData[this.data.currentIndex];
    item.Fabulous = Number(item.Fabulous) + 1;
    this.setData({
      listData: this.data.listData
    });
  },
  //进入详情页之后 本页增加浏览量
  updatePageBrowseVolume: function() {
    var item = this.data.listData[this.data.currentIndex];
    item.ReadingCount = Number(item.ReadingCount) + 1;
    this.setData({
      listData: this.data.listData
    });
  },
  //获取数据
  getPageData: function() {
    var that = this;
    apiHelper.paramData.cmd = "FrH5ActivitiesList"; //cmd
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
        console.log(data)
        that.setData({
          listData: that.data.listData.concat(data),
          updateOff: true
        });
        //小于请求条数 证明已经没有更多数据了
        if (data.length < that.data.PageSize) {
          this.setData({
            updateOff: false,
            noData: true
          });
        };
      } else {
        this.setData({
          updateOff: false,
          noData: true
        });
      };
      //判断数据是否为零
      if (that.data.listData.length == 0) {
        that.setData({
          noingData: true
        });
      };

    });
  },
  //初始化 常量
  initNew: function(titles) {
    var that = this;
    wx.getSystemInfo({
      success: function(e) {
        console.log(e.windowHeight);
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