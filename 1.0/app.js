//app.js
App({
  onLaunch: function () {
    var that = this;
    wx.getSystemInfo({
      success:function(res){
        that.globalData.platform = res.platform;
      }
    })
    if (wx.openBluetoothAdapter) {
      wx.openBluetoothAdapter();
      //背景音乐播放监听
      wx.onBackgroundAudioPlay(function(){
        console.log('背景音乐播放');
        that.globalData.backgroundAudioPlaying = false;
        that.globalData.globlPlayFn(that.globalData);
      });
      wx.onBackgroundAudioPause(function(){
        console.log('背景音乐暂停');
        that.globalData.backgroundAudioPlaying = true;
        that.globalData.globlPauseFn(that.globalData);
      });
      wx.onBackgroundAudioStop(function(){
        console.log('背景音乐停止');
        that.globalData.backgroundAudioPlaying = true;
        if(typeof that.globalData.globlStopFn == 'function' ){
          that.globalData.globlStopFn(that.globalData);
        };
      });
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    //清缓存
    wx.clearStorage();
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo: null,
    platform:'',
    backgroundAudioPlaying:true,
    globlPlayFn:null,
    globlPauseFn:null,
    globlStopFn:null
  }
})