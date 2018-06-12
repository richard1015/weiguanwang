//map.js
var apiHelper = require('../../utils/api.js');
var app = getApp();
Page({
  data:{
    //坐标位置
    // des_latitude: 39.915119,
    // des_longitude: 116.403963,
    // des_name: '天安门',
    // markers:[{
    //   latitude: 39.915119,
    //   longitude: 116.403963,
    //   label: {
    //     content: '天安门',
    //     color: '#0D9BF2'
    //   }
    // }],
    // 查看路线按钮
    pageTitle: '',
    controls: [{
      position: {},
      iconPath: '/image/daohang.png',
      clickable: true
    }],
    readyStatus:{
      scenicPosition: false
    },
    readyStatusCallback: null
  },
  //分享
  onShareAppMessage: function() {
    return {
      title: this.data.pageTitle,
      path: '/pages/map/map?title='+this.data.pageTitle,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  getroute: function(e){
    console.log(e)
    var that = this;
    wx.showLoading({
      title: '定位中',
      mask: true
    })
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        wx.openLocation({
          latitude: that.data.des_latitude,
          longitude: that.data.des_longitude,
          name: that.data.des_name,
          scale: 28,
          complete: function(){
            wx.hideLoading();
          }
        });
      },
      fail: function(){
        wx.hideLoading();
      }
    });
  },
  initBtn: function(w,h){
    var width = Math.floor(w *0.6);
    var height = width*70/401;
    var left = Math.floor((w - width) / 2);
    var top = Math.floor(h - height - 30);

    var json = {
      width: width,
      height: height,
      left: left,
      top: top
    };

    this.setData({
      controls: [{
        id: 1,
        iconPath: '/image/daohang.png',
        position: json,
        clickable: true
      }]
    });
  },
  //获取景区坐标
  getScenicPosition: function(){
    var that = this;
    apiHelper.paramData.cmd = "FrH5ScenicCoordList"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "PageIndex": 1,
      "PageSize": 10,
      "Sid": apiHelper.paramData.sid,
      "ID": ""
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        console.log(data)
        that.setData({
          des_longitude: data[0].GaoDeLon,
          des_latitude: data[0].GaoDeLat,
          des_name: data[0].SName,
          markers:[{
            latitude: data[0].GaoDeLat,
            longitude: data[0].GaoDeLon,
            callout: {
              content: data[0].SName,
              color: '#ffffff',
              fontSize: 12,
              borderRadius: 10,
              bgColor: '#0D9BF2',
              padding: 4,
              display: 'ALWAYS'
            }
          }]
        });
      } else {
        console.log('获取失败请刷新',res);
      };
      that.getReady('scenicPosition');
    });
  },
  getReady: function(key){
    var json = this.data.readyStatus;
    json[key] = true;
    this.setData({
      readyStatus: json
    });
    for(var attr in json){
      if(!json[attr]){
        //还有未加载完成的
        return false;
      };
    };
    this.data.readyStatusCallback();
  },
  init: function(){
    var that = this;
    //初始化 查看线路按钮位置
    //需要重新获取屏幕大小以防BUG
    wx.getSystemInfo({
      success: function(data){
        that.initBtn(data.windowWidth,data.windowHeight);
      }
    });
  },
  onLoad: function(option){
    // 设置将启动方法绑定到getReady 的回调
    this.setData({
      readyStatusCallback: this.init,
      pageTitle: option.title
    });
    // 初始化ajax请求数据
    this.getScenicPosition();
    wx.setNavigationBarTitle({
      title: option.title
    });
  }
});