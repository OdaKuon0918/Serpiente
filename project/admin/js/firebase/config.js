import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebaseの設定(どのDBに接続すればいいかを特定するための情報を記載。)
const firebaseConfig = {
    apiKey: "AIzaSyBoSmU8wqdo7kbhz2AX-MhElmWgk38mVKo",
    authDomain: "serpiente-7cece.firebaseapp.com",
    projectId: "serpiente-7cece",
    storageBucket: "serpiente-7cece.firebasestorage.app",
    messagingSenderId: "495631387007",
    appId: "1:495631387007:web:7c300a76254f42ce68724a",
    measurementId: "G-HPSLVPJQ08"
};

// 上述したDBの設定をもとに、このFireBaseを使います、と宣言している。
const app = initializeApp(firebaseConfig);

// FireStoreのDBを作る
const db = getFirestore(app);

// 他のファイルからもこのdbを使えるようにexportしておく
export { db };
