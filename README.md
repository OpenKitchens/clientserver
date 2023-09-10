# Instance    ( Tacos )

### instanceについて
instanceはopenkitchenのユーザーの本質でありまたコミュニティの原石です

instanceはユーザーそのものであります。

instanceはまたコミュニティを構成するserverでもあります。

コミュニティへの参加方法は本サービス(openkitchen)のホームにある「サーバーを追加」ボタンのモーダルformにinstanceのurlを入力することにより可能となります




### 構成 (必須)
instanceはnode.jsで構成されます
実行ファイルはapp.jsで、実行時のパスにこれを指定してください

instanceはユーザーのブラウザからリクエストを取得し送信し合います
またスレッド立てやサーバー追加など一部の機能はinstanceと他のinstance同士がリクエストを取得し送信し合います
以下の関数はリクエストを送受信する関数です

#### 関数一覧
``` js
  connectTest          //接続テスト用
  createAccount        //アカウント作成
  login                //ログイン
  renderingEngine      //レンダリング(タイムラインやユーザー情報をブラウザへ)
  
  addServer            //サーバー(コミュニティの一角)に参加
  joinRequestToServer  //サーバー参加のリクエストを受けた

  openServer           //サーバーの情報を取得
  
  threadPost           //スレ立て
  threadPostRequest    //スレ立てのリクエスト受信
  notificationNow      //サーバー参加者にスレッドの基本情報を送信

  getThread            //スレッドにアクセス
  postMessage          //リプライを送信
  getMessage           //リプライを取得
```
