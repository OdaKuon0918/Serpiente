import { db } from "./firebase/config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { saveData } from "./firebase/common.js";

async function initLiff() {
    await liff.init({ liffId: "2010961634-PvIMmuiT" });

    if (!liff.isLoggedIn()) {
        liff.login();
        return;
    }

    const profile = await liff.getProfile();

    // Firestoreにデータを保存
    await saveData("users", profile.userId,{
    userId: profile.userId,
    displayName: profile.displayName
    });
}

initLiff();

// URLからidを取得
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

// Firestoreからデータを取得して表示
/*
    async: これをつけた関数は非同期関数になる。
    await: 非同期処理の完了を待つ。awaitはasync関数内でしか使えない。
    　　　　awaitを使わないと、データが取れる前に次の処理が動く。
    　　　　これを使うことで、Firestoreの読み込みが終わるまで待てるようになる。
    ★同期処理と非同期処理について
    　同期処理：上から順番に必ず実行される処理
    　非同期処理：上から順番に実行されるとは限らない処理
    　　　　　　　すぐに終わらない処理は後で実行される処理
    　
    　非同期処理でFirebaseからデータの取得を行った場合
        (例)
            1　 データ  小
            2　 データ  大
            3   データ  小
        非同期処理の場合、処理順は132になる。
        表示されるデータの順番が、データの大きさで変わってしまう可能性がある。

      順番を保証したいなら、awaitを使って非同期処理の完了を待つ必要がある。

      ※同期処理で書いた場合、データを取得してくるまでの細かな処理がひとつひとつ終わったことを確認しながら
      　進めることになり、「then」でネストが深くなり可読性が落ちる。
      　なので、async/awaitを使うことで、非同期処理なのに、同期処理のように書けるので可読性が上がる。
*/

async function loadEvent() {
    // Firestoreのドキュメントを取得
    const docRef = doc(db, "schedules", eventId);

    /*
        スナップショット：Firestoreのドキュメントの状態を表すオブジェクト
        ※フィールド以外のデータも含まれているため、
        　このままでは、フィールドは取り出せない。
    */

    // ドキュメントのスナップショットを取得
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        document.getElementById("eventText").innerHTML = "<p>イベントが見つかりません</p>";
        return;
    }

    // ドキュメントのスナップショットからデータを取得
    const data = docSnap.data();

    // イベント名
    document.getElementById("eventName").textContent = data.eventName;

    const list = document.getElementById("eventText");
    list.innerHTML = ""; // 初期化

    // Firestoreから取得したtextフィールド
    const textData = data.text;

    // 改行で分割して配列化
    const dates = textData.split("\n").map(d => d.trim()).filter(Boolean);

    // 配列をループして表示
    dates.forEach(date => {
        const li = document.createElement("li");
        li.textContent = date;
        list.appendChild(li);
    });
}

loadEvent();