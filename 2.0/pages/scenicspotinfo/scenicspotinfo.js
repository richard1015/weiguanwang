// pages/scenicSpotInfo/scenicSpotInfo.js
var apiHelper = require('../../utils/api.js');
var app = getApp();
var pages, prevPage; //上一个页面
var isHome = false; //当前页是不是主页（用于分享进来的判断）true 是主页(分享途径进入) false 不是主页
var interval = null; //页面定时器
var audioConsole = app.globalData.audioConsole;
Page({
  data: {
    // 轮播配置
    imgUrls: [],
    Introduce: '',
    //音频
    audio: {
      src: '',
      title: ''
    },
    //简介和展开开关
    openbtn: false,
    audioLoad: 0,
    //拖动条 true 没有拖动  fasle 拖动中
    sliderOff: true,
    //音频开关 true 停止播放了  false 是播放中
    audioOff: true,
    //音频是否以已经准备（src 是否有值,是不是本页音频）
    // 0 没有载入音频  1 是本页音频  2 不是本页音频
    audioStatus: 0,
    nowTime: "00:00",
    endTime: "00:00",
    maxTimeNum: 0,
    nowTimeNum: 0,
    scrollTop: 0,
    scenicRecommendListData: [],// 周围景点
    isShow: false,//异步数据加载完毕之后为true
    testText: ''
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
  //附近景点跳转
  toNewPage:function(event){
    console.log(event)
    var item = event.currentTarget.dataset.pagedata;
    app.globalData.currentAudio = item;

    wx.redirectTo({
      url: '/pages/scenicspotinfo/scenicspotinfo?id=' + item.Id
    });
  },
  //分享
  onShareAppMessage: function() {
    var that = this;
    console.log(that.data.pageData.Id);
    return {
      title: that.data.pageData.SName,
      path: '/pages/scenicspotinfo/scenicspotinfo?id=' + that.data.pageData.Id,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  //获取数据
  getPageData: function(id) {
    var that = this;
    apiHelper.paramData.cmd = "FrH5ScenicSpotCoordList"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "PageIndex": 1,
      "PageSize": 10,
      "Sid": apiHelper.paramData.sid,
      "ID": id
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        that.setData({
          pageData: data[0]
        });

        var globa = that.data.pageData;
        var imgUrls = globa.LongPicUrl.split(",");
        that.setData({
          imgUrls: imgUrls,
          audio: {
            src: globa.AudioUrl,
            title: globa.SName
          }
        });
        that.initPage();
      } else {
        console.log('获取失败',res);
      };
    });
  },
  //获取附近景点数据
  getRecommendData: function() {
    var that = this;
    apiHelper.paramData.cmd = "FrScinceRecommend"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      // "PageIndex": that.data.PageIndex,
      // "PageSize": that.data.PageSize,
      "Sid": apiHelper.paramData.sid,
      "ID": that.data.pageData.Id
    };
    this.setData({
      testText: '开始附近景区请求/n'
    });
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        // console.log(data)
        that.setData({
          scenicRecommendListData: that.data.scenicRecommendListData.concat(data),
          updateOff: true
        });
        this.setData({
          testText: '附近景区请求成功/n'
        });
      } else {
        console.log(res);
        this.setData({
          testText: '附近景区请求失败/n'
        });
      };
      that.initPlayStatus();
    });
  },
  //音频初始状态 播放的是否是本页音频
  getNewAudio: function() {
    var audio = app.globalData.audioConsole;
    //还有BUG需要调试
    if (audio.src == undefined && audio.paused == undefined) {
      console.log('没有载入音频');
      this.setData({
        audioStatus: 0
      });
      return;
    };
    if (audio.src != this.data.audio.src) {
      console.log('不是本页音频');
      this.setData({
        audioStatus: 2
      });
      return;
    };
    if (audio.src == this.data.audio.src) {
      console.log('是本页音频');
      this.setData({
        audioStatus: 1,
        audioOff: audio.paused
      });
      return;
    };
  },
  //加载
  loadAudio: function(data) {
    app.setAudio(data);
    //修改音频状态
    this.setData({
      audioStatus: 1
    });
  },
  //播放暂停
  playAndPause: function() {
    if (this.data.audioStatus != 1) {
      console.log('加载按钮')
      if(interval == null){
        interval = setInterval(this.getAudioStatus,500);
      };
      this.loadAudio(this.data.audio);
    } else {
      if (this.data.audioOff) {
        //播放
        console.log('播放按钮')
        app.globalData.audioConsole.play();
      } else {
        //暂停
        app.globalData.audioConsole.pause();
      };
    };
    // 只是为了更快切换图标
    this.setData({
      audioOff: !this.data.audioOff
    });
  },
  //实时状态
  getAudioStatus: function() {
    var data = audioConsole;
    //判断是否正在拖动进度条
    if (this.data.sliderOff) {
      this.setData({
        audioOff: data.paused,
        nowTime: app.formNumberToTime(data.currentTime) || '00:00',
        endTime: app.formNumberToTime(data.duration) || '00:00',
        nowTimeNum: Math.floor(data.currentTime),
        maxTimeNum: Math.floor(data.duration)
      });
    } else {
      this.setData({
        audioOff: data.paused,
        nowTime: app.formNumberToTime(data.currentTime) || '00:00',
        endTime: app.formNumberToTime(data.duration) || '00:00',
        // nowTimeNum: Math.floor(data.currentTime),
        maxTimeNum: Math.floor(data.duration)
      });
    };
  },
  //拖动条
  sliderTouchstart: function() {
    this.setData({
      sliderOff: false
    });
  },
  sliderTouchend: function() {
    var that = this;
    setTimeout(function() {
      that.setData({
        sliderOff: true
      });
    }, 500)
  },
  sliderTap: function() {
    var that = this;
    this.setData({
      sliderOff: false
    });
    setTimeout(function() {
      that.setData({
        sliderOff: true
      });
    }, 500);
  },
  sliderChange: function(data) {
    if (this.data.audioStatus == 1) {
      app.globalData.audioConsole.seek(data.detail.value);
    };
  },
  //简介收起展开
  changeContentStatus: function(e){
    var key = e.currentTarget.id;
    var value = this.data[key];
    this.setData({
      openbtn: !value
    });
  },
  //初始化 常量
  initNew: function() {
    //获取页面栈
    pages = getCurrentPages();
    if (pages.length == 1) {
      //分享进入
      isHome = true;
    } else {
      //列表进入
      isHome = false;
      var globa = app.globalData.currentAudio;
      var imgUrls = globa.LongPicUrl.split(",");
      this.setData({
        imgUrls: imgUrls,
        audio: {
          src: globa.AudioUrl,
          title: globa.SName
        },
        pageData: globa
      });
    };
  },
  //初始化 重置反复使用
  initReset: function(id) {
    if (isHome) {
      //分享进入
      this.getPageData(id);
    } else {
      //列表进入
      this.initPage();
    };
  },
  initPage: function(){
    wx.setNavigationBarTitle({
      title: this.data.pageData.SName
    });
    //初始化判断 是否正在播放音频，是否是本页音频
    this.getNewAudio();

    //获取推荐景点
    this.getRecommendData();
  },
  initPlayStatus: function(){
    this.setData({
      isShow: true
    });

    if(isHome){
      //分享途径进来
      //分享页面自动播放会报错 需要提示手动 分享页面可能推出再进来
      switch(this.data.audioStatus){
        case 0 :
          //没有载入音频
          wx.showModal({
            title: '播放提示',
            content: '点击播放按钮播放音频',
            showCancel: false,
            success: function(res){
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              };
            }
          });
          interval = setInterval(this.getAudioStatus,500);
          break;
        case 1 :
          //本页音频
          console.log(app.globalData.audioConsole);
          if(app.globalData.audioConsole.paused){
            app.globalData.audioConsole.play();
          };
          interval = setInterval(this.getAudioStatus,500);
          break;
        case 2 :
          //不是本页音频
          wx.showModal({
            title: '播放提示',
            content: '点击播放按钮播放音频',
            showCancel: false,
            success: function(res){
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              };
            }
          });
          break;
      };
    }else{
      //列表途径进来
      switch(this.data.audioStatus){
        case 0 :
          //没有载入音频
          this.loadAudio(this.data.audio);
          interval = setInterval(this.getAudioStatus,500);
          break;
        case 1 :
          //本页音频
          console.log(app.globalData.audioConsole);
          if(app.globalData.audioConsole.paused){
            app.globalData.audioConsole.play();
          };
          interval = setInterval(this.getAudioStatus,500);
          break;
        case 2 :
          //不是本页音频
          this.loadAudio(this.data.audio);
          interval = setInterval(this.getAudioStatus,500);
          break;
      };
    };
  },
  //页面状态钩子方法
  onLoad: function(option) {
    console.log('页面加载');

    this.initNew();
    this.initReset(option.id);
  },
  onShow: function() {
    console.log('页面显示时');
    // 播放本页音频时第一次同步数据 只执行一次
    if (this.data.audioStatus == 1) {
      this.getAudioStatus(app.globalData.audioConsole);
    };
  },
  onHide: function() {
    console.log('页面隐藏时');
  },
  onUnload: function() {
    console.log('页面卸载时');

    clearInterval(interval);
    interval = null;
    //app.clearAudio();
  }
});