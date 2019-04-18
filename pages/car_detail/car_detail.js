//获取应用实例
let app = getApp()
let optionTemp;
const { regeneratorRuntime } = app.globalData
//引入图片预加载组件
var ImgLoader = require('../../components/img-loader/img-loader.js')
const CHARTS = require('../../libs/wxcharts.js'); // 引入wx-charts.js文件
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusType: [
      { name: "车辆设置", page: 0 },
      { name: "亲情设置", page: 1 },
      { name: "维保设置", page: 2 },
      { name: "快递设置", page: 3 },
      { name: "共享设置", page: 4 },
    ],
    list: [[], [], [], []],
    currentType: 0,
    stateArr: ['', '车辆设置', '亲情设置', '维保设置', '快递设置', '共享设置',],
    banners: [],
    page:1,
    takeArray: [
      { id: 1, name: '原地取还', value: 1 },
      { id: 2, name: '面对面还车', value: 2 },
    ],
    takeIndex: -1,
    rent_start_time: '',
    rent_end_time: '',
    is_dynamic_price: false,
    pingData:[],
    echartData: [],
    stateArr: ["", "待完善", "审核中", "未共享", "已共享", "已删除", "审核未通过", "审核通过"],
    start_time:"",
    end_time:"",
    wcy_msg:{}
  },
  
  onLoad(options) {
    //初始化图片预加载组件，并指定统一的加载完成回调
    this.imgLoader = new ImgLoader(this)
    this.options = options
    optionTemp = options
    var systemInfo = wx.getSystemInfoSync()
    this.setData({
      windowHeight: systemInfo.windowHeight,
      currentType: options.tabid || 0
    })
    
  },
  //pick选择
  startDateChange: function (e) {
    console.log('startDateChange:', e.detail.value)
    this.setData({
      start_time: e.detail.value
    })
    this.getChart()
  },
  endDateChange: function (e) {
    console.log('endDateChange:', e.detail.value)
    this.setData({
      end_time: e.detail.value
    })
    this.getChart()
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

  /*自定义方法--start */
  /* 初始化 */
  test1(){
    return new Promise((resolve, reject) => {
      wx.getNetworkType({
        success: (res) => {
          const networkType = res.networkType
          resolve(networkType);
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },
  test(){
    wx.getLocation({
      type: 'gcj02',
      success: async (res) => {
        let cl = await this.test1()
        if (cl) {
          app.showMsgModal({ content: cl + "" })
        }
      }
    })
    
  },
  init(options) {
    // this.test()
    console.log('-init', options)
    console.log('-arguments', arguments)
    
    if (this.options && this.options.id) {
      this.fetchData()
      this.fetchDianc(this.options.id)
      app.xcxPost({
        url: "/manager/owner/userEvaluateList.do",
        data: { 
          car_id: this.options.id 
        },
        success: res => {
          let _data = res.list || []
          _data.forEach(ele=>{
            ele.user_photo&&(ele.user_photo = app.globalData.domain + ele.user_photo)
          })
          this.setData({
            pingData: _data
          })
        }
      })
      app.xcxPost({
        url: "/manager/owner/userEvaluateGrade.do",
        data: {
          car_id: this.options.id || this.options.car_id
        },
        success: res => {
          let _data = res.data || {}
          this.setData({
            starNum: _data.grade || 4
          })
        }
      })

      var nowdate = new Date();
      var y = nowdate.getFullYear();
      var m = nowdate.getMonth() + 1;
      var d = nowdate.getDate();
      var end_time = y + '-' + m + '-' + d;

      var oneweekdate = new Date(nowdate - 7 * 24 * 3600 * 1000);
      var y = oneweekdate.getFullYear();
      var m = oneweekdate.getMonth() + 1;
      var d = oneweekdate.getDate();
      var start_time = y + '-' + m + '-' + d;
      this.setData({
        start_time,
        end_time
      })
      this.getChart()
    }
  },
  getChart(){
    
    let { start_time, end_time} = this.data
    app.xcxPost({
      url: "/manager/owner/dataCarEChartInfo.do",
      data: {
        car_id: this.options.id,
        start_time: start_time,
        end_time: end_time
      },
      success: res => {
        let _data = res.data || []
        let dayArr = [],
            countArr = []
        _data.forEach(ele => {
          dayArr.push(ele.days)
          countArr.push(ele.count)
        });
        let ring = {
          canvasId: 'areaCanvas',
          type: 'area',
          categories: dayArr||[],
          // animation: true,
          series: [{
            name: " ",
            data: countArr||[],
            format: function (val) {
              return val.toFixed(2) + '';
            },
            color: "#f7a35c"
          }],
          yAxis: {
            format: function (val) {
              return val;
            },
            min: 0,
            fontColor: '#bbb',
            gridColor: '#bbb',
            titleFontColor: '#f7a35c'
          },
          xAxis: {
            fontColor: '#bbb',
            gridColor: '',
            disableGrid: true
          },
          legend: false,
          width: 375,
          height: 165
        };
        new CHARTS(ring);
        this.setData({
          echartData: _data
        })
      }
    })
    
  },
  fetchDianc(carId) {
    app.xcxPost({
      //车主车辆获取电池电量及钥匙
      url: "/manager/owner/getOwnerCarBattNew.do",
      mask: 'hidden',// 不显示遮罩
      data: {
        car_id: carId || '',
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
  // 点击tab切换 
  swichNav (res) {
    console.log('swichNav', res)
    if (this.data.currentType == res.detail.currentNum) return;
    optionTemp.tabid = res.detail.currentNum
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
  },
  switch2Change: function (e) {
    console.log('switch2 发生 change 事件，携带值为', e.detail.value)
    let check = e.detail.value
    app.xcxPost({
      url: "/manager/owner/dynamicPrice.do",
      data: { id: this.options.id, is_dynamic_price: check ? "1" : "0"},
      success: res => {
        let _data = res.data

      }
    })
  },
  wcyChange: function (e) {
    console.log('switch2 发生 change 事件，携带值为', e.detail.value)
    let check = e.detail.value
    let { car_init } = this.data
    if (car_init.state == 3) {
      app.showMsgModal({ content: '取消共享后，才能关闭' })
      car_init.is_gps_upload = "1"
      this.setData({ car_init })
      return
    }
    if (car_init.state==4){
      app.showMsgModal({content:'车辆已共享，不可关闭'})
      car_init.is_gps_upload = "1"
      this.setData({ car_init })
      return
    }
    app.xcxPost({
      url: "/manager/owner/editGpsUpload.do",
      data: { car_id: this.options.id, is_gps_upload: check ? "1" : "0" },
      success: res => {
        // let _data = res.data
        
        car_init.is_gps_upload = check ? "1" : "0"
        this.setData({ car_init})
      }
    })
  },
  fetchData(num){
    app.xcxPost({
      url: "/manager/owner/settingCarInit.do",
      data: { id: this.options.id },
      success: res => {
        let _data = res.data || {}
        _data.carImageList.forEach(ele => {
          ele.url = app.globalData.domain + ele.image
          ele.miniUrl = app.globalData.domain + (ele.min_image || "")
          ele.loaded = false
        })

        this.setData({
          banners: _data.carImageList,
          car_init: _data.car_init,
          rent_start_time: _data.car_init.rent_start_time || "",
          rent_end_time: _data.car_init.rent_end_time || "",
          is_dynamic_price: _data.car_init.is_dynamic_price == 1 ? true : false,
          remain_gasoline: _data.car_init.remain_gasoline || "",
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
  goIndex: function () {
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },
  goAddPage(e){
    let tampPath = e.currentTarget.dataset.path
    // let tampPage = e.currentTarget.dataset.page

    wx.navigateTo({
      url: tampPath + "?car_id=" + (this.options.id || "") + "&ccd_id=" + (this.data.car_init.ccd_id || "") + "&describe=" + (this.data.car_init.car_describe || "") + "&state=" + (this.data.car_init.state || "")+'page=1'
    })
  },
  goPage(e) {
    let tampPath = e.currentTarget.dataset.path
    // let tampPage = e.currentTarget.dataset.page
    
    wx.navigateTo({
      url: tampPath + "?car_id=" + (this.options.id || "") + "&ccd_id=" + (this.data.car_init.ccd_id || "") + "&describe=" + (this.data.car_init.car_describe || "") + "&state=" + (this.data.car_init.state || "")
    })
  }, 
  goShous() {
    if (this.data.car_init.is_gesture == 1){
      return
    }
    wx.navigateTo({
      url: '/pages/gestureLock/index?car_id=' + (this.options.id || "") + "&wcy_number=" + (this.data.car_init.wcy_number || "")
    })
  },
  goPageSet(e) {
    let tampPath = e.currentTarget.dataset.path
    let state = e.currentTarget.dataset.state
    wx.navigateTo({
      url: tampPath + "?car_id=" + (this.options.id || "") + "&state=" + state
    })
  },
  goWcy(e) {
    if (this.data.car_init.state == 2) {
      // 审核中不能解绑
      app.showMsgModal({ content: "审核中不可修改，有疑问请咨询客服" })
      return
    }
    if (this.data.car_init.state == 4) {
      // 已共享不能解绑
      // app.showMsgModal({ content: "审核中不可修改，有疑问请咨询客服" })
      return
    }
    let tampPath = e.currentTarget.dataset.path
    wx.navigateTo({
      url: tampPath + "?wcy_number=" + this.data.car_init.wcy_number + "&id=" + (this.options.id || "")
    })
  },
  goDetail(e) {
    if (this.data.car_init.state == 2) {
      app.showMsgModal({ content: "审核中不可修改，有疑问请咨询客服" })
      return
    }
    if (this.data.car_init.state == 1 || this.data.car_init.state == 6){
      // 待完善和审核通过可修改资料
      let tampPath = e.currentTarget.dataset.path
      wx.navigateTo({
        url: tampPath + "?id=" + this.options.id
      })
    }
    
  },
  goDrive(e) {
    if (this.data.car_init.state==2){
      app.showMsgModal({ content: "审核中不可修改，有疑问请咨询客服" })
      return
    }
    if (this.data.car_init.state == 1 || this.data.car_init.state == 6) {
      // 待完善和审核通过可修改资料
      let tampPath = e.currentTarget.dataset.path
      let drive_id = this.data.car_init.driveid || ""
      wx.navigateTo({
        url: tampPath + "?car_id=" + this.options.id + "&&drive_id=" + drive_id
      })
    }
    
  },
  takeChange(e) {
    console.log('prodChange', e)
    var index = e.detail.value;
    var currentId = this.data.takeArray[index].id; // 这个id就是选中项的id
    app.xcxPost({
      url: '/manager/owner/getModel.do',
      data: {
        id: this.options.id,
        get_model: currentId 
      },
      success: res => {
        console.log('res', res)
        this.setData({
          takeIndex: e.detail.value
        })
      }
    })

    console.log('currentId', currentId)
  },
  rentStart(e) {
    console.log('rentStart：', e.detail.value)
    this.setData({
      rent_start_time: e.detail.value
    })
    let { rent_start_time, rent_end_time } = this.data
    if (rent_start_time && rent_end_time) {
      app.xcxPost({
        url: '/manager/owner/rentTime.do',
        data: {
          id: this.options.id,
          rent_start_time: rent_start_time,
          rent_end_time: rent_end_time,
        },
        success: res => {
          let _data = res.data

        }
      })
    }
  },
  rentEnd(e) {
    console.log('rentEnd：', e.detail.value)
    this.setData({
      rent_end_time: e.detail.value
    })
    let { rent_start_time, rent_end_time } = this.data
    if (rent_start_time && rent_end_time) {
      app.xcxPost({
        url: '/manager/owner/rentTime.do',
        data: {
          id: this.options.id,
          rent_start_time: rent_start_time,
          rent_end_time: rent_end_time,
        },
        success: res => {
          let _data = res.data
          
        }
      })
    }
  },
  nameInput(e) {
    this.setData({ remain_gasoline: e.detail.value })
    app.xcxPost({
      url: '/manager/owner/remainGasoline.do',
      data: {
        id: this.options.id,
        remain_gasoline: this.data.remain_gasoline,
      },
      success: res => {
        let _data = res.data

      }
    })
  },
  //提交审核
  confCheck() {
    if (!this.data.banners.length) {
      app.showMsgModal({ content: "请上传车辆图片" })
      return
    }
    // if (!this.data.car_init.drive_id) {
    //   app.showMsgModal({ content: "请填写行驶证和交强险内容" })
    //   return
    // }
    // if (!this.data.rent_start_time || !this.data.rent_end_time) {
    //   app.showMsgModal({ content: "请填写共享时段" })
    //   return
    // }
    if (!this.data.takeIndex) {
      app.showMsgModal({ content: "请设置取还模式" })
      return
    }
    if (!this.data.remain_gasoline) {
      app.showMsgModal({ content: "请填写续驶里程" })
      return
    }
    app.xcxPost({
      url: '/manager/owner/submitAuDit.do',
      data: {
        car_id: this.options.id,
        drive_id: this.data.car_init.drive_id,
      },
      success: res => {
        let _data = res.data
        // app.successMsg({ title: "成功提交审核！" })
        this.fetchData()
      }
    })
  },
  //确定共享
  confRent(){
    let { car_init } = this.data
    if (car_init.is_gps_upload != 1) {
      app.showMsgModal({ content: '请开启五车仪' })
      
      return
    }
    app.xcxPost({
      url: '/manager/owner/rentCar.do',
      data: {
        car_id: this.options.id,
      },
      success: res => {
        let _data = res.data
        // app.successMsg({ title: "共享成功！" })
        this.fetchData()

      }
    })
  },
  //取消共享
  cancelRent() {
    wx.showModal({
      title: '提示',
      content: '您确定要取消共享？',
      success: (resp) => {
        if (resp.confirm) {
          console.log('用户点击确定')
          app.xcxPost({
            url: '/manager/owner/cancelRentCar.do',
            data: {
              car_id: this.options.id,
            },
            success: res => {
              let _data = res.data
              // app.successMsg({ title: "取消共享成功" })
              this.fetchData()

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
  //删除车辆
  delCar() {
    wx.showModal({
      title: '提示',
      content: '您确定要删除车辆？',
      success: (resp) => {
        if (resp.confirm) {
          console.log('用户点击确定')
          app.xcxPost({
            url: '/manager/owner/delOwnerCar.do',
            data: {
              car_id: this.options.id,
            },
            success: res => {
              let _data = res.data
              app.successMsg({ title: res.errmsg+"" })
              wx.reLaunch({
                url: '/pages/index/index',
              })
              
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
  goInx(){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  }
})