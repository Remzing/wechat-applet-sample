//获取应用实例
let app = getApp()
// var carArr = require('../../utils/car.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    oneList:[],
    twoList:[
      // { id: 1, miniUrl:'/assets/imgs/carlogo_1.png', name: '沃尔沃'},
      // { id: 2, miniUrl:'/assets/imgs/carlogo_2.png', name: '奥迪'},
      // { id: 3, miniUrl:'/assets/imgs/carlogo_3.png', name: '保时捷'},
      // { id: 4, miniUrl:'/assets/imgs/carlogo_4.png', name: '欧宝'},
      // { id: 5, miniUrl:'/assets/imgs/carlogo_5.png', name: '捷克'},
    ],
    twoListCopy:[],
    threeList:[
      { id: 1, name: '梅赛德斯-奔驰1系列' },
      { id: 2, name: '奔驰2系列' },
      { id: 3, name: '奔驰3系列' },
      { id: 4, name: '奔驰4系列' },
      { id: 5, name: '奔驰5系列' },
    ],
    selectOne: '-1',
    selectTwo: '',
    selectThree: '',
    threeColumnShow: 0,
    oneText:'',
    twoText:'',
    carLogo:''
  },
  
  /*生命周期--start *
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.init(options)
    var _windowHeight = wx.getSystemInfoSync().windowHeight ;
    this.setData({
      windowHeight:_windowHeight
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
   * 用户点击右上角分享
   */
  onShareAppMessage() {
  },
  /**
   * 页面滚动时触发
   */
  onPageScroll() {
  },

  /* 生命周期--end */
  /* 自定义方法--start */
  /* 初始化 */
  init(options) {
    app.xcxPost({
      url: '/manager/owner/carSeriesParents.do',
      data: {},
      success: res => {
        let _data = res.data
        //检索的首字母
        let searchLetter = ["热", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"]

        var tempObj = [];
        for (var i = 0; i < searchLetter.length; i++) {
          var initial = searchLetter[i];
          var cityInfo = [];
          var tempArr = {};
          tempArr.initial = initial;
          for (var j = 0; j < _data.length; j++) {
            if (initial == _data[j].initial) {
              _data[j].url = app.globalData.domain + _data[j].image
              cityInfo.push(_data[j]);
            }
          }
          tempArr.cityInfo = cityInfo;
          tempObj.push(tempArr);
        }
        this.setData({
          oneList: tempObj
        })
        if (_data && _data.length) {
          this.setData({
            twoList: [{
              id: _data[0].id,
              url: app.globalData.domain + _data[0].image,
              name: _data[0].name
            }],
            selectOne: _data[0].id,
          })
        }
      }
    })
    console.log('-init', options)
    
  },
  switchRightTab(e){
    console.log('e', e)
    let id = e.currentTarget.dataset.id||'';
    let oneText = e.currentTarget.dataset.txt||'';
    let carLogo = e.currentTarget.dataset.url||'';
    this.setData({
      selectOne: id,
      selectTwo: '',
      oneText,
      carLogo
    })
    if (this.data.threeColumnShow == 1) {
      this.setData({
        threeColumnShow: 2
      })
    }
    let tempObj = {
      id: id,
      url: carLogo,
      name: oneText
    }
    if (id!=-1) {
      this.setData({
        twoList: [tempObj]
      })
    }else{
      this.setData({
        twoList: this.data.twoListCopy
      }) 
    }
  },
  twoSelect(e){
    console.log('e', e)
    let id = e.currentTarget.dataset.id || '';
    let cname = e.currentTarget.dataset.cname || '';
    // 
    app.xcxPost({
      url: '/manager/owner/carSeriesChildren.do',
      data: { id: id },
      success: res => {
        let _data = res.data
        this.setData({
          threeList: _data||[]
        })
        if (id == this.data.selectTwo) {
          this.setData({
            selectTwo: '',
          })
          if (this.data.threeColumnShow == 1) {
            this.setData({
              threeColumnShow: 2
            })
          }

          return
        }
        this.setData({
          selectTwo: id,
          twoText: cname,
          threeColumnShow: 1
        }) 
      }
    })
    
  },
  threeSelect(e){
    console.log('e', e)
    let id = e.currentTarget.dataset.id || '';
    let name = e.currentTarget.dataset.name || '';

    // 跳转到上一页面
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({//直接给上移页面赋值
      carSysName: name,
      carSysId: id,
    });
    wx.navigateBack({//返回
      delta: 1
    })
  }
})