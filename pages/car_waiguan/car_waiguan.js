//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgList:[
      '/assets/imgs/ban_1.png',
      '/assets/imgs/ban_1.png',
      '/assets/imgs/ban_1.png',
    ],
    imgList_index:'',
    page:''
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
  
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
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
  init(options) {
    console.log('-init', options)
    let user_owner_id = this.options.user_owner_id || ""
    let order_id = this.options.order_id || ""
    let kinshipuse_id = this.options.kinshipuse_id || ""
    // maintenance_id存在时  代表是维保号用车
    let maintenance_id = this.options.maintenance_id || ''
    // expressuse_id存在时  代表是快递号用车
    let expressuse_id = this.options.expressuse_id || ''
    this.setData({
      page: options.page || ""
    })
    app.xcxPost({
      url: "/manager/rider/carUnderwayInfo.do",
      data: {
        order_id,
        user_owner_id,
        kinshipuse_id,
        maintenance_id,
        expressuse_id,
      },
      success: res => {
        let _data = res.data || []
        let { rent_time, rent_time_txt } = this.data
        
        _data.car_info.forEach((ele) => {
          ele.car_image = app.globalData.domain + ele.image
        })
        this.setData({
          imgList: _data.car_info
        })
      }
    })
  },
  changIndex: function (e) {
    this.setData({ imgList_index: e.detail.current })
  },
  longcatch: function (e) {
    wx.showModal({
      content: '是否保存图片到本地',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.downloadFile({
            url: e.target.dataset.url,
            success: function (res) {
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: function (res) {
                  wx.showToast({
                    title: '保存图片到本地',
                    icon: 'none'
                  })
                  console.log(res)
                },
              })
            },
            fail: function (err) {
              console.log(err)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  bufuhe(){
    console.log("bufuhe", this.options)
    wx.navigateTo({
      url: "/pages/car_addphoto/car_addphoto?page=2&user_owner_id=" + (this.options.user_owner_id||"")+ "&order_id=" + this.options.order_id||""
    })
  }
})