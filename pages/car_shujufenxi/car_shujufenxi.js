//获取应用实例
let app = getApp()
var wxCharts = require('../../libs/wxcharts.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.init(options)
    new wxCharts({
      canvasId: 'areaCanvas',
      type: 'area',
      legend: false,
      categories: ['2016-08', '2016-09', '2016-10', '2016-11', '2016-12', '2017-2', '2017-3'],
      series: [{
        data: [70, 40, 65, 100, 34, 18, 34],
        color: "#ff8001",
        format: function (val) {
          return val.toFixed(2) + '';
        }
      }],
      yAxis: {
        format: function (val) {
          return val + '';
        }
      },
      width: 375,
      height: 200
    });
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
  },
})