//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bank_user_name:'',
    bank:"",
    bank_number:"",
    bank_address:"",
  },
  /*自定义方法--start */
  //
  nameInput(e) {
    this.setData({ bank_user_name: e.detail.value })
  },
  bankInput(e) {
    this.setData({ bank: e.detail.value })
  },
  bankNumberInput(e) {
    this.setData({ bank_number: e.detail.value })
  },
  bankAddressInput(e) {
    this.setData({ bank_address: e.detail.value })
  },
  bangding(){
    if (!this.data.bank_user_name) {
      app.warningMsg({ title: "请输入姓名" })
      return
    }
    if (!this.data.bank_address) {
      app.warningMsg({ title: "请输入开户地址" })
      return
    }
    if (!this.data.bank) {
      app.warningMsg({ title: "请输入开户银行" })
      return
    }
    if (!this.data.bank_number) {
      app.warningMsg({ title: "请输入银行卡号" })
      return
    }
    let url = ""
    let formData = {
      bank: this.data.bank || "",
      bank_user_name: this.data.bank_user_name || "",
      bank_number: this.data.bank_number || "",
      bank_address: this.data.bank_address || "",
    }
    if (this.options && this.options.id) {
      // 编辑
      formData.id = this.options.id
      url = "/manager/user/myBankEdit.do"
    }else{
      // 添加
      url = "/manager/user/myBankCardAdd.do"
    }
    app.xcxPost({
      url: url,
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
    if (options && options.id) {
      app.xcxPost({
        url: '/manager/user/myBankEditInit.do',
        data: { id: options.id },
        success: res => {
          let _data = res.data
          this.setData({
            bank: _data.bank||"",
            bank_user_name: _data.bank_user_name||"",
            bank_number: _data.bank_number||"",
            bank_address: _data.bank_address||"",
          })
        }
      })
    }
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
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