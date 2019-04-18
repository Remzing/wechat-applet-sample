//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  /*自定义方法--start */
  //页面跳转
  tozhaoHSJ() {
    wx.navigateTo({
      url: '../my_zhaoHSJ/my_zhaoHSJ'
    })
  },
  tozhaoHMM() {
    wx.navigateTo({
      url: '../my_zhaoHMM/my_zhaoHMM'
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
  switch2Change: function (e) {
    console.log('switch2 发生 change 事件，携带值为', e.detail.value)
    let check = e.detail.value
    // app.xcxPost({
    //   url: "/manager/owner/dynamicPrice.do",
    //   data: { id: this.options.id, is_dynamic_price: check ? "1" : "0" },
    //   success: res => {
    //     let _data = res.data

    //   }
    // })
  },
})