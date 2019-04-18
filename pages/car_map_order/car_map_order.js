let app = getApp()
var amapFile = require('../../libs/amap-wx.js');
var myAmapFun = app.globalData.myAmapFun

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
    page: 3,//page=3确认用车页面，page=4 正在用车页面
    longitude: 116.397390,
    latitude: 39.908860,
    markers: [],
    topText: ' ',
    scale: 18,
    lastLongitude: 0,
    lastLatitude: 0,
    polyline: [],
    distanceArr: [],
    kinshipuse_id: "",
    maintenance_id: "",
    expressuse_id: "",
    /* 0 */
    list: [],
    currentIndex: 0,
    cardRightIn: false,
    cardLeftIn: false,
    centerShow: false,
    carLocal:{},
    infoData:{},
    wcy_msg:{},
    lockFlag: 0,//是否在待机状态(0不是 1是 2订单未结算)
    rent_time:"",
    rent_time_txt:"",
    loopRun: true,

    /* 蓝牙操作变量 */
    devices: [],
    connected: false, // 当前蓝牙连接状态
    chs: [],
    blue_mac: '', 
    blue_deviceId: '',
    blue_keys: [], // 所有的key
    blue_keys_open: [],// 开锁的key
    blue_keys_lock: [],// 关锁的key
    openIndex: 0, // 当前可开锁的key的下标
    lockIndex: 0, // 当前可关锁的key的下标
    wcyIsOpenState: false, // 当前五车仪是开锁状态（true）,关锁状态（false）
    // linkBlueTime: 4, // 连接蓝牙时间超时就不再连接蓝牙
    // ridersBlueInfo // 代表最新存的车友key 存在local里
    // ridersBlueGettime // 代表最新存的车友key获取的时间 存在local里

    // ownerBlueInfo // 代表最新存的车主key 存在local里
    // ownerBlueGettime // 代表最新存的车主key获取的时间 存在local里
    /* 蓝牙操作变量 --END */

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.options = options
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
    console.log('map_onShow--')
    this.setData({ page: this.options.page || '3' })
    // ios系统 相同名字匹配但mac地址不匹配的deviceId
    this.disableDeviceArr = []

    if (this.options.page==4) {
      clearInterval(this.setInterInit)
      // 用车时 20秒刷新一次
      this.init(this.options)
      this.judgeState()
      this.setInterInit = setInterval(() => {
        this.init(this.options)
        this.judgeState()
      }, 20000);
    }else{

      this.init(this.options)
      this.judgeState()
    }
    
    
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.setData({loopRun:false})
    //清除计时器  即清除setInter
    clearInterval(this.setInterDian)
    // 清楚蓝牙连接超时计时器
    clearInterval(this.setBlueLinkOut)
    // 用车时 20秒刷新一次 清空
    clearInterval(this.setInterInit)
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    this.setData({ loopRun: false })
    //清除计时器  即清除setInter
    clearInterval(this.setInterDian)
    // 清楚蓝牙连接超时计时器
    clearInterval(this.setBlueLinkOut)
    // 用车时 20秒刷新一次 清空
    clearInterval(this.setInterInit)
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
  // onShareAppMessage() { },
  /**
   * 页面滚动时触发
   */
  onPageScroll() { },
  /* 自定义函数 */
  goPage(e){
    let tampPath = e.currentTarget.dataset.path
    let tampPage = e.currentTarget.dataset.page
    console.log('e123', tampPath + '?page=' + tampPage)
    if(tampPage){
      wx.redirectTo({
        url: tampPath + '?page=' + tampPage,
      })
      // this.setData({
      //   page: tampPage
      // })
      return
    }
    wx.navigateTo({
      url: tampPath
    })
  },
  goCancel(e){
    
    if (this.options.order_id) {// 普通车友取消订单
      wx.navigateTo({
        url: "/pages/car_cancelorder/car_cancelorder?car_id=" + (this.options.car_id || this.data.infoData.car_id) + "&order_id=" + (this.options.order_id || this.data.infoData.order_id)
      })
    } else {// 亲情号,维保号，快递号取消订单
      wx.showModal({
        title: '提示',
        content: '您确定取消用车？',
        success: (resp) => {
          if (resp.confirm) {
            console.log('用户点击确定')
            let { infoData } = this.data
            if (this.options.kinshipuse_id) {// 亲情号取消订单
              app.xcxPost({
                // 亲情号取消订单
                url: "/manager/rider/kinshipCancelUseCar.do",
                data: {
                  car_id: this.options.car_id || infoData.car_id || "",
                  kinshipuse_id: this.options.kinshipuse_id,
                },
                success: res => {
                  app.successMsg({ title: res.errmsg + "" })
                  setTimeout(() => {
                    wx.reLaunch({
                      url: "/pages/index/index"
                    })
                  }, 1000);
                }
              })
            } else if (this.options.maintenance_id) {// 维保号取消订单
              app.xcxPost({
                // 维保号取消订单
                url: "/manager/rider/maintenanceCancelUseCar.do",
                data: {
                  car_id: this.options.car_id || infoData.car_id || "",
                  maintenance_id: this.options.maintenance_id,
                },
                success: res => {
                  app.successMsg({ title: res.errmsg + "" })
                  setTimeout(() => {
                    wx.reLaunch({
                      url: "/pages/index/index"
                    })
                  }, 1000);
                }
              })
            } else if (this.options.expressuse_id) {// 快递号取消订单
              app.xcxPost({
                // 快递号取消订单
                url: "/manager/rider/expressCancelUseCar.do",
                data: {
                  car_id: this.options.car_id || infoData.car_id || "",
                  expressuse_id: this.options.expressuse_id,
                },
                success: res => {
                  app.successMsg({ title: res.errmsg + "" })
                  setTimeout(() => {
                    wx.reLaunch({
                      url: "/pages/index/index"
                    })
                  }, 1000);
                }
              })
            }
            
          } else if (resp.cancel) {

          }
        },
        fail: () => {
          console.log('fail')
        }
      })
    }
  },
  // 获取经纬度
  fetchLat() {
    let that = this
    app.xcxPost({
      url: "/manager/rider/getNewLonAndLat.do",
      data: {
        car_id: this.options.car_id || this.data.infoData.car_id,
      },
      success: res => {
        let _data = res.data || []
        if (!_data.lon || !_data.lat){
          if (this.data.page == 3) {// 确认用车，但还未解锁时，获取不到经纬度报错（获取不到经纬度可能是五车仪关闭了）其他状态不需要提示 之后有加其他需要获取经纬度状态时，在另加判断、提示
            app.showMsgModal({content:'经纬度获取失败，请取消用车并重试'})
          }
          return
        }
        let localtxt = _data.lon + "," + _data.lat
        myAmapFun.getRegeo({
          // location: "longitude,latitude",
          location: localtxt || "",
          success: function (data) {
            let { carLocal ,page} = that.data
            carLocal.lon = _data.lon
            carLocal.lat = _data.lat
            carLocal.name = data[0].name
            //成功回调
            that.setData({
              carLocal
            })
            if (page!=4){
              that.tocreate()
            }
            
          },
          fail: function (info) {
            //失败回调
            console.log(info)
          }
        })
      }
    })
  },
  
  init(options) {
    let car_id = this.options.car_id
    let user_owner_id = this.options.user_owner_id || ''
    // order_id  代表是普通车友用车
    let order_id = this.options.order_id || ''
    // kinshipuse_id存在时  代表是亲情号用车
    let kinshipuse_id = this.options.kinshipuse_id || ''
    // maintenance_id存在时  代表是维保号用车
    let maintenance_id = this.options.maintenance_id || ''
    // expressuse_id存在时  代表是快递号用车
    let expressuse_id = this.options.expressuse_id || ''
    this.setData({
      order_id,
      kinshipuse_id,
      maintenance_id,
      expressuse_id,
      markers: [],
    })
    console.log('map-init--', user_owner_id)
    if (user_owner_id) {
      console.log('map-init--user_owner_id', user_owner_id)
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
          let {rent_time, rent_time_txt} = this.data
          if (_data.rent_time) {
            
            rent_time = _data.rent_time
            rent_time_txt = app.minFormatSeconds(_data.rent_time)
          }
          _data.car_info.forEach((ele) => {
            ele.car_image = app.globalData.domain + ele.image
          })
          if (_data.user_info && _data.user_info.real_name) {
            let real_name = _data.user_info.real_name
            let sex = _data.user_info.sex
            _data.user_info.real_name_txt = real_name.split('')[0]
            _data.user_info.real_name_txt += (sex == 2) ? '女士' : '先生'
          }
          this.setData({
            infoData: _data,
            rent_time,
            rent_time_txt,
            loopRun: true,
            lockFlag: _data.is_await || _data.is_lock||0,
            domain: app.globalData.domain
          })
          //初始化当前开解锁状态
          let {page, lockFlag} = this.data
          console.log("ryy-lockFlag", lockFlag, page)
          if (page==3) {
            // 解锁页面 当前应该是待解锁状态 未打开
            wx.setStorageSync('wcyIsOpenState', false)
          } else if (page == 4 && lockFlag==0) {
            // 当前应该是待机落锁状态 已打开
            wx.setStorageSync('wcyIsOpenState', true)
          } else if (page == 4 && lockFlag == 1) {
            // 当前应该是行车解锁状态  未打开
            wx.setStorageSync('wcyIsOpenState', false)
          }

          this.fetchLat()
          this.fetchDianc()
          // 定时获取电量和钥匙状态
          this.interDian()
          // 倒计时
          this.loopMinTime()
          
          // 获取蓝牙的key
          this.fetchBlueKeyInfo()
        }
      })
    }
    
    // console.log('-init', options)
    wx.showLoading({
      title: '加载中',
    })
    //获取位置信息
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        let longitude = res.longitude;
        let latitude = res.latitude;
        this.setData({
          longitude,
          latitude
        })
        wx.hideLoading();
      },
      fail:(err)=>{
        wx.hideLoading();
      }
    })
  },
  judgeState(){
    app.xcxPost({
      // 判断用户车辆状态
      url: "/manager/rider/judgeUseOrder.do",
      data: {},
      success: resp => {
        let _data = resp.data || {}
        if (_data.is_order_unsettle == 1) {// 有无未结算的订单（0没有 1有）
          // wx.redirectTo({
          //   url: "/pages/car_cancelorder/car_cancelorder?page=2&id=" + _data.settle_info.id + "&order_id=" + _data.settle_info.order_id
          // });
          return
        }
        if (_data.is_order_unlock == 1) { // 有无确认用车但是还没有解锁也没有自动取消的订单（0没有 1有）
          return
        }
        if (_data.is_order_underway == 1) {// 有无正在进行中的订单（0没有 1有）
          return
        }
        if (_data.is_kinship_affirm == 1) {// 有无未亲情号确认用车但是未解锁的订单（0没有 1有）
          return
        }
        if (_data.is_kinship_driving == 1) {// 有无未亲情号已经解锁车辆进行中的订单（0没有 1有）
          return
        }
        if (_data.is_maintenance_affirm == 1) {// 有无未维保号确认用车但是未解锁的订单（0没有 1有）
          return
        }
        if (_data.is_maintenance_driving == 1) {// 有无未维保号已经解锁车辆进行中的订单（0没有 1有）
          return
        }
        if (_data.is_express_affirm == 1) {// 有无未快递号确认用车但是未解锁的订单（0没有 1有）
          return
        }
        if (_data.is_express_driving == 1) {// 有无未维保号已经解锁车辆进行中的订单（0没有 1有）
          return
        }
        //在进行中页面按返回键时 判断是否有未处理的订单，如果没有就跳转到首页
        wx.reLaunch({
          url: '/pages/index/index',
        })

      }
    })
  },
  interDian(){
    //将计时器赋值给setInterDian
    this.setInterDian = setInterval(()=> {
      this.fetchDianc();
    }
    , 5000);
  },
  fetchDianc(){
    let user_owner_id = this.options.user_owner_id || ''
    // order_id  代表是普通车友用车
    let order_id = this.options.order_id || ''
    // kinshipuse_id存在时  代表是亲情号用车
    let kinshipuse_id = this.options.kinshipuse_id || ''
    // maintenance_id存在时  代表是维保号用车
    let maintenance_id = this.options.maintenance_id || ''
    // expressuse_id存在时  代表是快递号用车
    let expressuse_id = this.options.expressuse_id || ''
    app.xcxPost({
      //获取电池电量及钥匙
      url: "/manager/rider/getCarBattNew.do",
      mask:'hidden',// 不显示遮罩
      data: {
        order_id,
        user_owner_id,
        kinshipuse_id,
        maintenance_id,
        expressuse_id,
      },
      success: res => {
        let _data = res.data
        console.log("_data", _data)
        // wx.showToast({
        //   title: "钥匙状态："+_data.wcy_msg.key_inside+"getCarBattNew.do!电量：" + _data.wcy_msg.batt,
        //   icon: 'none',
        //   mask: true,
        //   duration: 2000
        // });
        this.setData({
          wcy_msg: _data.wcy_msg
        })
      }
    })
  },
  loopMinTime(){
    if (this.data.loopRun) {
      let { rent_time, rent_time_txt } = this.data
      // console.log("rent_time", rent_time)
      rent_time -= 1000
      setTimeout(() => {
        if (rent_time > 1000) {
          rent_time_txt = app.minFormatSeconds(rent_time)
          this.setData({
            rent_time,
            rent_time_txt,
          })
          this.loopMinTime()
        } else {
          this.setData({
            rent_time: 0,
            rent_time_txt: 0,
          })
        }
      }, 1000);
    }
  },
  //复位按钮  已完成
  toReset() {
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
      }, 1000)
    })

  },
  // 跳转到个人中心
  toUser() {
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
  //经纬度数据显示当前车辆
  tocreate() {
    let {carLocal , page} = this.data;
    let temp = {}
    temp.iconPath = "/images/select.png"
    temp.width = 22
    temp.height = 34
    temp.title = "终点"
    temp.id="0"
    temp.longitude= carLocal.lon
    temp.latitude= carLocal.lat
    this.setData({
      markers:[temp]
    })
    if (page!=4){
      // page=4 是进行中页面 不需要路线规划
      this.route(temp)
    }
  },
  toVisit(e) {
    route(this.data.markers[0])
  },
  route(bic) {
    // 获取当前中心经纬度（目前未使用 上线可去掉）
    let { latitude, longitude} = this.data
    this.mapCtx.getCenterLocation({
      success: (res) => {
        // 调用高德地图步行路径规划API
        myAmapFun.getWalkingRoute({
        // 驾车路线规划
        // myAmapFun.getDrivingRoute({
          origin: `${longitude},${latitude}`,
          destination: `${bic.longitude},${bic.latitude}`,
          success: (data) => {
            console.log("data.paths", data)
            
            let points = [];
            if (data.paths && data.paths[0] && data.paths[0].steps) {
              let { carLocal } = this.data;
              let _distance_txt = '',
                  _duration_txt='',
                  _distance = data.paths[0].distance ,
                  _duration = data.paths[0].duration
              if (parseInt(_distance / 1000)>1){
                _distance_txt = parseInt(_distance / 1000).toFixed(1)+'公里'
              }else{
                _distance_txt = parseInt(_distance).toFixed(1) + '米'
              }
              _duration_txt = parseInt(_duration / 60).toFixed(0)+'分钟'
              carLocal.distance_txt = _distance_txt
              carLocal.duration_txt = _duration_txt
              this.setData({
                carLocal
              })

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
  cancelOrder(){
    let car_id = this.options.car_id
    let order_id = this.options.order_id
    wx.navigateTo({
      url: "/pages/car_cancelorder/car_cancelorder?car_id=" + car_id + "&order_id=" + this.data.infoData.order_id
    });
    
  },
  goCheckImg(){
    let user_owner_id = this.options.user_owner_id || ""
    let order_id = this.options.order_id || ""
    let kinshipuse_id = this.options.kinshipuse_id || ""
    // maintenance_id存在时  代表是维保号用车
    let maintenance_id = this.options.maintenance_id || ''
    // expressuse_id存在时  代表是快递号用车
    let expressuse_id = this.options.expressuse_id || ''
    let page=''
    if (this.options.order_id) {// 普通车友可上传车辆核对照片
      page=1
    } else if (this.options.kinshipuse_id) {// 亲情号可查看车辆图片
      
    }
    wx.navigateTo({
      url: "/pages/car_waiguan/car_waiguan?page=" + page + "&user_owner_id=" + user_owner_id + "&order_id=" + order_id + "&kinshipuse_id=" + kinshipuse_id + "&maintenance_id=" + maintenance_id + "&expressuse_id=" + expressuse_id
    })
  },
  callPhone(e){
    let phone = e.currentTarget.dataset.phone||""
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  daohang(){
    let {carLocal} = this.data
    wx.openLocation({
      latitude: Number(carLocal.lat),
      longitude: Number(carLocal.lon),
      name: carLocal.name,
      scale: 28
    })
  },
  
  goWenben(e) {
    let page = e.currentTarget.dataset.page || ""
    wx.navigateTo({
      url: '/pages/my_GSJS/my_GSJS?page=' + page,
    })
  },
  uploadVid(){
    let { maintenance_id, expressuse_id } = this.options
    let { page } = this.data
    wx.navigateTo({
      url: '/pages/car_upvideo/car_upvideo?page=' + page + "&maintenance_id=" + (maintenance_id||'') + "&expressuse_id=" + (expressuse_id||'')
    })
  },
  // 解锁
  goUnlock(e) {
    let { maintenance_id, expressuse_id} = this.options
    let { is_before_video, is_after_video} = this.data.infoData
    if (maintenance_id || expressuse_id) {//maintenance_id 存在当前就是维保操作//expressuse_id存在当前就是快递操作
      if (is_before_video!=1) {
        app.showMsgModal({content:"请先上传用车视频"})
        return
      }
    }
    
    // nowClickBtn=1确认解锁，=2待机落锁，=3行车解锁，=4还车（用来发送不同请求）
    this.nowClickBtn = 1

    if (this.data.connected) {
      // 在连接状态
      // this.loopSendStr()
    } else {
      this.openLock()
    }
    return
  },
  // 解锁之后需要发送数据给后端  同步
  goUnlockInterface(is_unlock_lanya) {

    let { carLocal, infoData } = this.data
    if (this.options.order_id) {// 普通车友车辆解锁
      app.xcxPost({
        url: "/manager/rider/unlockCar.do",
        data: {
          car_id: this.options.car_id || infoData.car_id || "",
          order_id: this.options.order_id || infoData.order_id || "",
          start_place: carLocal.name,
          start_place_lon: carLocal.lon,
          start_place_lat: carLocal.lat,
          is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
        },
        success: res => {
          let _data = res.data || []
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            wx.redirectTo({
              url: "/pages/car_map_order/car_map_order?page=4&car_id=" + (this.options.car_id || this.data.infoData.car_id) + "&order_id=" + this.data.infoData.order_id + "&user_owner_id=" + this.options.user_owner_id
            })
          }, 1000);
        }
      })
    } else if (this.options.kinshipuse_id) {// 亲情号车辆解锁
      app.xcxPost({
        url: "/manager/rider/kinshipUnlockCar.do",
        data: {
          car_id: this.options.car_id || infoData.car_id || "",
          kinshipuse_id: this.options.kinshipuse_id || infoData.kinshipuse_id || "",
          is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
        },
        success: res => {
          let _data = res.data || []
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            wx.redirectTo({
              url: "/pages/car_map_order/car_map_order?page=4&car_id=" + (this.options.car_id || this.data.infoData.car_id) + "&kinshipuse_id=" + (this.options.kinshipuse_id || infoData.kinshipuse_id) + "&user_owner_id=" + this.options.user_owner_id
            })
          }, 1000);
        }
      })
    } else if (this.options.maintenance_id) {// 维保号车辆解锁
      app.xcxPost({
        url: "/manager/rider/maintenanceUnlockCar.do",//维保号解锁车辆
        data: {
          car_id: this.options.car_id || infoData.car_id || "",
          maintenance_id: this.options.maintenance_id || infoData.maintenance_id || "",
          is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
        },
        success: res => {
          let _data = res.data || []
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            wx.redirectTo({
              url: "/pages/car_map_order/car_map_order?page=4&car_id=" + (this.options.car_id || this.data.infoData.car_id) + "&maintenance_id=" + (this.options.maintenance_id || infoData.maintenance_id) + "&user_owner_id=" + this.options.user_owner_id
            })
          }, 1000);
        }
      })
    } else if (this.options.expressuse_id) {// 快递号车辆解锁
      app.xcxPost({
        url: "/manager/rider/expressUnlockCar.do",//快递号解锁车辆
        data: {
          car_id: this.options.car_id || infoData.car_id || "",
          expressuse_id: this.options.expressuse_id || infoData.expressuse_id || "",
          is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
        },
        success: res => {
          let _data = res.data || []
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            wx.redirectTo({
              url: "/pages/car_map_order/car_map_order?page=4&car_id=" + (this.options.car_id || this.data.infoData.car_id) + "&expressuse_id=" + (this.options.expressuse_id || infoData.expressuse_id) + "&user_owner_id=" + this.options.user_owner_id
            })
          }, 1000);
        }
      })
    }
  },
  // 待机落锁-行车解锁
  goWaitlock(is_unlock_lanya) {
    let { lockFlag } = this.data
    // nowClickBtn=1确认解锁，=2待机落锁，=3行车解锁，=4还车（用来发送不同请求）
    if (lockFlag == 0) {//待机落锁
      this.nowClickBtn = 2
    } else if (lockFlag == 1) {//行车解锁
      this.nowClickBtn = 3
    }
    if (this.data.connected) {
      // 在连接状态
      this.loopSendStr()
    }else{
      this.openLock()
    }
    return
  },
  // 待机落锁-行车解锁 发送请求
  goWaitlockInterface(is_unlock_lanya) {

    let { lockFlag } = this.data
    if (lockFlag == 0) {//待机落锁
      let { infoData } = this.data
      if (this.options.order_id) {// 普通车友车辆解锁
        app.xcxPost({
          url: "/manager/rider/standByMode.do",
          data: {
            car_id: this.options.car_id || infoData.car_id || "",
            order_id: this.options.order_id,
            is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
          },
          success: res => {
            this.setData({
              lockFlag: 1
            })
            app.successMsg({ title: res.errmsg + "" })
          }
        })
      } else if (this.options.kinshipuse_id) {// 亲情号待机落锁
        app.xcxPost({
          // 亲情号待机落锁
          url: "/manager/rider/kinshipStandByMode.do",
          data: {
            car_id: this.options.car_id || infoData.car_id || "",
            kinshipuse_id: this.options.kinshipuse_id,
            is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
          },
          success: res => {
            this.setData({
              lockFlag: 1
            })
            app.successMsg({ title: res.errmsg + "" })
          }
        })
      } else if (this.options.maintenance_id) {// 维保号待机落锁
        app.xcxPost({
          // 维保号待机落锁
          url: "/manager/rider/maintenanceStandByMode.do",
          data: {
            car_id: this.options.car_id || infoData.car_id || "",
            maintenance_id: this.options.maintenance_id,
            is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
          },
          success: res => {
            this.setData({
              lockFlag: 1
            })
            app.successMsg({ title: res.errmsg + "" })
          }
        })
      } else if (this.options.expressuse_id) {// 快递号待机落锁
        app.xcxPost({
          // 快递号待机落锁
          url: "/manager/rider/expressStandByMode.do",
          data: {
            car_id: this.options.car_id || infoData.car_id || "",
            expressuse_id: this.options.expressuse_id,
            is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
          },
          success: res => {
            this.setData({
              lockFlag: 1
            })
            app.successMsg({ title: res.errmsg + "" })
          }
        })
      }
    } else if (lockFlag == 1) {//行车解锁

      let { infoData } = this.data
      if (this.options.order_id) {// 普通车友车辆行车解锁
        app.xcxPost({
          url: "/manager/rider/drivingUnlock.do",
          data: {
            car_id: this.options.car_id || infoData.car_id || "",
            order_id: this.options.order_id,
            is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
          },
          success: res => {
            this.setData({
              lockFlag: 0
            })
            app.successMsg({ title: res.errmsg + "" })
          }
        })
      } else if (this.options.kinshipuse_id) {// 亲情号行车解锁
        app.xcxPost({
          // 亲情号行车解锁
          url: "/manager/rider/kinshipDrivingUnlock.do",
          data: {
            car_id: this.options.car_id || infoData.car_id || "",
            kinshipuse_id: this.options.kinshipuse_id,
            is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
          },
          success: res => {
            this.setData({
              lockFlag: 0
            })
            app.successMsg({ title: res.errmsg + "" })
          }
        })
      } else if (this.options.maintenance_id) {// 维保号行车解锁
        app.xcxPost({
          // 维保号行车解锁
          url: "/manager/rider/maintenanceDrivingUnlock.do",
          data: {
            car_id: this.options.car_id || infoData.car_id || "",
            maintenance_id: this.options.maintenance_id,
            is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
          },
          success: res => {
            this.setData({
              lockFlag: 0
            })
            app.successMsg({ title: res.errmsg + "" })
          }
        })
      } else if (this.options.expressuse_id) {// 快递号行车解锁
        app.xcxPost({
          // 快递号行车解锁
          url: "/manager/rider/expressDrivingUnlock.do",
          data: {
            car_id: this.options.car_id || infoData.car_id || "",
            expressuse_id: this.options.expressuse_id,
            is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
          },
          success: res => {
            this.setData({
              lockFlag: 0
            })
            app.successMsg({ title: res.errmsg + "" })
          }
        })
      }
    }
  },
  // 我要还车
  backCar(e) {
    let user_owner_id = this.options.user_owner_id || ""
    let order_id = this.options.order_id || ""
    let kinshipuse_id = this.options.kinshipuse_id || ""

    let { maintenance_id, expressuse_id } = this.options
    let { is_before_video, is_after_video } = this.data.infoData
    if (maintenance_id || expressuse_id) {//maintenance_id 存在当前就是维保操作//expressuse_id存在当前就是快递操作
      if (is_after_video != 1) {
        app.showMsgModal({ content: "请先上传还车视频" })
        return
      }
    }
    if (this.options.order_id) {// 普通车友我要还车
      wx.navigateTo({
        url: "/pages/car_returncar/car_returncar?page=1&car_id=" + (this.options.car_id || this.data.infoData.car_id) + "&user_owner_id=" + user_owner_id + "&order_id=" + order_id + "&kinshipuse_id=" + kinshipuse_id
      })
    } else {// 亲情号,维保号，快递号我要还车
      wx.showModal({
        title: '提示',
        content: '您确定要还车？',
        success: (resp) => {
          if (resp.confirm) {
            console.log('用户点击确定')
            let wcyIsOpenState = wx.getStorageSync('wcyIsOpenState')
            let { lockFlag } = this.data
            if (lockFlag == 1) { //lockFlag == 1 是否在待机状态(0不是 1是 2订单未结算)
              // 在待机状态点击我要还车 当前已上锁则直接发送请求 不再执行蓝牙操作
              this.backCarKinship(1)
              return
            }
            // nowClickBtn=1确认解锁，=2待机落锁，=3行车解锁，=4还车（用来发送不同请求）
            this.nowClickBtn = 4 
            // 蓝牙解锁 
            if (this.data.connected) {
              // 在连接状态
              this.loopSendStr()
            }else{
              this.openLock()
            }

          } else if (resp.cancel) {

          }
        },
        fail: () => {
          console.log('fail')
        }
      })
    }

  },
  /**
   * 亲情号,维保号，快递号 还车发送请求
   */
  backCarKinship(is_unlock_lanya){
    let { infoData } = this.data
    if (this.options.kinshipuse_id) { //亲情号还车发送请求
      app.xcxPost({
        // 亲情号还车落锁
        url: "/manager/rider/kinshipReturnTheCarLock.do",
        data: {
          car_id: this.options.car_id || infoData.car_id || "",
          kinshipuse_id: this.options.kinshipuse_id,
          is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
        },
        success: res => {
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            wx.reLaunch({
              url: "/pages/index/index"
            })
          }, 1000);
        }
      })
    } else if (this.options.maintenance_id) { //维保号还车落锁
      app.xcxPost({
        // 维保号还车落锁
        url: "/manager/rider/maintenanceReturnTheCarLock.do",
        data: {
          car_id: this.options.car_id || infoData.car_id || "",
          maintenance_id: this.options.maintenance_id,
          is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
        },
        success: res => {
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            wx.reLaunch({
              url: "/pages/index/index"
            })
          }, 1000);
        }
      })
    } else if (this.options.expressuse_id) { //快递号还车落锁
      app.xcxPost({
        // 快递号还车落锁
        url: "/manager/rider/expressReturnTheCarLock.do",
        data: {
          car_id: this.options.car_id || infoData.car_id || "",
          expressuse_id: this.options.expressuse_id,
          is_unlock_lanya: is_unlock_lanya || '0' // 是否是蓝牙解锁（0不是 1是）
        },
        success: res => {
          app.successMsg({ title: res.errmsg + "" })
          setTimeout(() => {
            wx.reLaunch({
              url: "/pages/index/index"
            })
          }, 1000);
        }
      })
    }
    
  },
  /**
   * 不同状态下的 开关锁发送请求
   * 传入值=1 是蓝牙操作之后发送的请求，其他是正常请求开关锁
   * @param {0,1} is_unlock_lanya 
   */
  diffLock(is_unlock_lanya){
    // this.nowClickBtn=1确认解锁，=2待机落锁，=3行车解锁，=4还车（用来发送不同请求）
    if (this.nowClickBtn == 1) {
      this.goUnlockInterface(is_unlock_lanya)
    } else if (this.nowClickBtn == 2 || (this.nowClickBtn == 3)) {

      this.goWaitlockInterface(is_unlock_lanya)
    } else if (this.nowClickBtn == 4) {
      this.backCarKinship(is_unlock_lanya)
    }
  },
  /* 蓝牙模块函数 --START*/
  fetchBlueKeyInfo(){
    let orderId = '', type = '' //订单类型(1车友订单 2亲情号订单 3维保号订单 4快递号订单)
    let { order_id, kinshipuse_id, maintenance_id, expressuse_id} = this.options
    if (order_id) {
      orderId = order_id
      type = 1
    } else if (kinshipuse_id) {
      orderId = kinshipuse_id
      type = 2
    } else if (maintenance_id) {
      orderId = maintenance_id
      type = 3
    } else if (expressuse_id) {
      orderId = expressuse_id
      type = 4
    }
    app.xcxPost({
      url: "/manager/rider/confirmUseCarLanYa.do",
      data: {
        car_id: this.options.car_id || this.data.infoData.car_id,
        user_owner_id:this.options.user_owner_id,
        order_id: orderId,
        type
      },
      success: res => {
        let _datastr = res.data || "{}"
        let _data = JSON.parse(_datastr)
        console.log("mac-msg", _data, res)
        let blue_keys_open = [], blue_keys_lock = []
        _data.keys .forEach(ele => {
          if (ele.op == 'open') {
            blue_keys_open.push(ele)
          }
          if (ele.op == 'lock') {
            blue_keys_lock.push(ele)
          }
        });
        this.setData({
          blue_mac: _data.MAC,
          blue_deviceId: _data.deviceId,
          blue_keys: _data.keys || [],
          blue_keys_open,
          blue_keys_lock,
          openIndex:0,
          lockIndex:0,
        })
      }
    })
  },
  openLock() {
    wx.showLoading({ mask: true, title: "" });
    this.blueConnectNum = 5  // 蓝牙尝试连接的次数
    
    this.linkBlueTime = 12 // 蓝牙尝试连接的时间

    // 解决微信蓝牙 notify 连接未成功问题， 第一次write信息反应了之后，停止
    this.firstFetch = false

    this.openBluetoothAdapter()
    //将计时器赋值给setInterDian
    this.setBlueLinkOut = setInterval(() => {
      this.linkBlueTime--
      console.log("setBlueLinkOut", this.linkBlueTime)
      if (this.linkBlueTime<1) {
        clearInterval(this.setBlueLinkOut)
      }
    }, 1000);
  },
  /**
   * 蓝牙连接失败的异常处理
   */
  blueLinkErrHandle(){
    /// 如果连接失败 再次尝试连接 连接次数用完之后还连接失败 本次就不再连接蓝牙
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
    app.showMask()
    console.log('ryy-scan')
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        console.log('openBluetoothAdapter-ERR', res)
        if (res.errCode == 10001) {
          wx.onBluetoothAdapterStateChange( (res) =>{
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            } else {
              
            }
          })
          
          if (this.blueConnectNum == 0) {
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
      success:(res)=>{
        this.isDiscovering = res.isDiscovering
        console.log('ryy-STOP-stopBluetoothDevicesDiscovery-success', res)
      },
      fail:(err)=>{
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
      console.log("ryy-TODO")
      // 蓝牙连接超时
      console.log("ryy-linkBlueTime", this.linkBlueTime)
      if (this.linkBlueTime <= 0) {
        this.isDiscovering = false
        clearInterval(this.setBlueLinkOut)
        // app.showMsgModal({ content: "蓝牙操作超时，请检查设备是否有电，设备是否正常连接后重试" })
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
            console.log('platform',res.platform)
            let platform = res.platform
            that.platform = res.platform
            if (platform=='ios') {
              // 苹果系统
              console.log('device.name', device.name, device)
              // app.showMsgModal({ content: "ios系统暂不支持蓝牙操作" })
              if (device.localName == 'WCBOX' + that.data.blue_deviceId) {
                if (that.disableDeviceArr.indexOf(device.deviceId + "") > -1) {
                  return
                }

                that.createBLEConnection(device)
                that.isDiscovering = false // 找到设备并连接就停止
                that.stopBluetoothDevicesDiscovery()
              }

              
            }else{
              // platform == 'android'
              if (blue_mac == device.deviceId) {
                that.createBLEConnection(device)
                that.isDiscovering = false
                that.stopBluetoothDevicesDiscovery()
              } else {
                /* // 蓝牙连接超时
                console.log("ryy-linkBlueTime", this.linkBlueTime)
                if (this.linkBlueTime<0) {
                  // 超时就不再连接蓝牙 直接发送请求
                  that.diffLock()
                  clearInterval(that.setBlueLinkOut)
                  that.isDiscovering = false
                  that.stopBluetoothDevicesDiscovery()
                  // 关闭蓝牙模块。调用该方法将断开所有已建立的连接并释放系统资源。
                  that.closeBluetoothAdapter()
                } */
                // app.showMsgModal({ content: "未查找到对应五车仪设备，请确保五车仪设备可用并且在五车仪设备周围重新操作" })
              }
            }
          },
          fail:(err)=>{
            //关闭遮罩
            app.hideMask()
          } 
        })
        
      })

    })
  },
  createBLEConnection(device) {
    // 开启遮罩
    app.showMask()
    const ds = device
    const deviceId = ds.deviceId
    const serviceId = "0000FFE0-0000-1000-8000-00805F9B34FB"
    this.setData({
      serviceId
    })
    const name = ds.name
    console.log("ryy-ds", ds)
    console.log("ryy-连接", deviceId, name, serviceId)
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
    if (!this.data.deviceId) {
      return
    }
    wx.closeBLEConnection({
      deviceId: this.data.deviceId||"",
      success:(res)=>{
        callbcak && callbcak()
      },
      fail: (err) => {
        //关闭遮罩
        app.hideMask()
      } 
      
    })
    // 关闭蓝牙模块。调用该方法将断开所有已建立的连接并释放系统资源。
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
            if ((res.services[i].uuid).indexOf("FFE0") > -1) {
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
          if (item.properties.write && item.uuid.indexOf("FFE1") > -1) {
            setTimeout(() => {
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
                if (this.firstFetch) {
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
            }, 1000)
          }
          if (item.properties.notify || item.properties.indicate) {
            console.log('ryy-start-notifyBLECharacteristicValueChange', item)
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
              success: (res) => {
                console.log('ryy--notifyBLECharacteristicValueChange2', res)
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
      this.firstFetch = true
      console.log("characteristic-get-onestr", characteristic)
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}

      let onestr = ab2hex(characteristic.value)// 每次返回会回来的16进制命令
      console.log("characteristic-get-onestr2", onestr)

      if (onestr && (onestr.substring(0, 2) == "2b")) {
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
      } else {
        if (startRecive) {// 开始接收命令之后的字符串才拼进去
          tempStr16 += onestr
        }
      }
      console.log("onestr-tempStr16", onestr, tempStr16)
      console.log("onestr-tempStr16-hexCharCodeToStr", hexCharCodeToStr(onestr), hexCharCodeToStr(tempStr16))

      if (!isComp) {
        return
      } else {
        str16 = tempStr16
        tempStr16 = ''
        isComp = false
        startRecive = false
      }
      
      
      let str = hexCharCodeToStr(str16)
      console.log("str16== ", str, str16)
      if (str == 'key is ok!' || str16 == '6b6579206973206f6b210d0a') {
        console.log("str=='key is ok!'")
        this.setData({
          wcyIsOpenState: !this.data.wcyIsOpenState
        })
        wx.setStorageSync('wcyIsOpenState', !this.data.wcyIsOpenState)
        // 蓝牙操作完 请求后台接口
        this.diffLock(1)
        // 断开蓝牙连接
        this.closeBLEConnection()

        this.fetchBlueKeyInfo()
        //关闭遮罩
        app.hideMask()
      }
      if (str&&(str.split('')[0]=="+")) {
        //这是ios系统检测匹配mac地址，以及五车仪钥匙是否放回判断
        // ### 7获取蓝牙状态  命令码：AT+WCGETSTATUS  蓝牙返回mac地址，钥匙在不在,最后一个字母1表示在，0标识不在，  
        // 返回+50:F1:4A:53:8A:A3,1
        let strArr = str.split(',')
        let strMac = strArr[0].replace("+",'')
        let keyState = strArr[1]
        console.log("ryy-strArr", strArr, strMac, keyState)

        let { blue_mac, deviceId} = this.data
        console.log('ryy-strArr-ensureDevice', strMac, blue_mac)
        console.log('ryy-this.data.deviceId', deviceId)
        
        let that = this
        if (this.platform == 'ios') {
          // 苹果ios系统  先通过名字来判断  最后获取到mac地址  对比是否一致 不一致就断开然后重新连接下一个相同名字的蓝牙
          // deviceId 是当前正连接的设备id  ios返回的是uuid
          if (strMac != blue_mac) {
            this.disableDeviceArr.push(deviceId+"")

            // 断开蓝牙连接  并重新初始化蓝牙连接下一个设备
            this.closeBLEConnection(this.openBluetoothAdapter)

            return
          }
        }else{
          // platform == 'android'
        }
        
        if (keyState==0) {
          app.showMsgModal({ content: "请将钥匙放入五车仪中并关好" })
          // 断开蓝牙连接
          this.closeBLEConnection()
          return
        }
        // 发送开关锁指令
        this.loopSendStr()
      }
      if (str == 'keyError' || str16 == '6b65794572726f720d0a') {
        console.log("str=='keyError'")
        // 断开蓝牙连接
        this.closeBLEConnection()
        app.showMsgModal({content:'蓝牙操作失败，请重试'})
        this.fetchBlueKeyInfo()
      }
      this.setData(data)
    })
  },
  /**
   * 这是ios系统检测匹配mac地址，以及五车仪钥匙是否放回判断
   * ### 7获取蓝牙状态  命令码：AT+WCGETSTATUS  蓝牙返回mac地址，钥匙在不在,最后一个字母1表示在，0标识不在，
   * 返回+50:F1:4A:53:8A:A3,1
   */
  ensureKeyAndDevice(){
    let str = 'AT+WCGETSTATUS'
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
    let { wcyIsOpenState, openIndex, lockIndex } = this.data
    wcyIsOpenState = wx.getStorageSync('wcyIsOpenState')
    let str = ''
    if (wcyIsOpenState) {
      if (!this.data.blue_keys_lock[lockIndex]) {
        app.showMsgModal({ content: "设备蓝牙钥匙已用完，请到有网络的位置刷新页面获取新的钥匙" })
        return
      }
      // true 是打开状态  接下来需要关锁 要获取关锁的key，并让index指向下一条可用的key
      str = this.data.blue_keys_lock[lockIndex].key || '' // 获取可用的关锁key
      console.log('true 是打开状态  接下来需要关锁 要获取关锁的key', wcyIsOpenState, lockIndex, this.data.blue_keys_lock[lockIndex])
      this.setData({ lockIndex: lockIndex + 1 })
    } else {
      if (!this.data.blue_keys_open[openIndex]) {
        app.showMsgModal({ content: "设备蓝牙钥匙已用完，请到有网络的位置刷新页面获取新的钥匙" })
        return
      }
      console.log('false 是关闭状态 接下来需要开锁 要获取开锁的key', wcyIsOpenState, openIndex, this.data.blue_keys_open[openIndex])
      str = this.data.blue_keys_open[openIndex].key||''  // 获取可用的开锁key
      this.setData({ openIndex: openIndex + 1 })
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
    let buffer = string2buffer(str)
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