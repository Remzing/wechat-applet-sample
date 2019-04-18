//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    order:{},
    car_info:{},
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
    app.xcxPost({
      // 我要还车初始化(费用及费用明细
      url: "/manager/rider/returnTheCarInitFee.do",
      data: {
        car_id: this.options.car_id,
        order_id: this.options.order_id,
      },
      success: res => {
        let _data = res.data || {}

        _data.await_time_txt = app.minFormatSeconds(_data.await_time)
        _data.time_txt = app.minFormatSeconds(_data.time)
        this.setData({
          order: _data,
        })
      }
    })
    app.xcxPost({
      //我要还车初始化
      url: "/manager/rider/returnTheCarInit.do",
      data: {
        car_id: this.options.car_id,
        order_id: this.options.order_id,
      },
      success: res => {
        let _data = res.data || {}
        let car_info = _data.car_info
        car_info.car_image = app.globalData.domain + car_info.car_image
        car_info.license_number = app.addXing(car_info.license_number)
        this.setData({
          car_info,
        })
      }
    })
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
    this.init(this.options)
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