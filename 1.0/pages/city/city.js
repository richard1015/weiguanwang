// pages/city/city.js
var city = require('../../lib/city.js');
var hotCity = require('../../lib/cityHot.js');
function searchInfo(searchText) {
  if (!searchText) {
    return -1;
  }
  var searchListRes = [];
  function checksearchListResObj(obj) {
    for (var item in searchListRes) {
      if (searchListRes[item].firstLetter == obj.FirstLetter) {
        searchListRes[item].childs.push(obj);
        return true;
      }
    }
    return false;
  }
  function searchListResAdd(obj) {
    if (!checksearchListResObj(obj)) {
      searchListRes.push({
        firstLetter: obj.FirstLetter,
        childs: [obj]
      });
    }
  }

  console.log(`search ${searchText} begin`);
  for (var item in city) {
    if (searchText.indexOf(city[item].FirstLetter) != -1 || city[item].FirstLetter.indexOf(searchText) != -1 || searchText.indexOf(city[item].Name) != -1 || city[item].Name.indexOf(searchText) != -1) {
      searchListResAdd(city[item]);
    }
  }
  searchListRes.sort(function (a, b) {
    var s = a.firstLetter;
    var e = b.firstLetter;
    if (s > e) {
      return 1
    } else if (s < e) {
      return -1;
    } else {
      return 0;
    }
  });
  console.log(`search ${searchText} end`);

  return searchListRes;
}
Page({
  data: {
    //列表
    charArr: ['热门', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    search: "",
    cityList: [],
    hotCityList: [],
    types: [{
      name: "国内",
      type: 1,
      state: true
    }, {
      name: "海外",
      type: 2,
      state: false
    }]
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.choiceCountry();
  },
  bindKeyEnter: function () {
    this.searchList();
  },
  bindKeyInput: function (e) {
    var searchText = e.detail.value.toUpperCase();
    this.setData({
      search: searchText
    });
  },
  searchList: function () {
    var searchText = this.data.search;
    var resData = searchInfo(searchText);
    if (resData != -1) {
      this.setData({
        cityList: resData
      });
    } else {
      this.choiceCountry();
    }
  },
  choiceCity: function (event) {
    var cityName = '北京';
    if (event)
      cityName = event.currentTarget.dataset.name;

    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];  //当前页面
    var prevPage = pages[pages.length - 2]; //上级页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面即编辑款项页面中去
    //修改城市，清空输入框  
    prevPage.setData({
      city: cityName,
      keyword:"",
      tempKeyword:"",
      busy:false
    });
    prevPage.getSort('hot');
    wx.navigateBack({
      delta: 1
    });
  },
  choiceCountry: function (event) {
    var dataType = 1;
    if (event) {
      dataType = event.currentTarget.dataset.type;
    }

    this.setData({
      types: [{
        name: "国内",
        type: 1,
        state: dataType == '1' ? true : false
      }, {
        name: "海外",
        type: 2,
        state: dataType == '2' ? true : false
      }]
    });
    /*hotCity*/
    var hotCityObj = [];
    for (var item in hotCity) {
      if (dataType == hotCity[item].Type) {
        hotCityObj.push(hotCity[item]);
      }
    }
    this.setData({ hotCityList: hotCityObj });
    /*cityList*/
    var cityListObj = [];
    for (var item in city) {
      if (dataType == city[item].Type) {
        cityListObj.push(city[item]);
      }
    }
    var sortCityListObj = [];

    function checkSortCityListObj(obj) {
      for (var item in sortCityListObj) {
        if (sortCityListObj[item].firstLetter == obj.FirstLetter) {
          sortCityListObj[item].childs.push(obj);
          return true;
        }
      }
      return false;
    }
    function sortCityListObjAdd(obj) {
      if (!checkSortCityListObj(obj)) {
        sortCityListObj.push({
          firstLetter: obj.FirstLetter,
          childs: [obj]
        });
      }
    }
    for (var item in cityListObj) {
      sortCityListObjAdd(cityListObj[item]);
    }
    sortCityListObj.sort(function (a, b) {
      var s = a.firstLetter;
      var e = b.firstLetter;
      if (s > e) {
        return 1
      } else if (s < e) {
        return -1;
      } else {
        return 0;
      }
    });
    this.setData({ cityList: sortCityListObj });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})