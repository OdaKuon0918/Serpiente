import { initLiff, saveLoginUserData } from "./utils/firestoreUtils.js";

window.addEventListener("DOMContentLoaded", () => {
  const position = document.getElementById("position");
  const detailPosition = document.getElementById("detailPosition");
  const detailWrapper = document.querySelector(".detailPosition");

  position.addEventListener("change", () => {
    const positionValue = position.value;

    detailPosition.innerHTML = "";

    let options = [];

    if (positionValue === "DF") {
      options = ["RSB", "RCB", "LCB", "LSB"];
    } else if (positionValue === "MF") {
      options = ["RCM", "LCM", "RM", "CAM", "LM"];
    } else if (positionValue === "FW") {
      options = ["ST"];
    } else if (positionValue === "GK") {
      options = ["GK"];
    }

    options.forEach(pos => {
      const option = document.createElement("option");
      option.value = pos;
      option.textContent = pos;
      detailPosition.appendChild(option);
    });

    detailWrapper.style.display = options.length > 0 ? "block" : "none";
  });
});

document.getElementById("saveButton").addEventListener("click", async () => {
    const playerName = document.getElementById("name").value;
    const playerNumber = document.getElementById("number").value;
    const playerPosition = document.getElementById("detailPosition").value;
    const profile = await initLiff();
    const lineUserID = profile.userId

    if (!playerName.trim()) {
        alert("名前が空です。");
        return;
    }

    if (!playerNumber.trim()) {
        alert("背番号が空です。");
        return;
    }   

    if (!playerPosition.trim()) {
        alert("ポジションが空です。");
        return;
    }       

    try {
        const eventId = await saveLoginUserData("players", lineUserID, {
            playerName,
            playerNumber,
            playerPosition,
            lineUserID
        });
    } catch (e) {
        alert("保存に失敗しました。");
    }

    alert("登録完了しました。")
});
