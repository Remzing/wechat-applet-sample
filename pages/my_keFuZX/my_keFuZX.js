//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabType: 1,
    carOwn: {},
    carFriend: {},
    hotData: {},
  },
  /*自定义方法--start */
  //页面跳转
  towenTiXQ(e) {
    let id = e.currentTarget.dataset.id||""
    wx.navigateTo({
      url: '../my_wenTiXQ/my_wenTiXQ?id=' + id
    })
  },
  tochenWCY(e){
    let id = e.currentTarget.dataset.id || ""
    let pagename = e.currentTarget.dataset.pagename || ""
    wx.navigateTo({
      url: '../my_chenWCY/my_chenWCY?pagename=' + pagename +'&id='+id
    })
  },
  /**
   * tab切换
   */
  changeTab: function (e) {
    const that = this;
    const { tabType } = that.data;
    const { type } = e.currentTarget.dataset;
    if (tabType != type) that.setData({ tabType: type })
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
      url: '/manager/user/callCenter.do',
      data: {},
      success: res => {
        let _data = res.data
        
        this.setData({
          dataList: _data,
          carFriend: _data[0],
          carOwn: _data[1],
        })
        // 热点问题
        app.xcxPost({
          url: '/manager/user/callCenterHotQuestion.do',
          data: {},
          success: res => {
            let _data = res.data

            this.setData({
              hotData: _data
            })
          }
        })
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
  goWenben(e){
    let page = e.currentTarget.dataset.page||""
    wx.navigateTo({
      url: '/pages/my_GSJS/my_GSJS?page='+page,
    })
  }
  /*生命周期--end*/
})