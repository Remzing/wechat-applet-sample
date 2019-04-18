function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

//封装异步api
const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}
// 封装post请求
const request = (url, data) => {
  var promise = new Promise((resolve, reject) => {
    //网络请求
    wx.request({
      url: url,
      data: data,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': wx.getStorageSync('token')
      },
      success: function (res) {//服务器返回数据
        if (res.statusCode == 200) {
          resolve(res);
        } else {//返回错误提示信息
          reject(res.data);
        }
      },
      error: function (e) {
        reject('网络出错');
      }
    })
  });
  return promise;
}

const getLocationPromisified = wxPromisify(wx.getLocation);//获取经纬度
const showModalPromisified = wxPromisify(wx.showModal);//弹窗

module.exports = {
  formatTime: formatTime,
  wxPromisify: wxPromisify,
  // request: request
}
