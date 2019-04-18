//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bagData:{},
    is_owner:""
  },
  /*自定义方法--start */
  //页面跳转
  toyuE() {
    wx.navigateTo({
      url: '../my_yuE/my_yuE'
    })
  },
  toshouYi() {
    wx.navigateTo({
      url: '../my_shouYi/my_shouYi'
    })
  },
  toGLYHK() {
    wx.navigateTo({
      url: '../my_GLYHK/my_GLYHK'
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
  init() {
    let is_owner = app.globalData.is_owner || wx.getStorageSync('is_owner')
    this.setData({
      is_owner
    })
    app.xcxPost({
      url: '/manager/user/myWalletInit.do',
      data: {},
      success: res => {
        let _data = res.data
        _data.balance && (_data.balance = _data.balance.toFixed(2))
        _data.earnings && (_data.earnings = _data.earnings.toFixed(2))
        this.setData({
          bagData: _data 
        })
      }
    })
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
    this.init()
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