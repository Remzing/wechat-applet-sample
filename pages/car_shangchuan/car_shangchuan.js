//获取应用实例
let app = getApp()
let optionTemp
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusType: [
      { name: "行驶证", page: 0 },
      { name: "交强险", page: 1 },
    ],
    currentType: 0,
    strongFlag: '1',
    carFrontImg: {},
    carEndImg: {},
    carQiangImg: {},
  },
  
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
    this.init(options)
    optionTemp = options
    var systemInfo = wx.getSystemInfoSync()
    this.setData({
      windowHeight: systemInfo.windowHeight,
      currentType: options.id || 0
    })
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
  /*自定义方法--start */     
  /* 初始化 */
  init(options) {
    
    console.log('-init', options)
    if (this.options && this.options.drive_id) {
      app.xcxPost({
        url: "/manager/owner/uploadingCertificateInit.do",
        data: { id: this.options.drive_id||"" },
        success: res => {
          let _data = res.data
          _data.car_id && (this.options.car_id = _data.car_id)
          if (!_data){
            return
          }
          let carFrontImg = {
            url: app.globalData.domain + _data.drive_image,
            drive_image: _data.drive_image,
            drive_medium_image: _data.drive_medium_image,
            drive_min_image: _data.drive_min_image,
          }
          let carEndImg = {
            url: app.globalData.domain + _data.drive_back_image,
            drive_back_image: _data.drive_back_image,
            drive_back_medium_image: _data.drive_back_medium_image,
            drive_back_min_image: _data.drive_back_min_image,
          }
          let carQiangImg = {
            url: app.globalData.domain + _data.insurance_image,
            insurance_image: _data.drive_back_image,
            insurance_medium_image: _data.insurance_medium_image,
            insurance_min_image: _data.insurance_min_image,
          }
          this.setData({
            carFrontImg,
            carEndImg,
            carQiangImg,
          })
        }
      })
    }
  },
  // 点击tab切换 
  swichNav(res) {
    if (this.data.currentType == res.detail.currentNum) return;
    // optionTemp.id = res.detail.currentNum
    this.setData({
      currentType: res.detail.currentNum
    })
  },
  swichNav1() {
    if (!this.data.carFrontImg.url) {
      app.warningMsg({ title: "请传行驶证正面" })
      return
    }
    if (!this.data.carEndImg.url) {
      app.warningMsg({ title: "请传行驶证反面" })
      return
    }
    this.setData({
      currentType: 1
    })
  },
  backBtn(){
    wx.redirectTo({
      url: "/pages/car_detail/car_detail?id="+this.options.car_id
    })
  },
  bindChange(e) {
    this.setData({
      currentType: e.detail.current
    })
    // if (!this.data.list[e.detail.current].length) {

    // }
    // this.getList(e.detail.current);
  },
  upStrongImg(){
    if (!this.data.carFrontImg.url) {
      app.warningMsg({ title: "请传行驶证正面" })
      return
    }
    if (!this.data.carEndImg.url) {
      app.warningMsg({ title: "请传行驶证反面" })
      return
    }
    if (!this.data.carQiangImg.url) {
      app.warningMsg({ title: "请上传交强险" })
      return
    }
    this.setData({
      strongFlag: '2'
    })
    let carFrontImg = this.data.carFrontImg
    let carEndImg = this.data.carEndImg
    let carQiangImg = this.data.carQiangImg
    let formData = {
      insurance_image: carQiangImg.insurance_image,
      insurance_medium_image: carQiangImg.insurance_medium_image,
      insurance_min_image: carQiangImg.insurance_min_image,
      drive_image: carFrontImg.drive_image,
      drive_medium_image: carFrontImg.drive_medium_image,
      drive_min_image: carFrontImg.drive_min_image,
      drive_back_image: carEndImg.drive_back_image,
      drive_back_medium_image: carEndImg.drive_back_medium_image,
      drive_back_min_image: carEndImg.drive_back_min_image,
    }
    if (this.options && this.options.id) {
      formData.id = this.options.id
    }
    if (this.options && this.options.car_id) {
      formData.car_id = this.options.car_id
    }
    app.xcxPost({
      url: "/manager/owner/uploadingCertificate.do",
      data: formData,
      success: res => {
        app.successMsg({ title: res.errmsg || "" + "" })
        setTimeout(() => {
          wx.redirectTo({
            url: "/pages/index/index?car_id="
          })
        }, 1000);
      }
    })
    
  },
  upImage(e){
    // state 1行驶证正面，2反面，3交强险
    let state = Number(e.currentTarget.dataset.state || "")
    app.upImages(1, [], (res) => {
      console.log("upImages-res", res)
      if (res.errMsg == "chooseImage:ok") {
        app.xcxUploadFile({
          _url: '/file/kindeditorJson',
          _filePath: res.tempFilePaths[0],
          _title: '图片上传中...',
          _success: (resp) => {
            
            if (state == 1) {
              //1行驶证正面
              let tempObj = {
                url: app.globalData.domain + resp.data.url,
                drive_image: resp.data.url,
                drive_medium_image: resp.data.medium_url,
                drive_min_image: resp.data.min_url
              };
              this.setData({
                carFrontImg: tempObj
              })
            }
            else if (state == 2) {
              //2行驶证反面
              let tempObj = {
                url: app.globalData.domain + resp.data.url,
                drive_back_image: resp.data.url,
                drive_back_medium_image: resp.data.medium_url,
                drive_back_min_image: resp.data.min_url
              };
              this.setData({
                carEndImg: tempObj
              })
            }
            else if (state == 3) {
              //3交强险
              let tempObj = {
                url: app.globalData.domain + resp.data.url,
                insurance_image: resp.data.url,
                insurance_medium_image: resp.data.medium_url,
                insurance_min_image: resp.data.min_url
              };
              this.setData({
                carQiangImg: tempObj
              })
            }
            

          },
          _fail: (err) => { //fail

          }
        });

      }
    })

  }
  
})