//获取应用实例
let app = getApp()
var WxParse = require('../../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabType: 1,
    infoData:{},
    infoList:[]
  },
  /*自定义方法--start */
  //页面跳转
  towenTiXQ(e) {
    let id = e.currentTarget.dataset.id || ""
    wx.navigateTo({
      url: '../my_wenTiXQ/my_wenTiXQ?id=' + id
    })
  },

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
    app.xcxPost({
      url: '/manager/user/callCenterDetail.do',
      data: {id: options.id},
      success: res => {
        console.log('res', res)
        let _data = res.data
        this.setData({
          infoData: _data.serviceContent||{},
          infoList: _data.serviceContentList||[]
        })
        WxParse.wxParse('article', 'html', _data.serviceContent.content, this, 30);
      }
    })
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