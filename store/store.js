// store.js  引入所需配置
import { observable, action } from "mobx-miniprogram";
 
//创建仓库
export const store = observable({
  // 数据字段
  numA: 1,
  numB: 2,
  token: '1', // userId
  user: '', // username
  userList:{},// 好友列表
  roomList: {}, // 会话列表
 
  // 计算属性 数据改变时会执行，vue中的计算属性，返回sum这个变量
  get sum() {
    return this.numA + this.numB;
  },

  // actions 方法用于改变仓库的值
  update: action(function () {
    const sum = this.sum;
    this.numA = this.numB;
    this.numB = sum;
  }),

  setToken: action(function (token) {
    this.token = token;
  }),

  setUser: action(function (user) {
    this.user = user;
  }),

  // 保存头像链接
  pushUserList: action(function(key, content) {
    this.userList[key] = content
  }),

  pushRoomList: action(function(key, room) {
    this.roomList[key] = room;
  })
});