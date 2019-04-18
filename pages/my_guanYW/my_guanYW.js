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
  //我的介绍-字数限制
  bindCursor(e){
    let name = e.detail.value || '';
    let len = parseInt(name.length);
    if (len > this.data.noteMaxLen) {
      return;
    }
    this.setData({
      remark: name,
      currentNoteLen: len,
      limitNoteLen: this.data.noteMaxLen - len
    })
    console.log('长度', this.data.currentNoteLen)
  },
  bindFormSubmit: function (e) {
    console.log('文本值',e.detail.value.textarea, this.data.page)
    let url
    let formData = {}

    if (this.data.page == 1) {
      // 关于我
      url = '/manager/user/userInfoIntroduce.do'
      formData.introduce = this.data.remark
    }
    else if (this.data.page == 2) {
      // -昵称设置
      url = '/manager/user/userInfoNickName.do'
      formData.nick_name = this.data.name
    }
    app.xcxPost({
      url: url,
      data: formData,
      success: res => {
        console.log('userInfoInit-res', res)
        wx.navigateBack({
          delta: 1
        })
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
      page: options.page
    })
    let navTitle
    if (options.page == 1) {
      // 关于我
      navTitle = '关于我'
    }
    else if (options.page == 2) {
      // -昵称设置
      navTitle = '昵称设置'
    }
    
    wx.setNavigationBarTitle({
      title: navTitle,//页面标题为路由参数
    })
    app.xcxPost({
      url: '/manager/user/userInfoInit.do',
      data: {},
      success: res => {
        console.log('userInfoInit-res', options,res)
        
        if (options.page == 1) {
          // 关于我
          this.setData({
            remark: res.data.introduce || "",
          })
        }
        else if (options.page == 2) {
          // -昵称设置
          this.setData({
            name: res.data.nick_name || "",
          })
        }
      }
    })
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