//custominfo.js
var WxParse = require('../../wxParse/wxParse.js');
var apiHelper = require('../../utils/api.js');
var app = getApp();
var pages, prevPage; //上一个页面
var isShare;// true 分享进入  false 列表进入
var isHome = false; //当前页是不是主页（用于分享进来的判断）true 是主页 false 不是主页
Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    pageData: {},
    likesOff: true,
    ModularId: null
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
      title: that.data.pageData.Title,
      path: '/pages/custominfo/custominfo?share=1&id='+that.data.pageData.Id+'&mid='+that.data.ModularId,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  //获取数据
  getPageData: function(mid,id) {
    var that = this;
    apiHelper.paramData.cmd = "FrZDYListByMoId"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "PageIndex": 1,
      "PageSize": 10,
      "Sid": apiHelper.paramData.sid,
      "ID": id,
      "ModularID": mid
    };
    console.log('请求参数',apiHelper.paramData.param);
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        console.log('获取成功',res)
        var data = JSON.parse(res.Value);
        that.setData({
          pageData: data[0]
        });

        wx.setNavigationBarTitle({
          title: that.data.pageData.Title
        });

        //转换html 文本
        WxParse.wxParse('Content', 'html', this.data.pageData.Content, this, 0);
        // //默认增加浏览量
        // this.increaseBrowseVolume();
      } else {
        console.log('获取失败',res);
      };
    });
  },
  //初始化 常量
  initNew: function(mid,share) {
    //获取页面栈
    pages = getCurrentPages();
    if (share==1) {
      isHome = true;

    } else {
      isHome = false;

      this.setData({
        scrollHeight: app.globalData.windowHeight,
        pageData: app.globalData.currentCustom,
        ModularId: mid
      });

      wx.setNavigationBarTitle({
        title: this.data.pageData.Title
      });

      prevPage = pages[pages.length - 2]; //上一个页面
      //转换html 文本
      WxParse.wxParse('Content', 'html', this.data.pageData.Content, this, 0);
    };
  },
  //初始化 重置反复使用
  initReset: function(mid,id) {
    if (isHome) {
      this.getPageData(mid,id);
    } else {
      // //增加上一个页面的浏览量
      // prevPage.updatePageBrowseVolume();
      // //增加浏览量
      // this.increaseBrowseVolume();
    };
  },
  onLoad: function(option) {
    console.log('onLoad')
    console.log(option)

    this.initNew(option.mid,option.share);
    this.initReset(option.mid,option.id);
  }
});