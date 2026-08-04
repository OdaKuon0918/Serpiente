import { db } from "./config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 保存処理
export async function saveData(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
    });
    console.log("保存完了:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("保存エラー:", error);
    throw error;
  }
}


// 更新処理

// 削除処理

