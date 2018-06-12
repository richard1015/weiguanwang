//food.js
var apiHelper = require('../../utils/api.js');
var app = getApp();
Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    PageIndex: 1,
    PageSize: 10,
    commentList: [],
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
  //获取数据
  getPageData: function() {
    var that = this;
    apiHelper.paramData.cmd = "IFrAppScenicComment"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "PageIndex": that.data.PageIndex,
      "PageSize": that.data.PageSize,
      "Sid": apiHelper.paramData.sid
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        console.log(data)
        that.setData({
          commentList: that.data.commentList.concat(data),
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
      if (that.data.commentList.length == 0) {
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