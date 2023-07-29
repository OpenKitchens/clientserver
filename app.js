const database = require("./database")
const crypto = require("crypto")
const WebSocket = require("ws")
const { v4: uuidv4 } = require("uuid")

let temporaryId = uuidv4()


//複数へのソケット接続
const connectToMultipleSockets = (urls) => {
  const webSocketObjects = [];

  urls.forEach((url) => {
    const webSocketObject = new WebSocket(url);
    webSocketObjects.push(webSocketObject);
  });

  return webSocketObjects;
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
    else if (data.type.openServer) openServer(data, oneSocketReceived)
    else if (data.type.renderingData) renderingData(data, oneSocketReceived)
    else if (data.type.timeLineData) timeLineData(data, oneSocketReceived)
    else if (data.type.threadPost) threadPost(data, oneSocketReceived)
    else if (data.type.getThread) getThread(data, oneSocketReceived)
    else if (data.type.friendRequest) friendRequest(data, oneSocketReceived)//
    else if (data.type.friendRequestReply) friendRequestReply(data)//
    else if (data.type.joinRequestToServer) joinRequestToServer(data, oneSocketReceived)//
    else if (data.type.joinRequestToServerReply) joinRequestToServerReply(data, oneSocketReceived)//
    else if (data.type.openServerRequest) openServerRequest(data, oneSocketReceived)
    else if (data.type.timeLineRequestToFriend) timeLineRequestToFriend(data, oneSocketReceived)
    else if (data.type.threadPostRequest) threadPostRequest(data, oneSocketReceived)
    else if (data.type.getThreadRequest) getThreadRequest(data, oneSocketReceived)
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
  database.addItem(data.socket+"Information", { image: data.image, title: data.title, socket: data.socket })//接続用
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
  database.addItem(data.socket+"Information", { image: data.image, title: data.title, socket: data.socket })//接続用
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
      socket: database.getItem("serverSocket")
    })
  )
}

//フレンド申請先の情報を取得
function joinRequestToServerReply(data) {
  database.addToList("ServerList", { image: data.image, title: data.title, socket: data.socket })
  database.addToList("ServerListSocket", data.socket);
}

//DMを開く
function openDM(data, received) {
  received.send(JSON.stringify(database.getItem(data.socket+"MessageList")))
}

//ダイレクトメッセージを送信
function sendToFriendDM(data) {
  //一人へのソケット接続
  const connectToOneSocketForFriendRequest = connectToOneSocket(data.socket)

  connectToOneSocketForFriendRequest.on("connection", (connectToOneSocketForFriendRequested) => {
    connectToOneSocketForFriendRequested.send(
      JSON.stringify({
        type: { sendToDM: true },
        title: data.title,
        message: data.message,
        socket: database.getItem("mySocket")
      })
    )
  })

  database.addToList(data.socket+"MessageList", {title: data.title, message: data.message})
}

//受信して、保存する
function sendToFriendDM(data) {
  database.addToList(data.socket+"MessageList", {title: data.title, message: data.message})
}