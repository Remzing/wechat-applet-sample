//app.js
var util = require("./utils/util.js");
var amapFile = require('./libs/amap-wx.js');

import regeneratorRuntime from './libs/runtime.js';
App({
  globalData: {
    userInfo: {},
    regeneratorRuntime: regeneratorRuntime,
    // postUrl: wx.getExtConfigSync().request_url || "http://wuyu.mynatapp.cc" + "",
    // postUrl: wx.getExtConfigSync().request_url || "http://192.168.1.136:8984" + "",
    postUrl: wx.getExtConfigSync().request_url || "https://wccx.xcx.5autos.cn" + "",
    
    // postUrl: wx.getExtConfigSync().request_url || "http://192.168.1.222:8088" + "/wucheng",
    // postUrl: (wx.getExtConfigSync().request_url || 'http://xucheng.nat300.top/saas'),
    // AppId: wx.getExtConfigSync().user_appid || "wx5ee1c77544c9d5e7",
    AppId: wx.getExtConfigSync().user_appid || "wxe8b939ec5119af5c",

    domain: "", // 图片域名
    phone: "", // 用户手机号
    header: {
      "content-type": "application/x-www-form-urlencoded",
      Cookie: ""
    },
    bindingState: null, //状态为1：同意了授权但绑定手机，2为已绑定了手机，为null就需要发起登录请求
    unionId: null,
    shopId: null,
    postNum: 0,
    haveNetwork: true,
    // 控制台输出的log是否关闭
    logOff: true,
  },
  onLaunch() {
    this.globalData.myAmapFun = new amapFile.AMapWX({ key: '14db0799d724b1866aa65ebbea42d8e5' });
    //清空控制台输出的log
    this.globalData.logOff &&
      ((console.log = () => {}),
      (console.info = () => {}),
      (console.warn = () => {}));
    // 监听网络状态变化
    // wx.onNetworkStatusChange(res => {
    //   this.globalData.haveNetwork = res.isConnected;
    //   if (!res.isConnected) {
    //     this.errorMsg({ title: "网络离家出走了" });
    //   } else {
    //     if (res.networkType == "2g") {
    //       this.warningMsg({ title: "正在使用2g网络" });
    //       // let tempText = getCurrentPages()
    //       // let pageContext = tempText[tempText.length-1]
    //       // pageContext.pageState.loading2()
    //     } else if (res.networkType == "3g") {
    //       this.warningMsg({ title: "正在使用3g网络" });
    //     } else if (res.networkType == "4g") {
    //       this.warningMsg({ title: "正在使用4g网络" });
    //     }
    //   }
    // });
    // this.getShopId();
    // this.xcxLogin();
    //添加转发
    wx.showShareMenu({ withShareTicket: true });
    wx.getSystemInfo({
      success(res) {
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        console.log(res.platform)
      }
    })
    "https://easy-mock.com/mock/5caf702952dde96a2577ac83/example/test"
  },
  onShow(showParam) {
    console.log("showParam123", showParam);
    console.log(" wx.getStorageSync('domain')", wx.getStorageSync('domain'));
    this.globalData.domain = wx.getStorageSync('domain')
  },
  /**
   * 监听当前网络的变化状态
   */
  getNetworkType() {
    console.log("ryy-getNetworkType")
    return new Promise((resolve, reject) => {
      
      wx.getNetworkType({
        success:(res)=> {
          const networkType = res.networkType
          if (networkType=="none") {
            resolve(false);
            this.globalData.haveNetwork = false;
          }else{
            this.globalData.haveNetwork = true;
            resolve(networkType);
          }
        },
        fail: (err)=>{
          console.error(err)     
          reject(false)
        }
      })
    })
  },
  /**
   * 获取shopid
   * @param callBack 回调函数
   */
  getShopId(callBack) {
    this.xcxPost({
      url: "/banner/getShopIdByAppid.do",
      data: { appid: this.globalData.AppId },
      success: resp => {
        console.log("getShopId-this", this);
        if (resp.errcode > -1) {
          this.globalData.shopId = resp.list.shopId;
          this.globalData.domain = resp.list.domain;
          if (callBack) {
            callBack();
          }
        }
      }
    });
  },
  /**
   * HTTPS 请求
   * @param options 请求参数二次封装包含以下属性
   */
  xcxPost(options = {}) {
    // options.mask && this.showMask();
    if (options.mask != 'hidden') {
      this.showMask();
    }
    let tempText = getCurrentPages()
    let pageContext = tempText[tempText.length - 1]//当前页面实例
    wx.request({
      url: this.globalData.postUrl + options.url,
      data: options.data || {},
      method: "POST",
      dataType: "json",
      header: this.globalData.header,
      success: (res) => {
        if (pageContext.pageState && pageContext.pageState.finish) {
          pageContext.pageState.finish()
        }
        console.log('success-com1', res)
        if (res.data == "noLogin") { //会话失效重新登录
          this.xcxLogin(() => {
            this.globalData.postNum++;
            //设置请求上限，防止重复提交并死循环
            if (this.globalData.postNum < 3) {
              this.xcxPost(options);
            }
          });
          return;
        }
        if (res.statusCode != 200) {
          this.showMsgModal({ content: res.statusCode + ' 服务器请求错误' })
          this.hideMask()
          return
        }
        if (res.data.errcode > 0) {
          this.globalData.postNum = 0
          if (typeof options.success == "function") {
            options.success(res.data);
            // if (options.mask != 'hidden') {
            //   setTimeout(() => {
            //     this.hideMask()
            //   }, 2000)
            // }
          }
        } else {
          if (res.data.errmsg=="用户被禁用") {
            this.showMsgModal({ content: '用户已被禁用！请联系客服' });
            
            return;
          }
          this.showMsgModal({ content: res.data.errmsg || '服务器返回错误！' });
          return;
        }
      },
      fail: (res) => {
        console.log('fail-com1')
        if (typeof options.fail == "function") {
          options.fail(res);
        } else {
          console.log('fail-com2')
          if (pageContext.pageState && pageContext.pageState.error) {
            pageContext.pageState.error()
          }

        }
        if (typeof options.fail == "string") { //请求失败的弹框提示
          wx.showToast({ title: options.fail, icon: 'loading', duration: 2000 });
        }
      },
      complete: (res) => {
        console.log('complete-com1')
        if (typeof options.complete == "function") {
          options.complete(res);
        }
        setTimeout(()=>{
          this.hideMask()
        },2500)
      }
    });
  },
  /**
   * 请求登录,获取用户相关信息
   * @param callback 回调函数
   * @param state 判断是否可以调取 wx.getUserInfo
   */
  xcxLogin(_callback, state) {
    wx.login({
      success: loginRes => {
        // 获取到请求码，继续请求用户的基本信息
        if (loginRes.code) {
          let code = loginRes.code;
          let formData = {
            type: 1, //类型（1判断是否有union_id，有则直接登录，没有则传type=2 2 授权登录）
            code: code,
            appid: this.globalData.AppId,
            encryptedData: null,
            iv: null
          };
          this.globalData.domain =wx.getStorageSync('domain')
          if (!state) {
            this.userLogin(formData).then(resp => {
              if (typeof _callback == "function") {
                console.log("_callback-func");
                _callback();
              }
              console.log("userLogin---then", resp);
            });
          } else if (state == "updateUserInfo") {
            wx.getUserInfo({
              withCredentials: true,
              success: res => {
                console.log("updateUserInfo-success", res);
                formData.type = 2;
                formData.userPhoto = res.userInfo.avatarUrl;
                formData.nickName = res.userInfo.nickName;
                formData.encryptedData = res.encryptedData;
                formData.iv = res.iv;

                this.globalData.userInfo = res.userInfo || {};
                this.userLogin(formData).then(resp => {
                  if (typeof _callback == "function") {
                    _callback();
                  }
                  console.log("userLogin---then2", resp);
                });
              },
              fail: err => {
                console.log("getUserInfo--fail", err);
              }
            });
          }
        } else {
          wx.showToast({
            title: "获取code失败！",
            icon: "loading",
            duration: 2000
          });
        }
      },
      fail: err=>{
        wx.showToast({
          title: "err",
          icon: "loading",
          duration: 2000
        });
      }
    });
  },
  /**
   * 向后台发起登录请求
   * @param _formData 请求登录参数
   */
  userLogin(_formData) {
    console.log("userLogin-start");
    return new Promise((resolve, reject) => {
      this.xcxPost({
        url: "/manager/user/userLogin.do",
        data: _formData || {},
        success: resp => {
          if (resp.errcode == 1) {
            //此处可以将服务端返回的登录状态保存起来
            this.globalData.header.Cookie =
              "JSESSIONID=" + resp.data.session_id;
            // this.globalData.unionId = resp.data.union_id;
            this.globalData.domain = resp.data.domain;
            this.globalData.phone = resp.data.phone;
            this.globalData.is_car = resp.data.is_car;
            this.globalData.is_owner = resp.data.is_owner || '0';
            wx.setStorageSync('is_owner', resp.data.is_owner || '0')
            this.globalData.is_approve = resp.data.is_approve;
            wx.setStorageSync('domain', resp.data.domain)
            console.log("this.globalData", this.globalData);
          }
          resolve(resp);
        }
      })
    });
  },
  /**
   * HTTPS 请求
   * @param options 请求参数二次封装包含以下属性
   * (_url: 请求地址,协议必须为https
   *  _data 请求参数请求参数
   *  _success 请求成功回调
   *  _fail 请求失败回调
   *  _complete 请求完成（成功或者失败）回调)
   */
  xcxUploadFile(options = {}) {
    wx.showLoading({
      mask: true,
      title: options._title || '',
    })
    wx.uploadFile({
      url: this.globalData.postUrl + options._url,
      filePath: options._filePath || {},
      // method: "GET",
      name: 'file',
      header: this.globalData.header,
      success: (res) => {
        res.data = JSON.parse(res.data);
        console.log("res.data", res.data)
        if (res.data.errcode > -1 || res.data.error>-1) {
          if (typeof options._success == "function") {
            options._success(res);
          }
        } else {
          this.errorMsg({
            title: res.errmsg || '上传失败！'
          });
          // options._success(res);
        }
      },
      fail: (res) => {
        if (typeof options._fail == "function") {
          options._fail(res);
        }
        if (typeof options._fail == "string") { //请求失败的弹框提示
          wx.showToast({
            title: options._fail,
            icon: 'loading',
            duration: 2000
          });
        }
      },
      complete: (res) => {
        if (typeof options._complete == "function") {
          options._complete(res);
        }
        wx.hideLoading()
      }
    });
  },
  //图片上传
  upImages(count, uploadImages, callback) {
    wx.chooseImage({
      count: count - uploadImages.length, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        if (res.errMsg == "chooseImage:ok"){
          callback(res)
        }
      },
      fail: function() {}
    })
  },
  //视频上传
  upVideo( callback) {
    wx.chooseVideo({
      // sourceType: ['camera', 'album'],
      sourceType: ['camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        console.log("chooseVideo-res", res)
        if (res.errMsg == "chooseVideo:ok") {
          callback(res)
        }
      },
      fail: function () { }
    })
  },
  //电话号码校验
  testPhone(s) {
    if (s != null && s) {
      var length = s.length;
      if (
        (length = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/.test(
          s
        ))
      ) {
        return true;
      } else {
        return false;
      }
    }
  },
  // 时间毫秒数转化为 **：**：** 格式
  minFormatSeconds(value,type) {

    var result = parseInt(Number(value) / 1000)
    var h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600);
    var m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
    var s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));
    return result = h + ":" + m + ":" + s;
  },
  /**
   *  依据经纬度计算两点之间的直线距离
   */
  distance(la1, lo1, la2, lo2) {
    var La1 = la1 * Math.PI / 180.0;
    var La2 = la2 * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;//地球半径
    s = Math.round(s * 10000) / 10000;
    console.log("计算结果", s)
    return s
  },
  addXing(str, startNum, starNum){
    if (str) {
      var str2 = ""
      if (startNum && starNum) {
        var _star = ""
        for (var i = 0; i < starNum.length; i++) {
          _star+="*"
        }
        str2 = str.substr(0, startNum) + _star + str.substr((startNum + starNum));
        return str2
      }
      str2 = str.substr(0, 3) + "***" + str.substr(6);
      return str2
    }else{
      return str
    }
  },
  /**
   * 出现加载弹框遮罩层
   */
  showMask() {
    wx.showLoading({ mask: true, title: "" });
  },
  /**
   * 隐藏加载弹框遮罩层
   */
  hideMask() {
    wx.hideLoading();
  },
  /**
   * 弹窗提示信息
   * @param options 消息弹窗参数
   */
  showMsgModal(options = {}) {
    !options.title && (options.title = "提示");
    !options.content && (options.content = "服务器请求返回错误");
    !options.showCancel && (options.showCancel = false);
    wx.showModal(options);
  },
  /**
   * 操作成功提示
   * @param options 消息参数
   */
  successMsg(options = {}) {
    wx.showToast({
      title: options.title || "Success!",
      // image: "/assets/imgs/icon/success.png",
      icon: 'none',
      mask: true,
      duration: 2000
    });
  },
  /**
   * 操作失败提示
   * @param options 消息参数
   */
  errorMsg(options = {}) {
    wx.showToast({
      title: options.title || "Error!",
      // image: "/assets/imgs/icon/error.png",
      icon: 'none',
      mask: true,
      duration: 2000
    });
  },
  /**
   * 操作警告提示
   * @param options 消息参数
   */
  warningMsg(options = {}) {
    wx.showToast({
      title: options.title || "Warning!",
      // image: "/assets/imgs/icon/warning.png",
      icon: 'none',
      duration: 2000
    });
  },
  /**
   * 信息提示
   * @param options 消息参数
   */
  infoMsg(options = {}) {
    wx.showToast({
      title: options.title || "Warning!",
      icon: "none",
      duration: 2000
    });
  },
});
