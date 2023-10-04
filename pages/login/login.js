// pages/login/login.js
import {createStoreBindings} from 'mobx-miniprogram-bindings'
import  {store}  from "../../store/store";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
      store,
      fields: ["numA", "numB", "sum", "token"],
      actions: ["update", "setToken", "setUser"],
    });
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
    this.storeBindings.destroyStoreBindings();
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

  submit() {
    wx.request({
      url: 'http://localhost:9999/login',
      method: 'post',
      data: {
        'username': this.data.username,
        'password': this.data.password
      },
      success: res => {
        // 如果没有请求到，提示
        if (!res.data.username){
          wx.showToast({
            title: '登录失败！',
            icon: 'error',
            duration: 2000 //持续的时间
          })
          return
        }
        console.log(res)
        // 设置本地缓存
        wx.setStorage({
          key:"user",
          data:res.data.username,
          success: function() {
            console.log('缓存 => 写入user成功')
          }
        })
        wx.setStorage({
          key:"token",
          data:res.data.userId,
          success: function() {
            console.log('缓存 => 写入token成功')
          }
        })
        // 设置全局状态
        this.data.token = res.data.userId
        this.data.user = res.data.username
        store.setToken(res.data.userId)
        store.setUser(res.data.username)
        wx.showToast({
          title: '登录成功！',
          icon: 'success',
          duration: 2000 //持续的时间
        })
        var pages = getCurrentPages();
        var prePage = pages[pages.length - 2];
        setTimeout(() => {
          wx.navigateBack({
            url: '../home/home',
          })
        }, 2000)
        
      },
      fail: res => {
        console.log('error=>'+res)
      }
    })
  },

  bindInput(e) {
    // 表单双向数据绑定
    var that = this;
    var dataset = e.target.dataset;
    // data-开头的是自定义属性，可以通过dataset获取到，dataset是一个json对象
    var name = dataset.name;
    var value = e.detail.value;
    // 拼接对象属性名，用于为对象属性赋值
    var attributeName = 'dataList.' + name
    that.data[name] = value;
    that.setData({
      [attributeName]: that.data[name]
    });
    console.log(this.data)
  }
})