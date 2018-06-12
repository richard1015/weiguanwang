var apiHelper = require('../../utils/api.js');
Page({
    data:{
        list:[],
        Sid:'',
        PageIndex:1,
        PageSize:10,
        off:true,
        commentNone:false,
        commentAdd:false,
        commentLoad:false
    },
    onLoad: function (options) {
        this.setData({
            Sid:options.id
        });
        this.scrollLoad();
    },
    onReady:function(){
        console.log('初次渲染完成')
    },
    onShow:function(){
        console.log('页面显示')
    },
    scrollLoad:function(){
        if(!this.data.off){return};
        this.setData({off:false});

        apiHelper.paramData.cmd = "ScenicComment";
        apiHelper.paramData.param = {
            Sid: this.data.Sid,
            PageIndex: this.data.PageIndex,
            PageSize: this.data.PageSize,
        };
        apiHelper.paramData.version = "";
        apiHelper.paramData.language = "";
        var that = this;
        apiHelper.post(apiHelper.paramData, function (res) {
            if (res.state == 0) {
                var obj = JSON.parse(res.value);
                that.onSetText(obj);
            } else {
                console.log(that.data.list)
                console.log(!!that.data.list)
                console.log(!!that.data.list.length)
                console.log(!!that.data.list.length > 0)
                var ifelse = that.data.list && that.data.list.length && that.data.list.length > 0;
                that.setData({
                    off:false,
                    commentNone:ifelse?true:false,
                    commentAdd:true,
                    commentLoad:false
                });
            };
        });
    },
    onSetText:function(value){
        var index = this.data.PageIndex + 1;
        var arr = this.data.list;
        arr = arr.concat(value);
        this.setData({
            off:true,
            list:arr,
            PageIndex:index,
            commentLoad:true
        });
        if( arr.length <10){
            this.setData({
                commentLoad:false,
                commentAdd:true,
                commentNone:true
            }); 
        };
    }
});