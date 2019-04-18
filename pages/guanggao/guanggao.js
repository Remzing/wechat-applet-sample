//获取应用实例
let app = getApp()
var amapFile = require('../../libs/amap-wx.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    adBanner:[],
    ad_index: '',
    is_owner:'',
    is_car:'',
    loopnum:4
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
    let is_owner = wx.getStorageSync('is_owner')
    app.globalData.is_owner = is_owner
    app.globalData.refresh = true
    this.setData({ is_owner })
    app.xcxPost({
      url: "/manager/rider/getBannerList.do",
      data: {
        type: is_owner == 1 ? '2' : '1' //1是车友 2是车主
      },
      success: res => {
        console.log("then", res);
        let _data = res.data
        wx.setStorageSync('domain', _data.domain)
        app.globalData.domain = _data.domain;
        let adBanner = _data.banner
        adBanner.forEach(function (ele) {
          ele.url = app.globalData.domain + ele.image_url
          ele.miniUrl = app.globalData.domain + (ele.image_min_url || "")
          ele.loaded = false
        })
        this.setData({
          adBanner,
          is_owner: app.globalData.is_owner || 0,
          is_car: app.globalData.is_car || 0
        })
        
        this.countDown()// 倒计时
        this.judgeState()
      }
    })
  },
  qieHuang(){
    let is_owner = app.globalData.is_owner == 1 ? 0 : 1
    app.xcxPost({
      url: "/manager/user/switchIdentity.do",
      data: { login_identity: is_owner },
      success: res => {
        app.globalData.is_owner = is_owner || '0'
        wx.setStorageSync('is_owner', is_owner || '0')
        this.init(this.options)
      }
    })
  },
  countDown(){
    let { loopnum, is_owner} = this.data
    setTimeout(()=>{
      loopnum--
      if (loopnum<0){
        wx.reLaunch({
          url: '/pages/index/index',
        })
        return
      }
      this.setData({loopnum})
      this.countDown()
    },1000)
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    
    this.options = options
    this.init(this.options)
    
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType
        if (networkType == "none") {
          app.globalData.haveNetwork = false;
          wx.redirectTo({
            url: "/pages/index/index"
          });
        } else {
          app.globalData.haveNetwork = true;
        }
      },
      fail: (err) => {
        console.error(err)
      }
    })
    
  },
  touchstart(e) {
    // this.weswiper.touchstart(e)
  },
  touchmove(e) {
    // this.weswiper.touchmove(e)
  },
  touchend(e) {
    // this.weswiper.touchend(e)
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
  judgeState() {
    app.xcxPost({
      // 判断用户车辆状态
      url: "/manager/rider/judgeUseOrder.do",
      data: {},
      success: resp => {
        let _data = resp.data || {}
        let _state = true
        if (_data.is_order_unsettle == 1) {// 有无未结算的订单（0没有 1有）
          _state = false
        }
        if (_data.is_order_unlock == 1) { // 有无确认用车但是还没有解锁也没有自动取消的订单（0没有 1有）
          _state = false
        }
        if (_data.is_order_underway == 1) {// 有无正在进行中的订单（0没有 1有）
          _state = false
        }
        if (_data.is_kinship_affirm == 1) {// 有无未亲情号确认用车但是未解锁的订单（0没有 1有）
          _state = false
        }
        if (_data.is_kinship_driving == 1) {// 有无未亲情号已经解锁车辆进行中的订单（0没有 1有）
          _state = false
        }
        if (_data.is_maintenance_affirm == 1) {// 有无未维保号确认用车但是未解锁的订单（0没有 1有）
          _state = false
        }
        if (_data.is_maintenance_driving == 1) {// 有无未维保号已经解锁车辆进行中的订单（0没有 1有）
          _state = false
        }
        if (_data.is_express_affirm == 1) {// 有无未快递号确认用车但是未解锁的订单（0没有 1有）
          _state = false
        }
        if (_data.is_express_driving == 1) {// 有无未维保号已经解锁车辆进行中的订单（0没有 1有）
          _state = false
        }
        //在我的页面暗中判断  如果是车友且有在使用的车辆 怎不让其切换为车主
        this.setData({
          isQiehuan: _state
        })

      }
    })
  },
  changIndex: function (e) {
    this.setData({ ad_index: e.detail.current })
  },
  adOper(e){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  addCar(e) {
    if (!app.globalData.phone){
      wx.navigateTo({
        url: "/pages/my_login/my_login?page=3"
      });
    }else if (app.globalData.is_car>0){
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }else{
      wx.reLaunch({
        url: '/pages/car_tianxiexx/car_tianxiexx',
      })
    }
    
  }
})