//wifi.js
var apiHelper = require('../../utils/api.js');
var app = getApp();
Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    wifiList: [],
    PageIndex: 1,
    PageSize: 10,
    updateOff: true,
    noData: false,
    noingData: false
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
  //分享
  onShareAppMessage: function() {
    return {
      title: this.data.pageTitle,
      path: '/pages/wifi/wifi?title='+this.data.pageTitle,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  //获取数据
  getPageData: function() {
    var that = this;
    apiHelper.paramData.cmd = "FrH5WifiList"; //cmd
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
        console.log(data);
        that.setData({
          wifiList: that.data.wifiList.concat(data),
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
          pageTitle: titles,
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
    console.log(option)
    this.initNew(option.title);
    this.initReset();
  }
});