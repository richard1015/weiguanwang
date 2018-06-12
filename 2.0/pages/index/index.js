var apiHelper = require('../../utils/api.js');
//获取应用实例
var app = getApp();
Page({
  data: {
    imgUrls: [],
    indicatorDots: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    moduleData: [
      { Id: 1, url: '/pages/scenicspotlist/scenicspotlist' },
      { Id: 2, url: '/pages/active/active' },
      { Id: 3, url: '/pages/raiders/raiders' },
      { Id: 4, url: '/pages/comment/comment' },
      { Id: 5, url: '/pages/map/map' },
      { Id: 6, url: '/pages/video/video' },
      { Id: 7, url: '/pages/food/food' },
      { Id: 8, url: '/pages/hotel/hotel' },
      { Id: 9, url: '/pages/wifi/wifi' },
      { Id: 10, url: '/pages/mapguide/mapguide' }
    ],
    readyStatus: {
      banner: false,
      template: false,
      module: false
    },
    nowModuleData: [],
    readyStatu: false,
    template: 0,
    scenicName: ''
  },
  //分享
  onShareAppMessage: function() {
    return {
      title: app.globalData.scenicName,
      path: '/pages/index/index',
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  readyStatusCallback: function() {
    console.log('3个接口加载完成', this.data);
    this.initNew();
    this.initReset();
  },
  //初始化 常量
  initNew: function() {
    wx.setNavigationBarTitle({
      title: app.globalData.scenicName
    });
    var list = app.globalData.module;
    var arr = [];
    //模板2的图标用的是模板1的;
    var temNum = app.globalData.scenicTemplate == 2 ? 1 : app.globalData.scenicTemplate;
    for (var i = 0; i < list.length; i++) {
      var json = {};
      var index = Number(list[i].ModularId) - 1;
      if (index <= 10) {
        //固定模块
        json.Id = list[i].ModularId;
        json.image = '../../image/template' + temNum + '/home' + list[i].ModularId + '.png';
        json.title = list[i].NickName || list[i].ModularName;
        json.CoOrder = list[i].CoOrder;
        if (json.Id == 1) {
          //景区信息特殊处理
          json.url = this.data.moduleData[index].url + '?title=' + app.globalData.scenicName;
        } else {
          json.url = this.data.moduleData[index].url + '?title=' + json.title;
        };
        arr.push(json);
      } else {
        //自定义模块
        json.Id = list[i].ModularId;
        json.image = '../../image/template' + temNum + '/home11.png';
        json.title = list[i].NickName || list[i].ModularName;
        json.CoOrder = list[i].CoOrder;
        json.url = '/pages/custom/custom?id=' + list[i].ModularId + '&title=' + json.title;
        arr.push(json);
      };
    };
    // 根据 CoOrder字段排序
    arr.sort(function(a,b){
      return a.CoOrder - b.CoOrder;
    });
    console.log(arr)
    this.setData({
      template: app.globalData.scenicTemplate,
      imgUrls: app.globalData.imgUrls,
      nowModuleData: arr,
      readyStatu: true
    });
  },
  //初始化方法
  initReset: function() {},
  onLoad: function() {
    console.log('onLoad');

    app.getLoadReady(this.readyStatusCallback);


    if (wx.getExtConfig) {
      wx.getExtConfig({
        success: function (res) {
          console.log(`index config info read ok`);
          console.log(`index config info >>>>>`);
          console.log(res.extConfig)
        },
        fail: function (error) {
          console.log(`index config info read error`);
          console.log(error)
        }
      })
    } else {
      console.log(`index config info read no info`);
    }
  }
})


