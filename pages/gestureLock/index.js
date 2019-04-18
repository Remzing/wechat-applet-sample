const app = getApp()
const Locker = require('../../libs/lock.js');

Page({
  data: {
    lockMsg: '请绘制图案'
  },
  onLoad(options) {
    this.options = options
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log("getLocation-success", res)
      },
      fail: (err) => {
        console.log("getLocation-fail", err)
      },
    })

    let pwd = wx.getStorageSync('locker_pwd') || '';
    let res = wx.getSystemInfoSync();
    let ftHeight = res.windowHeight - 410;
    let that = this;
    this.setData({ lockType: this.options.locktype||'1', ftHeight: ftHeight });

    //
    this.lock = new Locker(this, {
      id: 'canvas',
      lockType: this.options.locktype||this.data.lockType,
      onTouchEnd: (e) => {
        console.log("onTouchEnd: ", e);
      },
      onSuccess: (e) => {
        // console.log("onSuccess: ", e);
        if (e.lockType == "1") {
          console.log("密码设置成功，密码为：", e.lockPwd);
          let formData = {}
          formData.id = this.options.car_id
          formData.wcy_number = this.options.wcy_number
          formData.code = e.lockPwd
          app.xcxPost({
            url: "/manager/owner/sendGesture.do",
            data: formData,
            success: res => {
              app.successMsg({ title: res.errmsg + "" })
              setTimeout(() => {
                wx.navigateBack({ changed: true });//返回上一页
                this.reset()
              }, 500);
            }
          })
          // that.setData({ lockType: 2 });
          // that.lock.changeLockType(2);
        } else {
          console.log("密码解锁成功!", e.lockPwd);
          setTimeout(() => {
            wx.navigateBack({ changed: true });//返回上一页
            let pages = getCurrentPages();//当前所有页面
            let prevPage = pages[pages.length - 2];//上一页面
            prevPage.setData({//直接给上一页面赋值
              lockPwd: e.lockPwd,
              isBlueLock: true
            });
            // prevPage.blueHandle.bind(prevPage)()
            // console.log('prevPage.userid', prevPage.userid)
            // console.log('prevPage.wcynumber', prevPage.wcynumber)
            // console.log('prevPage.nowIndex', prevPage.nowIndex)
            this.reset()
          }, 200);
          
         
        }
      }
    });
  },
  reset(e) {
    this.lock.reset();
  },
  forget(e) {
    let that = this;
    wx.showModal({
      content: '确定要重置密码吗?',
      success: (res) => {
        if (res.confirm) {
          that.setData({ lockType: 1 });
          that.lock.changeLockType(1);
        }
      }
    })
  },

  onPageScroll: function (e) {
    console.log("e.scrollTop", e.scrollTop)
    if (e.scrollTop <= 0) {
      console.log("e.scrollTop<=", e.scrollTop)
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  }
})