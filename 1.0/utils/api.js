var config = require('../config');
var md5 = require('../lib/md5');
//参数加密
var encryption = function (jsondata, key) {
    var arr = [];
    var Key = key;
    for (var key in jsondata) {
        arr.push(key);
    }
    arr.sort();
    var s = "";
    for (var i = 0; i < arr.length; i++) {
        s += jsondata[arr[i]];
    }
    return md5(s + Key);
}
function post(reqData, cb) {
    //check reqData
    var tag = config.tag;
    var key = config.key;
    var sign = encryption(reqData.param, key);
    var sendData = `cmd=${reqData.cmd}&param=${JSON.stringify(reqData.param)}&Sign=${sign}&Tag=${tag}&version=${reqData.version}&language=${reqData.language}&type=${reqData.type}`;
    console.log(`${config.requestUrl}?${sendData}`);
    // wx.showToast({
    //     title: '加载中...',
    //     icon: 'loading'
    // })
    // wx.showLoading({
    //     title:'正在加载',
    //     mask:true
    // });
    wx.request({
        url: config.requestUrl,
        data: sendData,
        method: "post", // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: { 'content-type': 'application/x-www-form-urlencoded' }, // 设置请求的 header
        success: function (res) {
            // success
        },
        fail: function (ex) {
            // fail
        },
        complete: function (res) {
            //wx.hideToast();
            // wx.hideLoading();
            // complete
            if (res.statusCode == 200) {
                typeof cb == "function" && cb(res.data)
            }
        }
    });

}

module.exports = {
    paramData: {
        "param": "",
        "cmd": "",
        "version": "",
        "language": "",
        "type": "H5",
        "errorMsg": true,
        "loadingState": true
    },
    post: post
}