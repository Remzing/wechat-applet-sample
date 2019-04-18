//获取应用实例
let app = getApp()
let wxpay = require('../../utils/pay.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    active: false,
    reasonList:[],
    cancel_reason:'',
    choose_reason:'',
    order_info: {},
    car_info: {},
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
    if (this.options.page == 2) {//未结算行程初始化
      this.setData({
        page: 2
      })
      wx.setNavigationBarTitle({
        title: '未结算行程'
      })
      app.xcxPost({
        url: "/manager/rider/unCloseOrderInit.do",
        data: {
          id: this.options.id,
          order_id: this.options.order_id,
        },
        success: res => {
          let _data = res.data || {}
          let car_info = _data.car_info
          car_info.car_image = app.globalData.domain + car_info.car_image
          car_info.license_number = app.addXing(car_info.license_number)
          this.setData({
            order_info: _data.order_info,
            car_info,
            domain: app.globalData.domain
          })
        }
      })
    }else{
      app.xcxPost({
        url: "/manager/rider/cancelUseCarInit.do",
        data: {
          car_id: this.options.car_id,
          order_id: this.options.order_id,
        },
        success: res => {
          let _data = res.data || {}
          let car_info = _data.car_info
          car_info.car_image = app.globalData.domain + car_info.car_image
          car_info.license_number = app.addXing(car_info.license_number)
          this.setData({
            reasonList: _data.cancel_reason,
            car_info,
            reservation_fee: 0,
            domain: app.globalData.domain
          })
        }
      })
    }
    
  },
  goFeeMinx(){
    wx.navigateTo({
      url: "/pages/car_fymx/car_fymx?order_id=" + this.options.order_id + "&car_id=" + this.data.car_info.car_id
    })
    
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
    if (options.page){
      this.setData({
        page: options.page
      })
    }
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
  nameInput(e) {
    this.setData({ cancel_reason: e.detail.value })
  },
  selectRes(e){
    console.log('e', e)
    let nowid = e.currentTarget.dataset.id
    let content = e.currentTarget.dataset.content||""
    let { active } = this.data
    if (active == nowid) {
      this.setData({
        active: '',
        choose_reason: ''
      })
    }else{
      this.setData({
        active: nowid,
        choose_reason: content
      })
    }
    
  },
  goPageConf(){
    let { cancel_reason, choose_reason, reservation_fee} = this.data
    if (!cancel_reason && !choose_reason){
      app.warningMsg({ title: "请选择取消原因" })
      return
    }
    if (reservation_fee>0){//超时支付，取消订单
      let _formData = {
        car_id: this.options.car_id || this.data.car_info.car_id,
        order_id: this.options.order_id,
        pay_type: 3, //付款分类(1充值 2订单支付 3用车超时费支付)
      }
      wxpay.wxpay(app, _formData, this.cancelOper)
    }else{
      let { cancel_reason, choose_reason } = this.data
      var remark = cancel_reason
      choose_reason && (remark = choose_reason + ";" + cancel_reason)
      this.cancelOper(null, 1)
    }
    
    
  },
  cancelOper(formData, type) {//支付费用后回调
    let { reservation_fee, choose_reason} = this.data
    if (type == 1) {//type==1支付成功，2支付失败
      app.xcxPost({
        url: "/manager/rider/cancelUseCar.do",
        data: {
          car_id: this.options.car_id || this.data.car_info.car_id || "",
          order_id: this.options.order_id || "",
          reservation_fee: reservation_fee || "",
          cancel_reason: choose_reason || "超时支付"
        },
        success: res => {
          let _data = res.data || []
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            wx.reLaunch({
              url: "/pages/index/index"
            })
          }, 1000);
        }
      }) 
    }
     
  },
  payFeeConf() {
    let _formData = {
      car_id: this.options.car_id || this.data.car_info.car_id,
      order_id: this.options.order_id,
      pay_type: 4, //付款分类(1充值 2订单支付 3用车超时费支付)
    }
    wxpay.wxpay(app, _formData, this.payOrder)
  },
  payOrder(formData, type){
    if (type==1){//支付成功
      app.successMsg({ title: "支付成功！" + "" })
      setTimeout(() => {
        wx.reLaunch({
          url: "/pages/index/index"
        })
      }, 1000);
    }
   
  },
  goWenben(e) {
    let page = e.currentTarget.dataset.page || ""
    wx.navigateTo({
      url: '/pages/my_GSJS/my_GSJS?page=' + page,
    })
  }
})