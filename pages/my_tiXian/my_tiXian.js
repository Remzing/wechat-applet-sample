//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bankInfo:{},
    bagData:{}
  },
  /*自定义方法--start */
  //页面跳转
  totiXJL() {
    wx.navigateTo({
      url: '../my_tiXJL/my_tiXJL'
    })
  },
  toGLYHK() {
    wx.navigateTo({
      url: '../my_GLYHK/my_GLYHK'
    })
  },
  numberInput(e) {
    this.setData({ numbers: e.detail.value })
  },
  setMon(){
    this.setData({ numbers: this.data.bagData.earnings })
  },
  tixian(){
    if (!this.data.bagData.earnings) {
      app.showMsgModal({ content: "可提现金额为零，请稍后再试" })
      return
    }
    if (!this.data.numbers) {
      app.showMsgModal({ content: "请输入提现金额" })
      return
    }
    let tempObj = this.data.bankInfo
    let formData = {
      bank: tempObj.bank,
      bank_user_name: tempObj.bank_user_name,
      bank_number: tempObj.bank_number,
      bank_address: tempObj.bank_address,
      money: this.data.numbers,
    }

    app.xcxPost({
      url: '/manager/user/myDeposit.do',
      data: formData,
      success: res => {
        app.successMsg({ title: res.errmsg + "" })
        setTimeout(() => {
          wx.navigateBack({ changed: true });//返回上一页
        }, 1000);
      }
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
    console.log('-init', options)
    app.xcxPost({
      url: '/manager/user/myDepositInit.do',
      data: {},
      success: res => {
        let _data = res.data
        let temp = _data.bank_number || "卡号有误"
        _data.bank_number_str = temp.substr(temp.length - 4, temp.length)
        this.setData({
          bankInfo: _data
        })
      }
    })
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