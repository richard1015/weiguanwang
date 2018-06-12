var CryptoJS = require('../libs/aes');
var CONFIG =  wx.getExtConfigSync ? wx.getExtConfigSync() : {} ||require('../config');

console.log(`config info read begin`);
if (wx.getExtConfig) {
  wx.getExtConfig({
    success: function (res) {
      console.log(`config info read ok`);
      console.log(`config info >>>>>`);
      console.log(res.extConfig)
    },
    fail: function (error) {
      console.log(`config info read error`);
      console.log(error)
    }
  })
}else{
  console.log(`config info read no info`);
}
function Encrypt(word, key, iv) {
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  //return encrypted.ciphertext.toString();
  return encrypted.toString();
}

function Decrypt(word, key, iv) {
  var encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  var decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

function post(reqData, cb) {
  // var key = CryptoJS.enc.Utf8.parse(CONFIG.key);
  // var iv = CryptoJS.enc.Utf8.parse(CONFIG.iv);
  // var mm = Encrypt('nihao', key, iv)
  // console.log(mm);
  // var jm = Decrypt(mm);
  // console.log(jm)

  //check reqData
  var key = CryptoJS.enc.Utf8.parse(CONFIG.key);
  var iv = CryptoJS.enc.Utf8.parse(CONFIG.iv);
  var host = CONFIG.host;
  var tag = CONFIG.tag;
  var language = reqData.function;

  var requestData = {
    "cmd": reqData.cmd,
    "p": reqData.param,
    "unix": 1497235653 || new Date().getTime()
  };
  var sign = Encrypt(JSON.stringify(requestData), key, iv);
  sign = encodeURIComponent(sign);
  var sendData = `key=${sign}`;
  // wx.showToast({
  //     title: '加载中...',
  //     icon: 'loading'
  // })
  // wx.showLoading({
  //     title:'正在加载',
  //     mask:true
  // });
  console.log(`${host}?${sendData}`);
  wx.request({
    url: host,
    data: sendData,
    method: "post", // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      "tag": tag,
      "language": language,
      "version": "1"
    }, // 设置请求的 header
    success: function (res) {
      // success
    },
    fail: function (ex) {
      // fail
      console.log(ex);
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
    "sid": CONFIG.scenicId,
    "param": "",
    "cmd": "",
    "function": "",
    "errorMsg": true,
    "loadingState": true
  },
  post: post
}