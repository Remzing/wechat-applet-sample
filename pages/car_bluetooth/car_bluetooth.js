//获取应用实例
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    devices: [],
    connected: false,
    chs: [],
    blue_mac: '',
    blue_deviceId: '',
    blue_keys: [],

    openIndex:0,
    lockIndex:0,
    wcyIsOpenState: false,

    // ridersBlueInfo // 代表最新存的车友key 存在local里
    // ridersBlueGettime // 代表最新存的车友key获取的时间 存在local里

    // ownerBlueInfo // 代表最新存的车主key 存在local里
    // ownerBlueGettime // 代表最新存的车主key获取的时间 存在local里
  },
  /*生命周期--start *
        /**
         * 生命周期函数--监听页面加载
         */
  onLoad(options) {
    this.options = options
    this.init()
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
  /* 初始化 */
  init() {
    app.xcxPost({
      url: "/manager/owner/ownerUnlockCarText.do",
      data: {
        
      },
      success: res => {
        let _datastr = res.data || "{}"
        let _data = JSON.parse(_datastr)
        console.log("mac-msg", _data, res)
        this.setData({
          blue_mac: _data.MAC,
          blue_deviceId: _data.deviceId,
          blue_keys: _data.keys || []
        })
      }
    })
  },
  openLock(){
    this.openBluetoothAdapter()
  },
  /**
   * 初始化蓝牙模块
   */
  openBluetoothAdapter() {
    console.log('ryy-scan')
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        console.log('openBluetoothAdapter-ERR', res)
        if (res.errCode == 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            }else{
              
            }
          })
          app.showMsgModal({ content: "当前蓝牙不可用,请检查蓝牙是否正常开启" })
        }
      }
    })
  },
  /**
   * 开始搜寻附近的蓝牙外围设备
   */
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },
  stopBluetoothDevicesDiscovery() {
    wx.stopBluetoothDevicesDiscovery()
  },
  /**
   * 监听寻找到新设备的事件
   */
  onBluetoothDeviceFound() {
    let searchNum = 0
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
        let { blue_mac } = this.data
        console.log('ryy-onBluetoothDeviceFound-blue_mac', blue_mac, device.deviceId)
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
        // if (blue_mac == device.deviceId) {
        //   this.createBLEConnection(device)
        // }else{
        //   searchNum++
        //   if (blue_mac && searchNum==20){
        //     app.showMsgModal({ content: "未查找到对应五车仪设备，请确保五车仪设备可用并且在五车仪设备周围重新操作" })
        //   }
        // }
      })
      
    })
  },
  createBLEConnection(device) {

    const ds = device
    const deviceId = ds.deviceId
    const serviceId = "0000FFE0-0000-1000-8000-00805F9B34FB"
    this.setData({
      serviceId
    })
    const name = ds.name
    console.log("ryy-ds", ds)
    console.log("ryy-连接", deviceId, name, serviceId)
    console.log("ryy-devices", this.data.devices)
    // wx.closeBLEConnection()
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      },
      fail: (res) => {
        console.error("ryy-createBLEConnection-error", res)
      },
    })
    this.stopBluetoothDevicesDiscovery()
  },
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },
  getBLEDeviceServices(deviceId) {
    let that = this
    wx.onBLEConnectionStateChange(function (res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
      if (!res.connected) {
        that.closeBLEConnection()
      }
      wx.showModal({
        title: 'state has changed',
        content: res.connected + '',
      })
    })
    // console.log('ryy-res.services', res.services)
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        console.log("ryy-getBLEDeviceServices", res.services)
        for (let i = 0; i < res.services.length; i++) {
          console.log("ryy-res.services[i]", res.services[i])
          if (res.services[i].isPrimary) {
            if (res.services[i].uuid.toUpperCase().indexOf("FEE0") != -1) {
              // service_id = services[i].uuid;
              console.log("ryy-res.services[i]-FEE0", res.services[i])
              this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
              return
            } else {
              console.log("ryy-this.data.serviceId", this.data.serviceId)
              this.getBLEDeviceCharacteristics(deviceId, this.data.serviceId)
              return
            }

          }
        }
      },
      fail: (err) => {
        console.error('err-getBLEDeviceServices', err)
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              success: (res1) => {
                console.log('ryy-read-init-success', res1)
              },
              fail: (err1) => {
                console.error('ryy-read-init-err', err1)
              }
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            // send
            this.loopSendStr()
          }
          if (item.properties.notify || item.properties.indicate) {
            console.log('ryy-start-notifyBLECharacteristicValueChange', item)
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
              success: (res) => {
                console.log('ryy--notifyBLECharacteristicValueChange2', res)
              },
              fail: (res) => {
                console.error('notifyBLECharacteristicValueChange2-err', res)
              }
            })
          }
        }
      },
      fail: (res) => {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
      data[`chs[${this.data.chs.length}]`] = {
        uuid: characteristic.characteristicId,
        value: ab2hex(characteristic.value),
        str: hexCharCodeToStr(ab2hex(characteristic.value))
      }
      this.setData(data)
    })
  },
  loopSendStr() {
    // let str = '152VmkCR2r7A5FB6VkIimwjIHwvbEWLAacabsQ6_T73kGQF8HqbEybppmBVtlSd9CnhD6PO7qtW1a9E7IEXQXmEcDgivxhioqlNIU133neSjWp1+hyigmrpTSUxny9FbiXcltsap_rggM69Cj_oHdF3sQ=='
    let str = this.data.blue_keys[0].key

    let loopNum = Math.ceil(str.length / 20)
    console.log('loopNum', loopNum)
    let strArr = []
    for (let i = 0; i < loopNum; i++) {
      console.log('nowStr', nowStr)
      let nowStr = str.substring(i * 20, i * 20 + 20)
      console.log('nowStr', nowStr)
      strArr.push(nowStr)
      // strArr = str.split(20)
    }
    console.log("loopSendStr", strArr)
    this.sendNum = 0
    this.writeBLECharacteristicValue(strArr)
  },
  writeBLECharacteristicValue(strArr) {
    var that = this
    // 向蓝牙设备发送一个0x00的16进制数据
    if (strArr.length <= this.sendNum) {
      return
    }
    let str = strArr[this.sendNum]
    let buffer = string2buffer(str)
    // let buffer = new ArrayBuffer(str.length)
    // let dataView = new DataView(buffer)
    // dataView.setUint8(0, str.length)
    console.log("buffer :" + buffer);
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._serviceId,
      characteristicId: this._characteristicId,
      value: buffer,
      success: (res) => {
        console.log('success-writeBLECharacteristicValue', res)
        that.sendNum++
        that.writeBLECharacteristicValue(strArr)

        wx.readBLECharacteristicValue({
          deviceId: this._deviceId,
          serviceId: this._serviceId,
          characteristicId: this._characteristicId,
          success: (res1) => {
            console.log('ryy-read-success', that.sendNum, res1)
          },
          fail: (err1) => {
            console.error('ryy-read--err', that.sendNum, err1)
          }
        })
      },
      fail: (err) => {
        console.error('err-writeBLECharacteristicValue', err)
      }
    })
  },
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
})

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
// 十六进制转换为字符串
function hexCharCodeToStr(hexCharCodeStr) {
　　var trimedStr = hexCharCodeStr.trim();
　　var rawStr =
  trimedStr.substr(0, 2).toLowerCase() === "0x"
    ?
    trimedStr.substr(2)
    :
    trimedStr;
　　var len = rawStr.length;
　　if (len % 2 !== 0) {
  alert("Illegal Format ASCII Code!");
  return "";
　　}
　　var curCharCode;
　　var resultStr = [];
　　for (var i = 0; i < len; i = i + 2) {
  curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
  resultStr.push(String.fromCharCode(curCharCode));
　　}
　　return resultStr.join("");
}
//字符串转ArrayBuffer
function string2buffer(str) {
  // 首先将字符串转为16进制
  let val = ""
  for (let i = 0; i < str.length; i++) {
    if (val === '') {
      val = str.charCodeAt(i).toString(16)
    } else {
      val += ',' + str.charCodeAt(i).toString(16)
    }
  }
  // 将16进制转化为ArrayBuffer
  return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  })).buffer
}