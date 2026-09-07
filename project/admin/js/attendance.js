import { db } from "./firebase/config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initLiff, saveData, saveLoginUserData, saveAttendanceStatus, fetchDoc, loadCollectionWhere } from "./utils/firestoreUtils.js";

// 変数宣言
let textData = '';
let selectedStatus = {};                                    // 押されたボタンのステータスを格納

const params = new URLSearchParams(window.location.search); 
const eventId = params.get("id");                           // URLからidを取得

const currentUser = await initLiff(eventId);                // ログインユーザのデータを格納

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
    // Firestoreから schedules/eventId のデータを取得（共通化）
    const data = await fetchDoc("schedules", eventId);

    if (!data) {
        document.getElementById("eventText").innerHTML = "<p>イベントが見つかりません</p>";
        return;
    }

    // テーブル要素を取得し、初期化
    const table = document.getElementById("attendance-table");
    table.innerHTML = ""; // 初期化

    // テーブルヘッダーの作成
    const headerRow = document.createElement("tr");

    // ★参加者列★
    const thName = document.createElement("th");
    thName.textContent = "参加者";
    thName.style.fontSize = '10px';
    thName.style.width = '70px';
    headerRow.appendChild(thName);

    // ★テキスト列★
    const text = data.text;

    const textArray = text.includes("\n") ? text.split("\n") : [text];

    textData = textArray;

    textArray.forEach(line => {
        const thSchedule = document.createElement("th");
        thSchedule.textContent = line;
        thSchedule.style.fontSize = '10px';
        thSchedule.style.width = '50px';
        headerRow.appendChild(thSchedule);
    });

    // ★コメント列★
    const thComment = document.createElement("th");
    thComment.textContent = "コメント";
    thComment.style.fontSize = '10px';
    headerRow.appendChild(thComment);

    // ヘッダー行をテーブルに追加
    table.appendChild(headerRow);

    const allAttendance = await loadCollectionWhere("attendance", eventId);

    // 各ユーザーの行
    allAttendance.forEach(userData => {
        const row = document.createElement("tr");

        // 参加者名
        const tdName = document.createElement("td");
        tdName.textContent = userData.displayName || "不明";
        tdName.style.fontSize = "10px";
        row.appendChild(tdName);

        // 出欠
        textArray.forEach((dateText) => {
            const td = document.createElement("td");

            // ★日付文字列で参照する
            const status = userData.selectedStatus?.[dateText] || "";

            td.textContent = status;
            row.appendChild(td);
        });


        // コメント
        const tdComment = document.createElement("td");
        tdComment.textContent = userData.comment || "";
        tdComment.style.fontSize = "10px";
        row.appendChild(tdComment);

        table.appendChild(row);
    });

//     // データを入れるための行を作成
//     const row = document.createElement("tr");

//     // 参加者列に参加者名を入れる
//     const tdName = document.createElement("td");

//     tdName.textContent = currentUser.displayName;
//     tdName.style.fontSize = '10px';
//     row.appendChild(tdName);

//     // ★ 自分の attendance を取得
//     const myAttendance = await fetchDoc("attendance", `${eventId}_${currentUser.userId}`);

//     // 日程ごとのセル（ここで直接 status を入れる）
//     textData.forEach((_, index) => {
//         const td = document.createElement("td");
//          const status = myAttendance.selectedStatus?.[String(index)] || myAttendance[String(index)] || "";
//         td.textContent = status;
//         row.appendChild(td);
//     });

//     // コメント欄
//     const tdComment = document.createElement("td");
//     tdComment.id = "comment-cell";
//     row.appendChild(tdComment);
//     table.appendChild(row);
}

loadEvent();


// ★「出欠を入力する」ボタン
// ボタンとフォームを取得
const attendanceButton = document.getElementById("attendance-btn");
const attendanceForm = document.getElementById("attendance-form");

// ボタンを押したらフォームを表示
attendanceButton.addEventListener("click", () => {

// 親コンテナ（縦並び）
const listContainer = document.getElementById("schedule-list");

// 初期化
listContainer.innerHTML = "";

// 1行ずつ追加
textData.forEach((dateText, index) => {

    // 行コンテナ（横並び）
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "space-between";
    row.style.marginBottom = "10px";

    // 日付（左）
    const dateElement = document.createElement("span");
    dateElement.textContent = dateText;
    dateElement.style.fontSize = "14px";

    // ボタンコンテナ（右・横並び）
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "8px";

    // ◯ボタン作成
    const btnCircle = document.createElement("button");
    btnCircle.textContent = "◯";
    btnCircle.dataset.status = "◯";
    btnCircle.classList.add("status-btn", "circle-btn");
    btnCircle.dataset.index = index;

     // △ボタン作成
    const btnTriangle = document.createElement("button");
    btnTriangle.textContent = "△";
    btnTriangle.dataset.status = "△";
    btnTriangle.classList.add("status-btn", "triangle-btn");
    btnTriangle.dataset.index = index;

    // ×ボタン作成
    const btnCross = document.createElement("button");
    btnCross.textContent = "✕";
    btnCross.dataset.status = "✕";
    btnCross.classList.add("status-btn", "cross-btn");
    btnCross.dataset.index = index;

    // ◯ボタン
    btnCircle.addEventListener("click", () => {
        btnCircle.classList.add("active");
        btnCross.classList.remove("active");
        btnTriangle.classList.remove("active");
    });

    // △ボタン
    btnTriangle.addEventListener("click", () => {
        btnTriangle.classList.add("active");
        btnCircle.classList.remove("active");
        btnCross.classList.remove("active");
    });

    // ×ボタン
    btnCross.addEventListener("click", () => {
        btnCross.classList.add("active");
        btnCircle.classList.remove("active");
        btnTriangle.classList.remove("active");
    });

    [btnCircle, btnTriangle, btnCross].forEach(btn => {
        btn.addEventListener("click", (e) => {
            const status = e.target.dataset.status;
            const index = e.target.dataset.index;
            const dataText = textData[index];

            console.log(`index:${index}, status:${status}`);

            // Firestoreに保存しない！
            // ここでは配列に記録するだけ
            selectedStatus[dataText] = status;
        });
    });


    // ボタンをコンテナに追加
    btnContainer.appendChild(btnCircle);
    btnContainer.appendChild(btnCross);
    btnContainer.appendChild(btnTriangle);

    // 行に追加
    row.appendChild(dateElement);
    row.appendChild(btnContainer);

    // 親に追加（縦に並ぶ）
    listContainer.appendChild(row);
});

    attendanceForm.style.display = "block";
});

async function saveButton() {
    const saveButton = document.getElementById("save");

    saveButton.addEventListener("click", async () => {
        const userId = currentUser.userId;
        const displayName = currentUser.displayName;

        const commentText = document.getElementById("comment").value;

        // Firestoreに保存
        await saveAttendanceStatus(userId, eventId, selectedStatus, commentText, displayName);

        // ★ 保存後に一覧を再描画（これが正解）
        await loadEvent();

        // 入力フォームを閉じる
        document.getElementById("attendance-form").style.display = "none";
    });


    // saveButton.addEventListener("click", async () => {
    //     const userId = currentUser.userId;
    //     const displayName = currentUser.displayName;

    //     // コメント取得
    //     const commentText = document.getElementById("comment").value;

    //     // コメントをテーブルに反映
    //     document.getElementById("comment-cell").textContent = commentText;
    //     document.getElementById("comment-cell").style.fontSize = "11px";

    //     // ★ まず Firestore に保存する（ここが重要）
    //     await saveAttendanceStatus(userId, eventId, selectedStatus, commentText, displayName);

    //     // ★ 保存後に最新データを取得する
    //     const attendanceData = await fetchDoc("attendance", `${eventId}_${userId}`);

    //     if (!attendanceData) return;

    //     // ★ 最新データをテーブルに反映
    //     textData.forEach((current, index) => {
    //     // Firestoreの構造に合わせて selectedStatus を参照
    //     const status =
    //         attendanceData.selectedStatus?.[String(index)] || "";
    //     const cell = document.getElementById(`cell-${index}`);

    //     if (status === "◯") cell.textContent = "◯";
    //     if (status === "△") cell.textContent = "△";
    //     if (status === "✕") cell.textContent = "✕";
    //     });

    //     // 入力フォームを閉じる
    //     document.getElementById("attendance-form").style.display = "none";
    // });
}

await saveButton();

const cancelButton = document.getElementById("cancel");

cancelButton.addEventListener("click", () => {
    const attendanceForm = document.getElementById("attendance-form");

    attendanceForm.style.display = "none"
});
