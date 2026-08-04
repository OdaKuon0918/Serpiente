import { saveData } from "./firebase/common.js";

// flatpickr の日本語化を有効化
flatpickr.localize(flatpickr.l10ns.ja);

// 開始時間の整形
function startTime() {
    const startTimeInput = document.getElementById('startTime');
    const formattedStartTime = formatTime(startTimeInput.value);

    /*
    ①不正な入力値を勝手に書き換えないようにするため、
　  　変換できる時だけ、変換するようにしたい
    ②ネストを深くしないため。
    ③引数の戻り値がnullの場合、エラーを起こさないようにする。
    */

    // データの整形が出来た場合のみ、入力値を書き換える
    if (formattedStartTime) {
        startTimeInput.value = formattedStartTime;
    } 
}

// 終了時間の整形
function endTime() {
    const endTimeInput = document.getElementById('endTime');
    const formattedEndTime = formatTime(endTimeInput.value);
    
    // データの整形が出来た場合のみ、入力値を書き換える
    if (formattedEndTime) {
        endTimeInput.value = formattedEndTime;
    } 
}

// 入力された時間のフォーマット処理
function formatTime(input) {
    // 入力値から数字以外の文字を削除（どんな入力でも扱えるようにしたいから）
    const digits = input.replace(/[^\d]/g, "");

    // 4桁でない場合、nullを返す（整形出来ない場合を明確にしたい。）
    if (digits.length !== 4) {
        return null;
    }

    const hh = digits.slice(0,2);
    const mm = digits.slice(2,4);

    return `${hh}:${mm}`;
}

// イベントリスナーに変更
document.getElementById("startTime").addEventListener("change", startTime);
document.getElementById("endTime").addEventListener("change", endTime);

// flatpickrの設定と曜日をつける処理
window.onload = () => {
    flatpickr("#date", {
    locale: "ja",
    defaultDate: new Date(),
    inline: true, // ← カレンダーを常に表示
    dateFormat: "n月j日(D)", // 形式は使わないが必須
    onChange: function(selectedDates, dateStr, instance) {
        // 月移動時は selectedDates が空なので何もしないようにする。
        if (!selectedDates.length) return;

        // 日付をフォーマット
        const dateObj = selectedDates[0];
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        /*
        ■曜日を取得して日本語に変換
        jsでは、配列[番号]でインデックス番号に紐づいている要素を取得することが出来る。
        date.getDay()で選択された曜日の番号が取得できる。
        配列["日","月","火","水","木","金","土"]のインデックス番号に紐づいている日本語表記の曜日がweekdayに
        格納される、という作り。
        */
        const weekday = ["日","月","火","水","木","金","土"][dateObj.getDay()];
        const formattedDate = `${month}月${day}日(${weekday})`;

        // 開始・終了時間を取得
        const start = document.getElementById("startTime").value;
        const end = document.getElementById("endTime").value;

        // テキストエリアを取得
        const scheduleArea = document.getElementById("schedule");

        // 既存の内容に追記（改行付き）
        const newLine = `${formattedDate} ${start}～${end}`;
        scheduleArea.value += (scheduleArea.value ? "\n" : "") + newLine;
    }
});
}

// 保存ボタンのクリックイベント
document.getElementById("saveButton").addEventListener("click", async () => {
    const text = document.getElementById("schedule").value;
    const eventName = document.getElementById("eventName").value;

    if (!text.trim()) {
    alert("スケジュールが空です。");
    return;
    }

    if (!eventName.trim()) {
        alert("イベント名が空です。");
        return;
    }

    try {
        const eventId = await saveData("schedules", {
            text,
            eventName
        });

    // イベントURLを生成
    const eventUrl = `http://192.168.11.10:5500/project/admin/eventList.html?id=${eventId}`;

    window.location.href = `complete.html?url=${encodeURIComponent(eventUrl)}`;
    } catch (e) {
        alert("保存に失敗しました。");
    }
});