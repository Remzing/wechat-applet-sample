//获取应用实例
let app = getApp()
var amapFile = require('../../libs/amap-wx.js');
var myAmapFun = new amapFile.AMapWX({ key: '14db0799d724b1866aa65ebbea42d8e5' });
let optionTemp;
//引入图片预加载组件
var ImgLoader = require('../../components/img-loader/img-loader.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentType: 0,
    banners: [{}],
    page:1,
    carLocal:{},
    ownerInfo:{},
    calcFeeData:{
      startlat:'',
      startlon:'',
      startName:'',
      endlat:'',
      endlon:'',
      endName:'',
    },
    calcResult:{}
  },
  
  onLoad(options) {
    //初始化图片预加载组件，并指定统一的加载完成回调
    this.imgLoader = new ImgLoader(this)
    this.options = options
    
    this.init(this.options)

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
    if (this.options && this.options.car_id) {
      this.fetchData()
      // app.xcxPost({
      //   url: "/manager/owner/userEvaluateList.do",
      //   data: {
      //     car_id: this.options.car_id
      //   },
      //   success: res => {
      //     let _data = res.list || []
      //     _data.forEach(ele => {
      //       ele.user_photo = app.globalData.domain + ele.user_photo
      //     })
      //     this.setData({
      //       pingData: _data
      //     })
      //   }
      // })
      this.fetchLat()
    }
  },
  // 点击tab切换 
  swichNav (res) {
    console.log('swichNav', res)
    if (this.data.currentType == res.detail.currentNum) return;
    optionTemp.id = res.detail.currentNum
    this.setData({
      currentType: res.detail.currentNum
    })
  }, 
  bindChange (e) {
    console.log('bindChange', e)
    this.setData({
      currentType: e.detail.current
    })
    if (!this.data.list[e.detail.current].length){

    }
      // this.getList(e.detail.current);
  },
  goIndex: function () {
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },
  fetchData() {
    let car_id = this.options.car_id
    let user_owner_id = this.options.userid
    app.xcxPost({
      url: "/manager/rider/carInfo.do",
      data: {
        car_id,
        user_owner_id,
      },
      success: res => {
        let _data = res.data || {}
        _data.carImageList.forEach(ele => {
          ele.url = app.globalData.domain + ele.image
          ele.miniUrl = app.globalData.domain + (ele.min_image || "")
          ele.loaded = false
        })
        let { ownerInfo} = this.data
        ownerInfo.num = _data.num
        _data.owner_photo&&(ownerInfo.owner_photo = app.globalData.domain + _data.owner_photo)

        if (_data.owner_name){
          ownerInfo.owner_name_txt = _data.owner_name.split('')[0]
          ownerInfo.owner_name_txt += (_data.owner_sex == 2) ? '女士' : '先生'
        }
        

        this.setData({
          banners: _data.carImageList,
          car_init: _data.car_init,
          pingData: _data.orderEvaluateList,
          ownerInfo
        })
        if (_data.car_init && _data.car_init.get_model) {
          this.setData({
            takeIndex: (_data.car_init.get_model - 1)
          })
        }
        //同时发起全部图片的加载
        console.log('图片的加载', _data.carImageList)
        _data.carImageList.forEach(ele => {
          this.imgLoader.load(ele.url, (err, data) => {
            console.log('getBanners加载完成', err, data.src)
            if (!err) {
              ele.loaded = true
              this.setData({ banners: _data.carImageList, })
            }
          })
        })
      }
    })
  },
  // 获取经纬度
  fetchLat() {
    let that = this
    app.xcxPost({
      url: "/manager/rider/getNewLonAndLat.do",
      data: {
        car_id: this.options.car_id,
      },
      success: res => {
        let _data = res.data || []
        let localtxt = _data.lon + "," + _data.lat
        myAmapFun.getRegeo({
          // location: "longitude,latitude",
          location: localtxt || "",
          success: function (resp) {
            let { carLocal, calcFeeData} = that.data
            let _resp = resp[0]
            carLocal.lon = _data.lon
            carLocal.lat = _data.lat
            carLocal.name = _resp.name
            calcFeeData.startlat = _data.lat
            calcFeeData.startlon = _data.lon
            calcFeeData.startName = _resp.name+"(车辆位置)"
            if (_resp.latitude) {
              let tempDis = app.distance(_resp.latitude, _resp.longitude, _data.lat, _data.lon)
              if (tempDis < 1) {
                carLocal.distance = parseInt(tempDis * 1000) + '米'
              } else {
                carLocal.distance = parseInt(tempDis) + '公里'
              }
            } else {
              carLocal.distance = '获取距离失败'
            }
            //成功回调
            that.setData({
              carLocal,
              calcFeeData
            })

          },
          fail: function (info) {
            //失败回调
            console.log(info)
          }
        })
      }
    })
  },
  querenUse(e) {
    if (app.globalData.is_approve != 1) {
      app.xcxPost({
        url: "/manager/user/getIsApprove.do",
        data: {
        },
        success: res => {
          let _data = res.data || {}
          app.globalData.is_approve = _data.is_approve || ""
          if (_data.is_approve == 2) {
            app.showMsgModal({
              content: '实名认证审核中，请耐心等待审核结果'
            })
            return
          }
          this.querenUseState(e)
        }
      })
    } else {
      this.querenUseState(e)
    }
  },
  querenUseState(e) {
    let qingq = e.currentTarget.dataset.qingq || ""// 亲情号不需要实名认证
    if (!app.globalData.phone) {
      wx.navigateTo({
        // url: '/pages/car_map_order/car_map_order?page=3',
        url: "/pages/my_login/my_login?page=3"
      });
      return
    }
    if (!qingq && app.globalData.is_approve != 1) {
      // 不是亲情号，需要实名认证
      wx.showModal({
        title: '提示',
        content: '请先完成实名认证',
        success: (resp) => {
          if (resp.confirm) {
            console.log('用户点击确定')
            //跳转设置页面授权             
            wx.navigateTo({
              url: "/pages/my_yanZSF/my_yanZSF"
            });
          } else if (resp.cancel) {

          }
        },
        fail: () => {
          console.log('fail')
        }
      })

    } else if (app.globalData.phone) {
      let car_id = e.currentTarget.dataset.carid || this.options.car_id
      let user_owner_id = e.currentTarget.dataset.userid || this.options.userid
      app.xcxPost({
        url: "/manager/rider/confirmUseCar.do",
        data: {
          car_id,
          user_owner_id,
        },
        success: res => {
          let _data = res.data || []
          if (_data.order_id) {
            // 普通车辆确认用车成功
            wx.redirectTo({
              url: "/pages/car_map_order/car_map_order?page=3&order_id=" + _data.order_id + "&user_owner_id=" + user_owner_id
            })
          } else if (_data.kinshipuse_id) {
            // 亲情号车辆确认用车成功
            wx.redirectTo({
              url: "/pages/car_map_order/car_map_order?page=3&kinshipuse_id=" + _data.kinshipuse_id + "&user_owner_id=" + user_owner_id
            })
          }

        }
      })

    }
  },
  goSearchLocal(e){
    let state = e.currentTarget.dataset.state||""
    if (state==1){// 出发位置就是车辆位置 不用修改
      return
    }
    wx.navigateTo({
      url:'/pages/car_location/car_location?state='+state
    })
  },
  calcFeeHandle(){
    let { calcFeeData } = this.data
    if (!calcFeeData.startlon) {
      app.warningMsg({ title: "请选择出发位置" })
      return
    }
    if (!calcFeeData.endlon) {
      app.warningMsg({ title: "请选择终点位置" })
      return
    }
    let formData = {
      start_lon: calcFeeData.startlon || "",
      start_lat: calcFeeData.startlat || "",
      end_lon: calcFeeData.endlon || "",
      end_lat: calcFeeData.endlat || "",
    }
    app.xcxPost({
      url: "/manager/rider/carFeeEstimate.do",
      data: formData,
      success: res => {
        let _data = res.data.msg || {}
        _data.duration_txt = app.minFormatSeconds(_data.duration*1000)
        _data.total_fee = _data.total_fee.toFixed(1)
        this.setData({
          calcResult: _data
        })
      }
    })
  },
  goPingjia(){
    if (!this.data.pingData.length){
      return
    }
    wx.navigateTo({
      url: '/pages/car_pingjia/car_pingjia?car_id=' + this.options.car_id
    })
  }
})