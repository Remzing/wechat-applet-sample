function wxpay(app, _formData, _callBack) {
  let formData = _formData||""
  if (!formData) {
    formData = {}
  }
  
  app.xcxPost({
    url: '/manager/user/recharge.do',
    data: formData,
    success: function (data) {
      let _data = data
      // 发起支付
      xcxPay(_data.appId, _data.timeStamp, _data.nonceStr, _data.package, _data.signType, _data.paySign, formData, _callBack)
    },
    fail: function (res) {
      wx.hideLoading();
    }
  })
}
function xcxPay(appId, timestamp, nonceStr, package1, signType, paySign, formData, callBack) {
  console.log('appId', appId)
  console.log('timestamp', timestamp)
  console.log('nonceStr', nonceStr)
  console.log('package1', package1)
  console.log('signType', signType)
  console.log('paySign', paySign)
  wx.requestPayment({
    timeStamp: timestamp,
    nonceStr: nonceStr,
    package: package1,
    signType: signType,
    paySign: paySign,
    fail: function (res) {
      wx.hideLoading();
      wx.showToast({ title: '支付失败:', icon: 'none' })
      if (callBack) {
        callBack(formData, 2)
      }
    },
    success: function () {
      wx.hideLoading();
      wx.showToast({ title: '支付成功' })
      if (callBack) {
        callBack(formData, 1)
      }
    }
  })
}


module.exports = {
  wxpay: wxpay
}
