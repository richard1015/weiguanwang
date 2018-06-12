// pages/scenicSpotInfo/scenicSpotInfo.js
var apiHelper = require('../../utils/api.js');
var utils = require('../../utils/utils.js');
var app = getApp();

var progress = true;

Page({
  data: {
    // 基本ID
    id:'',
    pid:'',
    title:'',
    pName:'',
    // 轮播配置
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    //简介和展开开关
    openbtn: false,
    Introduce:'',
    //音频
    audio: {
      src:'',
      name:'',
      author:''
    },
    audioLoad:0,
    //音频开关
    audioOff: true,
    audioInterval:null,
    nowTime: "00:00",
    endTime: "00:00",
    maxTimeNum: 0,
    nowTimeNum: 0, 
    scrollTop: 0,
    // 周围景点
    scenicRecommendListData:[],
    // 解决分享播放页面后  直接进入分享页面
    shareStatus:false
  },
  onLoad: function (options){
    console.log('页面加载')
    wx.setNavigationBarTitle({
      title: options.name
    });
    this.setData({
      id: options.id,
      pid: options.pid,
      title: options.name,
      pName: options.pName,
    });
    this.initDetail();
  },
  onShow: function() {
    console.log('页面显示时')
    this.setData({
      audioOff:app.globalData.backgroundAudioPlaying
    });
  },
  onReady: function() {
    console.log('页面渲染完成时')
    this.setData({
      audioOff:app.globalData.backgroundAudioPlaying
    });
    app.globalData.globlPlayFn = this.backStatus;
    app.globalData.globlPauseFn = this.backStatus;
    app.globalData.globlStopFn = this.backStop;
    var pages = getCurrentPages();
    if(pages.length>1){
      this.firstBackPlay();
    };
  },
  onHide: function() {
    console.log('页面隐藏时');
  },
  onUnload: function() {
    console.log('页面卸载时');
    wx.stopBackgroundAudio();
    app.globalData.backgroundAudioPlaying = true;
    app.globalData.globlPlayFn = null;
    app.globalData.globlPauseFn = null;
    app.globalData.globlStopFn = null;
    clearInterval(this.data.audioInterval);
    this.data.audioInterval = null;
  },
  toGoBack:function(){
    var pages = getCurrentPages();
    if( pages && pages.length <=1){
      var pid = this.data.pid;
      var pName = this.data.pName;
      wx.redirectTo({
        url:`../../pages/scenicSpotList/scenicSpotList?id=${pid}&name=${pName}`
      })
      return
    }else{
      wx.navigateBack({
        delta: 1
      });
    };
  },
  //附件景点跳转
  toNewPage:function(e){
    var id = e.currentTarget.dataset.sid;
    var name = e.currentTarget.dataset.name;
    var pid = this.data.pid;
    var pName = this.data.pName;

    wx.redirectTo({
      url: '../../pages/scenicSpotInfo/scenicSpotInfo?id='+id+'&pid='+pid+'&name='+name+'&pName='+pName+''
    });
  },
  // 分享
  onShareAppMessage: function () {
    var title = this.data.title;
    var id = this.data.id;
    var pid = this.data.pid;
    var pName = this.data.pName;
    return {
      title: `${title}`,
      path: `pages/scenicSpotInfo/scenicSpotInfo?id=${id}&pid=${pid}&name=${title}&pName=${pName}`,
      success: function (res) {
        // 分享成功
        // wx.showToast({
        //   title: '分享成功！',
        //   icon: 'success',
        //   duration: 1000
        // })
      },
      fail: function (res) {
        // 分享失败
        // wx.showToast({
        //   title: '分享失败！',
        //   icon: 'success',
        //   duration: 1000
        // })
      }
    }
  },
  //获取景点信息
  initDetail: function () {
    var that = this;
    apiHelper.paramData.cmd = "ScenicSpotDetailByID";
    apiHelper.paramData.param = {
      SSId: that.data.id,
      Lon: '',
      Lat: ''
    };
    apiHelper.paramData.version = "";
    apiHelper.paramData.language = "";
    apiHelper.post(apiHelper.paramData, function (res) {
      if (res.state == 0) {
        var obj = JSON.parse(res.value);
        that.setData({
          imgUrls:obj.BigImg.split(','),
          Introduce:obj.Introduce,
          audio:{
            src:obj.VoiceUrl,
            name: obj.SSName,
            author: obj.LanName,
            tempSrc:obj.GoogLeLat
            // tempSrc:'http://zy.lianjinglx.com/msYjly/mp3/147151236023021.mp3'//测试用
          },
          maxTimeNum: obj.QRCode,
          endTime: utils.formatSeconds(obj.QRCode)
        });
        //获取周围景点
        that.initRecommend(obj.GaoDeLon, obj.GaoDeLat);

      } else {
        wx.showToast({
          title: '没有数据！',
          icon: 'success',
          duration: 1000
        })
      }
    });
  },
  //获取周围景点
  initRecommend: function (lon, lat) {
    var that = this;
    apiHelper.paramData.cmd = "WeiXinScenicSpotNear";
    apiHelper.paramData.param = {
      SId: that.data.id,
      Lon: lon,
      Lat: lat,
      PId: that.data.pid
    };
    apiHelper.paramData.version = "";
    apiHelper.paramData.language = "";
    apiHelper.post(apiHelper.paramData, function (res) {
      if (res.state == 0) {
        var obj = JSON.parse(res.value);
        for (var item in obj) {
          obj[item].Distance = (parseInt(obj[item].Distance) > 1000 ? (parseInt(obj[item].Distance) / 1000).toFixed(2) + "km" : +parseInt(obj[item].Distance) + "m");
        };
        that.setData({ scenicRecommendListData: obj });
      } else {
        // wx.showToast({
        //   title: '没有附近景点数据！',
        //   icon: 'success',
        //   duration: 1000
        // })
      }
    });
  },
  // 展开收缩开关
  setOpen: function (e) {
    var key = e.currentTarget.id;
    var value = this.data[key];
    this.setData({
      openbtn: !value
    });
  },
  //第一次自动播放
  firstBackPlay:function(){
    var that = this;
    var src = this.data.audio.tempSrc;
    var name = this.data.audio.name;
    var coverImgUrl = '';
    var json = {
      dataUrl: src,
      title: name,
      coverImgUrl: '',
      success: function (res) {
        wx.hideLoading();
      },
      fail:function(res){
        console.log('调用失败',res)
        var pages = getCurrentPages();
        if(pages.length<=1){
          wx.hideLoading();
          app.globalData.globlPlayFn = that.backStatus;
          app.globalData.globlPauseFn = that.backStatus;
          app.globalData.globlStopFn = that.backStop;
          return;
        };
        that.firstBackPlay();//加载失败递归调用自己
      }
    };
    wx.showLoading({
      title:'正在加载音频',
      mask:false
    });
    wx.playBackgroundAudio(json);
  },
  //音频停止
  backStop:function(data){
    clearInterval(this.data.audioInterval);
    this.data.audioInterval = null;
    app.globalData.backgroundAudioPlaying = true;
    app.globalData.globlPlayFn = null;
    app.globalData.globlPauseFn = null;
    app.globalData.globlStopFn = null;
    var bool = data.backgroundAudioPlaying;
    this.setData({
      audioOff:bool,
      nowTime:'00:00',
      nowTimeNum:0
    });
  },
  //实时状态
  backStatus:function(data){
    var that = this;
    var bool = data.backgroundAudioPlaying;
    this.setData({
      audioOff:bool
    });
    if(app.globalData.backgroundAudioPlaying){
      clearInterval(this.data.audioInterval);
      this.data.audioInterval = null;
    }else{
      //防止反复绑定定时器
      clearInterval(this.data.audioInterval);
      this.data.audioInterval = null;
      this.data.audioInterval = setInterval(function(){
        wx.getBackgroundAudioPlayerState({
          success:function(res){
            console.log('实时监听',res)
            // 监听失效备用判断
            if(res.status == 2){
              console.log('监听停止失效');
              app.globalData.backgroundAudioPlaying = true;
              that.backStop(app.globalData);
              return
            };
            // 监听失效备用判断
            if(res.status == 0){
              console.log('监听暂停失效');
              app.globalData.backgroundAudioPlaying = true;
              that.setData({
                audioOff:app.globalData.backgroundAudioPlaying
              });
              that.backPause();
              clearInterval(that.data.audioInterval);
              that.data.audioInterval = null;
              return
            };
            that.setData({
              // nowTimeNum:res.currentPosition,
              audioLoad:res.downloadPercent,
              nowTime:utils.formatSeconds(res.currentPosition)
            });
            if( progress ){
              that.tempSliderChange(res.currentPosition);
            };
          }
        });
      },500);
    };  
  },
  //音频操作
  backAudio:function(){
    if(typeof app.globalData.globlPlayFn != "function"){
      console.log('调用初次请求');
      this.firstBackPlay();
      return;
    };
    if(app.globalData.backgroundAudioPlaying){
      this.backPlay();
    }else{
      this.backPause();
    };
  },
  backPlay:function(){
    var that = this;
    var src = this.data.audio.tempSrc;
    var name = this.data.audio.name;
    var coverImgUrl = '';
    var json = {
      dataUrl: src,
      title: name,
      coverImgUrl: '',
      success: function (res) {
      }
    };
    wx.playBackgroundAudio(json)
    // 安卓手机 播放监听只有首次生效暂停后再播放无效 兼容使用
    // 解决分享bug 直接分享播放页面时进入的bug
    var pages = getCurrentPages();
    if(app.globalData.platform == 'android' && pages.length > 1){
      app.globalData.globlPlayFn = that.backStatus;
      app.globalData.globlPauseFn = that.backStatus;
      app.globalData.globlStopFn = that.backStop;
      app.globalData.backgroundAudioPlaying = false;
      app.globalData.globlPlayFn(app.globalData);
    }else if(app.globalData.platform == 'android' && pages.length <= 1 && this.data.shareStatus){
      app.globalData.globlPlayFn = that.backStatus;
      app.globalData.globlPauseFn = that.backStatus;
      app.globalData.globlStopFn = that.backStop;
      app.globalData.backgroundAudioPlaying = false;
      app.globalData.globlPlayFn(app.globalData);
    };
    //初次执行之后 变false 为true
    this.setData({
      shareStatus:true
    });
  },
  backPause:function(){
    var that = this;
    wx.pauseBackgroundAudio({
      success:function(res){
      }
    });
    this.setData({
      shareStatus:true
    });
  },
  backSeek:function(e){
    var that = this;
    var num = e.detail.value;
    wx.getBackgroundAudioPlayerState({
      success:function(res){
        var Total = res.duration;
        var load = res.downloadPercent / 100;
        var nowLoad = Total * load;
        if( res.status == 2 && res.downloadPercent == 0){
          that.firstBackPlay();
        };
        if(num >= nowLoad ){
          wx.showToast({
            title:'还未加载完',
            icon:'loading',
            mask:true,
            duration:500
          });
        }else{
          // 不可以使用return 代替
          if(res.status != 1 ){
            that.backPlay();
            wx.seekBackgroundAudio({
              position: num
            });  
          }else{
            wx.seekBackgroundAudio({
              position: num
            });
          };
        };
      }
    });
    this.setData({
      shareStatus:true
    });
  },
  //进度条
  sliderTouchstart:function(){
    progress = false;
  },
  sliderTouchend:function(){
    setTimeout(function(){
      progress = true;
    }, 100);
  },
  //进度条赋值
  tempSliderChange:function(value){
    this.setData({
      nowTimeNum:value
    });
  }
})
