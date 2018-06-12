var apiHelper = require('../../utils/api.js');
Page({
    data: {
        list:{
            OpenTime:{
                id: 'OpenTime',
                name: '营业时间',
                image: '/image/icon8.png',
                info: '暂无数据'
            },
            PriceDesc:{
                id: 'PriceDesc',
                name: '票价详情',
                image: '/image/icon7.png',
                info: '暂无数据'
            },
            Suitable:{
                id: 'Suitable',
                name: '小贴士',
                image: '/image/icon6.png',
                info: '暂无数据'
            },
            Introduce:{
                id: 'Introduce',
                name: '景点介绍',
                image: '/image/icon5.png',
                info: '暂无数据'
            },
            Address:{
                id: 'Address',
                name: '景区地址',
                image: '/image/icon4.png',
                info: '暂无数据'
            },
            Traffic:{
                id: 'Traffic',
                name: '交通方式',
                image: '/image/icon3.png',
                info: '暂无数据'
            },
            Telephone:{
                id: 'Telephone',
                name: '电话咨询',
                image: '/image/icon1.png',
                info: '暂无数据'
            },
            Tips:{
                id: 'Tips',
                name: '温馨提示',
                image: '/image/icon2.png',
                info: '暂无数据'
            },
        }
    }, 
    onLoad: function (options) {
        apiHelper.paramData.cmd = "ScenicTipsByID";
        apiHelper.paramData.param = {
            Id: options.id
        };
        apiHelper.paramData.version = "";
        apiHelper.paramData.language = "";
        var onSetText = this.onSetText;
        apiHelper.post(apiHelper.paramData, function (res) {
            if (res.state == 0) {
                var obj = JSON.parse(res.value);
                onSetText(obj);
            } else {
                wx.showToast({
                    title: '暂无数据！',
                    icon: 'success',
                    duration: 1000
                })
            };
        });
    },
    onSetText:function(value){
        var json = {};
        for(var attr in this.data.list){
            json[attr] = this.data.list[attr];
            json[attr].info = value[attr];
        };
        this.setData({list:json});
    }
});