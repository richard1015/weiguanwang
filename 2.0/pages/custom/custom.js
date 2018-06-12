//custom.js
var apiHelper = require('../../utils/api.js');
var app = getApp();
Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    customList: [],
    PageIndex: 1,
    PageSize: 10,
    updateOff: true,
    noData: false,
    noingData: false,
    currentIndex: null,
    ModularId: null
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
    console.log(event)
    var item = event.currentTarget.dataset.pagedata;
    app.globalData.currentCustom = item;
    wx.navigateTo({
      url: '/pages/custominfo/custominfo?id='+item.Id+'&mid='+this.data.ModularId,
    });
    this.setData({
      currentIndex: event.currentTarget.dataset.index
    });
  },
  // //详情页点赞后 本页面也增加点赞量
  // updatePageFabulous: function() {
  //   var item = this.data.customList[this.data.currentIndex];
  //   item.Fabulous = Number(item.Fabulous) + 1;
  //   this.setData({
  //     customList: this.data.customList
  //   });
  // },
  // //进入详情页之后 本页增加浏览量
  // updatePageBrowseVolume: function() {
  //   var item = this.data.customList[this.data.currentIndex];
  //   item.BrowseVolume = Number(item.BrowseVolume) + 1;
  //   this.setData({
  //     customList: this.data.customList
  //   });
  // },
  //获取数据
  getPageData: function(id,title) {
    var that = this;
    apiHelper.paramData.cmd = "FrZDYListByMoId"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "PageIndex": that.data.PageIndex,
      "PageSize": that.data.PageSize,
      "Sid": apiHelper.paramData.sid,
      "ID": "",
      "ModularID": id
    };
    console.log('请求内容',apiHelper.paramData.param);
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        console.log(res)
        var data = JSON.parse(res.Value);
        var arr = that.data.customList.concat(data);
        that.setData({
          customList: arr,
          updateOff: true,
          ModularId: id
        });

        wx.setNavigationBarTitle({
          title: title
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
      if (that.data.customList.length == 0) {
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
  initReset: function(id,title) {
    this.getPageData(id,title);
  },
  onLoad: function(option) {
    console.log('onLoad')

    this.initNew(option.title);
    this.initReset(option.id,option.title);
  },
  onReady: function() {
    console.log('onReady');
  },
});