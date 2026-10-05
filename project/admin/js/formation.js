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
  const benchMembers = [];

  // ★ 既に割り当てられたポジションを管理するコレクション
  const assignedPositions = new Set();

  for (const userData of allAttendance) {
    const status = userData.selectedStatus?.[selectedDate] || "";
    if (status !== "◯") continue;

    const playerDoc = await fetchDoc("players", userData.userId);
    if (!playerDoc) continue;

    const player = {
      userId: userData.userId,
      position: playerDoc.playerPosition || "",
      playerName: playerDoc.playerName || "",
      playerNumber: playerDoc.playerNumber || ""
    };

    // スタメンに割り当てられたポジションと重複があった場合、ベンチに配置する
    if (!assignedPositions.has(player.position)) {
      assignedPositions.add(player.position);
      starters.push(player);  
    } else {
      benchMembers.push(player);
    }
  }

  renderFormation(starters, benchMembers);
}

initFormationPage();

function renderFormation(starters, benchMembers) {
  const container = document.getElementById("players-container");
  container.innerHTML = ""; // 初期化

  starters.forEach(player => {
    // プレイヤー要素
    const div = document.createElement("div");
    div.classList.add("player");

    // 背番号
    const name = document.createElement("div");
    name.classList.add("player-name");
    name.textContent = player.playerNumber;

    // 背景アイコンと名前を表示
    const icon = document.createElement("div");
    icon.classList.add("player-icon");
    icon.textContent = player.playerName;

    div.appendChild(icon);
    div.appendChild(name);

    // ポジションに応じて座標を決定
    const pos = getPositionCoordinates(player.position);
    div.style.left = pos.x + "px";
    div.style.top = pos.y + "px";

    // ドラッグ可能にする（既存関数）
    enableDrag(div);
    container.appendChild(div);
  });

  // ベンチメンバーの表示
  const benchContainer = document.getElementById("bench-container");
  benchContainer.innerHTML = "";

  benchMembers.forEach((player, index) => {
    // ベンチプレイヤー要素
    const div = document.createElement("div");
    div.classList.add("player");

    // 背景アイコンと名前を表示
    const icon = document.createElement("div");
    icon.classList.add("player-icon");
    icon.textContent = player.playerName;

    // 背番号表示
    const name = document.createElement("div");
    name.classList.add("player-name");
    name.textContent = player.playerNumber;

    div.appendChild(icon);
    div.appendChild(name);

    div.style.position = "absolute";
    div.style.left = `${20 + index * 70}px`;
    div.style.top = "480px";

    benchContainer.appendChild(div);

    // ドラッグ可能にする（既存関数）
    enableDrag(div);
    container.appendChild(div);
  });
}

function getPositionCoordinates(position) {
  const map = {
    GK:  { x: 160, y: 410 },
    LSB: { x: 20, y: 325 },
    LCB: { x: 110, y: 325 },
    RCB: { x: 210, y: 325 },
    RSB: { x: 300, y: 325 },
    LCM: { x: 110, y: 225 },
    RCM: { x: 210, y: 225 },
    LM:  { x: 20, y: 125 },
    CAM: { x: 160, y: 125 },
    RM:  { x: 300, y: 125 },
    ST:  { x: 160, y: 35 }
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