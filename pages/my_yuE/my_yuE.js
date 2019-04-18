//获取应用实例
let app = getApp()
let formData = {
  page: 1
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    multiArray: [
      ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    ],
    traceType: ['', "车友车费", "提现", "充值", "车主收益"],
    multiIndex: [0, 0, 0],
    infoData:{},
    bagData:{},
    start_time:"",
    end_time:""
  },
  /*自定义方法--start */
  //pick选择
  startDateChange: function (e) {
    console.log('startDateChange:', e.detail.value)
    this.setData({
      start_time: e.detail.value
    })
    this.fetchData()
  },
  endDateChange: function (e) {
    console.log('endDateChange:', e.detail.value)
    this.setData({
      end_time: e.detail.value
    })
    this.fetchData()
  },

  //页面跳转
  tochongZ() {
    wx.navigateTo({
      url: '../my_chongZ/my_chongZ'
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
    this.fetchData()
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
  fetchData(){
    formData.type = 1
    formData.page=1
    let { start_time, end_time} = this.data
    formData.startTime = start_time
    formData.endTime = end_time

    app.xcxPost({
      url: '/manager/user/myBalanceList.do',
      data: formData,
      success: res => {
        let _data = res.list
        if (_data && _data.length) {
          formData.page++
        }
        this.setData({
          infoData: _data
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