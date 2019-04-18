//获取应用实例
let app = getApp()
var WxParse = require('../../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page:''
  },
  /*自定义方法--start */
  //

  /*自定义方法--end */

  /*http 请求--start */
  /**
  * http请求
  * 列表
  */

  /*http 请求--end *
      
     /* 初始化 */
  init(options) {
    console.log('-init', options)
    let that = this
    this.setData({
      page: options.page
    })
    let navTitle, url,formData ={}
    if (options.page == 1) {
      navTitle = "公司介绍"
      url = "/manager/user/aboutUsCompany.do"
    } else if (options.page == 2) {
      navTitle = "五车仪介绍"
      // url = "/manager/user/aboutUsWcy.do"
      formData.id = 5
      url = "/manager/user/serviceAgreement.do"
    } else if (options.page == 3) {
      navTitle = "服务协议"
      url = "/manager/user/aboutUsService.do"
    } else if (options.page == 4) {
      // 1是软件使用协议 2是个人隐私保护政策 3是用户服务协议 4是平台服务规则 5是五车仪使用说明
      navTitle = "软件使用协议"
      formData.id=1
      url = "/manager/user/serviceAgreement.do"
    }else if (options.page == 5) {
      navTitle = "个人信息保护及隐私政策"
      formData.id=2
      url = "/manager/user/serviceAgreement.do"
    }else if (options.page == 6) {
      navTitle = "用户服务协议"
      formData.id=3
      url = "/manager/user/serviceAgreement.do"
    }else if (options.page == 7) {
      navTitle = "平台服务规则"
      formData.id=4
      url = "/manager/user/serviceAgreement.do"
    }else if (options.page == 8) {
      navTitle = "五车仪使用说明"
      formData.id=5
      url = "/manager/user/serviceAgreement.do"
    }else if (options.page == 9) {
      navTitle = "超时计价规则"
      formData.id=5
      url = "/manager/user/serviceAgreement.do"
    } else if (options.page == 10) {
      navTitle = "超时计价规则"
    } else if (options.page == 11) {
      navTitle = "取消订单规则"
    } else if (options.page == 12) {
      navTitle = "还车附加费规则"
    }
    wx.setNavigationBarTitle({
      title: navTitle,//页面标题为路由参数
    })
    if (url) {
      app.xcxPost({
        url: url,
        data: formData,
        success: res => {
          console.log('init-res', res)
          let _data = res.data
          WxParse.wxParse('article', 'html', _data.content, that, 30);
        }
      })
    }
    
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.init(options)

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  },
  /**
   * 页面滚动时触发
   */
  onPageScroll() {
  },

  /*生命周期--end*/
})