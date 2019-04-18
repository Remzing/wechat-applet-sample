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
    multiArray: [['2017', '2018'], ['01', '06', '08', '09', '12']],
    multiIndex: [0, 0, 0],
    bagData: {},
    start_time:'',
    end_time: '',
  },
  /*自定义方法--start */
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
  //pick选择
  // bindDateChange: function (e) {
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   this.setData({
  //     multiIndex: e.detail.value
  //   })
  // },
  // pickerDate: function (e) {
  //   console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
  //   var data = {
  //     multiArray: this.data.multiArray,
  //     multiIndex: this.data.multiIndex
  //   };
  //   data.multiIndex[e.detail.column] = e.detail.value;
  //   switch (e.detail.column) {
  //     case 0:
  //       switch (data.multiIndex[0]) {
  //         case 0:
  //           data.multiArray[1] = ['01', '03', '08', '09', '12'];//第一组的第二联
  //           break;
  //         case 1:
  //           data.multiArray[1] = ['03', '06', '11'];//第二组的第二联
  //           break;
  //       }
  //       data.multiIndex[1] = 0;
  //       console.log(data.multiIndex);
  //       break;
  //   }
  //   this.setData(data);
  // },
  //页面跳转
  totiXian() {
    wx.navigateTo({
      url: '../my_tiXian/my_tiXian'
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
  init(options) {
    this.fetchData(options)
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
  fetchData() {
    formData.type = 2
    formData.page = 1
    let { startTime, endTime } = this.data
    formData.startTime = startTime
    formData.endTime = endTime

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
    this.init(this.options )
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