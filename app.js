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
    if (data.type.createAccount) createAccount(data)
    else if(data.type.login) login(data, oneSocketReceived)
    else if(data.type.settings) settings(data)
    else if(data.type.addFriend) addFriend(data, oneSocketReceived) //ここまで
    else if(data.type.addServer) addServer(data, oneSocketReceived)
    else if(data.type.openDM) openDM(data, oneSocketReceived)
    else if(data.type.openServer) openServer(data, oneSocketReceived)
    else if(data.type.renderingData) renderingData(data, oneSocketReceived)
    else if(data.type.timeLineData) timeLineData(data, oneSocketReceived)
    else if(data.type.threadPost) threadPost(data, oneSocketReceived)
    else if(data.type.getThread) getThread(data, oneSocketReceived)
    else if(data.type.friendRequest) friendRequest(data, oneSocketReceived)
    else if(data.type.friendRequestReply) friendRequestReply(data)
    else if(data.type.joinRequestToServer) joinRequestToServer(data, oneSocketReceived)
    else if(data.type.openDMbyFreind) openDMbyFreind(data, oneSocketReceived)
    else if(data.type.openServerRequest) openServerRequest(data, oneSocketReceived)
    else if(data.type.timeLineRequestToFriend) timeLineRequestToFriend(data, oneSocketReceived)
    else if(data.type.threadPostRequest) threadPostRequest(data, oneSocketReceived)
    else if(data.type.getThreadRequest) getThreadRequest(data, oneSocketReceived)
  });

  oneSocketReceived.on("close", () => {
    console.log("クライアントの接続がクローズされました");
  });
});

//アカウントの作成(username,hash,SocketのIDを記録)
function createAccount(){
  database.addItem("username", data.username)
  database.addItem("hash", crypto.createHash("sha256").update(data.username+data.password).digest("hex"))
  database.addItem("mySocket", data.mySocket)
}

//ログイン(セッションIDを返す)
function login(data, received){
  const referenceHash = database.getItem("hash")
  const checkHash = crypto.createHash("sha256").update(data.username+data.message).digest("hex")
  if(referenceHash == checkHash){
    received.send(temporaryId)
  }
}

//設定
function settings(data) {
  if(data.temporaryId == temporaryId){
    database.addItem("myIconImage", data.myIconImage)
    database.addItem("myHeaderImage", data.myHeaderImage)
    database.addItem("myBio", data.myBio)
  }
}

//フレンドの追加
function addFriend(data) {
  //一人へのソケット接続
  const connectToOneSocketForFriendRequest = connectToOneSocket(data.socket)

  connectToOneSocketForFriendRequest.on("connection", (connectToOneSocketForFriendRequested) => {
    connectToOneSocketForFriendRequested.send(
      JSON.stringify({
        type: {friendRequest: true},
        mySocket: database.getItem("mySocket"),
        image: database.getItem("myIconImage"),
        title: database.getItem("username"),
        socket: database.getItem("mySocket")
      })
    )
  })
}

function friendRequestReply(data){
  database.addToList("friendList", { image: data.image, title: data.title, socket: data.socket })
  database.addToList("friendListSocket", data.socket);
}