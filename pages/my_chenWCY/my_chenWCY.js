//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    menuTitle:[
      {
        'title':'车友条件0',
        menuTxt: [
          { 'txt': 'GPS费用如何收取1？', },
          { 'txt': '车友取消订单违约金如何计算？', },
          { 'txt': 'GPS费用如何收取2？', },
          { 'txt': 'GPS费用如何收取3？', },
          { 'txt': 'GPS费用如何收取4？', },
        ]
      },
      {
        'title': '车友条件1',
        menuTxt: [
          { 'txt': 'GPS费用如何收取1？', },
          { 'txt': '车友取消订单违约金如何计算？', },
          { 'txt': 'GPS费用如何收取2？', },
          { 'txt': 'GPS费用如何收取3？', },
          { 'txt': 'GPS费用如何收取4？', },
        ]
      },
      {
        'title': '车友条件2',
        menuTxt: [
          { 'txt': 'GPS费用如何收取1？', },
          { 'txt': '车友取消订单违约金如何计算？', },
          { 'txt': 'GPS费用如何收取2？', },
          { 'txt': 'GPS费用如何收取3？', },
          { 'txt': 'GPS费用如何收取4？', },
        ]
      },
    ],
    smTxt:[],
    showFlag:true,
  },
  /*自定义方法--start */
  //只显示头两个
  topShow(e){
    let that = this
    let list = that.data.menuTitle;
    var index = e.currentTarget.dataset.index; 
    list[index].isShow = !list[index].isShow
    //当true时，截取前两个即收缩，false时显示全部即展开
    if (list[index].isShow==false){
      list[index].menuTxtT = list[index].menuTxt
    }else{
      list[index].menuTxtT = list[index].menuTxt.slice(0, 2)
    }
    //更新列表的状态
    this.setData({ menuTitle: list });
  },
  //页面跳转
  towenTiXQ(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../my_wenTiXQ/my_wenTiXQ?id=' + id
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
    let that = this
    let list = that.data.menuTitle;
    list.forEach(ele => {
      ele.isShow = true
      ele.menuTxtT = ele.menuTxt.slice(0, 2)
    }) 
    list[0].isShow = false
    list[1].isShow = false
    list[0].menuTxtT = list[0].menuTxt
    list[1].menuTxtT = list[1].menuTxt
    // this.setData({ menuTitle: list });
    app.xcxPost({
      url: '/manager/user/callCenterThree.do',
      data: { id: options.id },
      success: res => {
        console.log('res', res)
        let _data = res.data
        this.setData({
          menuTitle: res.data||[]
        })
        
      }
    })
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
})