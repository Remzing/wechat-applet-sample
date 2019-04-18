//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    video_url: "",//"http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400"
    domain: app.globalData.domain 
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
  // onShareAppMessage() {
  // },
  /**
   * 页面滚动时触发
   */
  onPageScroll() {
  },

  /*生命周期--end*/
  /*自定义方法--start */
  /* 初始化 */
  init() {
    console.log('-init')
    let { maintenance_id, expressuse_id ,page} = this.options
    if (maintenance_id) { // 是维保号操作 维保号视频初始化
      app.xcxPost({
        url: '/manager/rider/maintenanceUploadCarVideoInit.do',
        data: { 
          maintenance_id,
          type: (page == 3) ? 1 : 2 //1解锁前视频 2还车前视频
        },
        success: res => {
          console.log('uploadVideo-test-res', res, res.data.video_url)
          if (res.data && res.data.video_url) {
            this.setData({
              video_url: res.data.video_url || ''
            })
          }
          
        }
      })
    } else if (expressuse_id) {// 是快递号操作
      app.xcxPost({
        url: '/manager/rider/expressUploadCarVideoInit.do',
        data: { 
          expressuse_id,
          type: (page == 3) ? 1 : 2 //1解锁前视频 2还车前视频
        },
        success: res => {
          console.log('uploadVideo-test-res', res, res.data.video_url)
          if (res.data && res.data.video_url) {
            this.setData({
              video_url: res.data.video_url || ''
            })
          }
        }
      })
    }
  },
  upVid(){
    app.upVideo((res) => {
      console.log("res.tempFilePath", res.tempFilePath)
      app.xcxUploadFile({
        _url: '/file/kindeditorJson',
        _filePath: res.tempFilePath,
        _title: '上传中...',
        _success: (resp) => {
          console.log('uploadVideo-res', resp)
          this.setData({
            video_url:''
          })
          let video_url = resp.data.video_url
          if (!video_url) {
            app.showMsgModal({content:"视频地址出错，请重新上传"})
            return
          }
          this.setData({
            video_url
          })

        },
        _fail: (err) => { //fail

        }
      });
    })
  },
  conf() {
    console.log('-init')
    let { maintenance_id, expressuse_id , page} = this.options
    let { video_url } = this.data
    if (maintenance_id) { // 是维保号操作
      app.xcxPost({
        url: '/manager/rider/maintenanceUploadCarVideo.do',
        data: { 
          video_url: video_url,
          maintenance_id,
          type: (page == 3) ? 1 : 2 //1解锁前视频 2还车前视频
        },
        success: res => {
          console.log('uploadVideo-test-res', res)
          wx.navigateBack({ changed: true });//返回上一页
        }
      })
    } else if (expressuse_id) {// 是快递号操作
      app.xcxPost({
        url: '/manager/rider/expressUploadCarVideo.do',
        data: { 
          video_url: video_url,
          expressuse_id,
          type: (page == 3) ? 1 : 2 //1解锁前视频 2还车前视频
        },
        success: res => {
          console.log('uploadVideo-test-res', res)
          wx.navigateBack({ changed: true });//返回上一页
        }
      })
    }
  },
})