//获取应用实例
let app = getApp()
var amapFile = require('../../libs/amap-wx.js');
// import weSwiper from '../../libs/weSwiper'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list:[{},{}]
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
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    // new weSwiper({
    //   animationViewName: 'animationData',
    //   slideLength: 3,//!!!!!
    //   initialSlide: 0,
    // }) 

  },
  touchstart(e) {
    this.weswiper.touchstart(e)
  },
  touchmove(e) {
    this.weswiper.touchmove(e)
  },
  touchend(e) {
    this.weswiper.touchend(e)
  },
  uploadvideo(){
    wx.chooseVideo({
      // sourceType: ['camera', 'album'],
      sourceType: ['camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        console.log("chooseVideo-res",res)
      }
    })
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