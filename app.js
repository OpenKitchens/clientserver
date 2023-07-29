const database = require("./database")
const crypto = require("crypto")
const WebSocket = require("ws")
const { v4: uuidv4 } = require("uuid")

var temporaryId = uuidv4()
var threadData = null;

//複数へのソケット接続
const connectToMultipleSockets = (urls) => {
  const webSocketObjects = [];

  urls.forEach((url) => {
    const webSocketObject = new WebSocket(url);
    webSocketObjects.push(webSocketObject);
  });

  return webSocketObjects;
}

// WebSocketオブジェクトたちに対してメッセージを送信する関数
const sendMessageToAllSockets = (sockets, message) => {
  sockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    } else {
      console.error('WebSocket is not open.');
    }
  });
}

//一人へのソケット接続
const connectToOneSocket = (url) => new WebSocket(url)

//ソケット受信
const oneSocketReceive = new WebSocket.Server({ port: 8080 })

oneSocketReceive.on("connection", (oneSocketReceived) => {
  console.log("クライアントが接続しました");
  temporaryId = uuidv4();

  oneSocketReceived.on("message", (getData) => {
    const data = JSON.parse(getData)
    if (data.type.createAccount) createAccount(data)//
    else if (data.type.login) login(data, oneSocketReceived)//
    else if (data.type.settings) settings(data)//
    else if (data.type.addFriend) addFriend(data, oneSocketReceived) //ここまで
    else if (data.type.addServer) addServer(data, oneSocketReceived)//
    else if (data.type.openDM) openDM(data, oneSocketReceived)//
    else if (data.type.sendToFriendDM) sendToFriendDM(data)//
    else if (data.type.sendToDM) sendToDM(data, oneSocketReceived)//
    else if (data.type.openServer) openServer(data, oneSocketReceived)//
    else if (data.type.renderingData) renderingData(data, oneSocketReceived)
    else if (data.type.timeLineData) timeLineData(data, oneSocketReceived)
    else if (data.type.threadPost) threadPost(data, oneSocketReceived)//
    else if (data.type.notificationNow) notificationNow(data, oneSocketReceived)//
    else if (data.type.getThread) getThread(data, oneSocketReceived)//
    else if (data.type.friendRequest) friendRequest(data, oneSocketReceived)//
    else if (data.type.friendRequestReply) friendRequestReply(data)//
    else if (data.type.joinRequestToServer) joinRequestToServer(data, oneSocketReceived)//
    else if (data.type.joinRequestToServerReply) joinRequestToServerReply(data, oneSocketReceived)//
    else if (data.type.timeLineRequestToFriend) timeLineRequestToFriend(data, oneSocketReceived)
    else if (data.type.threadPostRequest) threadPostRequest(data, oneSocketReceived)//
    else if (data.type.getThreadRequest) getThreadRequest(data, oneSocketReceived)//
    else if (data.type.getThreadRequestReply) getThreadRequest(data, getThreadRequestReply)//
    else if (data.type.ThreadToSendMessage) getThreadRequest(data, ThreadToSendMessage)//
    else if (data.type.ThreadToSendMessageRequest) getThreadRequest(data, ThreadToSendMessageRequest)//
    else if (data.type.NewMessage) getThreadRequest(data, NewMessage)//
    else if (data.type.haveNewMessage) getThreadRequest(data, haveNewMessage)//
  });

  oneSocketReceived.on("close", () => {
    console.log("クライアントの接続がクローズされました");
  });
});

//アカウントの作成(username,hash,SocketのIDを記録)
function createAccount() {
  database.addItem("username", data.username)
  database.addItem("hash", crypto.createHash("sha256").update(data.username + data.password).digest("hex"))
  database.addItem("mySocket", data.socket)
  database.addItem("serverIconImage", data.serverIconImage)
  database.addItem("servername", data.servername)
  database.addItem("serverSocket", data.socket)
  database.addItem("myIconImage", data.myIconImage)
  database.addItem("myHeaderImage", data.myHeaderImage)
  database.addItem("myBio", data.myBio)
}

//ログイン(セッションIDを返す)
function login(data, received) {
  const referenceHash = database.getItem("hash")
  const checkHash = crypto.createHash("sha256").update(data.username + data.message).digest("hex")
  if (referenceHash == checkHash) {
    received.send(temporaryId)
  }
}

//設定を要求
function settings(data) {
  if (data.temporaryId == temporaryId) {
    database.addItem("username", data.username)
    database.addItem("hash", crypto.createHash("sha256").update(data.username + data.password).digest("hex"))
    database.addItem("mySocket", data.socket)
    database.addItem("serverIconImage", data.serverIconImage)
    database.addItem("servername", data.servername)
    database.addItem("serverInformation", data.ServerInformation)
    database.addItem("serverSocket", data.socket)
    database.addItem("myIconImage", data.myIconImage)
    database.addItem("myHeaderImage", data.myHeaderImage)
    database.addItem("myBio", data.myBio)
  }
}

//フレンドの追加を要求
function addFriend(data) {
  if (data.temporaryId == temporaryId) {
    //一人へのソケット接続
    const connectToOneSocketForFriendRequest = connectToOneSocket(data.socket)

    connectToOneSocketForFriendRequest.on("connection", (connectToOneSocketForFriendRequested) => {
      connectToOneSocketForFriendRequested.send(
        JSON.stringify({
          type: { friendRequest: true },
          image: database.getItem("myIconImage"),
          title: database.getItem("username"),
          socket: database.getItem("mySocket")
        })
      )
    })
  }
}

//フレンド申請者に自分の情報を送信
function friendRequest(data, received) {
  database.addToList("friendList", { image: data.image, title: data.title, socket: data.socket })//画面レンタリング用
  database.addItem(data.socket + "Information", { image: data.image, title: data.title, socket: data.socket })//接続用
  received.send(
    JSON.stringify({
      type: { friendRequestReply: true },
      image: database.getItem("myIconImage"),
      title: database.getItem("username"),
      socket: database.getItem("mySocket")
    })
  )
}

//フレンド申請先の情報を取得
function friendRequestReply(data) {
  database.addToList("friendList", { image: data.image, title: data.title, socket: data.socket })//画面レンタリング用
  database.addItem(data.socket + "Information", { image: data.image, title: data.title, socket: data.socket })//接続用
}

//サーバーの追加を要求
function addServer(data) {
  if (data.temporaryId == temporaryId) {
    //一人へのソケット接続
    const connectToOneSocketForServerRequest = connectToOneSocket(data.socket)

    connectToOneSocketForServerRequest.on("connection", (connectToOneSocketForServerRequested) => {
      connectToOneSocketForServerRequested.send(
        JSON.stringify({
          type: { joinRequestToServer: true },
          socket: database.getItem("mySocket")
        })
      )
    })
  }
}

//フレンド申請者に自分の情報を送信
function joinRequestToServer(data, received) {
  database.addToList("serverJoinList", data.socket);
  received.send(
    JSON.stringify({
      type: { joinRequestToServerReply: true },
      image: database.getItem("serverIconImage"),
      title: database.getItem("servername"),
      serverInformation: database.getItem("serverInformation"),
      socket: database.getItem("serverSocket")
    })
  )
}

//フレンド申請先の情報を取得
function joinRequestToServerReply(data) {
  database.addToList("ServerList", { image: data.image, title: data.title, serverInformation: data.serverInformation, socket: data.socket })
}

//DMを開く
function openDM(data, received) {
  received.send(JSON.stringify(database.getItem(data.socket + "MessageList")))
}

//ダイレクトメッセージを送信
function sendToFriendDM(data) {
  //一人へのソケット接続
  const connectToOneSocketForFriendToMessage = connectToOneSocket(data.socket)

  connectToOneSocketForFriendToMessage.on("connection", (connectToOneSocketForFriendToMessaged) => {
    connectToOneSocketForFriendToMessaged.send(
      JSON.stringify({
        type: { sendToDM: true },
        title: data.title,
        message: data.message,
        socket: database.getItem("mySocket")
      })
    )
  })

  database.addToList(data.socket + "MessageList", { title: data.title, message: data.message })
}

//受信して、保存する
function sendToFriendDM(data) {
  database.addToList(data.socket + "MessageList", { title: data.title, message: data.message })
}

//サーバーにアクセス
function openServer(data, received) {
  received.send(JSON.stringify(database.getItem(data.socket + "ThreadList")))
}

//ダイレクトメッセージを送信
function threadPost(data) {

  const uuid = uuidv4()
  //一人へのソケット接続
  const connectToOneSocketForServerForThread = connectToOneSocket(data.socket)

  connectToOneSocketForServerForThread.on("connection", (connectToOneSocketForServerForThreaded) => {
    connectToOneSocketForServerForThreaded.send(
      JSON.stringify({
        type: { threadPostRequest: true },
        title: data.title,
        headerImagemage: data.headerImagemage,
        message: data.message,
        serverName: data.serverName,
        uuid: uuid,
        myName: database.getItem("username"),
        socket: database.getItem("mySocket")
      })
    )
  })

  database.addItem(uuid, {
    threadInfo: {
      title: data.title,
      headerImagemage: data.headerImagemage,
      message: data.message,
      serverName: data.serverName,
      uuid: uuid,
      myName: database.getItem("username"),
      socket: database.getItem("mySocket")
    },
    threadMessage: []
  })
}

//スレ立てを参加者に通知
function threadPostRequest(data) {
  // 接続するURLのリスト
  const urls = database.getItem("serverJoinList");

  // 複数のWebSocketオブジェクトを取得
  const sockets = connectToMultipleSockets(urls);

  // すべてのWebSocketオブジェクトにメッセージを送信
  const messageToSend = data;
  sendMessageToAllSockets(sockets, JSON.stringify(
    { type: { notificationNow: true }, data: data }
  ));
}

//スレ立ての通知を取得
function notificationNow(data) {
  database.addToList(data.data.serverName, data.data)
}

//スレにアクセス
function getThread(data) {
  const connectToOneSocketForFriendRequest = connectToOneSocket(data.socket)

  connectToOneSocketForFriendRequest.on("connection", (connectToOneSocketForFriendRequested) => {
    connectToOneSocketForFriendRequested.send(
      JSON.stringify({
        type: { getThreadRequest: true },
        accessPoint: data.uuid
      })
    )
  })
}

//スレアクセスの要請を取得
function getThreadRequest(data, received){
  received.send(
    JSON.stringify({
      type: { getThreadRequestReply: true },
      data: database.getItem(data.accessPoint).threadMessage
    })
  )
}

//スレの中身を取得
function getThreadRequestReply(data){
  threadData = data
}

//スレッドに送信
function ThreadToSendMessage(data) {
  const connectToOneSocketForThreadToMessage = connectToOneSocket(data.socket)

  connectToOneSocketForThreadToMessage.on("connection", (connectToOneSocketForThreadToMessaged) => {
    connectToOneSocketForThreadToMessaged.send(
      JSON.stringify({
        type: { ThreadToSendMessageRequest: true },
        data: data,
        uuid: data.uuid,
        socket: data.socket
      })
    )
  })
}

//Threadに送信されたデータをばら撒く
function ThreadToSendMessageRequest(data){
  const connectToOneSocketForThreadToMessage = connectToOneSocket(data.serverSocket)
  //uuidでスレッドのメッセージを取得
  const MessageData = database.getItem(data.uuid).threadMessage.push(data)
  //uuidでスレッドに書き込む
  database.addItem(data.uuid, MessageData)
  connectToOneSocketForThreadToMessage.on("connection", (connectToOneSocketForThreadToMessaged) => {
    connectToOneSocketForThreadToMessaged.send(
      JSON.stringify({
        type: { NewMessage: true },
        uuid: data.uuid,
        socket: data.socket
      })
    )
  })
}

function NewMessage(data){
  // 接続するURLのリスト
  const urls = database.getItem("serverJoinList");

  // 複数のWebSocketオブジェクトを取得
  const sockets = connectToMultipleSockets(urls);

  sendMessageToAllSockets(sockets, JSON.stringify(
    { type: { haveNewMessage: true }, uuid: data.uuid, socket: data.socket }
  ));
}

function haveNewMessage(data) {
  getThread(data)
}
//threadDataに変更があった時レンタリングデータをclientに送信