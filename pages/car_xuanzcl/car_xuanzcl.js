//获取应用实例
let app = getApp()
var amapFile = require('../../libs/amap-wx.js');
var myAmapFun = new amapFile.AMapWX({ key: '14db0799d724b1866aa65ebbea42d8e5' });
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    stateArr: ["", "待完善", "审核中", "未共享", "已共享", "已删除", "审核未通过", "审核通过"],
    localTxt:"",
    license_number:""
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
    let that = this
    // 车主查看自己的车辆
    if (app.globalData.is_owner == 1 || wx.getStorageSync('is_owner') == 1) {
      // 车主查看自己的车辆
      app.xcxPost({
        url: "/manager/owner/ownerCarList.do",
        data: {
          license_number: that.data.license_number || ""
        },
        success: res => {
          let _data = res.data
          _data.forEach((ele) => {
            ele.car_image && (ele.car_image = app.globalData.domain + ele.car_image)
            ele.license_number_txt = app.addXing(ele.license_number)
          })
          that.setData({
            list: _data,
            is_owner: 1
          })
        }
      })
    } else {
      // 车友查找可用车辆
      myAmapFun.getRegeo({
        success: function (data) {
          //成功回调
          let _data = data[0], _dataLocal = data[0]
          that.setData({ localTxt: _data.name })
          let self_longitude = _data.longitude
          let self_latitude = _data.latitude
          // city 为空时 发送省（如北京市，上海市为直辖市，city返回为空）
          
          let nowCity = '',
            searchCity = _dataLocal.regeocodeData.addressComponent.city,
            searchProvince = _dataLocal.regeocodeData.addressComponent.province

          if (searchCity && searchCity.length) {
            nowCity = searchCity
          } else {
            nowCity = searchProvince
          }
          let _distance = 2000000
          app.xcxPost({
            // 获取范围内的亲情号车辆
            url: "/manager/rider/getKinshipCarNearbyList.do",
            data: {
              distance: _distance,
              lon: _data.longitude,
              lat: _data.latitude,
              city: nowCity,
              license_number: that.data.license_number || ""
            },
            success: resp => {
              let qingqList = resp.data || []
              qingqList.forEach(ele => {
                ele.car_info.qingqFlag = true
              });
              app.xcxPost({
                // 获取范围内的车辆
                url: "/manager/rider/getCarNearbyList.do",
                data: {
                  distance: _distance,
                  lon: _data.longitude,
                  lat: _data.latitude,
                  city: nowCity,
                  license_number: that.data.license_number || ""
                },
                success: res1 => {
                  that.setData({ pageState: 1 })//去掉加载效果
                  let _data1 = res1.data || []
                  // 车辆合并在一起
                  // 车辆合并在一起
                  let nearList = qingqList.concat(_data1)
                  app.xcxPost({
                    // 获取范围内的维保号车辆
                    url: "/manager/rider/getMaintenanceCarNearbyList.do",
                    data: {
                      distance: _distance,
                      lon: _dataLocal.longitude,
                      lat: _dataLocal.latitude,
                      city: nowCity,
                      license_number: that.data.license_number || ""
                    },
                    success: res2 => {
                      let _data2 = res2.data || []
                      _data2.forEach(ele => {
                        ele.car_info.weibFlag = true
                      });
                      // 车辆合并在一起
                      let weibaoList = nearList.concat(_data2)
                      app.xcxPost({
                        // 获取范围内的快递号车辆
                        url: "/manager/rider/getExpressCarNearbyList.do",
                        data: {
                          distance: _distance,
                          lon: _dataLocal.longitude,
                          lat: _dataLocal.latitude,
                          city: nowCity,
                          license_number: that.data.license_number || ""
                        },
                        success: res3 => {
                          let _data3 = res3.data || []
                          _data3.forEach(ele => {
                            ele.car_info.kuaidFlag = true
                          });
                          // 车辆合并在一起
                          let allData = weibaoList.concat(_data3)
                          that.manageRiderCarList(allData, self_latitude, self_longitude)

                        }
                      })
                    }
                  })
                  
                }
              })
            }
          })
        },
        fail: function (info) {
          wx.hideLoading();
          //失败回调
          console.log("成功回调", info)
        }
      })
    }
  },
  /**
   * 车友车辆 数据处理
   */
  manageRiderCarList(allData, self_latitude, self_longitude) {
    let that = this
    allData.forEach((ele) => {
      let localtxt = ele.lon + "," + ele.lat
      if (self_latitude) {
        let tempDis = app.distance(self_latitude, self_longitude, ele.lat, ele.lon)
        if (tempDis < 1) {
          ele.car_info.distance = parseInt(tempDis * 1000) + '米'
        } else {
          ele.car_info.distance = parseInt(tempDis) + '公里'
        }
      } else {
        ele.car_info.distance = '未授权'
      }
      myAmapFun.getRegeo({
        // location: "longitude,latitude",
        location: localtxt || "",
        success: function (data) {
          let { list } = that.data
          //成功回调
          console.log("成功回调22", data[0])
          ele.car_info.car_image && (ele.car_info.car_image = app.globalData.domain + ele.car_info.car_image)


          ele.car_info.license_number_txt = app.addXing(ele.car_info.license_number)

          ele.car_info.name = data[0].name
          ele.car_info.latitude = data[0].latitude
          ele.car_info.longitude = data[0].longitude
          list.push(ele.car_info)
          that.setData({
            list,
          })
          // 地图上车辆标记 车辆都拼接完毕时
          // if (list.length == _data1.length) {
          //   //模拟请求单车数据
          //   setTimeout(() => {
          //     that.tocreate()
          //     that.mapCtx.getCenterLocation({
          //       type: 'gcj02',
          //       success: (res) => {
          //         console.log("allList--:", res)
          //         // that.nearestBic(res)
          //       }
          //     })
          //     wx.hideLoading();
          //   }, 1000)
          // }
        },
        fail: function (info) {
          //失败回调
          console.log(info)
        }
      })
    })
    that.setData({
      is_owner: 0,
      domain: app.globalData.domain
    })
    wx.hideLoading();
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
  license_numberInput(e) {
    var that = this;
    that.setData({ license_number: e.detail.value });
  },
  goDetail(e) {
    let id = e.currentTarget.dataset.id
    // wx.navigateTo({
    //   url: "/pages/car_detail/car_detail" + "?id=" + id
    // })
    wx.reLaunch({
      url: "/pages/index/index" + "?car_id=" + id
    })
  },
  addCar(e) {
    wx.navigateTo ({
      url: '/pages/car_tianxiexx/car_tianxiexx',
    })
  },
  goSearch(){
    if (!this.data.license_number) {
      app.warningMsg({ title: "请输入车牌号" })
      return
    }
    this.setData({
      list:[]
    })
    this.init(this.options)
  }
})