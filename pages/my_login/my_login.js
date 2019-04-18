//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page:1,
    Length: 6, //输入框个数
    isFocus: false, //聚焦
    Value: "", //输入的内容
    ispassword: false, //是否密文显示 true为密文， false为明文。
    nextBtnDisabled: true,
    nextBtnBc: "#494c5b", //按钮颜色
    loginPhone: "",
    codeNum: "",
    checkValue: [""],
    loginpsw: true, //睁眼闭眼 true为密文， false为明文。
    codeTxt: "获取验证码",
    currentTime: 60,   //点击之后进行倒计时
    codeBtnDis:true,
  },
  /*自定义方法--start */
  //解决弹出多次键盘
  Focus(e) {
    var that = this;
    console.log(e.detail.value);
    var inputValue = e.detail.value;
    that.setData({
      Value: inputValue
    });
  },
  Tap() {
    var that = this;
    that.setData({
      isFocus: true
    });
  },
  formSubmit(e) {
    console.log(e.detail.value.password);
  },
  
  phoneInput(e) {
    var that = this;
    that.setData({ loginPhone: e.detail.value });
  },
  codeInput(e) {
    var that = this;
    that.setData({ codeNum: e.detail.value });
  },

  //复选框
  checkboxChange: function(e) {
    console.log("checkbox发生change事件，携带value值为：",e, e.detail.value.length);
    let that = this;
    that.setData({
      checkValue: e.detail.value
    });
  },
  //睁眼闭眼
  biyanShow() {
    this.setData({
      loginpsw: !this.data.loginpsw
    });
  },
  //页面跳转
  toForget() {
    wx.navigateTo({
      url: "../my_zhaoHMM/my_zhaoHMM"
    });
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
    console.log("-init", options);
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    let that = this;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
  /**
   * 页面滚动时触发
   */
  onPageScroll() {},

  /*生命周期--end*/
  getShou(e){
    console.log('updateUserInfo', e)
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showModal({
        title: '设置授权',
        content: '您未授权个人信息，请点击【确定】设置授权',
        success: (resp) => {
          if (resp.confirm) {
            console.log('用户点击确定')
            //跳转设置页面授权             
            wx.openSetting({
              success: (succ) => { }
            })
          } else if (resp.cancel) {
            console.log('用户点击取消')
            wx.switchTab({ url: "/pages/index/index" })
          }
        },
        fail: () => {
          console.log('fail')
          wx.switchTab({ url: "/pages/index/index" })
        }
      })
    } else {
      wx.login({
        success: loginRes => {
          // 获取到请求码，继续请求用户的基本信息
          if (loginRes.code) {
            let code = loginRes.code;
            let formData = {
              code: code,
              encryptedData: e.detail.encryptedData,
              iv: e.detail.iv,
            };
            app.xcxPost({
              url: "/manager/user/wxGetPhone.do",
              data: formData,
              mask: true,
              success: res => {
                console.log('res', res)
                if (res.data && res.data.phone) {
                  this.setData({
                    loginPhone: res.data.phone
                  })
                }
                app.hideMask()
              }
            })
          } else {
            wx.showToast({
              title: "获取code失败！",
              icon: "loading",
              duration: 2000
            });
          }
        },
        fail: err => {
          wx.showToast({
            title: "err",
            icon: "loading",
            duration: 2000
          });
        }
      });
    }
  },
  goNext(e){
    let next = e.currentTarget.dataset.next
    
    if (next == 2 ) {
      this.getCode(next)
    }else{
      this.setData({
        page: next
      })
    }
  },
  getCode(next){
    var isPhone = app.testPhone(this.data.loginPhone); //正则
    console.log('e', isPhone)
    if (isPhone) {
      app.xcxPost({
        url: '/manager/user/sendCode.do',
        data: { phone: this.data.loginPhone },
        success: res => {
          app.warningMsg({ title: res.errmsg + '' })
          this.setData({
            page: next||2
          })
          this.getTime()
        }
      })
    } else {
      app.warningMsg({ title: '手机号不正确' })
    }
  },
  //倒计时计算
  getTime: function () {
    var that = this;
    that.setData({
      codeBtnDis: true
    })
    var currentTime = that.data.currentTime
    var interval = setInterval(function () {
      currentTime--;
      that.setData({
        codeTxt: currentTime + '秒后获取',
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          codeTxt: '获取验证码',
          currentTime: 60,
          codeBtnDis: false
        })
      }
    }, 1000)
  },
  goLogin(){
    if (!this.data.codeNum) {
      app.warningMsg({title:"请输入验证码"})
      return
    }
    if (!this.data.checkValue.length) {
      app.warningMsg({ title:"请阅读并同意协议"})
      return
    }
    app.xcxPost({
      url: '/manager/user/bandingPhone.do',
      data: { phone: this.data.loginPhone, code: this.data.codeNum},
      success: res => {
        app.successMsg({ title: res.errmsg + "" })
        setTimeout(() => {
          app.globalData.phone = this.data.loginPhone
          wx.reLaunch({
            url: "/pages/index/index"
          });
        }, 1000);
      }
    })
  },
  goWenben(e){
    let page = e.currentTarget.dataset.page||""
    wx.navigateTo({
      url: '/pages/my_GSJS/my_GSJS?page='+page,
    })
  }
});