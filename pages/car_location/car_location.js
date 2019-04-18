//获取应用实例
let app = getApp()
var amapFile = require('../../libs/amap-wx.js');
var myAmapFun = new amapFile.AMapWX({ key: '14db0799d724b1866aa65ebbea42d8e5' });
Page({
  /**
   * 页面的初始数据
   */
  data: {
    keyword:'',
    tips:[],
    region: ['广东省', '广州市', '海珠区'],
    carLocal:{}
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
    var that = this
    myAmapFun.getRegeo({
      success: function (data) {
        console.log('location-getRegeo', data)
        let { carLocal, region } = that.data
        let _data = data[0]
        //成功回调
        if (_data && _data.regeocodeData && _data.regeocodeData.addressComponent) {
          let cObj = _data.regeocodeData.addressComponent
          region = [cObj.province, cObj.city, cObj.district,]
          carLocal.city = cObj.city
        }
        carLocal.latitude = _data.latitude
        carLocal.longitude = _data.longitude
        carLocal.name = _data.name
        that.setData({
          region,
          carLocal
        })
        
        
        myAmapFun.getInputtips({
          keywords: region[2]||'',
          location: '',
          city: region[1] || carLocal.city || '',
          // citylimit:true, //只搜索city内的相关地址
          success: function (data) {
            if (data && data.tips) {
              that.setData({
                tips: data.tips
              });
            }

          }
        })

      },
      fail: function (info) {
        //失败回调
        console.log(info)
      }
    })
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
    this.init()
  },
  keywordInput(e) {
    let key = e.detail.value||""
    this.setData({ keyword: key })
    this.getTips(key)
  },
  clearinp(){
    this.setData({ keyword: '' })    
  },
  selfLoacl(){
    let { carLocal, region } = this.data
    // this.getTips(carLocal.name)
    // this.setData({ keyword: carLocal.name })
    // 跳转到上一页面
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    let { calcFeeData } = prevPage.data
    if (this.options.state == 1) {
      calcFeeData.startlon = carLocal.longitude
      calcFeeData.startlat = carLocal.latitude
      calcFeeData.startName = carLocal.name
    } else {
      calcFeeData.endlon = carLocal.longitude
      calcFeeData.endlat = carLocal.latitude
      calcFeeData.endName = carLocal.name
    }
    prevPage.setData({//直接给上一页面赋值
      calcFeeData
    });
    wx.navigateBack({//返回
      delta: 1
    })
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
   * 页面滚动时触发
   */
  onPageScroll() {
  },

  /*生命周期--end*/
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      region: e.detail.value
    })
  },
  getTips(key){
    if (!key) {
      return
    }
    let that = this
    let { carLocal, region } = that.data
    myAmapFun.getInputtips({
      keywords: key||'',
      location: '',
      city: region[1]||carLocal.city||'',
      // citylimit:true, //只搜索city内的相关地址
      success: function (data) {
        console.log('getInputtips', data)
        if (data && data.tips) {
          that.setData({
            tips: data.tips
          });
        }

      }
    })
  },
  selectItem(e){
    let { local, district, address, name} = e.currentTarget.dataset
    if (local && (district || address)) {
      
      // 跳转到上一页面
      let pages = getCurrentPages();//当前页面
      let prevPage = pages[pages.length - 2];//上一页面
      let { calcFeeData } = prevPage.data
      if (this.options.state==1) {
        calcFeeData.startlon = local.split(',')[0]
        calcFeeData.startlat = local.split(',')[1]
        calcFeeData.startName = (district || "") + (address || "") + (name ? '(' + name+')':'')
      }else{
        calcFeeData.endlon = local.split(',')[0]
        calcFeeData.endlat = local.split(',')[1]
        calcFeeData.endName = (district || "") + (address || "") + (name ? '(' + name + ')' : '')
      }
      prevPage.setData({//直接给上一页面赋值
        calcFeeData
      });
      wx.navigateBack({//返回
        delta: 1
      })
    }
  }
})