//获取应用实例
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swich:0,
    page: 1,
    index:1,
    flag:false,
    nextflag:true,
    upflag:false,
    codeImg: {},
    miao: 5
  },
  //导航tab切换
  changeTabSwich: function (e) {
    let that = this
    let state = e.currentTarget.dataset.state
    if (!this.data.oldPhone) {
      app.warningMsg({title: "请输入手机号"})
      return
    }
    var isPhone = app.testPhone(this.data.oldPhone); //正则
    if (!isPhone) {
      app.warningMsg({ title: '手机号不正确' })
      return
    }

    if (!this.data.pin_name) {
      app.warningMsg({title: "请输入验证码"})
      return
    }
    let formData = {
      code: this.data.pin_name,
      phone_old: this.data.oldPhone,
      state: state,
      token: this.data.codeImg.token
    }
    app.xcxPost({
      url: '/manager/user/userOldPhoneSend.do',
      data: formData,
      success: res => {
        console.log('init-res', res)
        let _data = res.data
        that.setData({
          page: 2
        }) 
      }
    })
    
  },
  //导航tab切换
  changeTabIndex: function (e) {
    let that = this
    if (!this.data.newPhone) {
      app.warningMsg({ title: "请输入手机号" })
      return
    }
    var isPhone = app.testPhone(this.data.newPhone); //正则
    if (!isPhone) {
      app.warningMsg({ title: '手机号不正确' })
      return
    }

    if (!this.data.newCode) {
      app.warningMsg({ title: "请输入验证码" })
      return
    }
    let formData = {
      code: this.data.newCode,
      phone_new: this.data.newPhone,
    }
    app.xcxPost({
      url: '/manager/user/updatePhone.do',
      data: formData,
      success: res => {
        console.log('init-res', res)
        let _data = res.data
        that.setData({
          index: 2,
          page: 4
        })
        this.daojsNum()
      }
    })
  },
  daojsNum(){
    setTimeout(() => {
      let nowM = this.data.miao - 1
      if (nowM>0) {
        this.daojsNum()
      }else{
        this.goIndex()
      }
      this.setData({
        miao: nowM
      })
    }, 1000);
  },
  newPhoneCode(){
    if (!this.data.newPhone) {
      app.warningMsg({ title: "请输入手机号" })
      return
    }
    var isPhone = app.testPhone(this.data.newPhone); //正则
    if (!isPhone) {
      app.warningMsg({ title: '手机号不正确' })
      return
    }
    app.xcxPost({
      url: '/manager/user/userNewPhoneSend.do',
      data: { phone_new: this.data.newPhone},
      success: res => {
        console.log('init-res', res)
        
      }
    })
  },
  //绑定input
  pin_name: function (e) {
    let pin_name = e.detail.value || '';
    this.setData({
      pin_name: pin_name
    })
  },
  phone: function (e) {
    let oldPhone = e.detail.value || '';
    this.setData({
      oldPhone: oldPhone
    })
  },
  newPhone: function (e) {
    let newPhone = e.detail.value || '';
    this.setData({
      newPhone: newPhone
    })
  },
  oldCode: function (e) {
    let oldCode = e.detail.value || '';
    this.setData({
      oldCode: oldCode
    })
  },
  newCode: function (e) {
    let newCode = e.detail.value || '';
    this.setData({
      newCode: newCode
    })
  },
  getCode(){
    app.xcxPost({
      url:'/manager/user/imageCode.do',
      data: {},
      success: res => {
        console.log('init-res', res)
        let _data = res.data
        this.setData({
          codeImg: _data
        })
      }
    })
  },
  //验证身份后的下一步
  nextGo(){
    if (!this.data.oldCode) {
      app.warningMsg({ title: "请输入验证码" })
      return
    }
    let formData = {
      code: this.data.oldCode,
      // phone_old: this.data.oldPhone,
    }

    app.xcxPost({
      url: '/manager/user/checkOldPhoneMsg.do',
      data: formData,
      success: res => {
        console.log('init-res', res)
        let _data = res.data
        this.setData({
          swich: 1,
          page: 3
        })
      }
    })
    
  },
  //重新登录-跳到登录
  goIndex: function () {
    wx.reLaunch({
      url: "/pages/index/index"
    });
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
    this.getCode()
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