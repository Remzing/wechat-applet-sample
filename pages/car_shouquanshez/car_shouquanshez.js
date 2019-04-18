//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userData: [],
    show: 1,
  },
  
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
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
    this.init(this.options)
    this.setData({
      show:1
    })
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
    this.setData({
      state: options.state||1
    })
    let _url = "/manager/owner/beGrantedKinship.do"// 已授权亲情号
    let navTitle = '亲情号授权设置'
    if (options.state == 2) {
      _url = "/manager/owner/beGrantedMaintenance.do"// 已授权维保号
      navTitle = '维保号授权设置'
    } else if (options.state == 3){
      _url = "/manager/owner/beGrantedExpress.do"// 已授权快递号
      navTitle = '快递号授权设置'
    }
    wx.setNavigationBarTitle({
      title: navTitle,//页面标题为路由参数
    })
    if (this.options && this.options.car_id) {
      app.xcxPost({
        url: _url,
        data: { car_id: this.options.car_id },
        success: res => {
          let _data = res.data || {}
          let { userData } = this.data
          userData = _data.user_list||[]
          userData.forEach(ele => {
            ele.user_photo = app.globalData.domain + ele.user_photo
          })
          this.setData({
            userData
          })
        }
      })
    }
  },
  phoneInput(e) {
    var that = this;
    that.setData({ phone: e.detail.value });
  },
  phoneSq(){
    this.setData({
      show: "2"
    })
  },
  back(){
    this.setData({
      show: "1"
    })
  },
  addPhone(){
    let { userData, phone } = this.data    
    if (!phone) {
      app.warningMsg({ title: "请输入手机号" })
      return
    }
    if (phone==app.globalData.phone) {
      app.warningMsg({ title: "手机号重复" })
      return
    }
    let temp = false
    userData.forEach((ele, k) => {
      if (phone==ele.phone){
        temp = true
      }
    })
    if (temp) {
      app.warningMsg({ title: "手机号重复" })
      return
    }
    app.xcxPost({
      url: "/manager/owner/findKinshipByPhone.do",
      data: {phone: this.data.phone},
      success: res => {
        let _data = res.data||{}
        let car_id = this.options.car_id || ""
        let user_ids = ""
        let { userData } = this.data
        userData.forEach((ele, k) => {
          user_ids += ele.id + ','
        })
        user_ids && (user_ids = user_ids.substring(0, user_ids.length - 1))
        wx.navigateTo({
          url: "/pages/car_querenshouq/car_querenshouq?user_photo=" + _data.user_photo + "&car_id=" + car_id + "&name=" + (_data.real_name || _data.phone) + "&user_ids=" + user_ids + "&id=" + _data.id + "&state=" + this.options.state
        })
      }
    })
  },
  deleteUser(e){
    let id = e.currentTarget.dataset.id || ""
    let user_ids = ""
    let { userData } = this.data
    userData.forEach((ele, k)=>{
      if (ele.id && ele.id != id) {
        user_ids += ele.id+','
      }
    })
    user_ids && (user_ids = user_ids.substring(0, user_ids.length - 1))
    let _url = "/manager/owner/updateKinship.do"// 已授权亲情号
    if (this.options.state == 2) {
      _url = "/manager/owner/updateMaintenance.do"// 已授权维保号
    } else if (this.options.state == 3) {
      _url = "/manager/owner/updateExpress.do"// 已授权快递号
    }
    app.xcxPost({
      url: _url,
      data: { 
        car_id: this.options.car_id,
        user_ids: user_ids
      },
      success: res => {
        this.init(this.options)
        
      }
    })
  }
})