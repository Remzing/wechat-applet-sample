//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userData:{}
  },
  
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
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
  /*自定义方法--start */     
  /* 初始化 */
  init(options) {
    console.log('-init', options)
    let { userData } = this.data
    userData.id = options.id || ""
    userData.name = options.name || ""
    userData.url = app.globalData.domain + options.user_photo || ""
    this.setData({
      userData
    })
  },
  conf() {
    let user_ids = ""
    if (this.options.user_ids) {
      user_ids = this.options.user_ids + "," + this.options.id
    }else{
      user_ids = this.options.id
    }
    let _url = "/manager/owner/updateKinship.do"// 已授权亲情号
    if (this.options.state == 2) {
      _url = "/manager/owner/updateMaintenance.do"// 已授权维保号
    } else if (this.options.state == 3) {
      _url = "/manager/owner/updateExpress.do"// 已授权快递号
    }
    app.xcxPost({
      url: _url,
      data: { 
        car_id: this.options.car_id, 
        user_ids: user_ids
      },
      success: res => {
        app.successMsg({ title: res.errmsg || "" + "" })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1000);
      }
    })
  },
  back(){
    wx.navigateBack({
      delta: 1
    })
  }
})