let app = getApp()
Page({
  data: {
    balance: 0,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    waitPay: 0,
    waitSend: 0,
    waitGet: 0,
    couponsLength: ''//有几张优惠券可领
  },
  onLoad() {
    console.log('onLoad++++');
    let that = this

    if (app.globalData.header.Cookie) {
      that.couponsList()
    } else {
      app.login(that.couponsList);
    }
  },
  onShow() {
    console.log('onShow++++', this.data);
    //判断shopId是否获取
    if (!app.globalData.shopId) {
      app.getShopId(this.init)
    } else {
      this.init()
    }
    // this.checkScoreSign();
  },
  init() {

    this.nowOrderNum()

    this.getUserInfo();
    this.setData({
      userInfo: app.globalData.userInfo
    });
    let that = this
    that.couponsList()

  },
  onReady() {
    // let that = this
    // console.log('that是什么鬼', that)
    console.log('onReady++++');
    this.loginModal = this.selectComponent("#loginModal");

  },
  onHide: function () {
    console.log('App onHide+++++');

  },
  /**
 *  打开弹窗
 */
  showLoginModal() {
    console.log('showLoginModal')
    setTimeout(() => {
      this.loginModal.show()
    }, 300);
    // let that = this
    // that.couponsList()
  },
  getUserInfo: function (cb) {
    console.log('getUserInfo-cb', cb);
    wx.showLoading({
      title: '',
      mask: true
    })
    wx.getSetting({
      success: (resp) => {
        if (resp.authSetting['scope.userInfo']) {
          console.log('scope.userInfo', resp)
          wx.getUserInfo({
            success: (resInfo) => {
              console.info("授权1", resInfo);
              this.setData({
                userInfo: resInfo.userInfo
              })
              app.login()
              let that = this
              wx.hideLoading();
              this.loginModal.hide()
              that.couponsList()
            },
            complete: function () {
            }
          })
        } else {
          this.showLoginModal()
          wx.hideLoading();
        }
      },
      fail: () => {
        wx.hideLoading();
      }
    })
  },
  setUserInfo() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  allOrder(e) {
    var _id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-list/index?id=" + _id
    })
  },
  aboutUs: function () {

  },
  getPhoneNumber: function (e) {
    console.log(e.detail);
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        title: '提示',
        content: '无法获取手机号码',
        showCancel: false
      })
      return;
    }
    var that = this;
    wx.request({
      url: app.globalData.postUrl + 'manager/user/wxapp/bindMobile',
      data: {
        token: app.globalData.token,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '绑定成功',
            icon: 'success',
            duration: 2000
          })
          that.getUserApiInfo();
        } else {
          wx.showModal({
            title: '提示',
            content: '绑定失败',
            showCancel: false
          })
        }
      }
    })
  },
  nowOrderNum: function () {
    var that = this;
    console.log('app.globalData.header', app.globalData.header)
    wx.request({
      url: app.globalData.postUrl + 'manager/user/myOrderNum.do',
      data: {
      },
      header: app.globalData.header,
      success: function (res) {
        if (res.data.errcode > -1) {
          var _data = res.data.data
          console.log('_data', _data)
          that.setData({
            waitPay: _data.waitPay,
            waitSend: _data.waitSend,
            waitGet: _data.waitGet,
          });
        }
        console.log('res.data', res.data, res)
        if (res.data == "noLogin") {
          app.login(that.nowOrderNum)
        }
      }
    })

  },
  checkScoreSign: function () {
    var that = this;
    wx.request({
      url: app.globalData.postUrl + '/score/today-signed',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            score_sign_continuous: res.data.data.continuous
          });
        }
      }
    })
  },
  scoresign: function () {
    var that = this;
    wx.request({
      url: app.globalData.postUrl + '/score/sign',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getUserAmount();
          that.checkScoreSign();
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  relogin: function () {
    var that = this;
    app.globalData.token = null;
    app.login();
    wx.showModal({
      title: '提示',
      content: '重新登陆成功',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          that.onShow();
        }
      }
    })
  },
  recharge: function () {
    wx.navigateTo({
      url: "/pages/recharge/index"
    })
  },
  withdraw: function () {
    wx.navigateTo({
      url: "/pages/withdraw/index"
    })
  },
  /**
  * 领取中心
  */
  couponsList: function () {
    let that = this
    wx.request({
      url: app.globalData.postUrl + 'manager/user/canGetDiscountsCount.do',
      header: app.globalData.header,
      data: {
        page: null,
        pageSize: null
      },
      success: function (res) {
        console.log('领卷中心+++++++', res)
        if (res.data.errcode == 1) {
          // console.log('领卷中心', res.data.list.length)
          that.setData({
            couponsLength: res.data.data
          })
        }
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  },
})