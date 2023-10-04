// pages/chat/chat.js
import {createStoreBindings} from 'mobx-miniprogram-bindings'
import  {store}  from "../../store/store";
import Socket from '../../socket/socket'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupName: '', // 群名
    contents: [], // 聊天纪录
    useInfo: [], // 存放群内用户的信息
    socket: null,
    roomId: -1, // 房间id
    context: '', // 输入框内容
    bottom: 'scrollBottom',
    scrollTop: 0,// 当前滚动条位置
    myUserId: '', // 当前用户id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.storeBindings = createStoreBindings(this, {
        store,
        fields: ["token", "user", "userList", "roomList"],
        actions: ["setToken", "setUser", "pushUserList", "pushRoomList"],
    });
    this.setData({
      ['groupName']:options.name,
      ['roomId']: options.id,
      ['myUserId']: store.token
    })
    this.getContent(options.id).then(res => {
      this.setData({
        ['contents']: res
      })
      let userIds = [];
      res.map(item => {
        if (userIds.indexOf(item.userId) === -1) {
          userIds.push(item.userId)
        }
      })
      userIds.map(id => {
        this.getHead(id).then(res => {
          store.pushUserList(id, res)
          this.setData({
            ['userInfo'] : store.userList,
          })
        })
      })
    })
    this.setData({
      ['bottom']: 'scrollBottom'
    })
    // let query = wx.createSelectorQuery().in(this)
    // query.select('.contentContainer').boundingClientRect(res=>{
    //    this.setData({
    //       scrollTop:  res.height
    //     })
    //     console.log(this.data.scrollTop)
    //  })
    // query.exec(res=>{})
    if(!this.socket){
      this.socket = new Socket()
      this.socket.webSocketStart(store.token)
    }
    
    this.socket.sotk.onMessage(onMessage => {
      var data = JSON.parse(onMessage.data);
      console.log('监听WebSocket接受到服务器的消息事件。服务器返回的消息',data);
      if (data.roomId !== this.data.roomId)
        return;
      var nowContent = this.data.contents
      nowContent.push({
        contentId: data.contentId,
        roomId:data.roomId,
        content:data.content,
        isFile:data.isFile,
        file:data.File,
        time:data.time,
        userId:data.userId
      })
      this.setData({
        ['contents']: nowContent
      })
      // 更新消息后，把滚动条移动到底端
    //   query.select('.contentContainer').boundingClientRect(res=>{
        this.setData({
           bottom: "scrollBottom"
         })
      // })
    //  query.exec(res=>{})
    
    //  发送后清空输入框
     this.setData({
      context: ''
     })
      console.log(this.data.contents)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // let query = wx.createSelectorQuery().in(this)
    // query.select('.contentContainer').boundingClientRect(res=>{
    //   console.log(res.height)
    //    this.setData({
    //       scrollTop:  res.height
    //     })
    //     console.log(this.data.scrollTop)
    //  })
    // query.exec(res=>{})
    this.setData({
      bottom: 'scrollBottom'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // let query = wx.createSelectorQuery().in(this)
    // query.select('.contentContainer').boundingClientRect(res=>{
    //    this.setData({
    //       scrollTop:  res.height
    //     })
    //     console.log(this.data.scrollTop)
    //  })
    // query.exec(res=>{})
    this.setData({
      bottom: 'scrollBottom'
    })
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
    // 关闭监听
    this.socket.closeWebsocket.call(this);
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

  // 进来页面后，根据传参提取聊天内容
  getContent(roomId) {
    let promise = new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:9999/content/getById/'+roomId,
        method: 'GET',
        success: res => {
          resolve(res.data)
        }
      })
    })
    return promise;
  },
// 返回上级
  goback() {
    wx.navigateBack({
      delta:1
   })
  },
  // 获取头像链接
  getHead(userId) {
    let promise = new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:9999/user/getHead/'+userId,
        method: 'GET',
        success: res => {
          resolve(res.data)
        }
      })
    })
    return promise;
  },
  send(){
    this.socket.sendSocketMessage({
      content: this.data.context,
      roomId:this.data.roomId
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
    var attributeName = name
    that.data[name] = value;
    that.setData({
      [attributeName]: that.data[name]
    });
  }
})