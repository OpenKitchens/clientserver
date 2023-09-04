const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const database = require("./database")
const crypto = require("crypto")

const app = express();
const port = 3000;
const { v4: uuidv4 } = require("uuid")

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
// 特定のオリジンからのリクエストを許可
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // 許可するHTTPメソッドを指定
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

app.post('/', (req, res) => {
  const data = req.body;
  console.log(data)

  if (data.type.connectTest) res.json("success")
  else if (data.type.createAccount) createAccount(data, res)
  else if (data.type.login) login(data, res)
  else if (data.type.renderingEngine) renderingEngine(res)
  
  else if (data.type.addServer) addServer(data, res)
  else if (data.type.joinRequestToServer) joinRequestToServer(data, res)

  else if (data.type.openServer) openServer(res)
  
  else if (data.type.threadPost) threadPost(data, res)
  else if (data.type.threadPostRequest) threadPostRequest(data)
  else if (data.type.notificationNow) notificationNow(data)

  else if (data.type.getThread) getThread(data, res)
  else if (data.type.postMessage) postMessage(data, res)
  else if (data.type.getMessage) getMessage(data, res)
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

var temporaryId = uuidv4()
var threadData = null;

//複数へのHTTP
async function sendDataToServers(data, urls) {
  const promises = urls.map(url => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  });

  const responses = await Promise.all(promises);

  const responseData = responses.map(async response => {
    if (response.ok) {
      const responseData = await response.json();
      return responseData;
    } else {
      return { error: 'Request failed' };
    }
  });

  return Promise.all(responseData);
}


function createAccount(data, received) {
  if (!database.getItem("username")) {
    database.addItem("username", data.username)
    database.addItem("hash", crypto.createHash("sha256").update(data.username + data.password).digest("hex"))
    database.addItem("mySocket", data.socket)
    database.addItem("serverIconImage", data.serverIconImage)
    database.addItem("serverEmoji", data.emoji)
    database.addItem("serverInformation", data.serverInformation)
    database.addItem("servername", data.servername)
    database.addItem("serverSocket", data.socket)
    database.addItem("myIconImage", data.myIconImage)
    database.addItem("myHeaderImage", data.myHeaderImage)
    database.addItem("myBio", data.myBio)
    temporaryId = uuidv4()
    database.addItem("token", temporaryId)
    received.json({ data: temporaryId})
  }
}

//ログイン(セッションIDを返す)
function login(data, received) {
  const referenceHash = database.getItem("hash")
  const checkHash = crypto.createHash("sha256").update(data.username + data.password).digest("hex")
  if (referenceHash == checkHash) {
    temporaryId = uuidv4()
    database.addItem("token", temporaryId)
    received.json({ data: temporaryId})
  }
}


function renderingEngine(received){
  console.log(getTimeLine())
  received.json({
    myName: database.getItem("username"),
    myHash: database.getItem("hash"),
    myIcon: database.getItem("myIconImage"),
    myHeader: database.getItem("myHeaderImage"),
    myBio: database.getItem("myBio"),
    friends: database.getItem("friendList") ?? [{ title: "フレンドがいません(悲しい)", image: "https://tadaup.jp/0612551642.png" }],
    servers: database.getItem("ServerList") ?? [{ title: "サーバーに所属していません。", emoji: "", badge: "" }],
    timeLine: getTimeLine()
  })
}

function getTimeLine() {
  const threads = [];

  const ServerList = database.getItem("ServerList");
  if(ServerList){
    ServerList.forEach(server => {
      threads.push(database.getItem(server.socket));
    });

    return threads;
  }else{
    return null;
  }
}

//サーバーの追加を要求
function addServer(data) {
  console.log("addServerリクエスト(確認前)")
  if (data.temporaryId == database.getItem("token")) {

    fetch(data.socket, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: { joinRequestToServer: true },
        socket: database.getItem("mySocket")
      })
    })
    .then(response => response.json())
    .then(data => {
      if(data.type.joinRequestToServerReply){
        database.addToList("ServerList", { image: data.image, title: data.title, serverInformation: data.serverInformation, socket: data.socket, emoji: data.emoji })
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
}

//フレンド申請者に自分の情報を送信
function joinRequestToServer(data, received) {
  database.addToList("serverJoinList", data.socket);
  received.json({
    type: { joinRequestToServerReply: true },
    image: database.getItem("serverIconImage"),
    title: database.getItem("servername"),
    emoji: database.getItem("serverEmoji"),
    socket: database.getItem("serverSocket")
  })
}

//サーバーにアクセス
function openServer(received) {
  received.json({
    threads: database.getItem("ThreadList"),
    image: database.getItem("serverIconImage"),
    title: database.getItem("servername"),
    emoji: database.getItem("serverEmoji"),
    serverInformation: database.getItem("serverInformation")
  })
}

//ダイレクトメッセージを送信
function threadPost(data, received) {
  console.log("threadPost")
  console.log(data)
  const uuid = uuidv4()

  received.json({ data: uuid })

  database.addItem(uuid, {
    threadInfo: {
      title: data.title,
      headerImage: data.headerImage,
      message: data.message,
      uuid: uuid,
      myName: database.getItem("username"),
      myIcon: database.getItem("myIconImage"),
      socket: database.getItem("mySocket")
    },
    threadMessage: []
  })

  fetch(data.socket, {
    method: 'POST', // POSTリクエストを指定
    headers: {
      'Content-Type': 'application/json' // リクエストのコンテンツタイプを指定
    },
    body: JSON.stringify(
      {
        type: { threadPostRequest: true },
        title: data.title,
        headerImage: data.headerImage,
        message: data.message,
        uuid: uuid,
        myName: database.getItem("username"),
        myIcon: database.getItem("myIconImage"),
        socket: database.getItem("mySocket")
      }
    ) // POSTデータをJSON形式に変換して指定
  })
  .catch(error => {
    console.error('エラーが発生しました:', error);
  });
}

//スレ立てを参加者に通知
function threadPostRequest(data) {
  const serverJoinList = database.getItem("serverJoinList");
  
  sendDataToServers(
    {
    type: { notificationNow: true },
    data: {
      title: data.title,
      headerImage: data.headerImage,
      message: data.message,
      uuid: data.uuid,
      myIcon: data.myIcon,
      myName: data.myName,
      socket: data.socket,
      serverSocket: database.getItem("mySocket"),
      serverName: database.getItem("servername"),
      serverEmoji: database.getItem("serverEmoji")
    }
  }
  , serverJoinList)

  database.addToList("ThreadList", data);
}

//スレ立ての通知を取得
function notificationNow(data) {
  database.addToList(data.data.serverSocket, data.data)
}

function getThread (data, received){
  console.log("getThread")
  const username = database.getItem("username")
  const myIconImage = database.getItem("myIconImage")
  received.json({ data: database.getItem(data.uuid), username: username, myIconImage: myIconImage })
}

function postMessage (data, received){
  console.log(data.uuid)
  database.addItemToList(data.uuid, "threadMessage", JSON.stringify({ message: data.message, icon: data.icon, name: data.name }));
  received.json({ data: database.getItem(data.uuid).threadMessage })
}

function getMessage (data, received){
  received.json({ data: database.getItem(data.uuid).threadMessage })
}