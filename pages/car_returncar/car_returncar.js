//获取应用实例
let app = getApp()
let wxpay = require('../../utils/pay.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    car_info: {},
    car_image: [],
    destination: {},
    page: 1,
    order: {},
    order_fee: {},
  },
  
  /*生命周期--start *
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.init(options)
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
   * 页面滚动时触发
   */
  onPageScroll() {
  },

  /*生命周期--end*/
  /*自定义方法--start */     
  /* 初始化 */
  init(options) {
    this.setData({
      page: options.page || 1
    })
    
    console.log('-init', options)
    if (options.page == 1) {//确认还车
      app.xcxPost({
        //我要还车初始化
        url: "/manager/rider/returnTheCarInit.do",
        data: {
          car_id: this.options.car_id,
          order_id: this.options.order_id,
        },
        success: res => {
          let _data = res.data || {}
          _data.car_image.forEach((ele) => {
            ele.image = app.globalData.domain + ele.image
          })
          _data.car_info.car_image && (_data.car_info.car_image = app.globalData.domain + _data.car_info.car_image)
          this.setData({
            car_info: _data.car_info,
            car_image: _data.car_image,
            destination: _data.destination,
          })
        }
      })
      this.refreshFee()
    } else if (options.page == 2) {
      wx.setNavigationBarTitle({
        title: '行程结束'
      })
      app.xcxPost({
        // 行程结束页面数据
        url: "/manager/rider/orderEndInfo.do",
        data: {
          car_id: this.options.car_id,
          order_id: this.options.order_id,
        },
        success: res => {
          let _data = res.data || {}
          _data.car_info.car_image && (_data.car_info.car_image = app.globalData.domain + _data.car_info.car_image)
          this.setData({
            car_info: _data.car_info,
            order: _data.order,
            order_fee: _data.order_fee,
          })
        }
      })
    }
    
  },
  refreshFee(){
    app.xcxPost({
      // 我要还车初始化(费用及费用明细
      url: "/manager/rider/returnTheCarInitFee.do",
      data: {
        car_id: this.options.car_id,
        order_id: this.options.order_id,
      },
      success: res => {
        let _data = res.data || {}

        _data.await_time_txt = app.minFormatSeconds(_data.await_time)
        _data.time_txt = app.minFormatSeconds(_data.time)
        this.setData({
          order: _data,
        })
      }
    })
  },
  goCheckImg() {
    let user_owner_id = this.options.user_owner_id || ""
    let order_id = this.options.order_id || ""
    let kinshipuse_id = this.options.kinshipuse_id || ""
    let page = ''
    wx.navigateTo({
      url: "/pages/car_waiguan/car_waiguan?page=" + page + "&user_owner_id=" + user_owner_id + "&order_id=" + order_id + "&kinshipuse_id=" + kinshipuse_id
    })
  },
  goFeeMinx() {
    wx.navigateTo({
      url: "/pages/car_fymx/car_fymx?page=3&car_id=" + this.options.car_id + "&order_id=" + this.options.order_id
    })
  },
  goBack(){
    wx.navigateBack({ changed: true });//返回上一页
  },
  goWenben(e) {
    let page = e.currentTarget.dataset.page || ""
    wx.navigateTo({
      url: '/pages/my_GSJS/my_GSJS?page=' + page,
    })
  },
  conf() {
    app.xcxPost({
      // 还车落锁
      url: "/manager/rider/returnTheCarLock.do",
      data: {
        car_id: this.options.car_id,
        order_id: this.options.order_id,
      },
      success: res => {
        // this.setData({
        //   lockFlag: false
        // })
        // app.successMsg({ title: res.errmsg + "" })
        let _formData = {
          car_id: this.options.car_id,
          order_id: this.options.order_id,
          pay_type: 2, //付款分类(1充值 2订单支付 3用户手动取消订单用车超时费支付 4未完成行程超时费支付)
        }
        wxpay.wxpay(app, _formData, this.cancelOper)

      }
    })
  },
  cancelOper(formData, type){
    if (type == 1) {//type==1支付成功，2支付失败
      setTimeout(() => {
        wx.redirectTo({
          url: "/pages/car_returncar/car_returncar?page=2&car_id=" + this.options.car_id + "&order_id=" + this.options.order_id
        })
      }, 1000);
    }
  },
  copyTxt(e){
    let txt = e.currentTarget.dataset.txt
    wx.setClipboardData({
      data: txt||"",
      success: function (res) {
        
      }
    })
  },
  goIndex(){
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },
  goPingj(e){
    let txt = e.currentTarget.dataset.txt
    wx.navigateTo({
      url: "/pages/car_zuchedp/car_zuchedp?car_id=" + this.options.car_id + "&order_id=" + this.options.order_id
    })
  },
})
