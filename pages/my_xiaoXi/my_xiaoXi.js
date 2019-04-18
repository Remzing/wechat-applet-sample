//获取应用实例
let app = getApp()
var formData = { type: 1 }//消息类型（1订单消息 2系统消息）
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabType: 1,
    msgList:[],
    loadFlag:true
  },
  /*自定义方法--start */
  /**
   * tab切换
   */
  changeTab: function (e) {
    const that = this;
    const { tabType } = that.data;
    const { type } = e.currentTarget.dataset;
    if (tabType != type){
      that.setData({ tabType: type })
      formData.type = type
      this.init()
    }
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
    this.setData({ loadFlag:true })
    
    app.xcxPost({
      url: "/manager/user/myMsgList.do",
      data: formData,
      success: res => {
        let _data = res.list||[]
        this.setData({
          msgList: _data,
          loadFlag: false
        })
        if (_data.length>0){
          app.xcxPost({
            url: "/manager/user/myMsgRead.do",
            data: {},
            success: res => {
            }
          })
        }
      }
    })
    
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
    formData.type = 1
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
  onShareAppMessage() {
  },
  /**
   * 页面滚动时触发
   */
  onPageScroll() {
  },

  /*生命周期--end*/
})