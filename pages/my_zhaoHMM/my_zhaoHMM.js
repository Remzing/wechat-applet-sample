//获取应用实例
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swich:0,
    index:1,
    flag:false,
  },
  //导航tab切换
  changeTabSwich: function () {
    let that = this
    if (!this.data.oldPhone) {
      app.warningMsg({ title: "请输入手机号" })
      return
    }
    var isPhone = app.testPhone(this.data.oldPhone); //正则
    if (!isPhone) {
      app.warningMsg({ title: '手机号不正确' })
      return
    }
    if (!this.data.pin_name) {
      app.warningMsg({ title: "请输入验证码" })
      return
    }
    let formData = {
      code: this.data.pin_name,
    }
    app.xcxPost({
      url: '/manager/user/passwordSendMsg.do',
      data: formData,
      success: res => {
        console.log('init-res', res)
        let _data = res.data
        that.setData({
          swich: 1,
          flag: true
        })
      }
    })

  },
  //
  getCode: function () {
    let that = this
    if (!this.data.oldPhone) {
      app.warningMsg({ title: "请输入手机号" })
      return
    }
    var isPhone = app.testPhone(this.data.oldPhone); //正则
    if (!isPhone) {
      app.warningMsg({ title: '手机号不正确' })
      return
    }
    let formData = {
      phone: this.data.oldPhone,
    }
    app.xcxPost({
      url: '/manager/user/passwordCheckMsg.do',
      data: formData,
      success: res => {
        console.log('init-res', res)
        let _data = res.data
        that.setData({
          swich: 1,
          flag: true
        })
      }
    })

  },
  //导航tab切换
  changeTabIndex: function (e) {
    let that = this
    let index = that.data.index
    if (!this.data.pwd || !this.data.pwd1) {
      app.warningMsg({ title: '请输入密码' })
      return
    }
    if (this.data.pwd != this.data.pwd1) {
      app.warningMsg({ title: "密码不相同" })
      return
    }
    let formData = {
      password: this.data.pwd,
      password_two: this.data.pwd1,
    }
    app.xcxPost({
      url: '/manager/user/updatePassword.do',
      data: formData,
      success: res => {
        console.log('init-res', res)
        let _data = res.data
        that.setData({
          index: index + 1,
          flag: false
        })
        this.daojsNum()
      }
    })
    
  },
  daojsNum() {
    setTimeout(() => {
      let nowM = this.data.miao - 1
      if (nowM > 0) {
        this.daojsNum()
      } else {
        this.goIndex()
      }
      this.setData({
        miao: nowM
      })
    }, 1000);
  },
  //绑定input
  phone: function (e) {
    let oldPhone = e.detail.value || '';
    this.setData({
      oldPhone: oldPhone
    })
  },
  pin_name: function (e) {
    let pin_name = e.detail.value || '';
    this.setData({
      pin_name: pin_name
    })
  },
  pwd: function (e) {
    let pwd = e.detail.value || '';
    this.setData({
      pwd: pwd
    })
  },
  pwd1: function (e) {
    let pwd1 = e.detail.value || '';
    this.setData({
      pwd1: pwd1
    })
  },
  //重新登录-跳到登录
  loginNew() {
    wx.redirectTo({
      url: '../login/login',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  changeSwiper:function(e){
    this.setData({
      swiperCurrent: e.detail.current
    })
  }
})