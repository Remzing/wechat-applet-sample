//获取应用实例
let app = getApp()
let maxAge = 50
let maxCarAge = 40
Page({
  /**
   * 页面的初始数据
   */
  data: {
    sexArray: [
      { id: 3, name: '不限', value: 3 },
      { id: 1, name: '男', value: 1 },
      { id: 2, name: '女', value: 2 },
    ],
    sexIndex: "",
    ageArr:[],
    ageEndArr:[],
    carAgeArr: [],
    carAgeEndArr: [],
    ageInx: "",
    ageEndInx: "",
    carAgeInx: "",
    carAgeEndInx: "",
    sexId: "",
    infoData:{}
  },
  
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
    this.init(options)
    let ageArr = []
    let carAgeEndArr = []
    let carAgeArr = []
    let ageEndArr = []
    for (let i = 0; i < maxCarAge; i++) {
      const element = i + '';
      carAgeArr.push(element)
      carAgeEndArr.push(element)
    }
    for (let i = 18; i < maxAge; i++) {
      const element = i+'';
      ageArr.push(element)
      ageEndArr.push(element)
    }
    this.setData({
      ageArr,
      ageEndArr,
      carAgeArr,
      carAgeEndArr,
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
    if (this.options && this.options.ccd_id) {
      app.xcxPost({
        url: "/manager/owner/carConditionInit.do",
        data: { ccd_id: this.options.ccd_id },
        success: res => {
          let _data = res.data || {}
          this.setData({
            infoData: _data
          })
        }
      })

    }
  },
  sexChange(e) {
    console.log('prodChange', e)
    var index = e.detail.value;
    var currentId = this.data.sexArray[index].id; // 这个id就是选中项的id
    this.setData({
      sexIndex: e.detail.value,
      sexId: currentId,
    })
  },
  carAgeStart(e) {
    console.log('prodChange', e)
    var index = e.detail.value;
    this.setData({
      carAgeInx: e.detail.value
    })
  },
  carAgeEnd(e) {
    console.log('prodChange', e)
    var index = e.detail.value;
    this.setData({
      carAgeEndInx: e.detail.value
    })
  },
  ageStart(e) {
    console.log('prodChange', e)
    var index = e.detail.value;
    this.setData({
      ageInx: e.detail.value
    })
  },
  ageEnd(e) {
    console.log('prodChange', e)
    var index = e.detail.value;
    this.setData({
      ageEndInx: e.detail.value
    })
  },
  conf() {
    let { ageInx, ageEndInx, carAgeInx, carAgeEndInx,
      ageArr, ageEndArr, carAgeArr, carAgeEndArr, sexId, infoData
    } = this.data
    
    if (carAgeInx && carAgeEndInx && (carAgeArr[carAgeInx] > carAgeEndArr[carAgeEndInx])) {
      app.showMsgModal({ title: "选择的驾龄范围开始年限大于结束年限" })
      return
    }
    if (ageInx && ageEndInx && (ageArr[ageInx] > ageEndArr[ageEndInx])) {
      app.showMsgModal({ content: "选择的年龄范围开始年龄大于结束年龄" })
      return
    }
    let formData = {}
    infoData.id && (formData.id = infoData.id)
    sexId && (formData.sec = sexId)
    carAgeArr[carAgeInx] && (formData.drive_age_start = carAgeArr[carAgeInx])
    carAgeEndArr[carAgeEndInx] && (formData.drive_age_end = carAgeEndArr[carAgeEndInx])
    ageArr[ageInx] && (formData.age_start = ageArr[ageInx])
    ageEndArr[ageEndInx] && (formData.age_end = ageEndArr[ageEndInx])

    if (this.options && this.options.car_id) {
      formData.car_id = this.options.car_id
    }
    app.xcxPost({
      url: "/manager/owner/carCondition.do",
      data: formData,
      success: res => {
        app.successMsg({ title: res.errmsg + "" })
        setTimeout(() => {
          let car_id = this.options.car_id || ""
          wx.redirectTo({
            url: "/pages/car_detail/car_detail?id=" + car_id
          })
        }, 1000);
      }
    })
  }
})