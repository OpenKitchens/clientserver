# OpenProtocol.    ( Tacos )

**OpenProtocol(Tacos)の制定**

`hoge` **... 複数へのソケット接続**

`hoge` **... 一人へのソケット接続**

`hoge` **... 一人へのソケット返信**

`hoge` **... 一人へのソケット受信**

`hoge` **... 一人へのソケット送信**

「要求」と書いてあるものには全てセッションID(uuidで作成)が必要

## 完成したのはClientServerのみ

## **ClientServer**

`{type: createAccount}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　 createAccount

`{type: login}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　  login

`{type: settings}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　設定の変更を要求


`{type: addFriend}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　　　  フレンドの追加を要求(この時フレンド追加のuuidを送信)

**→Friend(Client鯖)へ**  `{type: friendRequest}` 　　　　　　　　　　　　　　　　フレンド申請

`{type: addServer}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　　　  サーバーの追加を要求

**→Serverへ**    `{type: joinRequestToServer}` 　　　　　　　　　　　　　　　　　サーバー参加申請

`{type: openDM}` 　                                 　　　　　　　　　　 　DMを開くことを要求

`{type: sendToFriendDM}`                                              フレンドへダイレクトメッセージを送信

**→Friend(Client鯖)へ**  `{type: sendToDM}` 　　　　　　　　　　　　　　　 　フレンドへダイレクトメッセージを送信

`{type: openServer}` 

`{type: renderingData}` 

**→返信** `{type: renderToData}` 　　　　　　　　　　　　　　　　　　　　　　　  レンダリングするに必要なデータを要求

`{type: timeLineData}`  

**→ 全てのFriend(Client鯖)へ** `{type: timeLineRequestToFriend}` 　　　　　　　　 タイムラインの取得を要求

`{type: threadPost}`  

**→Serverへ** `{type: threadPostRequest}` 　　　　　　　　　　　　　　　　　　　スレッドを立てる

`{type: getThread}` 

**→スレ主(Client鯖)へ**  `{type: getThreadRequest}` 　　　　　　　　　　　　　　　スレッドにアクセス

`{type: friendRequest}`  →  `{type: friendRequestReply}` 　　　　　　　　　　　 フレンド申請者に自分の情報を送信

`{type: friendRequestReply}`                                                   申請対象の情報を取得しデータベースに保存

`{type: joinRequestToServer}`  → `{type: joinRequestToServerSuccess}` 　　　　　 サーバー参加成功を返信

`{type: openDMbyFreind}`  →  `{type: openDMbyFriendSuccess}` 　　　　　　　　　　 DMの成功を送信

`{type: openServerRequest}`  →  `{type: openServerRequestSuccess}` 　　　　　　　 サーバーアクセスの成功(スレッド一覧を送信)

`{type: timeLineRequestToFriend}`  →  `{type: timeLineRequestToFriendSuccess}` 　自分が今閲覧中、または受信したThreadを5個送信

`{type: ThreadPostRequest}`

**→全てのサーバー参加者へ** `{type: NotificationNow}`    　　　　　　　　　　　　   スレッドが立った通知を参加者へ送信

`{type: getThreadRequest}`  →  `{type: getThreadRequestSuccess}`   　　　　　　　   スレッドアクセスの成功送信


#### CreateAccount関数の詳細
`data = {username: "examle", password: "exapmle_password", mySocket: "ws://example.com"}`

#### login関数の詳細
`data = {username: "examle", password: "exapmle_password"}`

#### settings関数の詳細
`data = {myIconImage: "examle.jpg", myHeaderImage: "exapmle_header.jpg", myBio: "example_myBio", temporaryId: "3e-091ae-23"}`

#### addFriend関数の詳細
`data = {socket: "ws://example.com", temporaryId: "3e-091ae-23"}`

#### friendRequestReplyの詳細
`data = {image: database.getItem("myIconImage"),title: database.getItem("username"),socket: database.getItem("mySocket")}`

### joinRequestToServerの詳細
`{image: database.getItem("serverIconImage"),title: database.getItem("servername"),socket: database.getItem("serverSocket")}`