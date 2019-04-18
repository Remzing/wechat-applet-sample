//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    infoData:[]
  },
  
  /*生命周期--start *
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.options = options
    this.init()
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
  // onShareAppMessage() {
  // },
  /**
   * 页面滚动时触发
   */
  onPageScroll() {
  },

  /*生命周期--end*/
  /*自定义方法--start */     
  /* 初始化 */
  init() {
    console.log('-init')
    app.xcxPost({
      url: "/manager/user/useGuide.do",
      data: {},
      mask: true,
      success: res => {
        console.log('res', res)
        if (res.data ) {
          this.setData({
            infoData: res.data
          })
        }
        app.hideMask()
      }
    })
  },
  goDetail(e) {
    let tampPath = e.currentTarget.dataset.path
    let img = e.currentTarget.dataset.img
    let minimg = e.currentTarget.dataset.minimg

    wx.navigateTo({
      url: tampPath + "?img=" + img + "&minimg=" + minimg
    })
  }, 
})