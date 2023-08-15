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

    // WebSocket のイベントハンドラを追加して接続状態を監視
    webSocketObject.addEventListener('open', () => {
      console.log(`WebSocket connected to ${url}`);
    });

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
      console.error(`WebSocket to ${socket.url} is not open.`);
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
    console.log(data)
    
    if (data.type.connectTest) {
      oneSocketReceived.send("success")
      console.log("success")
    }//
    else if (data.type.createAccount) createAccount(data, oneSocketReceived)//
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
    else if (data.type.threadPost) threadPost(data)//
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
    else if (data.type.renderingEngine) renderingEngine(oneSocketReceived)//
  });

  oneSocketReceived.on("close", () => {
    console.log("クライアントの接続がクローズされました");
  });
});

//アカウントの作成(username,hash,SocketのIDを記録)
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
    received.send(temporaryId)
  }
}

//ログイン(セッションIDを返す)
function login(data, received) {
  const referenceHash = database.getItem("hash")
  const checkHash = crypto.createHash("sha256").update(data.username + data.password).digest("hex")
  if (referenceHash == checkHash) {
    temporaryId = uuidv4()
    received.send(temporaryId)
    database.addItem("token", temporaryId)
  }
}

//設定を要求
function settings(data) {
  if (data.temporaryId == temporaryId) {
    database.addItem("username", data.username)
    database.addItem("hash", crypto.createHash("sha256").update(data.username + data.password).digest("hex"))
    database.addItem("mySocket", data.socket)
    database.addItem("serverIconImage", data.serverIconImage)
    database.addItem("serverEmoji", data.emoji)
    database.addItem("servername", data.servername)
    database.addItem("serverInformation", data.serverInformation)
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
  console.log("addServerリクエスト(確認前)")
  if (data.temporaryId == database.getItem("token")) {

    console.log("addServerリクエスト")
    //一人へのソケット接続
    const connectToOneSocketForServerRequest = connectToOneSocket(data.socket)

    connectToOneSocketForServerRequest.on('open', () => { // 'open' イベントを使用
      console.log("WebSocket接続が開かれました");

      connectToOneSocketForServerRequest.send(
        JSON.stringify({
          type: { joinRequestToServer: true },
          socket: database.getItem("mySocket")
        })
      )
    });

    connectToOneSocketForServerRequest.on('message', (getData) => { // 'message' イベントを使用
      console.log("サーバーから基本情報が送られました")
      const data = JSON.parse(getData)
      if(data.type.joinRequestToServerReply){
        database.addToList("ServerList", { image: data.image, title: data.title, serverInformation: data.serverInformation, socket: data.socket, emoji: data.emoji })
      }
    });
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
      emoji: database.getItem("serverEmoji"),
      socket: database.getItem("serverSocket")
    })
  )
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
  received.send(JSON.stringify(
    {
      threads: database.getItem("ThreadList"),
      image: database.getItem("serverIconImage"),
      title: database.getItem("servername"),
      emoji: database.getItem("serverEmoji"),
      serverInformation: database.getItem("serverInformation")
    }
  ))
}

//ダイレクトメッセージを送信
function threadPost(data) {
  console.log("threadPost")
  const uuid = uuidv4()
  //一人へのソケット接続

  const connectToOneSocketForServerForThread = connectToOneSocket(data.socket)

  connectToOneSocketForServerForThread.on('open', () => { // 'open' イベントを使用
    console.log("WebSocket接続が開かれました");

    connectToOneSocketForServerForThread.send(
      JSON.stringify({
        type: { threadPostRequest: true },
        title: data.title,
        headerImage: data.headerImage,
        message: data.message,
        uuid: uuid,
        myName: database.getItem("username"),
        myIcon: database.getItem("myIconImage"),
        socket: database.getItem("mySocket")
      })
    )
    console.log("サーバーへ送信")
  });

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
}

//スレ立てを参加者に通知
function threadPostRequest(data) {
  const urls = database.getItem("serverJoinList");

  const sockets = connectToMultipleSockets(urls);

  const message = JSON.stringify({
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
  });

  // WebSocket の接続が完了するまで待機
  Promise.all(sockets.map(socket => new Promise(resolve => {
    if (socket.readyState === WebSocket.OPEN) {
      resolve();
    } else {
      socket.addEventListener('open', resolve);
    }
  })))
  .then(() => {
    sendMessageToAllSockets(sockets, message);
    database.addToList("ThreadList", data);
  });
}

//スレ立ての通知を取得
function notificationNow(data) {
  database.addToList(data.data.serverSocket, data.data)
}

//スレにアクセス
function getThread(data, received) {
  //ブラウザからスレッドを立てたユーザーのsocketとuuidを送信
  const connectToOneSocketForGetThreadRequest = connectToOneSocket(data.socket)

  connectToOneSocketForGetThreadRequest.on("open", () => {
    connectToOneSocketForGetThreadRequest.send(
      JSON.stringify({
        type: { getThreadRequest: true },
        accessPoint: data.uuid
      })
    )
  })

  connectToOneSocketForGetThreadRequest.on('message', (getData) => {
    if(data.type.getThreadRequestReply){
      received.send(getData)
    }
  });
}

//スレアクセスの要請を取得
function getThreadRequest(data, received) {
  received.send(
    JSON.stringify({
      type: { getThreadRequestReply: true },
      data: database.getItem(data.accessPoint).threadMessage
    })
  )
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
function ThreadToSendMessageRequest(data) {
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

function NewMessage(data) {
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

function renderingEngine(received){
  console.log(getTimeLine())
  received.send(
    JSON.stringify({
      myName: database.getItem("username"),
      myHash: database.getItem("hash"),
      myIcon: database.getItem("myIconImage"),
      myHeader: database.getItem("myHeaderImage"),
      myBio: database.getItem("myBio"),
      friends: database.getItem("friendList") ?? [{ title: "フレンドがいません(悲しい)", image: "https://tadaup.jp/0612551642.png" }],
      servers: database.getItem("ServerList") ?? [{ title: "サーバーに所属していません。", emoji: "", badge: "" }],
      timeLine: getTimeLine()
    })
  )
}

function getTimeLine() {
  const threads = [];

  const ServerList = database.getItem("ServerList");
  ServerList.forEach(server => {
    threads.push(database.getItem(server.socket));
  });

  return threads;
}