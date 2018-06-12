//activeinfo.js
var WxParse = require('../../wxParse/wxParse.js');
var apiHelper = require('../../utils/api.js');
var app = getApp();
var pages,prevPage; //当前页面 上一个页面
var isShare;// true 分享进入  false 列表进入
var isHome = false; //当前页是不是主页（用于分享进来的判断）true 是主页 false 不是主页
Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    pageData: {},
    likesOff: true,
    bigImgShow: false,
    bigImg: ''
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
    var that = this;
    return {
      title: that.data.pageData.ActivitiesName,
      path: '/pages/activeinfo/activeinfo?share=1&id=' + that.data.pageData.Id,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  //显示大图
  showBigImg: function (e) {
    console.log(e)
    this.setData({
      bigImgShow: !this.data.bigImgShow,
      bigImg: e.currentTarget.dataset.itemdata || ''
    })
  },
  //获取数据
  getPageData: function(id) {
    var that = this;
    apiHelper.paramData.cmd = "FrH5ActivitiesList"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "PageIndex": 1,
      "PageSize": 10,
      "Sid": apiHelper.paramData.sid,
      "ID": id
    };
    console.log('请求参数',apiHelper.paramData.param);
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        console.log('获取成功',res)
        var data = JSON.parse(res.Value);
        that.setData({
          pageData: data[0],
          activeImg: data[0].ActiImg.split(',')
        });

        wx.setNavigationBarTitle({
          title: that.data.pageData.ActivitiesName
        });

        //转换html 文本
        WxParse.wxParse('Content', 'html', this.data.pageData.ActivitiesCount, this, 0);
        //默认增加浏览量
        this.increaseBrowseVolume();
      } else {
        console.log('获取失败',res);
      };
    });
  },
  //开打定位导航页面
  getPosition: function(){
    console.log(1)
    wx.openLocation({
      latitude: this.data.pageData.GaoDeLat,
      longitude: this.data.pageData.GaoDeLon,
      address: this.data.pageData.Address,
      scale: 28
    });
  },
  //打开拨号界面
  toCallUp: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  //默认增加浏览量
  increaseBrowseVolume: function() {
    var that = this;
    apiHelper.paramData.cmd = "FrActivitiesByRead"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "ID": this.data.pageData.Id
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      console.log(res)
    });
  },
  //点赞
  getLikes: function() {
    if (!this.data.likesOff) {
      // wx.showToast({
      //   title: '您已经赞过了'
      // });
      return
    };
    // wx.showToast({
    //   title: '感谢您的支持'
    // });
    //增加上一个页面的点赞
    if(!isHome){
      prevPage.updatePageFabulous();
    };
    var that = this;
    apiHelper.paramData.cmd = "FrActivitiesByFabulous"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "ID": this.data.pageData.Id
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      console.log(res)
      that.data.pageData.Fabulous = Number(that.data.pageData.Fabulous)+1;
      that.setData({
        likesOff: false,
        pageData: that.data.pageData
      });
    });
  },
  //初始化 常量
  initNew: function(share) {
    //获取页面栈
    pages = getCurrentPages();
    if (share==1) {
      isHome = true;

    } else {
      isHome = false;
      console.log(app.globalData.currentActive)

      this.setData({
        scrollHeight: app.globalData.windowHeight,
        pageData: app.globalData.currentActive,
        activeImg: app.globalData.currentActive.ActiImg.split(',')
      });
      console.log(this.data.activeImg)
      wx.setNavigationBarTitle({
        title: this.data.pageData.ActivitiesName
      });

      prevPage = pages[pages.length - 2]; //上一个页面
      //转换html 文本
      WxParse.wxParse('Content', 'html', this.data.pageData.ActivitiesCount, this, 0);
    };
  },
  //初始化 重置反复使用
  initReset: function(id) {
    if (isHome) {
      this.getPageData(id);
    } else {
      //增加上一个页面的浏览量
      prevPage.updatePageBrowseVolume();
      //增加浏览量
      this.increaseBrowseVolume();
    };
  },
  onLoad: function(option) {
    console.log('onLoad')
    console.log(option)

    this.initNew(option.share);
    this.initReset(option.id);
  }
});