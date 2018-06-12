//map.js
var apiHelper = require('../../utils/api.js');
var app = getApp();
Page({
  data: {
    mapobj: null,
    mapOk: false, //地图显示隐藏 为了解决一些显示的bug
    scale: 17,
    //longitude: 0, //getMyPosition 请求获取
    //latitude: 0,
    //initLongitude: 0,
    //initLatitude: 0,
    //markers: [],//initMarkers 生成
    //markersData: [],//getScenicspotPosition 请求获取
    //controls: [],//initPageStatus 生成
    loopPosition: true,
    //autoPlayOff: true//initPageStatus 生成
    prevIndex: null, //播放状态改变 采用记录上一个位置 而不是循环的方式
    readyStatus:{
      scenicPosition: false,
      scenicspotPosition: false,
    },
    readyStatusCallback: null,
    pageTitle: '',
    pageClose: true
  },
  //返回
  goback: function() {
    var page = getCurrentPages();
    console.log('返回',page)
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
      path: '/pages/mapguide/mapguide?title='+this.data.pageTitle,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    };
  },
  regionchange: function(e) {
    console.log(this.data.scale);
    // if( e.type == 'end'){
    //   让地图回到当前所在位置导致marker不显示的补救方法，每次移动地图都更新一下marker
    //   this.initMarkers(this.data.markersData);
    // };
  },
  //标记的事件分发
  markertap: function(e) {
    // 当前点击标记的状态
    var index = e.markerId;
    //当前播放状态  用于切换播放和停止
    var nowTapAudioStatus = this.data.markersData[index].audioOff;
    console.log('点击标记点');
    if (nowTapAudioStatus) {
      //音频正在播放
      this.stopAudio(index);
    } else {
      //音频正在播放
      this.playAudio(index);
    };
  },
  //控件的事件分发 自动播放 和回到自己的位置
  controltap: function(e) {
    var that = this;
    console.log('控件点击',e)
    switch (e.controlId) {
      case 1:
        // this.data.mapobj.getCenterLocation({
        //   success: function(res) {
        //     console.log(res)
        //   }
        // });
        this.setAutoPlay();
        break;
      case 2:
        this.getMyPosition();
        break;
    };
  },
  maptap: function(e) {
    console.log('点击地图', e);
  },
  //实时定位
  loopGetPosition: function() {
    if (!this.data.autoPlayOff) {
      return;
    };
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      complete: function(res) {
        if( res.errMsg == 'getLocation:ok' ){
          console.log('定位成功');
          var latitude = res.latitude;
          var longitude = res.longitude;
          that.setData({
            // 实时定位不需要马上改变地图的位置
            // longitude: longitude, //把地图焦点移到景区
            // latitude: latitude,
            initLongitude: longitude,
            initLatitude: latitude
          });
          //测试使用 固定定位位置
          // that.positionControler(39.918054, 116.397083);
           that.positionControler(latitude, longitude);
        }else{
          console.log('定位失败');
        };

        //递归循环 上次定位成功后5秒再次定位
        if (that.data.loopPosition) {
          setTimeout(function() {
            that.loopGetPosition();
          }, 5000);
        };
      }
    });
  },
  //距离集中处理判断
  positionControler: function(lat, long) {
    var that = this;
    var nowlat = lat;
    var nowlong = long;
    var scenicLists = this.data.markersData;
    var length = scenicLists.length;
    if(!this.data.pageClose){
      console.log('已经退出该页面');
      return;
    };
    if( app.globalData.audioConsole.paused == false){
      //正在播放音频
      return;
    };

    var distances = [];
    for (var i = 0; i < length; i++) {
      var json = {
        distance: this.getDistance(nowlat, nowlong, scenicLists[i].GaoDeLat, scenicLists[i].GaoDeLon),
        fromLat: nowlat,
        fromLong: nowlong,
        toLat: scenicLists[i].GaoDeLat,
        toLong: scenicLists[i].GaoDeLon,
        index: i
      };
      distances.push(json);
      // 调用计算方法，用结果进行判断  并且 从未播放过
      var num = scenicLists[i].Distance>=50?scenicLists[i].Distance:50;
      // console.log('到景点距离',json.distance);
      // console.log('景点范围',scenicLists[i].Distance);
      // console.log('数据',json);
      if (json.distance <= num && !scenicLists[i].audioAlready) {
        // console.log('范围内');
        that.playAudio(i);
        // 先轮到谁就播放谁,然后直接跳出循环;
        break;
      }else if(scenicLists[i].audioAlready){
        // console.log('已经播放');
      }else{
        // console.log('范围外');
      };
    };
  },
  //自动播放控制
  setAutoPlay: function() {
    if (this.data.autoPlayOff) {
      //正在自动播放
      this.data.controls[0].iconPath = '/image/autoplay1.png';
      this.setData({
        autoPlayOff: !this.data.autoPlayOff,
        controls: this.data.controls
      });
    } else {
      //没有自动播放
      this.data.controls[0].iconPath = '/image/autoplay.png';
      this.setData({
        autoPlayOff: !this.data.autoPlayOff,
        controls: this.data.controls
      });

      this.loopGetPosition();
    };
  },
  //距离计算
  getDistance: function() {
    var t = Math.sin,
      n = Math.cos,
      r = Math.sqrt,
      a = Math.asin;
    return function(fromLat, fromLong, toLat, toLong) {
      var s = 12742001.5798544,
        i = .01745329251994329;
      var e = fromLat * i,
        f = fromLong * i,
        o = toLat * i,
        v = toLong * i,
        q = t(e),
        b = t(f),
        d = n(e),
        g = n(f),
        j = t(o),
        k = t(v),
        l = n(o),
        m = n(v),
        p = d * g,
        w = d * b,
        x = l * m,
        y = l * k,
        z = r((p - x) * (p - x) + (w - y) * (w - y) + (q - j) * (q - j));
      return a(z / 2) * s;
    };
  }(),
  //回到当前地址
  getMyPosition: function() {
    this.setData({
      mapOk: false
    });
    this.setData({
      longitude: this.data.initLongitude,
      latitude: this.data.initLatitude,
      scale: 14
    });
    this.setData({
      mapOk: true
    });
    // 用提供的接口 让地图回到当前所在位置，但是有BUG可能导致marker不显示
    // this.data.mapobj.moveToLocation();
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
    console.log('开始获取景区坐标');
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        console.log('获取景区坐标成功',res);
        var data = JSON.parse(res.Value);
        // console.log(data)
        that.setData({
          longitude: data[0].GaoDeLon,
          latitude: data[0].GaoDeLat,
          initLongitude: data[0].GaoDeLon,
          initLatitude: data[0].GaoDeLat,
          scale: 17
        });
      } else {
        console.log('获取景区坐标失败',res);
      };
      that.getReady('scenicPosition');
    });
  },
  //获取景点坐标
  getScenicspotPosition: function(){
    var that = this;
    apiHelper.paramData.cmd = "FrH5ScenicSpotCoordList"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "PageIndex": 1,
      "PageSize": 9999,
      "Sid": apiHelper.paramData.sid,
      "ID": ""
    };
    console.log('开始获取景点坐标');
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        console.log('获取景点坐标成功',data)
        that.setData({
          markersData: data
        });
      } else {
        console.log('获取景点坐标失败',res);
      };
      that.getReady('scenicspotPosition');
    });
  },
  //初始化一些状态
  initPageStatus: function(w,h){
    var that = this;
    //根据定位是否成功  确定自动播放状态 开启自动播放 关闭自动播放 无法自动播放
    wx.getLocation({
      success: function(res) {
        console.log('定位成功');
        //这里需要再次考虑 定位失败的坐标放在哪里
        that.setData({
          //longitude: 113.08217, //把地图焦点移到景区
          //latitude: 25.768819,
          //initLongitude: res.longitude,
          //initLatitude: res.latitude,
          mapOk: true, //判断map 的显示和隐藏
          autoPlayOff: true,
          //初始化固定控件
          controls: [{
            id: 1,
            iconPath: '/image/autoplay.png',
            clickable: true,
            position: {
              left: w-50-20,
              top: h-50-20-10-50,
              width: 50,
              height: 50
            }
          }, {
            id: 2,
            iconPath: '/image/1.png',
            clickable: true,
            position: {
              left: w-50-20,
              top: h-50-20,
              width: 50,
              height: 50
            }
          }]
        });
        //开启实时定位
        that.data.loopPosition = true;
        that.loopGetPosition();
      },
      fail: function(res) {
        //这里需要再次考虑 定位失败的坐标放在哪里
        console.log('定位失败');
        that.setData({
          longitude: res.longitude, //把地图焦点移到景区
          latitude: res.latitude,
          initLongitude: res.longitude,
          initLatitude: res.latitude,
          mapOk: true, //判断map 的显示和隐藏
          autoPlayOff: true,
          //初始化固定控件
          controls: [{
            id: 2,
            iconPath: '/image/1.png',
            position: {
              left: w - 50 - 20,
              top: h - 50 - 20,
              width: 50,
              height: 50
            }
          }]
        });
        //清空实时定位功能
        that.data.loopPosition = false;
        that.loopGetPosition = function() {};

        wx.showModal({
          title: "定位失败",
          content: "请检查网络后重新打开",
          showCancel: false,
          success: function(res){
            console.log(res);
          }
        });
      }
    });
  },
  //初始化标记位置
  initMarkers: function() {
    var that = this;
    var markersData = this.data.markersData;
    var markers = [];
    for (var i = 0; i < markersData.length; i++) {
      //添加播放还是停止状态字段 false 为未播放 true 为播放
      markersData[i].audioOff = false;
      //添加是否播放过字段  false 没有播放过   true 为播放过
      markersData[i].audioAlready = false;
      var marke = {
        id: i,
        callout: {
          content: markersData[i].SName,
          display: 'BYCLICK',
          bgColor: '#ffffff',
          color: '#000000',
          borderRadius: 8,
          padding: 4
        },
        iconPath: "/image/play.png",
        width: 25,
        height: 25,
        latitude: markersData[i].GaoDeLat,
        longitude: markersData[i].GaoDeLon,
      };
      markers.push(marke);
    };

    this.setData({
      markersData: markersData,
      markers: markers
    });

    // 当前是否正在播放
    var audio = app.globalData.audioConsole;
    var audioSrc = audio.src;
    var nowAudioIndex = audio.mapAudioIndex;
    //audio含有 mapAudioIndex 且是数字 src 地址也一致才能判断播放的是本页音频
    if (nowAudioIndex && !isNaN(nowAudioIndex) && audioSrc == markersData[nowAudioIndex].AudioUrl) {
      markersData[nowAudioIndex].audioOff = true;
      markers[nowAudioIndex].iconPath = "/image/play1.png";
    } else {
      audio.mapAudioIndex = '';
    };
  },
  //---------------------audio 方法----------------------------
  //初始化audio 自然播放完毕后的回调
  initAudioCallBack: function() {
    var that = this;
    app.audioEndCallback = function() {
      var index = app.globalData.audioConsole.mapAudioIndex;
      that.stopAudio(index);
    };
  },
  clearAudioCallBack: function() {
    app.audioEndCallback = function() {};
  },
  playAudio: function(index) {
    //防止没有音频的播放
    var items = this.data.markersData;
    if(!items[index].AudioUrl && !items[index].SName){
      //没有音频名称 或 没有音频地址
      console.log('没有音频地址或者音频名称');
      this.data.markersData[index].audioAlready = true;
      this.setData({
        markersData: this.data.markersData
      });
      return;
    };

    var preIndex = this.data.prevIndex;
    console.log(this.data.markers[preIndex]);
    if(preIndex){
      // this.data.markers[preIndex].iconPath = "/image/play.png";
      this.data.markers[preIndex]['callout']['display'] = "BYCLICK";
      this.data.markersData[preIndex].audioOff = false;
    };
    this.data.markers[index].iconPath = "/image/play1.png";
    this.data.markers[index]['callout']['display'] = "ALWAYS";
    this.data.markersData[index].audioOff = true;
    this.data.markersData[index].audioAlready = true;

    this.setData({
      markers: this.data.markers,
      markersData: this.data.markersData,
      prevIndex: index
    });
    // 设置了 src 之后会自动播放
    app.globalData.audioConsole.src = this.data.markersData[index].AudioUrl;
    app.globalData.audioConsole.title = this.data.markersData[index].SName;
    app.globalData.audioConsole.mapAudioIndex = index; //用于标记当前播放了哪个音频
  },
  stopAudio: function(index) {
    var preIndex = this.data.prevIndex;
    if(preIndex){
      // this.data.markers[preIndex].iconPath = "/image/play.png";
      this.data.markers[preIndex]['callout']['display'] = "BYCLICK";
      this.data.markersData[preIndex].audioOff = false;
    };
    this.setData({
      markers: this.data.markers,
      markersData: this.data.markersData
    });

    app.globalData.audioConsole.mapAudioIndex = ''; //播放赋值，停止清空
    app.globalData.audioConsole.stop();
  },
  //-----------------页面启动时的方法--------------------------
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
    console.log('ready');
    // 初始化音频回调函数
    this.initAudioCallBack();
    // 初始化标记
    this.initMarkers();
    // 初始化页面的一些状态
    // 获取当前定位 并且显示地图
    // 初始化固定控件
    this.initPageStatus(this.data.winWidth, this.data.winHeight);
  },
  onLoad: function(option) {
    console.log('onLoad');
    var that = this;
    // 重新获取窗口信息尺寸（安卓上，初始化获取的可能不准确）
    wx.getSystemInfo({
      success: function(data) {
        console.log('初始化地图尺寸')
        that.setData({
          winWidth: data.windowWidth,
          winHeight: data.windowHeight,
          mapobj: wx.createMapContext('map')
        });
      }
    });
    wx.setNavigationBarTitle({
      title: option.title
    });
    app.globalData.audioConsole.stop();
    // 设置将启动方法绑定到getReady 的回调
    this.setData({
      pageTitle: option.title,
      readyStatusCallback: this.init
    });
    // 初始化ajax请求数据
    this.getScenicPosition();
    this.getScenicspotPosition();
  },
  onUnload: function() {
    this.setData({
      pageClose: false,
      loopPosition: false
    });
    this.clearAudioCallBack();
    this.loopGetPosition = function() {};
    app.clearAudio();
  }
})