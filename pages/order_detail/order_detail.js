//获取应用实例
let app = getApp()
let wxpay = require('../../utils/pay.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    order_fee:{},
    order_info: {},
    car_info: {},
    user_owner_info: {},
    is_owner:'',
    stateArr: ['', '进行中', '已完成', '已取消'],
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
  init() {
    let {is_owner} = this.data
    let url = "/manager/rider/selectUserOrderDetail.do"
    is_owner = app.globalData.is_owner || wx.getStorageSync('is_owner')
    this.setData({ is_owner })
    if (is_owner==1) {
      //我的订单详情  车主
      wx.setNavigationBarTitle({
        title: '订单详情'
      })
    }else{
      //我的行程详情  车友
      wx.setNavigationBarTitle({
        title: '行程详情'
      })
    }
    app.xcxPost({
      url: url,
      data: {
        order_id: this.options.order_id || "",
      },
      success: res => {
        let _data = res.data || {}
        let car_info = _data.car_info || {}
        let order = _data.order||{}
        car_info.car_image = app.globalData.domain + car_info.car_image
        car_info.license_number = app.addXing(car_info.license_number)

        if (order.await_time) {
          order.await_time_txt = app.minFormatSeconds(order.await_time)
          order.travel_time_txt = app.minFormatSeconds(order.travel_time)
        }
        this.setData({
          car_info,
          order_info: order||{},
          order_fee: _data.order_fee || {},
          user_owner_info: _data.user_owner_info||{}
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
    if (options.page){
      this.setData({
        page: options.page
      })
    }
    
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
    console.log('onShow-order_detail')
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
  goWenben(e) {
    let page = e.currentTarget.dataset.page || ""
    wx.navigateTo({
      url: '/pages/my_GSJS/my_GSJS?page=' + page,
    })
  },
  callPhone(e) {
    let { user_owner_info} = this.data
    wx.makePhoneCall({
      phoneNumber: user_owner_info.phone,
    })
  },
  goPingjia(){
    let { car_info}=this.data
    wx.navigateTo({
      url: "/pages/car_zuchedp/car_zuchedp?goback=1&car_id=" + car_info.car_id + "&order_id=" + this.options.order_id 
    })
  }
})