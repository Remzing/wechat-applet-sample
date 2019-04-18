//获取应用实例
let app = getApp()
import { getNumber } from '../../utils/number.js';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    carBoxList: [],
    carPlate: [],
    colorList:[
    ],
    oilList:[
    ],
    checkValue: [""],
    carBoxIndex: "",
    palteIndex: "",
    colorIndex: "",
    oilIndex: "",
    wcNumCheck:false,
    wcInpDis: false,
  },
  
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
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
  /*自定义方法--start */     
  /* 初始化 */
  init(options) {
    this.options = options
    console.log('-init', options)
    let carPlate = getNumber()
    this.setData({
      carPlate
    })
    app.xcxPost({
      url: "/manager/owner/uploadingCarInfoInit.do",
      data: {},
      success: res => {
        let _data = res.data
        let carBoxList = _data.carBoxList || []
        let colorList = _data.carColourList || []
        let oilList = _data.carGasolineList || []
        this.setData({
          carBoxList,
          colorList,
          oilList,
        })

        if (this.options && this.options.id){
          app.xcxPost({
            url: "/manager/owner/editCarInfoInit.do",
            data: { id: this.options.id },
            success: res => {
              let _data = res.data
              this.setData({
                carAddress: _data.license_number.split("")[0] || "", // 车牌
                carNum: _data.license_number.substring(1) || "", // 车牌号
                carSysId: _data.car_series_id || "", // 车系id
                carSysName: _data.series_name || "", // 车系名称
                wcNum: _data.wcy_number || "", // 五车仪编号
                carBoxId: _data.speed_box_id || "", // 变速箱id
                carBoxName: _data.speed_box || "", // 变速箱名称
                colorIndex: _data.car_colour_id || "", // 车辆颜色id
                colour: _data.colour || "", // 车辆颜色
                oilIndex: _data.gasoline_id || "", // 油型id
                gasoline: _data.gasoline || "", // 油型
                wcInpDis: true,
              })
              this.data.carBoxList.forEach((ele, k)=> {
                if (ele.id == _data.speed_box_id) {
                  this.setData({
                    carBoxIndex: k
                  })
                }
              });
              this.data.carPlate.forEach((ele, k)=> {
                if (ele.abbreviation == this.data.carAddress) {
                  this.setData({
                    index: k
                  })
                }
              });
            }
          })
        }
      }
    })
  },
  selColor(e){
    console.log('e', e)
    let id = e.target.dataset.id||'';
    this.setData({
      colorIndex: id
    })
  },
  selOil(e){
    console.log('e', e)
    let id = e.target.dataset.id||'';
    this.setData({
      oilIndex: id
    })
  },
  goChexi(){
    wx.navigateTo({
      url: '/pages/car_pinpaichexi/car_pinpaichexi'
    })
  },
  goShous() {
    wx.navigateTo({
      url: '/pages/gestureLock/index?car_id='
    })
  },
  carBoxChange(e){
    console.log('prodChange', e)
    var index = e.detail.value;
    var currentId = this.data.carBoxList[index].id; // 这个id就是选中项的id
    this.setData({
      carBoxIndex: e.detail.value,
      carBoxId: currentId
    })
  },
  carNumInput(e) {
    this.setData({ carNum: e.detail.value })
  },
  wcNumInput(e) {
    this.setData({ wcNum: e.detail.value })
  },
  //车牌地址选择
  bindPickerChange: function (e) {
    let index = e.detail.value
    let carPlate = this.data.carPlate
    this.setData({
      index: e.detail.value,
      carAddress: carPlate[index].abbreviation
    })
  },
  //复选框
  checkboxChange: function (e) {
    console.log("checkbox发生change事件，携带value值为：", e, e.detail.value.length);
    let that = this;
    that.setData({
      checkValue: e.detail.value
    });
  },
  conf(){
    if (!this.data.carAddress) {
      app.warningMsg({ title: "请选择归属地" })
      return
    }
    if (!this.data.carNum) {
      app.warningMsg({ title: "请输入车牌号" })
      return
    }
    let num = /^[A-Za-z0-9]+$/;
    if ((num.test(this.data.carNum)) == false) {
      app.warningMsg({ title: "请输入正确的车牌号" })
      return
    }
    if (!this.data.carSysName) {
      app.warningMsg({ title: "请选择车系" })
      return
    }
    if (!this.data.wcNum) {
      app.warningMsg({ title: "请输入序列号" })
      return
    }
    if (!this.data.carBoxId) {
      app.warningMsg({ title: "请选择变速箱" })
      return
    }
    if (!this.data.colorIndex) {
      app.warningMsg({ title: "请选择车辆颜色" })
      return
    }
    if (!this.data.oilIndex) {
      app.warningMsg({ title: "请选择油型" })
      return
    }
    if (!this.data.checkValue.length) {
      app.warningMsg({ title: "请阅读并同意协议" })
      return
    }
    let { wcNumCheck, wcInpDis } = this.data
    if (!wcNumCheck && !wcInpDis){
      this.checkCarNum(null, this.conf)
      return
    }

    let formData = {
      license_number: this.data.carAddress + this.data.carNum,
      car_series_id: this.data.carSysId,
      wcy_number: this.data.wcNum,
      speed_box_id: this.data.carBoxId,
      car_colour_id: this.data.colorIndex,
      gasoline_id: this.data.oilIndex,
    }
    if (this.options && this.options.id) {
      formData.id = this.options.id
    }
    app.xcxPost({
      url: "/manager/owner/uploadingCarInfo.do",
      data: formData,
      success: res => {
        app.successMsg({ title: res.errmsg + "" })
        setTimeout(() => {
          // wx.navigateBack({ changed: true });//返回上一页
          let car_id = this.options.id || res.data.car_id || ""
          wx.redirectTo({
            url: "/pages/car_shangchuan/car_shangchuan?car_id=" + car_id
          })
        }, 1000);
      }
    })
  },
  checkCarNum(e, callBack){
    console.log("e", e, callBack)
    app.xcxPost({
      url: "/manager/owner/judgeWcy.do",
      data: { 
        wcy_number: this.data.wcNum,//e.detail.value ||

      },
      success: res => {
        // app.successMsg({ title: res.errmsg + "" })
        this.setData({
          wcNumCheck: true
        })
        if (callBack){
          callBack()
        }
      }
    })
  },
  goWenben(e){
    let page = e.currentTarget.dataset.page||""
    wx.navigateTo({
      url: '/pages/my_GSJS/my_GSJS?page='+page,
    })
  }
})