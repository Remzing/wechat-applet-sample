// common/component/customModal.js
//获取应用实例
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
   properties: {
    title : {
      type : String,
      value : ''
    },
    
    cancelText : {
      type: String,
      value: '取消'
    },

    confirmText : {
      type: String,
      value: '确定'
    },
       
    backdrop: {
      type: Boolean,
      value: false
    },

    animated: {
      type: Boolean,
      value: true
    },

    modalSize: {
      type: String,
      value: "md"
    },    
  },

  /**
   * 组件的初始数据
   */
  data: {
    navShow: false
  },

  ready : function(){
    //获得baseModal节点
    if (!this.selectComponent){
      throw new Error("小程序sdk暂不支持节点操作selectComponent");
    }
    this.baseModal  = this.selectComponent('#baseModal');
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show : function(){
      console.log('nav-show')
      this.setData({
        navShow: true
      })  
      this.baseModal.showModal();           
    },

    hide : function(){
      console.log('hide()')
      this.setData({
        navShow: false
      })         
    },
    navhide : function(){
      console.log('navhide()')
      this.setData({
        navShow: false
      })         
      this.baseModal.hideModal();
    },
    callBack : function(){          
      this.hide();
      this.triggerEvent("confirmEvent");
    },

    //cancel
    _cancelModal: function (state){
      // this.triggerEvent("cancelEvent");
      if (state == 'quit_xcx') {
        // 退出小程序
        wx.navigateBack({
          delta: 1
        })
      } else {
        this.hide();
        wx.switchTab({
          url: (state || '/pages/index/index')
        })
      }
    },

    //success
    _confirmModal : function(e){     
      // this.triggerEvent("confirmEvent");
      console.log('updateUserInfo', e)
      if (e.detail.errMsg == "getUserInfo:fail auth deny") {
        wx.showModal({
          title: '提示',
          content: '您点击了拒绝授权，将无法使用该功能。请点击【确定】设置授权，或者等10分钟之后再次获取授权。',
          success: (resp) => {
            if (resp.confirm) {
              console.log('用户点击确定')
              //跳转设置页面授权             
              wx.openSetting({
                success: (succ) => {}
              })
            } else if (resp.cancel) {
              console.log('用户点击取消')
              wx.switchTab({ url: "/pages/index/index" })
            }
          },
          fail: () => {
            console.log('fail')
            wx.switchTab({ url: "/pages/index/index" })
          }
        })
      } else {
        app.xcxLogin(this.callBack.bind(this), 'updateUserInfo')
      }
    }
  }
})
