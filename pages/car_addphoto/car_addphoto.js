//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page:1,//1车辆图片，2车辆图片核对
    list:[],
    mainList: [],
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
  init(options) {
    console.log('-init', options)
    this.setData({
      page: this.options.page||1
    })
    if (this.options.page==2){
      
      app.xcxPost({
        url: "/manager/rider/pickCarImagesInit.do",
        data: { order_id: this.options.order_id, },
        success: res => {
          let _data = res.data || []
          let { list } = this.data
          list = _data || []
          list.forEach(ele => {
            ele.url = app.globalData.domain + ele.pick_image
          })
          this.setData({
            list
          })
        }
      })
    }else{
      if (this.options && this.options.car_id) {
        app.xcxPost({
          url: "/manager/owner/uploadCarImagesInit.do",
          data: { car_id: this.options.car_id },
          success: res => {
            let _data = res.data || {}
            let { list, mainList } = this.data
            list = _data.carImageList || []
            mainList = _data.carImageList_main || []
            list.forEach(ele => {
              ele.url = app.globalData.domain + ele.image
            })
            mainList.forEach(ele => {
              ele.url = app.globalData.domain + ele.image
            })
            this.setData({
              list,
              mainList
            })
          }
        })
      }
    }
    
  },
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
  upImage(e) {
    // state 1车身图，2主图
    let state = Number(e.currentTarget.dataset.state || "")
    let { list, mainList } = this.data
    if (state == 2 && mainList.length && this.options.state != 1 && this.options.state != 6) {
      //2主图 有图并且审核通过之后不能修改  只有待完善和审核未通过可修改
      return
    }
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
            if (state == 1) {
              //1车身图
              list.push(tempObj)
              this.setData({
                list
              })
            }
            else if (state == 2) {
              //2主图
              mainList = []
              mainList.push(tempObj)
              this.setData({
                mainList
              })
            }
            
          },
          _fail: (err) => { //fail

          }
        });

      }
    })

  },
  conf() {
    let { list, mainList } = this.data
    if (!list.length) {
      app.warningMsg({ title: "请上传展示图片" })
      return
    }
    if (this.options.page!=2 && !mainList.length) {
      app.warningMsg({ title: "请上传主图" })
      return
    }
    if (this.options.page == 2) {// 车友上传取车核对照片
      let formData = {
        order_id: this.options.order_id,
        images: JSON.stringify(list),
      }
      app.xcxPost({
        url: "/manager/rider/uploadPickCarImages.do",
        data: formData,
        success: res => {
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000);
        }
      })
    }else{
      let formData = {
        car_id: this.options.car_id,
        images: JSON.stringify(list),
        images_main: JSON.stringify(mainList),
      }
      app.xcxPost({
        url: "/manager/owner/uploadCarImages.do",
        data: formData,
        success: res => {
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            // wx.navigateBack({ changed: true });//返回上一页
            let car_id = this.options.car_id || ""
            // wx.redirectTo({
            //   url: "/pages/car_detail/car_detail?id=" + car_id
            // })
            wx.navigateBack({
              delta: 1
            })
          }, 1000);
        }
      })
    }
    
    
  },
  goBack(){
    wx.navigateBack({
      delta: 1
    })
  },
  detImg(e){
    let id = e.currentTarget.dataset.id || ""
    let index = String(e.currentTarget.dataset.inx) || ""
    console.log("detImg",e, index, id)
    let { list } = this.data
    console.log("detImg-list", list.splice(index, 1))
    this.setData({
      list
    })
  }
})