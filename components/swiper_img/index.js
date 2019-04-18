Component({
  properties: {
    imgList: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal) {
        this.setData({
          imgList: newVal
        })
      }
    },
    isPreview: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
        this.setData({
          isPreview: newVal
        })
      }
    },
    url: {
      type: String,
      value: ''
    },
    sHeight: {
      type: String,
      value: ''
    }
  },
  ready() {
    console.log('swiper', this.data.sHeight);
  },
  methods: {
    goImagePage: function (e) {
      if (this.data.isPreview) {
        //预览操作 url
        var imgArr = []
        var cururl = e.currentTarget.dataset.url
        this.data.imgList.forEach(ele => {
          imgArr.push(ele.url)
        })
        wx.previewImage({
          current: cururl, // 当前显示图片的http链接
          urls: imgArr // 需要预览的图片http链接列表
        })
      } else {
        // 跳转操作
        console.log('goImagePage', e);
        var producturl = e.currentTarget.dataset.producturl;
        var classname = e.currentTarget.dataset.classname;
        var classid = e.currentTarget.dataset.classid;
        var ordernum = e.currentTarget.dataset.ordernum;
        var urltype = e.currentTarget.dataset.urltype;// 链接类型 1-链接地址 3-商品编号 2-商品分类id
        if (urltype == 1 && producturl) {
          //跳转外部链接 
          // wx.navigateTo({
          //   url: "/pages/goods-details/index?nowpage=banner&id=" + e.currentTarget.dataset.id
          // })
          wx.navigateTo({
            url: "/pages/outLink/outLink?outlink=" + producturl
          })
          //通过triggerEvent来向父组件传递参数 "https://mp.weixin.qq.com/"
          // this.triggerEvent('changeCurrent', {
          //   bannerUrl: "https://mp.weixin.qq.com/"
          // })

        } else if (urltype == 2 && classid && classname) {
          //跳转内部分类链接 
          wx.navigateTo({
            url: "/pages/search/index?nowpage=" + classname + "&pid=" + classid
          })

        } else if (urltype == 3 && ordernum) {
          //跳转内部商品链接 
          wx.navigateTo({
            url: "/pages/goods-details/index?nowpage=banner&id=" + ordernum
          })
        }
      }

    }
  }
})