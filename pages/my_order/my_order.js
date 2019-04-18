//获取应用实例
let app = getApp()
let optionTemp;
var formData={
  state: '',
  page: 1
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusType: [
      { name: "全部", page: 0 },
      { name: "进行中", page: 0 },
      { name: "已完成", page: 0 },
      { name: "已取消", page: 0 },
    ],
    list: [[], [], [], []],
    currentType: 0,
    stateArr: ['', '进行中', '已完成', '已取消'],
  },
  
  onLoad(options) {
    optionTemp = options
    var systemInfo = wx.getSystemInfoSync()
    this.setData({
      windowHeight: systemInfo.windowHeight,
      currentType: options.id || 0
    })
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
    console.log("onReachBottom")
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
    console.log('-init', options)
    this.getList()
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
    let curr = e.detail.current
    this.setData({
      currentType: curr
    })
    // 初始化
    formData.page=1
    var param = {}, str1 = "list[" + (curr || 0) + "]"
    param[str1] = [];
    this.setData(param);

    if (!this.data.list[curr].length){

    }
    this.getList(curr);
  },
  getList(num){
    let url = ""
    let is_owner = app.globalData.is_owner || wx.getStorageSync('is_owner')
    if (is_owner == 1) {
      //我的订单  车主
      wx.setNavigationBarTitle({
        title: '我的订单'
      })
      url = "/manager/owner/selectOwnerOrderList.do"
    } else {
      //我的行程  车友
      wx.setNavigationBarTitle({
        title: '我的行程'
      })
      url = "/manager/rider/selectUserOrderList.do"
    }
    formData.state = num || ''
    app.xcxPost({
      url: url,
      data: formData,
      success: res => {
        let _data = res.list || []
        let {list} = this.data
        let currentList = list[(num || '0')]    
        if (_data.length){
          formData.page = ++res.page
          currentList = currentList.concat(_data)
        }else{

        }
        var param = {}, str1 = "list[" + (num||0) + "]"
        param[str1] = currentList;
        this.setData(param);
      }
    })
    // var param = {}, str1 = "list[" + that.data.currentType + "]",
    
  },
  fetchData(){
    console.log('fetchData-bottom')
    
    let { currentType} = this.data
    this.getList(currentType);
  },
  goIndex() {
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },
  goDetail(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/order_detail/order_detail" + "?order_id=" + id
    })
    
  },
})