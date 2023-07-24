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

`{type: createAccount}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　 createAccountを要求

`{type: login}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　  loginを要求

`{type: settings}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　設定の変更を要求

`{type: addFriend}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　　　  フレンドの追加を要求

**→Friend(Client鯖)へ**  `{type: friendRequest}` 　　　　　　　　　　　　　　　　フレンド申請

`{type: addServer}` 　　　　　　　　　　　　　　　　　　　　　　　　　　　　　  サーバーの追加を要求

**→Serverへ**    `{type: joinRequestToServer}` 　　　　　　　　　　　　　　　　　サーバー参加申請

`{type: openDM}` 

**→Friend(Client鯖)へ**  `{type: openDMRequest}` 　　　　　　　　　　　　　　　 　DMを開くことを要求

`{type: openServer}` 

**→Serverへ**   `{type: openServerRequest}` 　　　　　　　　　　　　　　　　　　  サーバーを開くことを要求

`{type: renderingData}` 

**→返信** `{type: renderToData}` 　　　　　　　　　　　　　　　　　　　　　　　  レンダリングするに必要なデータを要求

`{type: timeLineData}`  

**→ 全てのFriend(Client鯖)へ** `{type: timeLineRequestToFriend}` 　　　　　　　　 タイムラインの取得を要求

`{type: threadPost}`  

**→Serverへ** `{type: threadPostRequest}` 　　　　　　　　　　　　　　　　　　　スレッドを立てる

`{type: getThread}` 

**→スレ主(Client鯖)へ**  `{type: getThreadRequest}` 　　　　　　　　　　　　　　　スレッドにアクセス

`{type: friendRequest}`  →  `{type: friendRequestSuccess}` 　　　　　　　　　　　 フレンド申請成功を返信

`{type: joinRequestToServer}`  → `{type: joinRequestToServerSuccess}` 　　　　　 サーバー参加成功を返信

`{type: openDMbyFreind}`  →  `{type: openDMbyFriendSuccess}` 　　　　　　　　　　 DMの成功を送信

`{type: openServerRequest}`  →  `{type: openServerRequestSuccess}` 　　　　　　　 サーバーアクセスの成功(スレッド一覧を送信)

`{type: timeLineRequestToFriend}`  →  `{type: timeLineRequestToFriendSuccess}` 　自分が今閲覧中、または受信したThreadを5個送信

`{type: ThreadPostRequest}`

**→全てのサーバー参加者へ** `{type: NotificationNow}`    　　　　　　　　　　　　   スレッドが立った通知を参加者へ送信

`{type: getThreadRequest}`  →  `{type: getThreadRequestSuccess}`   　　　　　　　   スレッドアクセスの成功送信
