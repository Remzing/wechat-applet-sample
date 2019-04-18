//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userData:{},
    sexArray: [
      { id: 1, name: '男', value: 1 },
      { id: 2, name: '女', value: 2 },
    ],
    sexIndex:-1,
    date: '',
  },
  sexChange(e) {
    console.log('prodChange', e)
    var index = e.detail.value;
    var currentId = this.data.sexArray[index].id; // 这个id就是选中项的id
    app.xcxPost({
      url: '/manager/user/userInfoSex.do',
      data: { sex: currentId},
      success: res => {
        console.log('res', res)
        this.setData({
          sexIndex: e.detail.value
        })
      }
    })
    
    console.log('currentId', currentId)
  },
  bindDateChange: function (e) {
    console.log('picker', e.detail.value)
    app.xcxPost({
      url: '/manager/user/userInfoBirthday.do',
      data: { birthday: e.detail.value },
      success: res => {
        console.log('res', res)
        this.setData({
          date: e.detail.value
        })
      }
    })
  },
  /*自定义方法--start */
  //页面跳转
  toguanYW(e) {
    wx.navigateTo({
      url: '../my_guanYW/my_guanYW?page='+e.currentTarget.dataset.page
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
      url: '/manager/user/userInfoInit.do',
      data: {},
      success: res => {
        console.log('userInfoInit-res', res)
        if (res.data.user_photo){
          res.data.url = app.globalData.domain +res.data.user_photo
        }
        this.setData({
          userData: res.data || {},
        })
        if (res.data.sex) {
          this.setData({
            sexIndex: (res.data.sex - 1)
          })
        }
        if (res.data.birthday) {
          this.setData({
            date: res.data.birthday
          })
        }
      }
    })
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
  
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
    this.init()
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
  upImage(e) {
    // state 1车身图，2主图
    let state = Number(e.currentTarget.dataset.state || "")
    let { list, mainList } = this.data
    app.upImages(9, [], (res) => {
      console.log("upImages-res", res)
      if (res.errMsg == "chooseImage:ok") {
        app.xcxUploadFile({
          _url: '/file/kindeditorJson',
          _filePath: res.tempFilePaths[0],
          _title: '图片上传中...',
          _success: (resp) => {
            let tempObj = {
              url: app.globalData.domain + resp.data.url,
              image: resp.data.url,
              medium_image: resp.data.medium_url,
              min_image: resp.data.min_url
            };
            app.xcxPost({
              url: '/manager/user/uploadUserPhoto.do',
              data: { user_photo: tempObj.image},
              success: res => {
                console.log('uploadUserPhoto-res', res)
                let { userData } = this.data
                userData.url = tempObj.url
                userData.user_photo = tempObj.image
                this.setData({
                  userData
                })
              }
            })
            
            

          },
          _fail: (err) => { //fail

          }
        });

      }
    })

  },
  preImg(e){
    let url = e.currentTarget.dataset.url||""
    if (url){
      wx.previewImage({
        current: url, // 当前显示图片的http链接
        urls: [url] // 需要预览的图片http链接列表
      })
    }
    
  }
})