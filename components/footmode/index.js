Component({
  properties: {
    foottype:{
      type:Number,
      value:1,
      observer: function (newVal, oldVal) {
        this.setData({
          foottype: newVal
        })
      }
    },
    istop:{
      type: Boolean,
      value:true,
      observer: function (newVal, oldVal) {
        this.setData({
          istop: newVal
        })
      }
    },
    storetext:{
      type: Object,
      value:{},
      observer: function (newVal, oldVal) {
        this.setData({
          storetext: newVal
        })
      }
    },
    tipcolor:{
      type:String,
      value:"#f9f9f9"
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    animation: ''
  },
  ready: function () { 
    console.log('this.data.storetext', this.data.storetext)  
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //返回顶部
    goTop(e) {
      if (wx.pageScrollTo) {
        wx.pageScrollTo({
          scrollTop: 0
        })
        this.setData({
          istop: true
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    }
  }
})