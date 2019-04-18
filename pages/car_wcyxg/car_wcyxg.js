//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    remark:'',
    name:'',
    noteMaxLen:20,//最大字数
    currentNoteLen:0,//当前字数
    limitNoteLen:0,//剩余字数
    page: ''
  },
  /*自定义方法--start */
  
  bindFormSubmit: function (e) {
    app.xcxPost({
      url: "/manager/owner/judgeWcy.do",
      data: {
        wcy_number: this.data.name,//e.detail.value ||

      },
      success: res => {
        
        app.xcxPost({
          url: '/manager/owner/bandingWcy.do',
          data: {
            id: this.options.id,
            wcy_number: this.data.name
          },
          success: res1 => {
            console.log('userInfoInit-res', res1)
            app.successMsg({ title: res1.errmsg + "" })
            setTimeout(()=>{
              wx.navigateBack({
                delta: 1
              })
            }, 2000)
            
          }
        })
      }
    })
    
    
  },
  // checkCarNum() {
  //   console.log("e", e, callBack)
  //   app.xcxPost({
  //     url: "/manager/owner/judgeWcy.do",
  //     data: {
  //       wcy_number: this.data.wcNum,//e.detail.value ||

  //     },
  //     success: res => {
  //       // app.successMsg({ title: res.errmsg + "" })
        
  //     }
  //   })
  // },
  jiechuHandle() {
    wx.showModal({
      title: '提示',
      content: '您确定要解除绑定？',
      success: (resp) => {
        if (resp.confirm) {
          console.log('用户点击确定')
          app.xcxPost({
            url: '/manager/owner/unBandingWcy.do',
            data: {
              id: this.options.id,
              wcy_number: this.data.name
            },
            success: res => {
              let _data = res.data
              app.successMsg({ title: res.errmsg })
              // this.fetchData()
              this.setData({ name: '', disWcy: false })
            }
          })
        } else if (resp.cancel) {
          console.log('用户点击取消')
        }
      },
      fail: () => {
        console.log('fail')
      }
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
    
    this.setData({ 
      name: this.options.wcy_number||"",
      disWcy: this.options.wcy_number || "",
    });
  },
  codeInput(e) {
    var that = this;
    that.setData({ name: e.detail.value });
  },
  areaInput(e) {
    console.log('areaInput',e)
    var that = this;
    that.setData({ remark: e.detail.value });
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    console.log('onLoad', options)
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