//food.js
var WxParse = require('../../wxParse/wxParse.js');
var apiHelper = require('../../utils/api.js');
var app = getApp();
var pages,prevPage; //上一个页面
var isShare;// true 分享进入  false 列表进入
var isHome = false; //当前页是不是主页（用于分享进来的判断）true 是主页 false 不是主页
Page({
  data: {
    scrollTop: 0,
    scrollHeight: 0,
    pageData: {},
    likesOff: true,
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
      path: '/pages/foodinfo/foodinfo?share=1&id=' + that.data.pageData.Id,
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
    apiHelper.paramData.cmd = "FrH5FoodList"; //cmd
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
          pageData: data[0]
        });

        wx.setNavigationBarTitle({
          title: that.data.pageData.Title
        });

        //转换html 文本
        WxParse.wxParse('Content', 'html', this.data.pageData.Content, this, 0);
        //默认增加浏览量
        this.increaseBrowseVolume();
      } else {
        console.log('获取失败',res);
      };
    });
  },
  //默认增加浏览量
  increaseBrowseVolume: function() {
    var that = this;
    apiHelper.paramData.cmd = "FrFoodByBrowseVolume"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "ID": this.data.pageData.Id
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      console.log('增加浏览量',res)
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
    apiHelper.paramData.cmd = "FrFoodByFabulous"; //cmd
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

      this.setData({
        scrollHeight: app.globalData.windowHeight,
        pageData: app.globalData.currentFood
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