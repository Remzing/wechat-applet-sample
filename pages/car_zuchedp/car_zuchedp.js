//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    starNum: '',
    content: "",
    noteMaxLen: 50,
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
    app.xcxPost({
      //共享车点评初始化
      url: "/manager/rider/rentCommentsInit.do",
      data: {
        car_id: this.options.car_id,
        order_id: this.options.order_id,
      },
      success: res => {
        let _data = res.data || {}
        if (_data.car_info && _data.car_info.car_image){
          _data.car_info.car_image = app.globalData.domain + _data.car_info.car_image          
        }
        if (_data.car_info && _data.car_info.real_name) {
          let real_name = _data.car_info.real_name
          let sex = _data.car_info.sex
          _data.car_info.real_name_txt = real_name.split('')[0]
          _data.car_info.real_name_txt += (sex == 2) ? '女士' : '先生'
        }
        this.setData({
          car_info: _data.car_info,
          starNum: _data.grade < 1 ? 5 : _data.grade,
          order_number: _data.order_number||'',
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
    this.init()
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
  selStar(e){
    console.log('e', e)
    this.setData({
      starNum: e.target.dataset.num,
    })
  },
  textA(e){
    console.log('e', e)
    this.setData({
      content: e.detail.value,
    })
  },
  conf(){
    // if (!this.data.content) {
    //   app.warningMsg({ title: "请输入点评" })
    //   return
    // }
    app.xcxPost({
      //共享车点评初始化
      url: "/manager/rider/rentComments.do",
      data: {
        car_id: this.options.car_id,
        order_id: this.options.order_id,
        grade: this.data.starNum <1 ? '5' : this.data.starNum,
        order_number: this.data.order_number,
        content: this.data.content||'',
      },
      success: res => {
        app.successMsg({ title: res.errmsg + "" })
        setTimeout(() => {
          let car_id = this.options.car_id || ""
          if (this.options.goback==1) {
            wx.navigateBack({
              delta: 1
            })
          }else{
            wx.reLaunch({
              url: "/pages/index/index"
            });
          }
          
        }, 1000);
      }
    })
  },
  callPhone(e) {
    let phone = e.currentTarget.dataset.phone || ""
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  }
})