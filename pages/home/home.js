// pages/home/home.js
import { keys } from 'mobx-miniprogram';
import {createStoreBindings} from 'mobx-miniprogram-bindings'
import  {store}  from "../../store/store";

Page({

    /**
     * 页面的初始数据
     */
    data: {
      temp: [], // 临时变量
      user: '', // 当前用户
      isLogin: false, // 是否已经登录
      relativeInfo: [], // 关系列表
      listTemp: {}, // 好友列表
      userList: {}, // 好友列表
      info: {}, // 临时信息
      roomName: '', // 临时房间名
    },

    onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ["token", "user", "userList", "roomList"],
            actions: ["setToken", "setUser", "pushUserList", "pushRoomList"],
        });
        wx.getStorage({
          key:'user',
          // 箭头函数保留this关键字
          success: res => {
            // 异步接口在success回调才能拿到返回值
            console.log('读取缓存 => user')
            store.setUser(res.data)
            this.setData({
              ['user']:store.user,
              ['isLogin']:store.user ? true : false
            })
          }
        })
        wx.getStorage({
          key:'token',
          success: res => {
            // 异步接口在success回调才能拿到返回值
            console.log('读取缓存 => token')
            store.setToken(res.data)
            this.getRelList(res.data)
          }
        })
        this.setData({
          ['user']:store.user,
          ['isLogin']:this.data.user ? true : false
        })
      },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      console.log('监听显示')
      this.setData({
        ['user']:store.user,
        ['isLogin']:this.data.user ? true : false
      })
      this.getRelList(store.token)
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.storeBindings.destroyStoreBindings();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.data.user = store.user
        this.data.isLogin = this.data.user ? true : false
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    getRelList(id) {
      wx.request({
        url: 'http://localhost:9999/relative/getUserList/'+id,
        method: 'GET',
        success: res => {
          this.setData({
            ['relativeInfo']: res.data
          })
          this.getUserList.call(this, this.data.relativeInfo)
        }
      })
    },

    // 获取列表信息
    getUserList(list) {
      // 类型转换成list
      list = Array.from(list)
      // 搜集roomId
      let rooms = []
      list.forEach(item => {
        if (rooms.indexOf(item.roomId) == -1){
          rooms.push(item.roomId)
        }
      })
      // 构建数据结构
      // roomInfo = [ { roomId: 1, isGroup: 1, users:[ { userId: 2, username: 'xxx' }, { xxx } ] } ]
      let roomInfo;
      // 用户信息： { userId: 1, username: 'xxx'}
      // 1.获取user
      let userIds = [];
      let Name = '';
      // 2.遍历每一个会话，添加基本信息
      rooms.map(room => {
        userIds = []; // 初始化
        // 1.通过roomId 获取所有在这个会话的userId
        list.filter(item => item.roomId === room).forEach(item => { userIds.push(item.userId) })
        this.data.userList[room] = []
        // 2.根据userId获取用户名
        let userInfo = []; //存放用户信息
        let temp = {}; // 临时变量
        // 搜集每一个用户的信息
        userIds.forEach(id => {
          this.getUser.call(this,id) // 设置好了this.data.info
          setTimeout(() => {
            var info = {
              'username': this.data.info.username,
              'userId': this.data.info.userId
            }
            userInfo.push(info)
          }, 200)
        })
        // 3.获取房间名称
        this.getName.call(this, room).then(res => {
          this.setData({
            ['roomName']: res
          })
          roomInfo = {
            roomId:room,
            isGroup: list.filter(item => item.roomId === room).length > 1? 1:0,
            roomName: this.data.roomName,
            u: userInfo
          }
          this.setData({
            ['listTemp.'+room]: roomInfo,
          })
          store.pushRoomList(room, roomInfo)
          this.setData({
            ['userList']:store.roomList
          })
        
        })
        // 这边的所有setTimeout都是为了重新创建宏任务，使得微任务对变量的改变完成后才开始这些任务，使得执行顺序正确
        // 笔记：上方创建宏任务方法失效。原因：在forEach循环中，第一次循环的setTimeout创建的宏任务在第二次循环的微任务后发生，这是因为第一次创建完宏任务后，并不会在第一次的微任务，即异步请求数据后立即执行，因为循环的js栈还没有清空，因为不会进入第二个宏任务，而是转向第二次循环，因此多次循环的异步请求按顺序执行后才会执行setTimeout的内容。
        // 新解决办法：异步改成同步，将方法内的网络请求（异步）通过Promise对象返回，调用时使用.then函数可以等待异步请求结束后再执行内部的函数，以此将异步转换成同步。
      })
    },

    getUser(id) {
      const promise = new Promise((resolve, reject) => { 
        wx.request({
          url: 'http://localhost:9999/user/getUser/'+id,
          method: 'GET',
          success: res => {
            // 利用回调函数传回去
            this.setData({
              ['info'] : res.data
            })
            resolve(res.data);
          },
          fail: res => {
            reject(res)
          }
        })      
      })
    },

    getName(id) {
      const promise = new Promise((resolve, reject) => {
        wx.request({
          url: 'http://localhost:9999/room/getName/'+id,
          method: 'GET',
          success: res => {
            this.setData({
              ['roomName']: res.data
            })
            resolve(res.data)
          },
          fail: res => {
            reject(res)
          }
        })
      })
      return promise;
    },

    goChat(e) {
      let id = e.currentTarget.dataset.item // 获取roomId
      let name = e.currentTarget.dataset.name // 获取roomId
      wx.navigateTo({
        url: '../chat/chat?id='+id+'&name='+name,
      })
    }
})