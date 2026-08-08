import { fetchDoc, loadCollectionWhere } from "./utils/firestoreUtils.js";

async function initFormationPage() {
  const eventId = localStorage.getItem("formationEventId");
  const selectedDate = localStorage.getItem("formationDate");

  if (!eventId || !selectedDate) {
    console.error("イベント情報が見つかりません");
    return;
  }

  // ★ 出席者情報を取得
  const allAttendance = await loadCollectionWhere("attendance", eventId);
  const starters = [];

  for (const userData of allAttendance) {
    const status = userData.selectedStatus?.[selectedDate] || "";
    if (status !== "◯") continue;

    const playerDoc = await fetchDoc("players", userData.userId);
    if (!playerDoc) continue;

    starters.push({
      userId: userData.userId,
      position: playerDoc.playerPosition || "",
      playerName: playerDoc.playerName || ""
    });
  }

  renderFormation(starters);
}

initFormationPage();

function renderFormation(starters) {
  const container = document.getElementById("players-container");
  container.innerHTML = ""; // 初期化

  starters.forEach(player => {
    // プレイヤー要素
    const div = document.createElement("div");
    div.classList.add("player");

    // 背番号＋名前
    const name = document.createElement("div");
    name.classList.add("player-name");
    name.textContent = `${player.playerName}`;

    // 背景アイコン（円形など）
    const icon = document.createElement("div");
    icon.classList.add("player-icon");

    div.appendChild(icon);
    div.appendChild(name);

    // ★ ポジションに応じて座標を決定
    const pos = getPositionCoordinates(player.position);
    div.style.left = pos.x + "px";
    div.style.top = pos.y + "px";

    // ドラッグ可能にする（既存関数）
    enableDrag(div);

    container.appendChild(div);
  });
}

function getPositionCoordinates(position) {
  const map = {
    GK: { x: 160, y: 425 },
    LSB: { x: 20, y: 335 },
    LCB: { x: 110, y: 335 },
    RCB: { x: 210, y: 335 },
    RSB: { x: 300, y: 335 },
    LCM: { x: 110, y: 235 },
    RCM: { x: 210, y: 235 },
    LM: { x: 20, y: 135 },
    CAM: { x: 160, y: 135 },
    RM: { x: 300, y: 135 },
    ST: { x: 160, y: 35 }
  };
  return map[position] || { x: 0, y: 0 };
}

function enableDrag(el) {
  let offsetX = 0;
  let offsetY = 0;

  el.addEventListener("mousedown", startDrag);
  el.addEventListener("touchstart", startDrag);

  function startDrag(e) {
    const rect = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    e.preventDefault();

    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    document.addEventListener("mousemove", move);
    document.addEventListener("touchmove", move);

    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
  }

  function move(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    e.preventDefault();

    el.style.left = clientX - offsetX + "px";
    el.style.top = clientY - offsetY + "px";
  }

  function endDrag() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("touchmove", move);
  }
}


