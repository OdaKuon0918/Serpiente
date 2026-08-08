import { loadAll, deleteAll } from "./utils/firestoreUtils.js";

async function loadSchedules() {
  const schedules = await loadAll("schedules");
  const list = document.getElementById("schedule-list");

  schedules.forEach(item => {
    // 改行で分割
    const dates = item.text.split("\n");

    const eventId = item.id;

    // イベント名の見出し
    const title = document.createElement("h3");
    title.classList.add("event-title");
    title.textContent = item.eventName;
    list.appendChild(title);

    // 日付ごとにカードを生成
    dates.forEach(date => {
      const card = document.createElement("div");
      card.classList.add("event-card");
      card.textContent = `${date}`;
      card.dataset.eventId = eventId;
      card.dataset.date = date;

    card.addEventListener("click", () => {
      const selectedId = card.dataset.eventId;
      const selectedDate = card.dataset.date;

      // ★ formation.html に渡すために localStorage に保存
      localStorage.setItem("formationEventId", selectedId);
      localStorage.setItem("formationDate", selectedDate);

      // ★ フォーメーション画面へ遷移
      window.location.href = "formation.html";
    });

      list.appendChild(card);
    });
  });
}

loadSchedules();

// deleteAll("attendance");