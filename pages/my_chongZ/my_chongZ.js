//获取应用实例
let app = getApp()
let wxpay = require('../../utils/pay.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    numbers:'',
  },
  /*自定义方法--start */
  //
  numberInput(e){
    var that = this
    that.setData({ numbers: e.detail.value })
  },

  weixPay(){
    if (!this.data.numbers) {
      app.warningMsg({ title: "请输入充值金额" })
      return
    }
    let _formData = {
      pay_type: 1, //付款分类(1充值 2订单支付)
      money: this.data.numbers
    }
    wxpay.wxpay(app, _formData, this.payCallback)
  },
  payCallback(formData, type) {
    setTimeout(function () {
      wx.redirectTo({
        url: "/pages/my_yuE/my_yuE"
      })
    }, 200)
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
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    let that = this

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