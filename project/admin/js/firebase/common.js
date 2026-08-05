import { db } from "./config.js";
import { collection, doc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 保存処理
export async function saveData(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

// 保存処理（ドキュメントID:LINEのuserId）
/*
  分けた理由
  ①ユーザーが一意に管理できるため、コレクション内のデータがメンバの数だけで済む。
  ③重複ユーザの心配をしなくていい
*/
export async function saveLoginUserData(collectionName, userId, data) {
  try {
    const docRef = await setDoc(doc(db, collectionName, userId), {
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

// 更新処理

// 削除処理

