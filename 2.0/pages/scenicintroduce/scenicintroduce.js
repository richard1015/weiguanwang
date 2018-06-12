//map.js
var apiHelper = require('../../utils/api.js');
var app = getApp();
Page({
  data:{
    pageData:{}
  },
  //获取景区坐标
  getScenicPosition: function(){
    var that = this;
    apiHelper.paramData.cmd = "IFrScinceList"; //cmd
    apiHelper.paramData.function = "FrIntegratedH5"; //language
    apiHelper.paramData.param = {
      "Sid": apiHelper.paramData.sid
    };
    apiHelper.post(apiHelper.paramData, (res) => {
      if (res.State == 0) {
        var data = JSON.parse(res.Value);
        console.log(data)
        that.setData({
          pageData: data[0]
        });
        console.log(that.data.pageData);
      } else {
        console.log('获取失败请刷新',res);
      };
    });
  },
  onLoad: function(){
    wx.setNavigationBarTitle({
      title: "景区贴士"
    });
    // 初始化ajax请求数据
    this.getScenicPosition();
  },
});