import { db } from "../firebase/config.js";
import { collection, deleteDoc, query, where, getDoc, getDocs, doc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// データ取得処理
export async function fetchDoc(collectionName, docId) {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// 条件付き取得
export async function loadCollectionWhere(collectionName, eventId) {
  const q = query(collection(db, collectionName), where("eventId", "==", eventId));
  const querySnapshot = await getDocs(q);

  const allData = [];
  querySnapshot.forEach(doc => {
    allData.push({ id: doc.id, ...doc.data() });
  });

  return allData;
}

// ★コレクション名を渡すだけで全件取得できる共通関数
export async function loadAll(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

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
  } catch (error) {
    throw error;
  }
}

// 出席情報登録
export async function saveAttendanceStatus(userId, eventId, selectedStatus, comment, displayName) {
  try {
    await setDoc(doc(db, "attendance", `${eventId}_${userId}`), {
      userId: userId,
      eventId: eventId,
      displayName: displayName,
      selectedStatus: selectedStatus, // 日程ごとの出欠を動的に保存
      comment: comment,
      updatedAt: new Date()
    }, { merge: true });

    console.log("出欠情報を保存しました:", status);
  } catch (error) {
    console.error("Firestore保存エラー:", error);
  }
}

// 更新処理

// 削除処理
// ★コレクションの全件削除
// export async function deleteAll(collectionName) {
//   const snapshot = await getDocs(collection(db, collectionName));

//   const promises = snapshot.docs.map(d =>
//     deleteDoc(doc(db, collectionName, d.id))
//   );

//   await Promise.all(promises);
// }


// export async function initLiff(eventId) {
//     const liffId = "2010961634-PvIMmuiT";
//     const retryKey = `liff-profile-retry-${eventId || "default"}`;

//     try {
//         await liff.init({ liffId });

//         if (!liff.isLoggedIn()) {
//             // LINE内ブラウザでは liff.login() を呼ばない
//             if (liff.isInClient()) {
//                 alert("LINE認証を確認できません。アプリを開き直してください。");
//                 return null;
//             }

//             liff.login({
//                 redirectUri: window.location.href
//             });
//             return null;
//         }

//         let profile;

//         try {
//             profile = await liff.getProfile();
//         } catch (e) {
//             console.error("プロフィール取得エラー:", e.code, e.message);

//             const message = String(e.message || "");
//             const isTokenExpired =
//                 /access.?token.*expired|expired.*access.?token/i.test(message);

//             if (isTokenExpired) {
//                 // 自動再試行は1回だけ
//                 if (sessionStorage.getItem(retryKey) !== "1") {
//                     sessionStorage.setItem(retryKey, "1");

//                     const url = new URL(
//                         `https://liff.line.me/${liffId}`
//                     );

//                     if (eventId) {
//                         url.searchParams.set("id", eventId);
//                     }

//                     window.location.replace(url.toString());
//                     return null;
//                 }

//                 sessionStorage.removeItem(retryKey);
//                 alert(
//                     "LINE認証を更新できませんでした。\n" +
//                     "この画面を閉じ、LINEのトークからアプリを開き直してください。"
//                 );
//                 return null;
//             }

//             alert("LINEプロフィールを取得できませんでした。アプリを開き直してください。");
//             return null;
//         }

//         // プロフィール取得に成功したら再試行フラグを解除
//         sessionStorage.removeItem(retryKey);

//         await saveLoginUserData("users", profile.userId, {
//             userId: profile.userId,
//             displayName: profile.displayName
//         });

//         return profile;

//     } catch (e) {
//         console.error("LIFF初期化・ユーザー保存エラー:", e.code, e.message);
//         alert("アプリの初期化に失敗しました。時間をおいて再度お試しください。");
//         return null;
//     }
// }



export async function initLiff() {
    try {
        await liff.init({
            liffId: "2010961634-PvIMmuiT"
        });

        console.log("LIFF init成功");

        if (!liff.isLoggedIn()) {
            console.log("未ログイン");
            liff.login();
            return null;
        }

        const profile = await liff.getProfile();

        console.log("profile", profile);

        await saveLoginUserData("users", profile.userId, {
            userId: profile.userId,
            displayName: profile.displayName
        });

        console.log("users保存成功");

        return profile;

    } catch (e) {
        console.error("initLiffエラー", e.code, e.message);
        alert("LIFFエラー: " + (e.message || String(e)));
        return null;
    }
}


// export async function initLiff() {
//     try {
//         await liff.init({
//             liffId: "2010961634-PvIMmuiT"
//         });

//         console.log("LIFF init成功");

//         if (!liff.isLoggedIn()) {
//             console.log("未ログイン");
//             liff.login();
//             return null;
//         }

//         console.log("ログイン済み");

//         const profile = await liff.getProfile();

//         console.log("profile", profile);

//         await saveLoginUserData("users", profile.userId, {
//             userId: profile.userId,
//             displayName: profile.displayName
//         });

//         console.log("users保存成功");

//         return profile;

//     } catch (e) {
//         console.error("initLiffエラー", e);
//         alert(e.message);
//     }
// }

// // LINEログインユーザのデータ取得
// export async function initLiff(eventId) {
//     const isLocal = location.hostname === "192.168.11.10";
//     let profile;

//     if (isLocal) {
//         // ★ ローカル用ダミーユーザー
//         profile = {
//             userId: "dummy-user-014",
//             displayName: "テストスタッフ"
//         };
//         console.log("ローカル → ダミーユーザー使用:", profile);

//     } else {
//         // ★ 本番環境（LIFF）
//         await liff.init({ liffId: "2010961634-PvIMmuiT" });

//         if (!liff.isLoggedIn()) {
//             liff.login();
//             return;
//         }

//         profile = await liff.getProfile();
//         console.log("LIFFユーザー:", profile);

//         // // ★ 初回ログイン時だけリダイレクトする
//         // if (!sessionStorage.getItem("liffLoggedIn")) {

//         //     if (!liff.isLoggedIn()) {
//         //         liff.login();
//         //         return;
//         //     }

//         //     sessionStorage.setItem("liffLoggedIn", "true");

//         //     const params = new URLSearchParams(window.location.search);
//         //     const eventId = params.get("id");

//         //     // ★ 初回だけ attendance.html に戻す
//         //     window.location.href = `/project/admin/attendance.html?id=${eventId}`;
//         //     return;
//         // }
//     }

//     // Firestoreにも保存（共通）
//     await saveLoginUserData("users", profile.userId, profile, {
//         userId: profile.userId,
//         displayName: profile.displayName
//     });

//     return profile;
// }
