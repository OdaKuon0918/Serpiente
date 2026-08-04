import { saveData } from "./firebase/common.js";

document.getElementById("saveButton").addEventListener("click", async () => {
    const playerName = document.getElementById("name").value;
    const playerNumber = document.getElementById("number").value;
    const playerPosition = document.getElementById("position").value;

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
        const eventId = await saveData("players", {
            playerName,
            playerNumber,
            playerPosition
        });
    } catch (e) {
        alert("保存に失敗しました。");
    }
});
