const database = require("./database")
const crypto = require("crypto")
const WebSocket = require("ws")
const { v4: uuidv4 } = require("uuid")

let temporaryId = uuidv4()

const OneSocketReceive = new WebSocket.Server({ port: 8080 })


OneSocketReceive.on("connection", (OneSocketReceived) => {
  console.log("クライアントが接続しました")
  temporaryId = uuidv4()

  OneSocketReceived.on("message", (getData) => {
    const data = JSON.parse(getData)
    if (data.type.createAccount) createAccount(data)
    else if(data.type.login) login(data, OneSocketReceived)
    else if(data.type.settings) settings(data)
    else if(data.type.addFriend) addFriend(data, OneSocketReceived)
    else if(data.type.addServer) addServer(data, OneSocketReceived)
    else if(data.type.openDM) openDM(data, OneSocketReceived)
    else if(data.type.openServer) openServer(data, OneSocketReceived)
    else if(data.type.renderingData) renderingData(data, OneSocketReceived)
    else if(data.type.timeLineData) timeLineData(data, OneSocketReceived)
    else if(data.type.threadPost) threadPost(data, OneSocketReceived)
    else if(data.type.getThread) getThread(data, OneSocketReceived)
    else if(data.type.friendRequest) friendRequest(data, OneSocketReceived)
    else if(data.type.joinRequestToServer) joinRequestToServer(data, OneSocketReceived)
    else if(data.type.openDMbyFreind) openDMbyFreind(data, OneSocketReceived)
    else if(data.type.openServerRequest) openServerRequest(data, OneSocketReceived)
    else if(data.type.timeLineRequestToFriend) timeLineRequestToFriend(data, OneSocketReceived)
    else if(data.type.ThreadPostRequest) ThreadPostRequest(data, OneSocketReceived)
    else if(data.type.getThreadRequest) getThreadRequest(data, OneSocketReceived)
  })

  OneSocketReceived.on("close", () => {
    console.log("クライアントの接続がクローズされました")
  })
})

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
