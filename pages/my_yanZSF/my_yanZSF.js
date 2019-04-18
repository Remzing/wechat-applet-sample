//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    names:'',
    checkValue: [""],
    bank_user_name: '', bank_number: '', bank: '',
    // cardFlag:true,//第1-0步
    // cardFlagAg: false,//第1-1步
    // cardFlagTwo: false,//第2-0步
    // cardFlagAgTwo: false,//第2-1步
    // cardFlagThree: false,//第3-0步
    // cardFlagAgThree: false,//第3-1步
    swichOne:1,
    swichTwo:null,//第2步
    
    swichThree: null,//第三步
    sfzData:{},//身份证信息
    jszData:{},//驾驶证信息
    sfzImg:{},
    sfzScImg:{},
    jszImg:{}
  },
  /*自定义方法--start */
  
  nameInput(e) {
    let { sfzData } = this.data
    sfzData.name = e.detail.value
    this.setData({ sfzData })
  },
  idInput(e) {
    let { sfzData } = this.data
    sfzData.id = e.detail.value
    this.setData({ sfzData })
  },
  
  // jsz
  id_cardInput(e) {
    let { jszData } = this.data
    jszData.id_card = e.detail.value
    this.setData({ jszData })
  },
  jnameInput(e) {
    let { jszData } = this.data
    jszData.name = e.detail.value
    this.setData({ jszData })
  },
  
  motorcycleInput(e) {
    let { jszData } = this.data
    jszData.motorcycle_type = e.detail.value
    this.setData({ jszData })
  },
  first_licenceDateChange(e) {
    let { jszData } = this.data
    jszData.first_licence_time = e.detail.value
    this.setData({ jszData })
  },
  license_endDateChange(e) {
    let { jszData } = this.data
    jszData.license_end_time = e.detail.value
    this.setData({ jszData })
  },
  // 绑定信用卡
  //
  bank_user_nameInput(e) {
    this.setData({ bank_user_name: e.detail.value })
  },
  bank_numberInput(e) {
    this.setData({ bank_number: e.detail.value })
  },
  bankInput(e) {
    this.setData({ bank: e.detail.value })
  },
  cvn2Input(e) {
    this.setData({ cvn2: e.detail.value })
  },
  expiredInput(e) {
    this.setData({ expired: e.detail.value })
  },
  //复选框
  checkboxChange: function (e) {
    console.log("checkbox发生change事件，携带value值为：", e, e.detail.value.length);
    let that = this;
    that.setData({
      checkValue: e.detail.value
    });
  },
  goWenben(e) {
    let page = e.currentTarget.dataset.page || ""
    wx.navigateTo({
      url: '/pages/my_GSJS/my_GSJS?page=' + page,
    })
  },
  //上传身份证成功后，跳转到1-1步骤
  cardFlagShow(e){
    // state 1上传身份证，2上传手持身份证，3上传驾驶证
    let state = Number(e.currentTarget.dataset.state || "")
    /* // 下一步
    this.setData({
      page: (state+1)
    })
    return */
    let that = this
    app.upImages(1, [], (res) => {
      console.log("upImages-res", res)
      if (res.errMsg == "chooseImage:ok") {
        app.xcxUploadFile({
          _url: '/file/kindeditorJson',
          _filePath: res.tempFilePaths[0],
          _title: '图片上传中...',
          _success: (resp) => {
            console.log('tempObj-url', app.globalData.domain + resp.data.url)
            let tempObj = {
              url: app.globalData.domain + resp.data.url,
              medium_url: app.globalData.domain + resp.data.medium_url,
              min_url: app.globalData.domain + resp.data.min_url
            };
            if(state==1){
              //1上传身份证
              app.xcxPost({
                // 实名认证-身份证上传返回身份证信息
                url: '/manager/user/uploadingIdCard.do',
                data: {
                  identity_front_image: resp.data.url,
                  identity_front_medium_image: resp.data.medium_url,
                  identity_front_min_image: resp.data.min_url
                },
                success: res => {
                  console.log('res', res)
                  let _data = res
                  this.setData({
                    sfzData: _data
                  })
                  // 身份证图片显示
                  that.setData({
                    sfzImg: tempObj
                  })
                  // 下一步
                  that.setData({
                    page: 2
                  })
                  
                }
              })
              
            }
            else if(state==2){
              //2上传手持身份证
              app.xcxPost({
                // 实名认证-手持身份证上传
                url: '/manager/user/uploadingHandIdCard.do',
                data: {
                  identity_hand_image: resp.data.url,
                  identity_hand_medium_image: resp.data.medium_url,
                  identity_hand_min_image: resp.data.min_url
                },
                success: res => {
                  console.log('res', res)
                  // 手持身份证图片显示
                  that.setData({
                    sfzScImg: tempObj
                  })                  
                }
              })
              
            }
            else if(state==3){
              //3上传驾驶证
              app.xcxPost({
                // 实名认证-驾驶证上传
                url: '/manager/user/uploadingDriveCard.do',
                data: {
                  license_front_image: resp.data.url,
                  license_front_medium_image: resp.data.medium_url,
                  license_front_min_image: resp.data.min_url
                },
                success: res => {
                  console.log('res', res)
                  let jszData = {}
                  let _data = res.items
                  _data.forEach(ele => {
                    if(ele.item =="证号") {
                      jszData.id_card = ele.itemstring
                    }
                    if (ele.item =="姓名") {
                      jszData.name = ele.itemstring
                    }
                    if (ele.item =="领证日期") {
                      jszData.first_licence_time = ele.itemstring
                    }
                    if (ele.item =="准驾车型") {
                      jszData.motorcycle_type = ele.itemstring
                    }
                    if (ele.item =="起始日期") {
                      jszData.license_start_time = ele.itemstring
                    }
                    if (ele.item =="有效日期") {
                      jszData.license_end_time = ele.itemstring
                    }
                  });

                  this.setData({
                    jszData
                  })
                  // 驾驶证图片显示
                  this.setData({
                    jszImg: tempObj,
                    page:4
                  })
                  
                }
              })
              that.setData({
                cardFlagAgTwo:true,
                cardFlagTwo:false,
              })
            }
            
          },
          _fail: (err) => { //fail

          }
        });
        
      }
    })
    
  },
  queRenSfz(){
    // 实名认证-身份证真实性核实
    app.xcxPost({
      // 实名认证-身份证真实性核实
      url: '/manager/user/idCardProve.do',
      data: {
        name: this.data.sfzData.name || "",
        id: this.data.sfzData.id || "",
      },
      success: res1 => {
        console.log('res1', res1)
        if (res1.errcode == 0) {
          app.showMsgModal({ content: res1.errmsg + "" })
          return
        }
        this.setData({
          swichTwo: 2,
          page: 3
        })
      }
    })
  },
  queRenJsz() {
    // 实名认证-驾驶证真实性核实
    app.xcxPost({
      // 实名认证-驾驶证真实性核实
      url: '/manager/user/driveCardProve.do',
      data: this.data.jszData||{},
      success: res1 => {
        console.log('res', res1)
        if (res1.errcode == 0) {
          app.showMsgModal({ content: res1.errmsg + "" })
          return
        }
        this.setData({
          swichThree: 3,
          page: 5
        })
      }
    })
  },
  callPhone(e) {
    // let phone = e.currentTarget.dataset.phone||""
    wx.makePhoneCall({
      phoneNumber: '23201830',
    })
  },
  fanhui(e){
    this.setData({
      swichTwo: 1,
      page: 2
    })
  },
  //回到1-0步骤重新上传
  changeStepOne() {
    let that = this
    that.setData({
      swichOne: 1,
      cardFlag: true,//第1-0步
      cardFlagAg: false,//第1-1步
      swichTwo: null,//第二步
      swichThree: null,//第三步
    })
  },
  //上传驾驶证成功后，跳转到2-1步骤 state=3
  cardFlagShowTwo(){
    let that = this
    that.setData({
      cardFlagAgTwo:true,
      cardFlagTwo:false,
    })
  },
  //回到2-0步骤重新上传
  //步骤条按钮,第2-0步 state=2
  changeStepTwo(){
    let that = this
    that.setData({
      swichTwo: 2,
      page:3
    })
  },
  //步骤条按钮,第3-0步
  changeStepThree() {
    let that = this
    // that.setData({
    //   swichThree: 3,
    //   page:5
    // })
    that.setData({
      swichThree: 3,
      page: 6
    })
  },
  //步骤条按钮,第3-1步，绑定信用卡
  cardFlagShowThree(){
    let { bank_user_name, bank_number, bank, checkValue, cvn2, expired} = this.data
    if (!bank_user_name) {
      app.warningMsg({ title: "请输入姓名" })
      return
    }
    if (!bank_number) {
      app.warningMsg({ title: "请输入信用卡号" })
      return
    }
    if (!bank) {
      app.warningMsg({ title: "请输入银行名称" })
      return
    }
    if (!cvn2) {
      app.warningMsg({ title: "请输入卡背面的cvn2三位数字" })
      return
    }
    if (!expired) {
      app.warningMsg({ title: "请输入有效期 年在前月在后（例如2311）" })
      return
    }

    if (!checkValue.length) {
      app.warningMsg({ title: "请阅读并同意协议" })
      return
    }
    let formData={
      bank_user_name,
      bank_number,
      bank,
      cvn2,
      expired
    }
    app.xcxPost({
      url: '/manager/user/bindingCreditCard.do',
      data: formData,
      success: res => {
        this.setData({
          page: 6
        })
      }
    })
    
  },
  //全部、两个复选框，需另写
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    let that = this
    that.setData({
      checkValue: e.detail.value
    })
  },
  goIndex(){
    wx.reLaunch({
      url: "/pages/index/index"
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
    console.log('app.globalData.domain', app.globalData.domain)
    console.log('-init', options)
    // app.showMsgModal({ content:  "12313" })
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    let that = this
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