//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    stateData:{}
  },
  /*自定义方法--start */
  //页面跳转
  togeRXX() {
    wx.navigateTo({
      url: '../my_geRXX/my_geRXX'
    })
  },
  toyanZSF() {
    let { stateData} = this.data
    if (stateData.is_approve==1){
      wx.showModal({
        title: '提示',
        content: '您已完成认证，确定要重新认证？',
        success: (resp) => {
          if (resp.confirm) {
            console.log('用户点击确定')
            //重新认证
            wx.navigateTo({
              url: '../my_yanZSF/my_yanZSF'
            })
          } else if (resp.cancel) {
            console.log('用户点击取消')
          }
        },
        fail: () => {
          console.log('fail')
        }
      })
    }else{
      app.xcxPost({
        // 是否实名认证 获取最新信息
        url: "/manager/user/getIsApprove.do",
        data: {
        },
        success: res => {
          let _data = res.data || {}
          app.globalData.is_approve = _data.is_approve || ""

          if (_data.is_approve==2){
            wx.showModal({
              title: '提示',
              content: '信息已在审核中，确定要重新填写信息重新审核？',
              success: (resp) => {
                if (resp.confirm) {
                  console.log('用户点击确定')
                  //重新认证
                  wx.navigateTo({
                    url: '../my_yanZSF/my_yanZSF'
                  })
                } else if (resp.cancel) {
                  console.log('用户点击取消')
                }
              },
              fail: () => {
                console.log('fail')
              }
            })
          } else if (_data.is_approve == 0){
            wx.navigateTo({
              url: '../my_yanZSF/my_yanZSF'
            })
          }
        }
      })
      
    }
    
  },
  tozhangHAQ() {
    wx.navigateTo({
      url: '../my_zhangHAQ/my_zhangHAQ'
    })
  },
  toGYWM() {
    wx.navigateTo({
      url: '../my_GYWM/my_GYWM'
    })
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
    console.log('-init', options)
    app.xcxPost({
      url: '/manager/user/settingInit.do',
      data: {},
      success: res => {
        console.log('res', res)
        this.setData({
          stateData: res.data
        })
        res.data.is_approve && (app.globalData.is_approve = res.data.is_approve || "0")
      }
    })
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
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