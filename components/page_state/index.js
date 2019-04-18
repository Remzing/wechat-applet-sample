const loading = (that) => {
  return () => {
    that.setData({
      pageState: {
        state: 'loading',
        message: ''
      }
    })
  }
}
const loading2 = (that) => {
  return () => {
    that.setData({
      pageState: {
        state: 'loading2',
        message: ''
      }
    })
  }
}

const error = (that, newPageState) => {
  return (message = '请检查您的网络连接') => {
    that.setData({
      pageState: {
        state: 'error',
        message,
      }
    })
  }
}

const error2 = (that, newPageState) => {
  return (message = '请检查您的网络连接') => {
    that.setData({
      pageState: {
        state: 'error2',
        message,
      }
    })
  }
}

const empty = (that, message) => {
  return (message = '') => {
    that.setData({
      pageState: {
        state: 'empty',
        message
      }
    })
  }
}

const finish = (that) => {
  return () => {
    that.setData({
      pageState: {
        state: 'finish',
        message: ''
      }
    })
  }
}

export default (that) => {
  return {
    loading: loading(that),
    loading2: loading2(that),
    error: error(that),
    error2: error2(that),
    empty: empty(that),
    finish: finish(that)
  }
}