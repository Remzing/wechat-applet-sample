//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bankList:[
      
    ],
    editIndex: 0,
    delBtnWidth:180//删除按钮宽度单位（rpx）
  },
  /*自定义方法--start */
  //
  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        stX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    console.log("touchM:" + e);
     var that = this
    if (e.touches.length == 1) {
      //记录触摸点位置的X坐标 
      var moveX = e.touches[0].clientX; 
      //计算手指起始点的X坐标与当前触摸点的X坐标的差值 
      var disX = that.data.stX - moveX;
      //delBtnWidth 为右侧按钮区域的宽度 
      var delBtnWidth = that.data.delBtnWidth; 
      var txtStyle = "true"; 
      if(disX == 0 || disX < 0){
        //如果移动距离小于等于0，文本层位置不变 width: 660rpx;border-radius: 10rpx;
        // txtStyle = "left:0px"; 
        txtStyle = "true"; 
      }else if(disX > 0 ){
        //移动距离大于0，文本层left值等于手指移动距离 width: 470rpx;border-radius: 10rpx 0px 0px 10rpx;
        // txtStyle = "left:-"+disX+"px";
        txtStyle = "false"; 
        // if(disX>=delBtnWidth){ 
        //   //控制手指移动距离最大值为删除按钮的宽度 
        //   txtStyle = "left:-"+delBtnWidth+"px"; 
        // }
      } 
      //获取手指触摸的是哪一个item 
      var index = e.currentTarget.dataset.index; 
      var list = that.data.bankList; 
      //将拼接好的样式设置到当前item中
      list[index].txtStyle = txtStyle; 
      //更新列表的状态
      this.setData({ bankList:list }); 
      // console.log(this.data.bankList)
    } 
  },
  touchE: function (e) {
    console.log("touchE" + e);
    var that = this 
    if (e.changedTouches.length == 1) {
      //手指移动结束后触摸点位置的X坐标 
      var endX = e.changedTouches[0].clientX; 
      //触摸开始与结束，手指移动的距离
      var disX = that.data.stX - endX; 
      var delBtnWidth = that.data.delBtnWidth; 
      //如果距离小于删除按钮的1/2，不显示删除按钮 
      var txtStyle = disX > delBtnWidth/2 ? "true":"false";
      //获取手指触摸的是哪一项 
      var index = e.currentTarget.dataset.index;
      var list = that.data.bankList; list[index].txtStyle = txtStyle; 
      //更新列表的状态 
      that.setData({ bankList:list });
    }
  },
  //页面跳转
  totiXJL() {
    wx.navigateTo({
      url: '../my_tiXJL/my_tiXJL'
    })
  },
  toyinHKGL(e){
    let id = e.currentTarget.dataset.id||""
    wx.navigateTo({
      url: '../my_yinHKGL/my_yinHKGL?id='+id
    })
  },
  detBank(e){
    let id = e.currentTarget.dataset.id || ""
    wx.showModal({
      title: '删除银行卡',
      content: '确定要删除该银行卡？',
      success: (resp) => {
        if (resp.confirm) {
          console.log('用户点击确定')
          app.xcxPost({
            url: '/manager/user/myBankDel.do',
            data: {id: id},
            success: res => {
              app.successMsg({ title: res.errmsg+""})
              this.fetchData()
            }
          })
        } else if (resp.cancel) {
          
        }
      },
      fail: () => {
        console.log('fail')
        wx.switchTab({ url: "/pages/index/index" })
      }
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
    this.fetchData(options)
  },
  fetchData(options) {
    app.xcxPost({
      url: '/manager/user/myBankCardList.do',
      data: {},
      success: res => {
        let _data = res.data
        
        this.setData({
          bankList: _data
        })
      }
    })
  },
  /*生命周期--start *
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
})