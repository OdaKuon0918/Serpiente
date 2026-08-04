document.getElementById("openEventPage").addEventListener("click", () => {
    const eventUrl = document.getElementById("eventURL").value;
    window.location.href = eventUrl;
});

// URLパラメータからイベントURLを取得
const params = new URLSearchParams(window.location.search);
const eventUrl = params.get("url");

// テキストボックスに表示
document.getElementById("eventURL").value = eventUrl;