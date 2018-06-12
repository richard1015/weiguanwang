//app.js
var apiHelper = require('./utils/api.js');
App({
  onLaunch: function(option) {
    //清缓存
    wx.clearStorage();
    var that = this;
    // 判断版本
    if (!wx.getBackgroundAudioManager) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      });
      return;
    };
    // 获取系统信息
    wx.getSystemInfo({
      success: function(e) {
        console.log(e)
        that.globalData.windowWidth = e.windowWidth;
        that.globalData.windowHeight = e.windowHeight;
        if (e.system.indexOf('iOS') != -1) {
          that.globalData.system = 0;
        } else if (e.system.indexOf('Android') != -1) {
          that.globalData.system = 1;
        } else {
          that.globalData.system = 2;
        };
      },
      fail: function(e){
        console.log('获取系统信息失败',e);
      }
    });
    // 获取背景播放器
    this.globalData.audioConsole = wx.getBackgroundAudioManager();
    // 初始化音频回调函数
    this.firstInitAudio();
    //开启定时器获取全局播放状态
    // this.interval = setInterval(function() {
    //   that.getAudioStatus();
    // }, 500);
    // 初始化请求使用那个模板
    this.initScenicTemplate();
    // 获取景区长图
    this.initScenicBanner();
    // 获取景区模块
    this.initModule();
  },
  onShow: function(options) {
    console.log('App onShow')
    // console.log(options.path)
    this.globalData.comeInState = options.scene;
    console.log(this.globalData.comeInState)
  },
  getReady: function(key) {
    var json = this.globalData.readyStatus;
    json[key] = true;

    for (var attr in json) {
      if (!json[attr]) {
        //还有未加载完成的
        return false;
      };
    };
    this.readyStatusCallback();
  },
  readyStatusCallback: function() {
    console.log('callback',this.globalData);
  },
  getLoadReady: function(callback){
    var that = this;
    var json = that.globalData.readyStatus;
    var num = 0;
    var timer = setInterval(function(){
      num++;
      //3秒之后 不管是否加载完成都执行回调函数
      if( num>=30){
        clearInterval(timer);
        timer = null;
        if(typeof callback == 'function'){
          callback();
        };
      };
      for (var attr in json) {
        if (!json[attr]) {
          //还有未加载完成的
          return false;
        };
      };
      clearInterval(timer);
      timer = null;
      if(typeof callback == 'function'){
        callback();
      };
    },100);
  },
  // **************************音频方法**********************************
  //设置音频
  setAudio: function(data) {
    var that = this;
    var audio = this.globalData.audioConsole;
    audio.src = data.src;
    audio.title = data.title;

    this.globalData.src = data.src;
    this.globalData.title = data.title;

    // 获取长度以便播放完毕停止了使用
    var timer = setInterval(function() {
      if (!audio.paused) {
        that.globalData.duration = audio.duration;
        clearInterval(timer);
        timer = null;
      };
    }, 100);
  },
  //自然播放结束后自动设置音频
  setAgainAudio: function() {
    var that = this;
    var audio = this.globalData.audioConsole;
    audio.src = this.globalData.src;
    audio.title = this.globalData.title;
    var timer = setInterval(function() {
      if (!audio.paused) {
        audio.pause();
        clearInterval(timer);
        timer = null;
      };
    }, 100);
  },
  clearAudio: function(){
    console.log('停止播放');
    var audio = this.globalData.audioConsole;
    audio.stop();
    // audio.src = '';
    // audio.title = '';
    console.log(this.globalData.audioConsole.src);
    console.log(this.globalData.audioConsole.title);
  },
  //开启定时器获取全局播放状态
  getAudioStatus: function() {
    var audio = this.globalData.audioConsole;
    var global = this.globalData.audioStatus;
    global.src = audio.src;
    global.title = audio.title;
    global.duration = audio.duration;
    global.currentTime = audio.currentTime;
    global.paused = audio.paused;
    global.buffered = audio.buffered;

    // 具体页面的方法，由传参而来
    this.audioCallback(audio);
  },
  //定时执行时自定义方法
  audioCallback: function(data) {},
  //通过该方法修改 audioCallback
  changeAudioCallback: function(fn) {
    return;
    var that = this;
    if (typeof fn != 'function') {
      return;
    };
    clearInterval(this.interval);
    this.interval = null;
    this.audioCallback = fn;
    this.interval = setInterval(function() {
      that.getAudioStatus();
    }, 100);
  },
  audioEndCallback: function() {
    console.log('自然结束的回调');
  },
  //第一次初始化 背景音频组件
  firstInitAudio: function() {
    var that = this;
    var audio = this.globalData.audioConsole;
    audio.onPlay(function() {
      console.log('音频播放');
      that.globalData.audioStatus.playStatus = 1;
    });
    audio.onPause(function() {
      console.log('音频暂停');
      that.globalData.audioStatus.playStatus = 2;
    });
    audio.onStop(function() {
      console.log('音频停止');
      that.globalData.audioStatus.playStatus = 3;
    });
    // 自然结束之后iOS 会清空src 地址
    audio.onEnded(function() {
      console.log('音频自然播放结束');
      that.globalData.audioStatus.playStatus = 3;
      //自然结束后重新加载
      // if(that.globalData.system == 1){
      //   console.log('安卓');
      //   that.setAgainAudio();
      // }else if(that.globalData.system == 0){
      //   console.log('iOS');
      //   that.setAgainAudio();
      // };
      that.setAgainAudio();
      that.audioEndCallback();
    });
    // 测试时 安卓 未执行该方法
    audio.onTimeUpdate(function() {
      // console.log('音频播放进度更新');
    });
    audio.onPrev(function() {
      console.log('iOS 上一曲');
    });
    audio.onNext(function() {
      console.log('iOS 下一曲');
    });
    audio.onError(function() {
      console.log('音频播放错误');
      that.setAgainAudio();
    });
    audio.onWaiting(function() {
      console.log('音频播放数据不足停下加载');
    });
    // 测试时 iOS 未执行该方法
    audio.onCanplay(function() {
      console.log('音频可以播放但不保证后面刘畅');
    });
  },
  // ***************************
  //第一次初始化 获取景区模板ID
  initScenicTemplate: function() {
    var that = this;
    apiHelper.paramData.cmd = "IFrGetTemplateBySid"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "Sid": apiHelper.paramData.sid,
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        that.globalData.scenicTemplate = data[0].TemplateID;
        that.globalData.scenicName = data[0].Name;
      } else {
        console.log(res);
      };
      console.log(data)
      that.getReady('template');
    });
  },
  //第一次初始化 获取景区模块
  initModule: function() {
    var that = this;
    apiHelper.paramData.cmd = "IFrAppModularList"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "Sid": apiHelper.paramData.sid,
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        that.globalData.module = data;
      } else {
        console.log(res);
      };
      console.log(that.globalData.module)
      that.getReady('module');
    });
  },
  //获取Banner数据
  initScenicBanner: function() {
    var that = this;
    apiHelper.paramData.cmd = "IFrAppBannerList"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "Sid": apiHelper.paramData.sid,
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        that.globalData.imgUrls = data;
      } else {
        console.log(res);
      };
      that.getReady('banner');
    });
  },
  //时间格式转换
  formNumberToTime: function(value) {
    if (!value && value == undefined && typeof value == 'undefined') {
      return false;
    };
    var number = Number(value);
    var minute = Math.floor(number / 60);
    var second = Math.floor(number % 60);
    if(minute.toString().length<2){
      minute = '0'+minute;
    };
    if(second.toString().length<2){
      second = '0'+second;
    };
    var str = minute + ':' + second;
    return str;
  },
  sliceStringAccordingToByte:function(string,byteNum){
    if(typeof string != 'string' || string === '' || typeof byteNum != 'number'){
      console.log('请传入正确的字符串');
      return false;
    };
    var maxlength = byteNum;
    var length = string.replace(/[^\x00-\xff]/g, '**').length;
    var num = 0;
    var sliceStr = '';
    if(length<=maxlength){
      return string;
    };
    for(var i=0;i<string.length;i++){
      var addnum = 0;
      if(/[^\x00-\xff]/g.test(string[i])){
        addnum = 2;
      }else{
        addnum = 1;
      };
      if(num+addnum>maxlength){
        sliceStr = string.slice(0,i) + '....';
        break;
      }else{
        num+=addnum;
      };
    };
    return sliceStr;
  },
  globalData: {
    readyStatus: {
      banner: false,
      template: false,
      module: false
    },
    comeInState: 0,
    // 0 iOS 1 安卓 2 其他
    system: 0,
    audioConsole: null,
    audioStatus:{
      src: '',
      title: '',
      duration: '',
      currentTime: '',
      paused: '',
      buffered: '',
      //1 是正在播放 2是已暂停 3 是已停止
      playStatus: 3
    },
    scenicTemplate: '',
    scenicName: '',
    windowWidth: 0,
    windowHeight: 0,
    currentFood: {},
    currentHotel: {},
    currentVideo: {},
    currentRaiders: {},
    currentAudio: {},
    currentActive: {},
    currentCustom: {},
    imgUrls: [],
    module: {}
  }
})