//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    multiArray: [['2017', '2018'], ['01', '06', '08', '09', '12']],
    multiIndex: [0, 0, 0],
    dataList:[],
    start_time:'',
    end_time:''
  },
  /*自定义方法--start */
  //pick选择
  startDateChange: function (e) {
    console.log('startDateChange:', e.detail.value)
    this.setData({
      start_time: e.detail.value
    })
    this.init()
  },
  endDateChange: function (e) {
    console.log('endDateChange:', e.detail.value)
    this.setData({
      end_time: e.detail.value
    })
    this.init()
  },
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

  /*自定义方法--end */

  /*http 请求--start */
  /**
  * http请求
  * 列表
  */

  /*http 请求--end *
      
     /* 初始化 */
  init() {
    console.log('-init',)
    let { start_time, end_time } = this.data
    app.xcxPost({
      url: '/manager/user/myDepositList.do',
      data: { 
        start_time,
        end_time
      },
      success: res => {
        let _data = res.list
        _data.forEach(ele => {
          let temp = ele.bank_number || "卡号有误"
          ele.bank_number_str = temp.substr(temp.length - 4, temp.length)
        });
        this.setData({
          dataList: _data
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

  /*生命周期--end*/
})