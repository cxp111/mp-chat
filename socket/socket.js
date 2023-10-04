

export default class socket  {
  constructor() {
      this.sotk = null;
      this.socketOpen = false;
      this.wsbasePath = "ws://localhost:9999/websocket/";
  }
 

  webSocketStart = (userId) => {
    this.sotk = wx.connectSocket({
      url: this.wsbasePath+userId,
      success: res => {
        console.log('socket连接成功：', res);
      },
      fail: err => {
        console.log('出现错误:' + err);
        wx.showToast({
          title: '网络异常！',
        })
      }
    })

    this.webSokcketMethods();
  }

  webSokcketMethods = (e) =>{
    let that = this;
    this.sotk.onOpen(res => {
      this.socketOpen = true;
      console.log(this.socketOpen)
      console.log('监听 WebSocket 连接打开事件。', res);
    })
    this.sotk.onClose(onClose => {
      console.log('监听 WebSocket 连接关闭事件。', onClose)
      this.socketOpen = false;
    })
    this.sotk.onError(onError => {
      console.log('监听 WebSocket 错误。错误信息', onError)
      this.socketOpen = false
    })
  }

  sendSocketMessage = (msg) => {
    console.log(msg)
    let that = this;
    if (this.socketOpen){
      console.log('通过 WebSocket 连接发送数据', JSON.stringify(msg))
      this.sotk.send({
        data: JSON.stringify(msg)
      }, function (res) {
        console.log('已发送', res)
      })
    }
    
  }
  //关闭连接
  closeWebsocket = (str) => {
    if (this.socketOpen) {
      this.sotk.close(
        {
          code: "1000",
          reason: str,
          success: function () {
            console.log("成功关闭websocket连接");
          }
        }
      )
    }
  }
}
