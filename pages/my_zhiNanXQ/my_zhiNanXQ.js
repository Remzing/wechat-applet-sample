//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    img: '',
    minimg:'',
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
    
    let img = app.globalData.domain + this.options.img
    let minimg = app.globalData.domain + this.options.minimg
    this.setData({
      img, minimg
    })
  },
  preImg(){
    
    wx.previewImage({
      current: 1, // 当前显示图片的http链接
      urls: [this.data.img] // 需要预览的图片http链接列表
    })
  }
})