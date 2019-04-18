let app = getApp()

var md5 = require('../../libs/md5.js')
// var amapFile = require('../../libs/amap-wx.js');
var myAmapFun = app.globalData.myAmapFun;
let { regeneratorRuntime } = app.globalData
// const gcoord = require('../../libs/gcoord.js');

//蓝牙命令接收相关参数
var isComp = false // 是否是完整的16进制命令
var str16 = '' //用于收集每条完整的16进制命令
var tempStr16 = '' // 临时存放完整的命令
var startRecive = false //命令开始接收flag

Page({
  /**
   * 页面的初始数据
   */
  data: {
    longitude: 116.397390,
    latitude: 39.908860,
    markers: [],
    topText: ' ',
    scale: 18,
    lastLongitude: 0,
    lastLatitude: 0,
    polyline: [],
    distanceArr: [],
    /* 0 */
    list: [],
    currentIndex: 0,
    cardRightIn: false,
    cardLeftIn: false,
    centerShow: false,
    loginFlag: false,
    domain: "",
    refreshtime: 0,
    is_owner: '',
    haveNetwork: true,
    currentType: '',//当前切换到的车辆
    currentCarId: '',
    wcy_msg: {},
    /* 蓝牙操作变量 */
    devices: [],
    connected: false, // 当前蓝牙连接状态
    chs: [],
    blue_mac: 'D0:5F:B8:54:1D:A6',
    blue_deviceId: '',
    wcyIsOpenState: false, // 当前五车仪是开锁状态（true）,关锁状态（false）
    lockPwd: '',
    lockPwdIsOK: false,
    isBlueLock:false , // 判断是否是蓝牙解锁 从手势页面修改回来触发
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("ryy-RYY-onLoad")
    this.options = options
    app.globalData.refresh = true
    if (!this.data.haveNetwork){
      // app.errorMsg({ title: "网络离家出走了" });
      return // 没网络就不要请求
    }
    console.log("ryy-RYY-onLoad2222")
    wx.onNetworkStatusChange(res => {
      app.globalData.haveNetwork = res.isConnected;
      console.log("ryy-RYY-onNetwork")
      if (!res.isConnected) {
        
      } else {
        // app.showMsgModal({ content: "index网络" + res.networkType });
        // this.init(this.options)
        
      }
      this.setData({
        haveNetwork: res.isConnected
      })
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 创建map上下文  保存map信息的对象
    this.mapCtx = wx.createMapContext('myMap');
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log("ryy-RYY-onShow")

    // 蓝牙 手势解锁
    let {isBlueLock} = this.data 
    if (isBlueLock){
      console.log("ryy-RYY-onShow-isBlueLock")
      this.setData({ isBlueLock: false})
      this.blueHandle()
    }

    app.globalData.is_owner = wx.getStorageSync('is_owner')
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType
        if (networkType == "none") {// 没网
          app.globalData.haveNetwork = false;
          // app.errorMsg({ title: "网络离家出走了" });
          if (app.globalData.is_owner == 1 || this.data.is_owner == 1) {// 车主离线显示
            let localData = JSON.parse(wx.getStorageSync("localOwnerCar") || "[]")
            console.log("localData", localData)
            this.setData({
              list: localData,
              is_owner: 1,
              domain: app.globalData.domain,
              pageState: 1,
              markers: localData,
              haveNetwork: false
            })
          }
        } else {
          app.globalData.haveNetwork = true;
          this.onshowHandle()
          this.setData({
            haveNetwork: true
          })
        }
      },
      fail: (err) => {
        console.error(err)
      }
    })
  },
  onshowHandle(){
    console.log("ryy-RYY-onShow2222")
    let a = "2b39433a31443a35380d0a"
    console.log("ryy-RYY-onShowqqqq", a.substring(0, 2))
    console.log("ryy-RYY-onShowqqqq2", a.substring(a.length - 4))
    
    /* let miyao = ('721000928505393230a069b3b31e9f4f79877ff610420889f412345').MyMD5(32)
    console.log("ryy-miyao", miyao, (`AT+WCGETSTATUS`).MyMD5(32))
    // console.log("ryy-miyao2", miyao, md5.lanyaMyMD5('AT+WCGETSTATUS'))
    console.log("ryy-string2buffer", string2buffer(`AT+WCGETSTATUS`, true))
    let arr = ['12', '33']
    if (arr[arr.length - 1].length == 2) {
      arr.push('')
    }
    console.log("arr", arr) */
    if (this.options.car_id) {
      this.setData({
        currentCarId: this.options.car_id
      })
    }

    let { is_owner } = this.data
    console.log("index-onShow-is_owner", is_owner)
    console.log("index-onShow-app.globalData.is_owner", app.globalData.is_owner)
    if ((is_owner !== "" && (is_owner != app.globalData.is_owner))||
      app.globalData.refresh
    ) {
      app.globalData.refresh = false
      console.log("index-onShow-init()")
      this.init(this.options)
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    //清除计时器  即清除setInter
    clearInterval(this.setInterDian)

    clearInterval(this.loopFirstSend)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    //清除计时器  即清除setInter
    clearInterval(this.setInterDian)

    clearInterval(this.loopFirstSend)

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() { },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() { },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() { },
  /**
   * 页面滚动时触发
   */
  onPageScroll() { },
  bindChange(e) {
    let { list, markers, is_owner } = this.data
    console.log('bindChange', e)
    console.log('bindChange-list', list, e.detail.current)
    let currCatId = e.detail.currentItemId
    if (e.detail.source == 'touch') {// 滑动时才触发
      // this.setData({
      //   currentType: e.detail.current
      // })
      markers.forEach((ele, k) => {
        if (ele.id == currCatId) {
          ele.id = ele.car_id
          ele.width = 22
          ele.height = 34
          ele.iconPath = "/images/select.png"
          ele.title = "去这里"

        } else {
          ele.id = ele.car_id
          ele.width = 40,
            ele.height = 31,
            ele.iconPath = "/images/map-bicycle.png",
            ele.title = "去这里"
        }

      })
      this.setData({
        markers,
        polyline: [],
      })
    }
    if (is_owner == 1) {
      //清除计时器  即清除setInter
      clearInterval(this.setInterDian)
      this.fetchDianc(currCatId)
      this.setData({
        currentCarId: currCatId
      })
      // 定时获取电量和钥匙状态
      this.interDian()
    }
  },
  /* 自定义函数 */
  toRefresh() {
    let { refreshtime } = this.data
    if (refreshtime == 0) {
      refreshtime = 10
      this.setData({
        refreshtime: 10,
      })
      var interval = setInterval(() => {
        refreshtime--;

        if (refreshtime <= 0) {
          clearInterval(interval)
          this.setData({
            refreshtime: 0,
          })
        }
      }, 1000)
      this.init(this.options)

    } else {
      app.showMsgModal({ content: '刷新太频繁，请稍后再试' })
    }

  },
  // ownerDataManage(dataCopy){

  // },
  init(options) {
    console.log("ryy-RYY-init")
    app.globalData.is_owner = wx.getStorageSync('is_owner')
    
    console.log('-init', options)
    var that = this
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    this.setData({
      list: [],
      markers: [],
      polyline: [],
      wcy_msg: {},
      pageState: 0,
      haveNetwork: app.globalData.haveNetwork,
      is_owner: wx.getStorageSync('is_owner'),
    })
    //清除计时器  即清除setInter
    clearInterval(this.setInterDian)
    //获取位置信息
    wx.getLocation({
      type: 'gcj02',
      success: async (res) => {
        console.log("Location", res)
        let longitude = res.longitude;
        let latitude = res.latitude;
        this.setData({
          longitude,
          latitude,
        })
        let isNet = await app.getNetworkType()
        console.log("ryy-isNet", isNet)
        if (!isNet && (app.globalData.is_owner == 1 || this.data.is_owner==1)) {// 车主离线显示
          let localData = JSON.parse(wx.getStorageSync("localOwnerCar") || "[]")
          console.log("localData", localData)
          this.setData({
            list: localData,
            is_owner: 1,
            domain: app.globalData.domain,
            pageState: 1,
            markers: localData,
            haveNetwork: false
          })
          wx.hideLoading();
          return
        }

        if (app.globalData.is_owner == 1) {
          // 车主查看自己的车辆
          app.xcxPost({
            url: "/manager/owner/ownerCarList.do",
            data: {},
            success: res => {
              let _data = res.data || []
              _data.forEach((ele) => {
                ele.car_image && (ele.car_image = app.globalData.domain + ele.car_image)
                ele.license_number_txt = app.addXing(ele.license_number)
              })
              this.setData({
                list: _data,
                is_owner: 1,
                domain: app.globalData.domain,
                pageState: 1,
              })
              wx.setStorageSync('is_owner', 1)
              if (_data.length) {
                this.fetchDianc(_data[0].car_id)
                console.log("!this.options.car_id", !this.options.car_id)
                if (!this.options.car_id) {
                  // 有传过来车辆，就不赋值
                  this.setData({
                    currentCarId: _data[0].car_id
                  })
                }

                // 定时获取电量和钥匙状态 有网才循环获取
                if (app.globalData.haveNetwork) {
                  this.interDian()
                }
              }
              // 车数量设置
              let { list, markers } = this.data
              let newList = []
              list.forEach((ele, k) => {
                console.log('list.forEach-k', k)
                let localtxt = ele.lon + "," + ele.lat
                myAmapFun.getRegeo({
                  // location: "longitude,latitude",
                  location: localtxt || "",
                  success: (resp) => {
                    let _resp = resp[0]
                    console.log('list.forEach-_resp', _resp)
                    ele.name = _resp.name
                    newList.push(ele)
                    if (list.length == newList.length) {

                      this.setData({ pageState: 1, list: newList })//去掉加载效果

                      wx.setStorageSync('localOwnerCar', JSON.stringify(newList))
                    }
                  },
                  fail: function (info) {
                    //失败回调
                    console.log(info)
                  }
                })

                //转换为markers  显示在地图上
                if (k == 0) {
                  this.setData({
                    currentCarId: ele.car_id
                  })
                  ele.id = ele.car_id
                  ele.width = 22
                  ele.height = 34
                  ele.iconPath = "/images/select.png"
                  ele.title = "去这里"
                  ele.lat && (ele.latitude = ele.lat)
                  ele.lon && (ele.longitude = ele.lon)

                } else {
                  ele.id = ele.car_id
                  ele.width = 40,
                    ele.height = 31,
                    ele.iconPath = "/images/map-bicycle.png",
                    ele.title = "去这里"
                  ele.lat && (ele.latitude = ele.lat)
                  ele.lon && (ele.longitude = ele.lon)
                }

              })
              this.setData({
                markers: list,
              })
              wx.hideLoading();
            }
          })
        } else {

          app.xcxPost({
            // judge车辆
            url: "/manager/rider/judgeUseOrder.do",
            data: {},
            success: resp => {
              let _data = resp.data || {}
              if (_data.is_order_unsettle == 1) {// 有无未结算的订单（0没有 1有）
                wx.redirectTo({
                  url: "/pages/car_cancelorder/car_cancelorder?page=2&id=" + _data.settle_info.id + "&order_id=" + _data.settle_info.order_id
                });
                return
              }
              if (_data.is_order_unlock == 1) { // 有无确认用车但是还没有解锁也没有自动取消的订单（0没有 1有）
                wx.redirectTo({
                  url: "/pages/car_map_order/car_map_order?page=3&user_owner_id=" + _data.order_unlock_info.user_owner_id + "&order_id=" + _data.order_unlock_info.order_id
                });
                return
              }
              if (_data.is_order_underway == 1) {// 有无正在进行中的订单（0没有 1有）
                wx.redirectTo({
                  url: "/pages/car_map_order/car_map_order?page=4&user_owner_id=" + _data.order_info.user_owner_id + "&order_id=" + _data.order_info.order_id
                });
                return
              }
              if (_data.is_kinship_affirm == 1) {// 有无未亲情号确认用车但是未解锁的订单（0没有 1有）
                wx.redirectTo({
                  url: "/pages/car_map_order/car_map_order?page=3&user_owner_id=" + _data.kinship_affirm_info.user_owner_id + "&kinshipuse_id=" + _data.kinship_affirm_info.kinshipuse_id
                });
                return
              }
              if (_data.is_kinship_driving == 1) {// 有无未亲情号已经解锁车辆进行中的订单（0没有 1有）
                wx.redirectTo({
                  url: "/pages/car_map_order/car_map_order?page=4&user_owner_id=" + _data.kinship_driving.user_owner_id + "&kinshipuse_id=" + _data.kinship_driving.kinshipuse_id
                });
                return
              }
              if (_data.is_maintenance_affirm == 1) {// 有无未维保号确认用车但是未解锁的订单（0没有 1有）
                wx.redirectTo({
                  url: "/pages/car_map_order/car_map_order?page=3&user_owner_id=" + _data.maintenance_affirm_info.user_owner_id + "&maintenance_id=" + _data.maintenance_affirm_info.maintenance_id
                });
                return
              }
              if (_data.is_maintenance_driving == 1) {// 有无未维保号已经解锁车辆进行中的订单（0没有 1有）
                wx.redirectTo({
                  url: "/pages/car_map_order/car_map_order?page=4&user_owner_id=" + _data.maintenance_driving.user_owner_id + "&maintenance_id=" + _data.maintenance_driving.maintenance_id
                });
                return
              }
              if (_data.is_express_affirm == 1) {// 有无未快递号确认用车但是未解锁的订单（0没有 1有）
                wx.redirectTo({
                  url: "/pages/car_map_order/car_map_order?page=3&user_owner_id=" + _data.express_affirm_info.user_owner_id + "&expressuse_id=" + _data.express_affirm_info.expressuse_id
                });
                return
              }
              if (_data.is_express_driving == 1) {// 有无未维保号已经解锁车辆进行中的订单（0没有 1有）
                wx.redirectTo({
                  url: "/pages/car_map_order/car_map_order?page=4&user_owner_id=" + _data.express_driving.user_owner_id + "&expressuse_id=" + _data.express_driving.expressuse_id
                });
                return
              }
              let that = this
              // 车友查找可用车辆  // 获取当前本地市区名称
              // let { longitude,latitude} = this.data
              // let nowLocation = longitude + "," + latitude
              let nowLocation = "121.492817,31.353333"
              myAmapFun.getRegeo({
                // location: nowLocation || "",
                success: function (data) {
                  //成功回调
                  let _dataLocal = data[0]
                  let self_longitude = _dataLocal.longitude
                  let self_latitude = _dataLocal.latitude
                  console.log("city-ryy：", _dataLocal)
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
                      lon: _dataLocal.longitude,
                      lat: _dataLocal.latitude,
                      // city 为空时 发送省（如北京市，上海市为直辖市，city返回为空）
                      city: nowCity
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
                          lon: _dataLocal.longitude,
                          lat: _dataLocal.latitude,
                          city: nowCity
                        },
                        success: res1 => {
                          let _data1 = res1.data || []
                          // 车辆合并在一起
                          let nearList = qingqList.concat(_data1)
                          app.xcxPost({
                            // 获取范围内的维保号车辆
                            url: "/manager/rider/getMaintenanceCarNearbyList.do",
                            data: {
                              distance: _distance,
                              lon: _dataLocal.longitude,
                              lat: _dataLocal.latitude,
                              city: nowCity
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
                                  city: nowCity
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
          })

        }

      },
      fail: (err) => {
        app.showMsgModal({
          content: "获取位置信息失败。请点击右下角定位按钮刷新重试"
        })
        wx.hideLoading();
      }
    })

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
        console.log("ele.car_info", ele.car_info)
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
          /* // gcoord ，GPS设备获取的经纬度坐标转为高德地图坐标，同GCJ-02
          // 将WGS84坐标转换为GCJ02坐标
          console.log("gcoord-to-GCJ02-AMap-star", Number(ele.lon), Number(ele.lat)); 
          var result = gcoord.transform([Number(ele.lon), Number(ele.lat)], gcoord.WGS84, gcoord.BMap);
          console.log("gcoord-to-GCJ02-AMap",result);  
          ele.car_info.latitude = result[1]
          ele.car_info.longitude = result[0] */

          ele.car_info.latitude = ele.lat
          ele.car_info.longitude = ele.lon
          ele.car_info.lat = ele.lat
          ele.car_info.lon = ele.lon
          list.push(ele.car_info)
          that.setData({
            list,
          })
          // 地图上车辆标记 车辆都拼接完毕时
          if (list.length == allData.length) {
            that.setData({ pageState: 1 })//去掉加载效果

            //模拟请求单车数据
            setTimeout(() => {
              that.tocreate()
              that.mapCtx.getCenterLocation({
                type: 'gcj02',
                success: (res) => {
                  console.log("allList--:", res)
                  // that.nearestBic(res)
                }
              })
              wx.hideLoading();
            }, 1000)
          }
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
    if (!allData.length) {
      that.setData({ pageState: 1 })//去掉加载效果
    }
    wx.hideLoading();
  },
  interDian() {
    //将计时器赋值给setInterDian
    this.setInterDian = setInterval(() => {
      this.fetchDianc();
    }
      , 10000);
  },
  fetchDianc(carId) {
    let { currentCarId } = this.data
    app.xcxPost({
      //车主车辆获取电池电量及钥匙
      url: "/manager/owner/getOwnerCarBattNew.do",
      mask: 'hidden',// 不显示遮罩
      data: {
        car_id: carId || currentCarId || '',
      },
      success: res => {
        let _data = res.data || {}
        let wcy_msg = {
          batt: _data.batt || '',
          key_inside: _data.key_inside || '',
        }
        this.setData({
          wcy_msg
        })
      }
    })
  },
  //
  tocreate() {
    // 车数量设置
    let { list, markers } = this.data
    console.log(markers)

    list.forEach((ele, k) => {
      console.log('list.forEach-k', k)

      if (!this.options.car_id) {
        // 没有传过来车辆id，就选第一个高亮
        if (k == 0) {
          this.setData({
            currentCarId: ele.car_id
          })
          ele.id = ele.car_id
          ele.width = 22
          ele.height = 34
          ele.iconPath = "/images/select.png"
          ele.title = "去这里"
        } else {
          ele.id = ele.car_id
          ele.width = 40,
            ele.height = 31,
            ele.iconPath = "/images/map-bicycle.png",
            ele.title = "去这里"
        }
      } else {
        // 有传过来车辆id，让其高亮
        if (this.options.car_id == ele.car_id) {
          this.setData({
            currentCarId: ele.car_id
          })
          ele.id = ele.car_id
          ele.width = 22
          ele.height = 34
          ele.iconPath = "/images/select.png"
          ele.title = "去这里"
        } else {
          ele.id = ele.car_id
          ele.width = 40,
            ele.height = 31,
            ele.iconPath = "/images/map-bicycle.png",
            ele.title = "去这里"
        }
      }


    })
    this.setData({
      markers: list
    })
  },

  toVisit(e) {
    console.log('select-one', e)
    let bic = e.markerId;
    let { markers } = this.data
    let selectMarker = {}
    markers.forEach((ele, k) => {
      if (ele.car_id == bic) {
        ele.iconPath = "/images/select.png"
        ele.width = 22
        ele.height = 34
        // ele.title = "去这里"
        selectMarker = ele

      } else {
        ele.iconPath = "/images/map-bicycle.png"
        ele.width = 40
        ele.height = 31
      }
    })
    this.setData({ markers, currentCarId: bic })

    this.route(selectMarker)
  },
  route(bic) {
    // 获取当前中心经纬度  （目前未使用 上线可去掉）
    let { latitude, longitude } = this.data
    this.mapCtx.getCenterLocation({
      success: (res) => {
        // 调用高德地图步行路径规划API
        myAmapFun.getWalkingRoute({
          // 驾车路线规划
          // myAmapFun.getDrivingRoute({
          origin: `${longitude},${latitude}`,
          destination: `${bic.longitude},${bic.latitude}`,
          success: (data) => {
            let points = [];
            if (data.paths && data.paths[0] && data.paths[0].steps) {
              let steps = data.paths[0].steps;
              for (let i = 0; i < steps.length; i++) {
                let poLen = steps[i].polyline.split(';');
                for (let j = 0; j < poLen.length; j++) {
                  points.push({
                    longitude: parseFloat(poLen[j].split(',')[0]),
                    latitude: parseFloat(poLen[j].split(',')[1])
                  })
                }
              }
            }
            // 设置map组件polyline，绘制线路
            this.setData({
              polyline: [{
                points: points,
                color: "#fffffaaa",
                // arrowLine: true,
                borderColor: "#09bb07",
                borderWidth: 2,
                width: 5,
              }]
            });
          }
        })
      }
    })
  },
  // 自动判断距离最近的方法
  nearestBic(res) {
    // 找出最近的单车
    let { markers } = this.data;
    let min_index = 0;
    let distanceArr = [];
    for (let i = 0; i < markers.length; i++) {
      let lon = markers[i].longitude;
      let lat = markers[i].latitude;
      // 计算距离
      let t = Math.sqrt((lon - res.longitude) * (lon - res.longitude) + (lat - res.latitude) * (lat - res.latitude));
      let distance = t;
      // 将每一次计算的距离加入数组 distanceArr
      distanceArr.push(distance)
    }
    console.log('distanceArr', distanceArr)
    //从距离数组中找出最小值，js是弱类型，数字不能直接比较大小。需要进行转换用 parseFloat（小数）  | parseInt（整数）
    let min = distanceArr[0];
    for (let i = 0; i < distanceArr.length; i++) {
      if (parseFloat(distanceArr[i]) < parseFloat(min)) {
        min = distanceArr[i];
        min_index = i;
      }
    }
    // console.log(distanceArr)
    // console.log(min_index)
    let callout = `markers[${min_index}].callout`;
    // 清楚旧的气泡，设置新气泡
    // wx.getStorage({
    //   key: 'bicycle',
    //   success: (res) => {
    //     this.setData({
    //       markers: res.data,
    //       [callout]: {
    //         "content": '离我最近',
    //         "color": "#ffffff",
    //         "fontSize": "16",
    //         "borderRadius": "50",
    //         "padding": "10",
    //         "bgColor": "#0082FCaa",
    //         "display": 'ALWAYS'
    //       }
    //     })
    //   }
    // })
  },
  //复位按钮  已完成
  toReset() {
    if (!this.data.haveNetwork) {
      // 没网不能进行此操作
      return
    }
    console.log('重置定位')
    //调回缩放比，提升体验
    var promise = new Promise((resolve) => {
      this.mapCtx.moveToLocation();
      resolve('调回缩放比')
    })
    promise.then((value) => {
      setTimeout(() => {
        this.setData({
          scale: 18
        })
        // return Promise.resolve(true)
      }, 1000)
    }).then(res => {
      console.log("res-then", res)
      this.init(this.options)
    })

  },
  getCent(e){
    let lon = e.currentTarget.dataset.lon || ""
    let lat = e.currentTarget.dataset.lat || ""
    this.setData({
      latitude: Number(lat),
      longitude: Number(lon),
    })
    console.log("getCent", e)
    // setTimeout(() => {
    //   console.log('重置定位', lon, lat)
    //   //调回缩放比，提升体验
    //   var promise = new Promise((resolve) => {
    //     // this.mapCtx.moveToLocation();
    //     resolve('调回缩放比')
    //   })
    //   promise.then((value) => {
    //     setTimeout(() => {
    //       this.setData({
    //         scale: 18
    //       })
    //       // return Promise.resolve(true)
    //     }, 1000)
    //   })
    // },3000)
    
  },
  goPage(e) {
    if (!this.data.haveNetwork) {
      // 没网不能进行此操作
      return
    }
    console.log('e', e)
    wx.navigateTo({
      url: e.currentTarget.dataset.path
    })
  },
  // 跳转到个人中心
  toUser() {
    if (!this.data.haveNetwork) {
      // 没网不能进行此操作
      return
    }
    // this.setData({
    //   centerShow: !this.data.centerShow
    // })
    wx.navigateTo({
      url: '/pages/my_center/my_center',
    })
  },
  // 跳转到消息  已完成
  toMsg() {
    wx.navigateTo({
      url: '/pages/messageCenter/messageCenter',
    })
  },
  // 触发客服
  toKeFu() {
    // let kefuBut = document.getElementById('keFu')
    var query = wx.createSelectorQuery()
    // query.select('#keFu').boundingClientRect()
    let kefuBut = query.select('#keFu').boundingClientRect()
    console.log('kefuBut', kefuBut)
    kefuBut.click()
  },
  regionchange(e) {
    // 拿到起点经纬度

    /* if (e.type == 'begin') {
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: (res) => {
          this.setData({
            lastLongitude: res.longitude,
            lastLatitude: res.latitude,
            polyline: []
          })
        }
      })
    }
    // 拿到当前经纬度
    if (e.type == 'end') {
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: (res) => {
          let lon_distance = res.longitude - this.data.lastLongitude;
          let lat_distance = res.latitude - this.data.lastLatitude;
          // console.log(lon_distance,lat_distance)
          // 判断屏幕移动距离，如果超过设定的阈值，模拟刷新单车
          if (Math.abs(lon_distance) >= 0.0035 || Math.abs(lat_distance) >= 0.0022) {
            console.log('刷新单车')
            this.setData({
              // 清空
              markers: []
            })
            this.tocreate(res)
          }
        }
      })
    }
    this.mapCtx.getCenterLocation({
      type: 'gcj02',
      success: (res) => {
        this.nearestBic(res)
      }
    }) */
  },
  querenUse(e) {
    let qingq = e.currentTarget.dataset.qingq || ""// 亲情号不需要实名认证
    if (app.globalData.is_approve != 1) {
      app.xcxPost({
        url: "/manager/user/getIsApprove.do",
        data: {
        },
        success: res => {
          let _data = res.data || {}
          app.globalData.is_approve = _data.is_approve || ""
          if (!qingq && _data.is_approve == 2) {
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
      let car_id = e.currentTarget.dataset.carid
      let user_owner_id = e.currentTarget.dataset.userid
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
          } else if (_data.maintenance_id) {
            // 维保号车辆确认用车成功
            wx.redirectTo({
              url: "/pages/car_map_order/car_map_order?page=3&maintenance_id=" + _data.maintenance_id + "&user_owner_id=" + user_owner_id
            })
          } else if (_data.expressuse_id) {
            // 快递号车辆确认用车成功
            wx.redirectTo({
              url: "/pages/car_map_order/car_map_order?page=3&expressuse_id=" + _data.expressuse_id + "&user_owner_id=" + user_owner_id
            })
          }

        }
      })

    }
  },
  qieHuang() {
    if (!this.data.haveNetwork) {
      // 没网不能进行此操作
      return
    }
    let is_owner = ""//app.globalData.is_owner == 1 ? 0 : 1
    if (app.globalData.is_owner) {
      is_owner = 0
    } else {
      is_owner = 1
    }
    app.xcxPost({
      url: "/manager/user/switchIdentity.do",
      data: { login_identity: is_owner },
      success: res => {
        app.globalData.is_owner = is_owner || '0'
        wx.setStorageSync('is_owner', is_owner || '0')
        this.init(this.options)
        // this.setData({
        //   is_owner: is_owner,
        // })
      }
    })
  },
  goDetail(e) {
    if (!this.data.haveNetwork) {
      // 没网不能进行此操作
      return
    }
    let id = e.currentTarget.dataset.id
    let user_owner_id = e.currentTarget.dataset.userid
    let qingq = e.currentTarget.dataset.qingq
    console.log("app.globalData.is_owner", app.globalData.is_owner)
    if (app.globalData.is_owner == 1) {
      wx.navigateTo({
        url: "/pages/car_detail/car_detail" + "?id=" + id
      })
      return
    } else if (!qingq) {//不是亲情号才可以查看预估车费
      wx.navigateTo({
        url: "/pages/car_info/car_info" + "?car_id=" + id + "&userid=" + user_owner_id
      })
    }

  },
  goAddCar() {
    if (!this.data.haveNetwork) {
      // 没网不能进行此操作
      return
    }
    if (!app.globalData.phone) {
      wx.navigateTo({
        url: "/pages/my_login/my_login?page=3"
      });
      return
    }
    wx.navigateTo({
      url: '/pages/car_tianxiexx/car_tianxiexx',
    })
  },

  daohang(e) {

    let lat = e.currentTarget.dataset.lat,
      lon = e.currentTarget.dataset.lon,
      name = e.currentTarget.dataset.name
    if (!lat) {
      return
    }
    wx.openLocation({
      latitude: Number(lat),
      longitude: Number(lon),
      name: name || "",
      scale: 28
    })
  },
  blueHandle() {
    if (this.data.connected) {
      // 在连接状态
      this.loopSendStr()
    } else {
      this.openLock()
    }
  },
  // 车主解锁
  ownerUnLock(e) {
    let car_id = this.car_id = e.currentTarget.dataset.id
    let is_owner_use = e.currentTarget.dataset.owneruse
    let is_kinship_use = e.currentTarget.dataset.kinshipuse
    let state = e.currentTarget.dataset.state
    let userid = this.userid = e.currentTarget.dataset.userid //当前车辆的userid（uuid）
    let wcynumber = this.wcynumber = e.currentTarget.dataset.wcynumber || ""//当前车辆的deviceid
    let index = this.nowIndex = e.currentTarget.dataset.index//当前车辆的下标
    let blue_mac = e.currentTarget.dataset.lanyamac || ""//当前车辆的蓝牙mac地址
    this.setData({ blue_mac })
    console.log("userid", userid)
    console.log("wcynumber", wcynumber)
    console.log("blue_mac", blue_mac)
    console.log("index", index)

    if (state == 4 || is_owner_use == 1 || is_kinship_use) {
      // 正在使用或者已被共享或已被亲情号使用 不能解锁
      return
    }
    if (!wcynumber) {
      // 未绑定五车仪
      app.showMsgModal({ content: "车辆与五车仪绑定异常，请检查五车仪绑定状态" })
      return
    }
    // 未使用  接下来需要解锁
    this.is_owner_use = 0

    let isOpenBlue = false
    wx.openBluetoothAdapter({
      success: (res) => {
        isOpenBlue = true
        wx.closeBluetoothAdapter()
      },
      fail: (res) => {
        // wx.showModal({
        //   content: '请开启手机蓝牙后再试'
        // })
        isOpenBlue = false
      },
      complete: () => {
        if (isOpenBlue) {
          // 蓝牙已打开
          this.goShous(1)
        } else {
          if (app.globalData.haveNetwork || this.data.haveNetwork) {
            // 有网
            this.ownerUnLockInterface(car_id)
          } else {
            // 没网也没打开蓝牙 就提示
            app.showMsgModal({
              content: '请开启手机蓝牙后再试'
            })
          }
        }
      }
    })
    // let { list } = this.data
    // list[this.nowIndex].is_owner_use = 1
    // this.setData({ list })
    // if (app.globalData.haveNetwork || this.data.haveNetwork) {
    //   // 有网
    //   this.ownerUnLockInterface(car_id)
    // } else {
      // this.goShous(1)
      // this.blueHandle()
    // }

  },
  ownerUnLockInterface(car_id, is_unlock_lanya) {
    app.xcxPost({
      // 解锁
      url: "/manager/owner/ownerUnlockCar.do",
      data: {
        car_id: car_id || '',
        is_unlock_lanya: is_unlock_lanya || '0'
      },
      success: res => {
        app.successMsg({ title: res.errmsg + "" })
        // setTimeout(() => {
        //   wx.redirectTo({
        //     url: "/pages/index/index?car_id=" + car_id
        //   })
        // }, 1000);
        let { list } = this.data
        list[this.nowIndex].is_owner_use = 1  //解锁成功之后就是
        this.setData({ list })
      }
    })
  },
  // 车主落锁
  ownerLock(e) {
    

    let car_id = this.car_id = e.currentTarget.dataset.id
    let is_owner_use = e.currentTarget.dataset.owneruse
    let is_kinship_use = e.currentTarget.dataset.kinshipuse
    let state = e.currentTarget.dataset.state
    let userid = this.userid = e.currentTarget.dataset.userid //当前车辆的userid（uuid）
    let wcynumber = this.wcynumber = e.currentTarget.dataset.wcynumber || ""//当前车辆的deviceid
    let index = this.nowIndex = e.currentTarget.dataset.index//当前车辆的下标
    let blue_mac = e.currentTarget.dataset.lanyamac || ""//当前车辆的蓝牙mac地址
    this.setData({ blue_mac })
    console.log("userid", userid)
    console.log("wcynumber", wcynumber)
    console.log("blue_mac", blue_mac)
    console.log("index", index)




    if (state == 4 || is_owner_use == 0 || is_kinship_use) {
      // 正在使用或者已被共享或已被亲情号使用 不能落锁
      return
    }
    if (!wcynumber) {
      // 未绑定五车仪
      app.showMsgModal({ content: "车辆与五车仪绑定异常，请检查五车仪绑定状态" })
      return
    }
    // 正在使用 接下来要落锁
    this.is_owner_use = 1
    // let { list } = this.data
    // list[this.nowIndex].is_owner_use = 0
    // this.setData({ list })
    let isOpenBlue = false
    wx.openBluetoothAdapter({
      success: (res) => {
        isOpenBlue = true
        wx.closeBluetoothAdapter()
      },
      fail: (res) => {
        // app.showMsgModal({
        //   content: '请开启手机蓝牙后再试'
        // })
        isOpenBlue = false
      },
      complete:()=>{
        if (isOpenBlue) {
          //蓝牙已打开
          this.goShous(2)
        } else {
          if (app.globalData.haveNetwork || this.data.haveNetwork) {
            // 有网
            this.ownerLockInterface(car_id)
          }else{
            // 没网也没打开蓝牙 就提示
            app.showMsgModal({
              content: '请开启手机蓝牙后再试'
            })
          }
        }
      }
    })
    // if (app.globalData.haveNetwork || this.data.haveNetwork) {
    //   // 有网
    //   this.ownerLockInterface(car_id)
    // }else{
      // this.goShous(2)
      // this.blueHandle()
    // }

  },
  ownerLockInterface(car_id, is_unlock_lanya) {
    app.xcxPost({
      // 落锁
      url: "/manager/owner/ownerLockCar.do",
      data: {
        car_id: car_id || '',
        is_unlock_lanya: is_unlock_lanya || '0'
      },
      success: res => {
        app.successMsg({ title: res.errmsg + "" })
        // setTimeout(() => {
        //   wx.redirectTo({
        //     url: "/pages/index/index?car_id=" + car_id
        //   })
        // }, 1000);
        let { list } = this.data
        list[this.nowIndex].is_owner_use = 0
        this.setData({ list })
      }
    })
  },
  diffLock(isBlue) {
    let _isBlue = isBlue || 0 // isBlue==1就是蓝牙解锁
    if (this.is_owner_use == 1) {
      // this.is_owner_use=1 是车主正在使用 已解锁了  现在需要落锁
      this.ownerLockInterface(this.car_id, _isBlue)
    } else {
      this.ownerUnLockInterface(this.car_id, _isBlue)
    }
  },
  goShous(lockstate) {
    let { lockPwdIsOK, lockPwd } = this.data
    if (lockPwdIsOK && lockPwd) {
      this.blueHandle()
      return
    }
    // lockstate=1 是要进行开锁操作  =2进行落锁操作
    wx.navigateTo({
      url: '/pages/gestureLock/index?locktype=2&lockstate=' + lockstate
    })
  },
  /* 蓝牙模块函数 --START*/
  openLock() {
    // 开启遮罩
    wx.showLoading({ mask: true, title: "" });
    this.disableDeviceArr = [] //ios 存储连接过的设备的deviceId
    this.blueConnectNum = 5  // 蓝牙尝试连接的次数

    this.linkBlueTime = 12 // 蓝牙尝试连接的时间
    // 解决微信蓝牙 notify 连接未成功问题， 第一次write信息反应了之后，停止
    this.firstFetch = false
    this.openBluetoothAdapter()
    //将计时器赋值给setInterDian
    this.setBlueLinkOut = setInterval(() => {
      this.linkBlueTime--
      console.log("setBlueLinkOut", this.linkBlueTime)
      if (this.linkBlueTime < 0) {
        this.isDiscovering = false
        clearInterval(this.setBlueLinkOut)
        this.linkBlueTime = 12
        // 超时就不再连接蓝牙 直接发送请求
        this.diffLock()
        wx.hideLoading()
        // app.showMsgModal({ content: "蓝牙操作超时，请检查密码是否正确，设备是否有电，设备是否正常连接后重试！" })
        this.closeBLEConnection()
        // 关闭蓝牙模块。调用该方法将断开所有已建立的连接并释放系统资源。
        this.closeBluetoothAdapter()
      }
    }, 1000);
  },
  /**
   * 蓝牙连接失败的异常处理
   */
  blueLinkErrHandle() {
    // 如果连接失败 再次尝试连接 连接次数用完之后还连接失败 本次就不再连接蓝牙
    this.blueConnectNum--
    if (this.blueConnectNum > 0) {
      this.openBluetoothAdapter()
    }
    // 等于0了 说明超过了设定的连接次数 连接失败  请求后台接口开锁解锁
    if (this.blueConnectNum == 0) {
      // app.showMsgModal({ content: "蓝牙操作超时，请检查密码是否正确，设备是否有电，设备是否正常连接后重试！" })
      this.diffLock()
    }
    clearInterval(this.setBlueLinkOut)
    //关闭遮罩
    app.hideMask()
    this.closeBLEConnection()

    /* if (this.data.deviceId) {
      // 如果有设备
      this.closeBLEConnection()
    } */
  },
  /**
   * 初始化蓝牙模块
   */
  openBluetoothAdapter() {
    // 开启遮罩
    wx.showLoading({ mask: true, title: "" });
    console.log('ryy-scan')
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        console.log('openBluetoothAdapter-ERR', res)
        if (res.errCode == 10001) {
          wx.onBluetoothAdapterStateChange((res) => {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            } else {

            }
          })
          if (this.blueConnectNum == 0){
            // app.showMsgModal({ content: "蓝牙操作异常，请检查设备是否有电，设备是否正常连接后重试" })
          }
          
        }
        // 异常处理
        this.blueLinkErrHandle()
      }
    })
  },
  /**
   * 开始搜寻附近的蓝牙外围设备
   */
  startBluetoothDevicesDiscovery() {
    // if (this._discoveryStarted) {
    //   return
    // }
    // this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.isDiscovering = res.isDiscovering
        this.onBluetoothDeviceFound()

      },
      fail: (err) => {
        console.error('startBluetoothDevicesDiscovery-err', err)
        // 异常处理
        this.blueLinkErrHandle()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery({
      success: (res) => {
        this.isDiscovering = res.isDiscovering
        console.log('ryy-STOP-stopBluetoothDevicesDiscovery-success', res)
      },
      fail: (err) => {
        console.error('ryy-STOP-ERR-stopBluetoothDevicesDiscovery-err', err)

        //关闭遮罩
        app.hideMask()
        /* // 异常处理
        this.blueLinkErrHandle() */
      }
    })
  },
  /**
   * 监听寻找到新设备的事件
   */
  onBluetoothDeviceFound() {
    let searchNum = 0


    wx.onBluetoothDeviceFound((res) => {
      console.log("ryy-res", res)
      if (!this.isDiscovering) {
        return
      }

      //TODO 搜索多久 超时
      // console.log("ryy-TODO")
      // 蓝牙连接超时
      console.log("ryy-linkBlueTime", this.linkBlueTime)
      if (this.linkBlueTime <= 0) {
        this.isDiscovering = false
        clearInterval(this.setBlueLinkOut)
        app.showMsgModal({ content: "蓝牙操作超时，请检查设备是否有电，设备是否正常连接后重试" })
        this.linkBlueTime = 12
        // 超时就不再连接蓝牙 直接发送请求
        // this.diffLock()
        wx.hideLoading()
        this.stopBluetoothDevicesDiscovery()
        
        // 关闭蓝牙模块。调用该方法将断开所有已建立的连接并释放系统资源。
        // this.closeBluetoothAdapter()
        // return
      }

      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        console.log("ryy-res.devices.foreach", res.devices)
        console.log("ryy-device.deviceId", device.deviceId)
        // const foundDevices = this.data.devices
        // const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        // const data = {}
        // if (idx === -1) {
        //   data[`devices[${foundDevices.length}]`] = device
        // } else {
        //   data[`devices[${idx}]`] = device
        // }
        // this.setData(data)
        let { blue_mac } = this.data
        console.log('ryy-onBluetoothDeviceFound-blue_mac', blue_mac, device.deviceId)
        let that = this

        wx.getSystemInfo({
          success(res) {
            console.log('platform', res.platform)
            let platform = res.platform
            that.platform = res.platform
            if (platform == 'ios') {
              // 苹果系统
              console.log('device.name', device.name, device)
              // app.showMsgModal({ content: "ios系统暂不支持蓝牙操作" })
              if (device.localName == 'WCBOX' + that.wcynumber) {
                if (that.disableDeviceArr.indexOf(device.deviceId + "") > -1) {
                  return
                }

                that.createBLEConnection(device)
                that.isDiscovering = false // 找到设备并连接就停止
                that.stopBluetoothDevicesDiscovery()
              }


            } else {
              // platform == 'android'
              if (blue_mac == device.deviceId) {
                that.createBLEConnection(device)
                that.isDiscovering = false
                that.stopBluetoothDevicesDiscovery()
              } else {
                // 蓝牙连接超时
                // console.log("ryy-linkBlueTime", this.linkBlueTime)
                // if (this.linkBlueTime<0) {
                //   // 超时就不再连接蓝牙 直接发送请求
                //   that.diffLock()
                //   clearInterval(that.setBlueLinkOut)
                //   that.isDiscovering = false
                //   that.stopBluetoothDevicesDiscovery()
                //   // 关闭蓝牙模块。调用该方法将断开所有已建立的连接并释放系统资源。
                //   that.closeBluetoothAdapter()
                // }
                // app.showMsgModal({ content: "蓝牙操作异常，请检查设备是否有电，设备是否正常连接后重试" })
              }
            }
          },
          fail: (err) => {
            //关闭遮罩
            app.hideMask()
          }
        })

      })

    })
  },
  createBLEConnection(device) {
    // 开启遮罩
    wx.showLoading({ mask: true, });
    const ds = device
    const deviceId = ds.deviceId
    // const serviceId = "0000FFE0-0000-1000-8000-00805F9B34FB"
    // this.setData({
    //   serviceId
    // })
    const name = ds.name
    console.log("ryy-ds", ds)
    // console.log("ryy-连接", deviceId, name, serviceId)
    console.log("ryy-devices", this.data.devices)

    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      },
      fail: (res) => {
        console.error("ryy-createBLEConnection-error", res)
        // 异常处理
        this.blueLinkErrHandle()
      },
    })

  },
  closeBLEConnection(callbcak) {
    clearInterval(this.setBlueLinkOut)
    clearInterval(this.loopFirstSend)
    // 关闭蓝牙模块。调用该方法将断开所有已建立的连接并释放系统资源。
    console.log("ryy-closeBLEConnection-this.data.deviceId", this.data.deviceId)
    if (!this.data.deviceId) {
      return
    }
    console.log("ryy-closeBLEConnection-this.data.deviceId2", this.data.deviceId)
    wx.closeBLEConnection({
      deviceId: this.data.deviceId || "",
      success: (res) => {
        console.log("ryy-closeBLEConnection-success", callbcak)
        callbcak && callbcak()
      },
      fail: (err) => {
        //关闭遮罩
        console.log("ryy-closeBLEConnection-fail", err)
        app.hideMask()
      }

    })
    // this.closeBluetoothAdapter()
    
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {
    let that = this
    wx.onBLEConnectionStateChange(function (res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
      if (!res.connected) {
        that.closeBLEConnection()
      }
      // wx.showModal({
      //   title: 'state has changed',
      //   content: res.connected + '',
      // })
    })
    // console.log('ryy-res.services', res.services)
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log("ryy-getBLEDeviceServices", res.services)
        for (let i = 0; i < res.services.length; i++) {
          console.log("ryy-res.services[i]", res.services[i])
          if (res.services[i].isPrimary) {
            if ((res.services[i].uuid).indexOf("FFE0") >-1) {
              // service_id = services[i].uuid;
              console.log("ryy-res.services[i]-FFE0", res.services[i])
              this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
              return
            } else {
              // console.log("ryy-this.data.serviceId", this.data.serviceId)
              // this.getBLEDeviceCharacteristics(deviceId, this.data.serviceId)
              // return
            }

          }
        }
      },
      fail: (err) => {
        console.error('err-getBLEDeviceServices', err)
        // 异常处理
        this.blueLinkErrHandle()
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              success: (res1) => {
                console.log('ryy-read-init-success', res1)
              },
              fail: (err1) => {
                console.error('ryy-read-init-err', err1)
              }
            })
          }
          console.log("item.properties.write", item.properties.write)
          console.log("item.", item, item.uuid.indexOf("FFE1") > -1)
          
          if ((item.properties.notify || item.properties.indicate) && item.uuid.indexOf("FFE1") > -1) {
            console.log('ryy-start-notifyBLECharacteristicValueChange', item)
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
              success: (res) => {
                console.log('ryy--notifyBLECharacteristicValueChange2', res)
                // 解决微信蓝牙 notify 连接未成功问题， 循环write信息，等到能接收到特征值时停止loop
                //  this.loopFirstSend = 
               setTimeout(()=>{
                  if (item.properties.write) {
                    this.setData({
                      canWrite: true
                    })
                    this._deviceId = deviceId
                    this._serviceId = serviceId
                    this._characteristicId = item.uuid
                    // send 由原来的直接发送操作指令修改为先确认钥匙是否在五车仪内再执行操作指令
                    this.ensureKeyAndDevice()
                    // this.loopSendStr()
                  }
                  setTimeout(() => {
                    if(this.firstFetch){
                      return
                    }
                    if (item.properties.write) {
                      this.setData({
                        canWrite: true
                      })
                      this._deviceId = deviceId
                      this._serviceId = serviceId
                      this._characteristicId = item.uuid
                      // send 由原来的直接发送操作指令修改为先确认钥匙是否在五车仪内再执行操作指令
                      this.ensureKeyAndDevice()
                      // this.loopSendStr()
                    }
                  }, 1000)
                },1000)
                

              },
              fail: (res) => {
                console.error('notifyBLECharacteristicValueChange2-err', res)
              }
            })
          }
        }
      },
      fail: (res) => {
        console.error('getBLEDeviceCharacteristics', res)
        // 异常处理
        this.blueLinkErrHandle()
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      // 解决微信蓝牙 notify 连接未成功问题， 第一次write信息反应了之后，停止
      // clearInterval(this.loopFirstSend)
      this.firstFetch=true
      console.log("characteristic-get-onestr", characteristic)
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      
      let onestr = ab2hex(characteristic.value)// 每次返回会回来的16进制命令
      console.log("characteristic-get-onestr2", onestr)
      
      if (onestr && (onestr.substring(0, 2) == "2b")){
        tempStr16 += onestr
        startRecive = true
        console.log("onestr-0d0a-ok1--onestr", onestr, onestr.substring(onestr.length - 4) == "0d0a")
        if (onestr && ((onestr.substring(onestr.length - 4) == "0d0a") || (onestr.substring(onestr.length - 2) == "0d"))) {
          console.log("onestr-0d0a-ok1", onestr)
          isComp = true
        }
      } else if (onestr && ((onestr.substring(onestr.length - 4) == "0d0a") || (onestr.substring(onestr.length - 2) == "0d"))) {
        console.log("onestr-0d0a-ok2", onestr)
        tempStr16 += onestr
        isComp = true
      } else{
        if (startRecive){// 开始接收命令之后的字符串才拼进去
          tempStr16 += onestr
        }
      }
      console.log("onestr-tempStr16", onestr, tempStr16)
      console.log("onestr-tempStr16-hexCharCodeToStr", hexCharCodeToStr(onestr), hexCharCodeToStr(tempStr16))

      if (!isComp) {
        return
      }else{
        str16 = tempStr16
        tempStr16 = ''
        isComp = false
        startRecive = false
      }
      

      console.log("str16-ok!!", str16)
      // if (idx === -1) {
      //   data[`chs[${this.data.chs.length}]`] = {
      //     uuid: characteristic.characteristicId,
      //     value: ab2hex(characteristic.value)
      //   }
      // } else {
      //   data[`chs[${idx}]`] = {
      //     uuid: characteristic.characteristicId,
      //     value: ab2hex(characteristic.value)
      //   }
      // }
      // data[`chs[${this.data.chs.length}]`] = {
      //   uuid: characteristic.characteristicId,
      //   value: ab2hex(characteristic.value),
      //   str: hexCharCodeToStr(ab2hex(characteristic.value))
      // }
      let str = hexCharCodeToStr(str16)
      console.log("characteristic.value== ", characteristic.value, characteristic)
      console.log("str16== ", str, str16)
      if ((str == 'key is ok!' || str16 == '6b6579206973206f6b210d0a' || str16 == '2b4f4b0d0a')) {// 2b4f4b0d0a  =>  +OK
        this.fetchChallengeOk = false
        console.log("str=='key is ok!'")
        // 蓝牙操作完 
        let { list } = this.data
        list[this.nowIndex].is_owner_use = this.is_owner_use == 1 ? '0' : '1'
        // lockPwdIsOK 为true时 则是在这段时间可用  不用再去输手势
        this.setData({ list, lockPwdIsOK: true })
        wx.setStorageSync("localOwnerCar", JSON.stringify(list))

        this.diffLock(1)
        // 断开蓝牙连接
        this.closeBLEConnection()
        //关闭遮罩
        app.hideMask()
        return
      } else {
        this.setData({ lockPwdIsOK: false })
      }
      if (str && (str.split('')[0] == "+")) {
        //这是ios系统检测匹配mac地址，以及五车仪钥匙是否放回判断 以及获取 挑战码
        // if (str == "+OPREQERROR") {
        //   // 说明钥匙不在五车仪内
        //   app.showMsgModal({ content: "请将钥匙放入五车仪中并关好" })
        //   return
        // }
        if ((str.indexOf(',1') > -1) || (str.indexOf(',0') > -1)) {
          let strArr = str.split(',')
          let strMac = strArr[0].replace("+", '')
          let keyState = strArr[1]
          console.log("ryy-strArr", strArr, strMac, keyState)

          let { blue_mac, deviceId } = this.data
          console.log('ryy-strArr-ensureDevice', strMac, blue_mac)
          console.log('ryy-this.data.deviceId', deviceId)

          let that = this
          if (this.platform == 'ios') {
            // 苹果ios系统  先通过名字来判断  最后获取到mac地址  对比是否一致 不一致就断开然后重新连接下一个相同名字的蓝牙
            // deviceId 是当前正连接的设备id  ios返回的是uuid
            if (strMac != blue_mac) {
              this.disableDeviceArr.push(deviceId + "")
              console.log('ryy-this.closeBLEConnection(this.openLock)', deviceId)
              // 断开蓝牙连接  并重新初始化蓝牙连接下一个设备
              this.closeBLEConnection(this.openLock)

              return
            }
          }
          //  else {
          //   // platform == 'android'
          // }

          if (keyState == 0) {
            // 说明钥匙不在五车仪内
            app.showMsgModal({ content: "请将钥匙放入五车仪中并关好" })
            // 断开蓝牙连接
            this.closeBLEConnection()
            return
          }
          // 获取挑战码 钥匙是否在设备中 已判断
          this.ensureKeyAndDevice('AT+OPREQ')
          return
        }

        // if (!this.tiaozhanma){
        //   //没有获取到挑战码则返回
        //   // 断开蓝牙连接
        //   this.closeBLEConnection()
        //   return
        // }
        if (str == " +ERROR" || (str16 == "2b4552524f520d0a") || (str16 == ' 2b4552524f520d0a')) {
          // 说明钥匙不在五车仪内
          app.showMsgModal({ content: "蓝牙操作失败，请确保密码输入正确" })
          // 断开蓝牙连接
          this.closeBLEConnection()
          return
        }
        if (str.indexOf('+CHALLENGE') > -1) {

          this.tiaozhanma = str.replace('+CHALLENGE', '').replace('\r', '').replace('\n', '').replace(' ', '')
          console.log("str.indexOf('+CHALLENGE')", str, this.tiaozhanma)
          // 获取到了挑战码
          this.fetchChallengeOk = true
          // 发送开关锁指令
          this.loopSendStr()
        }

      }
      if (str == 'keyError' || str16 == '6b65794572726f720d0a') {
        console.log("str=='keyError'")
        // 断开蓝牙连接
        this.closeBLEConnection()
        app.showMsgModal({ content: '蓝牙操作失败，请重试' })
        return
      }
      this.setData(data)
    })
  },
  /**
   * 这是ios系统检测匹配mac地址，以及五车仪钥匙是否放回判断
   * ### 7获取蓝牙状态  命令码：AT+WCGETSTATUS  蓝牙返回mac地址，钥匙在不在,最后一个字母1表示在，0标识不在，
   * 返回+50:F1:4A:53:8A:A3,1
   */
  ensureKeyAndDevice(codStr) {
    let str = codStr || 'AT+WCGETSTATUS'
    console.log("ensure-str:", str)
    let buffer = string2buffer(str, true)
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: buffer,
      success: (res) => {
        console.log('success-ensureKeyAndDevice', res)
      },
      fail: (err) => {
        console.error('err-ensureKeyAndDevice', err)
        app.showMsgModal({ content: '蓝牙数据发送失败，请重试' })
        //关闭遮罩
        app.hideMask()
      }
    })
  },
  loopSendStr() {
    // let str = '152VmkCR2r7A5FB6VkIimwjIHwvbEWLAacabsQ6_T73kGQF8HqbEybppmBVtlSd9CnhD6PO7qtW1a9E7IEXQXmEcDgivxhioqlNIU133neSjWp1+hyigmrpTSUxny9FbiXcltsap_rggM69Cj_oHdF3sQ=='
    let { wcyIsOpenState, } = this.data
    // wcyIsOpenState = wx.getStorageSync('wcyIsOpenState')
    // 发送“解锁开锁密码” AT+UNLOCK+KEY\n 或者 AT+LOCK+KEY\n KEY的算法是base64_encode(MD5(挑战码 + deviceId + UUID + 九宫格))
    // let tempKy = this.tiaozhanma + "505393230" + "a069b3b31e9f4f79877ff610420889f4" + '12345'
    let tempKy = this.tiaozhanma + this.wcynumber + this.userid + this.data.lockPwd
    console.log("ryy-tempKy", tempKy)
    let tmp = tempKy.MyMD5(32)
    console.log("ryy-tempKy2", tmp)
    // tempKy = md5
    let str = ''
    if (this.is_owner_use == 1) {
      // this.is_owner_use=1 是车主正在使用 已解锁了  现在需要落锁
      str = "AT+LOCK+" + tmp + ""
    } else {
      str = "AT+UNLOCK+" + tmp + ""
    }


    let loopNum = Math.ceil(str.length / 20)
    console.log('loopNum', loopNum)
    let strArr = []
    for (let i = 0; i < loopNum; i++) {
      console.log('nowStr', nowStr)
      let nowStr = str.substring(i * 20, i * 20 + 20)
      console.log('nowStr', nowStr)
      strArr.push(nowStr)
      // strArr = str.split(20)
    }
    if (strArr[strArr.length - 1].length == 20) {
      strArr.push('')
    }
    console.log("loopSendStr", strArr)
    this.sendNum = 0
    this.writeBLECharacteristicValue(strArr)
  },
  writeBLECharacteristicValue(strArr) {
    var that = this
    if (strArr.length <= this.sendNum) {
      // 当本次数据发送完毕之后 断开与设备的连接
      wx.closeBLEConnection()
      return
    }
    let str = strArr[this.sendNum]
    let addEnter = false
    if ((strArr.length - 1) == this.sendNum) {
      // 最后一次命令带上\n 表示结束
      addEnter = true
    }
    let buffer = string2buffer(str, addEnter)
    // let buffer = new ArrayBuffer(str.length)
    // let dataView = new DataView(buffer)
    // dataView.setUint8(0, str.length)
    console.log("buffer :" + buffer);
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: buffer,
      success: (res) => {
        console.log('success-writeBLECharacteristicValue', res)
        that.sendNum++
        that.writeBLECharacteristicValue(strArr)


      },
      fail: (err) => {
        console.error('err-writeBLECharacteristicValue', err)
        app.showMsgModal({ content: '蓝牙数据发送失败，请重试' })
        //关闭遮罩
        app.hideMask()
      }
    })
  },
  /**
   * 关闭蓝牙模块。调用该方法将断开所有已建立的连接并释放系统资源。
   */
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
  },
  /* 蓝牙模块函数 --END */
})

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
// 十六进制转换为字符串
function hexCharCodeToStr(hexCharCodeStr) {
  var trimedStr = hexCharCodeStr.trim();
  var rawStr =
    trimedStr.substr(0, 2).toLowerCase() === "0x"
      ?
      trimedStr.substr(2)
      :
      trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    alert("Illegal Format ASCII Code!");
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    resultStr.push(String.fromCharCode(curCharCode));
  }
  return resultStr.join("");
}
//字符串转ArrayBuffer
function string2buffer(str, addEnter) {
  // 首先将字符串转为16进制
  let val = ""
  for (let i = 0; i < str.length; i++) {
    if (val === '') {
      val = str.charCodeAt(i).toString(16)
    } else {
      val += ',' + str.charCodeAt(i).toString(16)
    }
  }
  if (addEnter) {
    if (val === '') {
      val += '0A'
    } else {
      val += ',0A'
    }
  }
  console.log("string2buffer-val", val)
  // 将16进制转化为ArrayBuffer
  return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  })).buffer
}